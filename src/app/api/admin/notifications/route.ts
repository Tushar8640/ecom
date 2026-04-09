import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [newOrders, lowStockProducts, unreadMessages] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.variant.findMany({
        where: { stock: { lte: 5, gt: 0 } },
        include: { product: { select: { name: true } } },
        take: 10,
      }),
      prisma.message.count({ where: { status: "OPEN" } }),
    ]);

    const outOfStock = await prisma.variant.count({ where: { stock: 0 } });

    const notifications = [];

    if (newOrders > 0) {
      notifications.push({ type: "order", title: `${newOrders} new order(s)`, message: "Pending orders need attention", priority: "high" });
    }
    if (lowStockProducts.length > 0) {
      notifications.push({
        type: "stock", title: `${lowStockProducts.length} low stock item(s)`,
        message: lowStockProducts.map((v) => `${v.product.name} (${v.stock} left)`).join(", "),
        priority: "medium",
      });
    }
    if (outOfStock > 0) {
      notifications.push({ type: "stock", title: `${outOfStock} out of stock variant(s)`, message: "Some products need restocking", priority: "high" });
    }
    if (unreadMessages > 0) {
      notifications.push({ type: "message", title: `${unreadMessages} unread message(s)`, message: "Customer messages awaiting reply", priority: "medium" });
    }

    return Response.json({ notifications });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
