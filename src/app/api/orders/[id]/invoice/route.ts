import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order || order.userId !== auth.userId) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate HTML invoice
    const itemRows = order.items.map((item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice #${order.id.slice(0, 8)}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333}
.header{display:flex;justify-content:space-between;margin-bottom:40px}
.logo{font-size:24px;font-weight:bold}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:14px}
.total-row td{font-weight:bold;padding-top:12px;font-size:16px}
@media print{body{padding:20px}}</style></head>
<body>
<div class="header">
  <div><div class="logo">ShopNest</div><p style="color:#666;margin:4px 0">Invoice</p></div>
  <div style="text-align:right">
    <p><strong>Invoice #${order.id.slice(0, 8)}</strong></p>
    <p style="color:#666">${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    <p style="color:#666">Status: ${order.status}</p>
  </div>
</div>
<div style="display:flex;gap:40px;margin-bottom:30px">
  <div><p style="font-weight:bold;margin-bottom:4px">Bill To:</p><p>${order.fullName}</p><p style="color:#666">${order.email}</p><p style="color:#666">${order.phone}</p></div>
  <div><p style="font-weight:bold;margin-bottom:4px">Ship To:</p><p>${order.address}</p><p style="color:#666">${order.city}, ${order.state} ${order.zipCode}</p><p style="color:#666">${order.country}</p></div>
</div>
<table>
  <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${itemRows}
    <tr class="total-row"><td colspan="3" style="text-align:right;padding:12px 8px">Subtotal:</td><td style="text-align:right;padding:12px 8px">${formatPrice(order.total + (order.discount || 0))}</td></tr>
    ${order.discount > 0 ? `<tr><td colspan="3" style="text-align:right;padding:4px 8px;color:green">Discount:</td><td style="text-align:right;padding:4px 8px;color:green">-${formatPrice(order.discount)}</td></tr>` : ""}
    <tr><td colspan="3" style="text-align:right;padding:4px 8px">Shipping:</td><td style="text-align:right;padding:4px 8px">Free</td></tr>
    <tr class="total-row"><td colspan="3" style="text-align:right;padding:12px 8px;border-top:2px solid #333">Total:</td><td style="text-align:right;padding:12px 8px;border-top:2px solid #333">${formatPrice(order.total)}</td></tr>
  </tbody>
</table>
<p style="margin-top:40px;text-align:center;color:#999;font-size:12px">Thank you for shopping with ShopNest!</p>
</body></html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.id.slice(0, 8)}.html"`,
      },
    });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Invoice error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
