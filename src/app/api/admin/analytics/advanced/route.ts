import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [totalOrders, totalCustomers, revenueResult, totalCarts, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.aggregate({ _avg: { total: true }, _sum: { total: true } }),
      prisma.cart.count({ where: { items: { some: {} } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    const completedOrders = await prisma.order.count({ where: { status: "COMPLETED" } });

    // Estimate unique visitors as total customers * 5 (rough multiplier)
    const estimatedVisitors = Math.max(totalCustomers * 5, 1);
    const conversionRate = parseFloat(
      ((totalOrders / estimatedVisitors) * 100).toFixed(2)
    );
    const avgOrderValue = revenueResult._avg.total || 0;

    // Conversion funnel
    const funnel = [
      { stage: "Visitors", count: estimatedVisitors, color: "#3b82f6" },
      { stage: "Added to Cart", count: totalCarts + totalOrders, color: "#8b5cf6" },
      { stage: "Checkout", count: totalOrders, color: "#f59e0b" },
      { stage: "Completed", count: completedOrders, color: "#10b981" },
    ];

    // Customer lifetime value
    const clvData = await prisma.order.groupBy({
      by: ["userId"],
      _sum: { total: true },
      _count: true,
    });
    const avgCLV = clvData.length > 0
      ? clvData.reduce((sum, c) => sum + (c._sum.total || 0), 0) / clvData.length
      : 0;

    // Revenue by month for forecasting
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    recentOrders.forEach((o) => {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
    });

    const revenueHistory = Object.entries(monthlyRevenue).sort(([a], [b]) => a.localeCompare(b));
    const avgMonthlyRevenue = revenueHistory.length > 0
      ? revenueHistory.reduce((s, [, v]) => s + v, 0) / revenueHistory.length
      : 0;

    // Simple forecast: next 3 months based on average
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      forecast.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        projected: Math.round(avgMonthlyRevenue * (1 + 0.05 * i)),
      });
    }

    return Response.json({
      conversionRate,
      totalCustomers,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      totalOrders,
      estimatedVisitors,
      funnel,
      avgCLV: Math.round(avgCLV),
      revenueHistory: revenueHistory.map(([month, revenue]) => ({ month, revenue: Math.round(revenue) })),
      forecast,
    });
  } catch (error: any) {
    console.error("Advanced analytics error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
