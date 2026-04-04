import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [totalOrders, totalCustomers, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.aggregate({ _avg: { total: true }, _sum: { total: true } }),
    ]);

    // Estimate unique visitors as total customers * 5 (rough multiplier)
    const estimatedVisitors = Math.max(totalCustomers * 5, 1);
    const conversionRate = parseFloat(
      ((totalOrders / estimatedVisitors) * 100).toFixed(2)
    );
    const avgOrderValue = revenueResult._avg.total || 0;

    return Response.json({
      conversionRate,
      totalCustomers,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      totalOrders,
      estimatedVisitors,
    });
  } catch (error: any) {
    console.error("Advanced analytics error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
