import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      where: { role: "USER", deletedAt: null },
      include: {
        orders: { select: { total: true, createdAt: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const segments = {
      highValue: [] as any[],
      active: [] as any[],
      atRisk: [] as any[],
      new: [] as any[],
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    users.forEach((user) => {
      const totalSpend = user.orders.reduce((s, o) => s + o.total, 0);
      const lastOrder = user.orders.length > 0
        ? new Date(Math.max(...user.orders.map((o) => o.createdAt.getTime())))
        : null;

      const summary = {
        id: user.id, name: user.name, email: user.email,
        totalSpend, orderCount: user._count.orders,
        lastOrderDate: lastOrder?.toISOString() || null,
        loyaltyPoints: user.loyaltyPoints,
      };

      if (totalSpend > 50000) segments.highValue.push(summary);
      else if (lastOrder && lastOrder > thirtyDaysAgo) segments.active.push(summary);
      else if (lastOrder && lastOrder < ninetyDaysAgo) segments.atRisk.push(summary);
      else if (user.createdAt > thirtyDaysAgo) segments.new.push(summary);
    });

    return Response.json({ segments });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
