import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let csv = "";
    let filename = "export.csv";

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: "desc" },
      });
      csv = toCsv(
        ["Order ID", "Customer", "Email", "Status", "Total", "Items", "Date"],
        orders.map((o) => [o.id, o.user.name, o.user.email, o.status, String(o.total), String(o.items.length), o.createdAt.toISOString()])
      );
      filename = "orders.csv";
    } else if (type === "products") {
      const products = await prisma.product.findMany({
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
      });
      csv = toCsv(
        ["ID", "Name", "SKU", "Price", "Category", "Stock", "Created"],
        products.map((p) => [
          p.id, p.name, p.sku, String(p.price),
          p.category?.name || "", String(p.variants.reduce((s, v) => s + v.stock, 0)),
          p.createdAt.toISOString(),
        ])
      );
      filename = "products.csv";
    } else if (type === "customers") {
      const users = await prisma.user.findMany({
        where: { role: "USER", deletedAt: null },
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
      });
      csv = toCsv(
        ["ID", "Name", "Email", "Phone", "Orders", "Loyalty Points", "Joined"],
        users.map((u) => [u.id, u.name, u.email, u.phone || "", String(u._count.orders), String(u.loyaltyPoints), u.createdAt.toISOString()])
      );
      filename = "customers.csv";
    } else {
      return Response.json({ error: "Invalid type. Use: orders, products, customers" }, { status: 400 });
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
