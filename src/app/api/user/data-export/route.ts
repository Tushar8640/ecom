import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        orders: { include: { items: { include: { product: { select: { name: true } } } } } },
        addresses: true,
        messages: true,
        wishlist: { include: { items: { include: { product: { select: { name: true } } } } } },
        notifications: true,
      },
    });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const { password, resetToken, resetTokenExp, ...safeUser } = user;

    const exportData = {
      exportDate: new Date().toISOString(),
      personalInfo: {
        name: safeUser.name,
        email: safeUser.email,
        phone: safeUser.phone,
        createdAt: safeUser.createdAt,
      },
      addresses: safeUser.addresses,
      orders: safeUser.orders.map((o) => ({
        id: o.id, status: o.status, total: o.total, createdAt: o.createdAt,
        items: o.items.map((i) => ({ product: i.product.name, quantity: i.quantity, price: i.price })),
      })),
      wishlist: safeUser.wishlist?.items.map((i) => i.product.name) || [],
      messages: safeUser.messages.map((m) => ({ subject: m.subject, message: m.message, createdAt: m.createdAt })),
      notifications: safeUser.notifications.map((n) => ({ title: n.title, message: n.message, createdAt: n.createdAt })),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="shopnest-data-export.json"`,
      },
    });
  } catch (error: any) {
    if (error.message === "Authentication required") return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
