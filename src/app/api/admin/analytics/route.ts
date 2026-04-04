import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    // Order counts by status
    const [totalOrders, pendingOrders, completedOrders, returnedOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),
        prisma.order.count({ where: { status: "RETURNED" } }),
      ]);

    // Total revenue from completed orders
    const revenueResult = await prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Total cost for completed orders (costPrice * quantity)
    const completedOrderItems = await prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED" } },
      include: { product: true },
    });

    const totalCost = completedOrderItems.reduce((sum, item) => {
      const costPrice = (item.product as any).costPrice || 0;
      return sum + costPrice * item.quantity;
    }, 0);

    const profit = totalRevenue - totalCost;

    // Orders by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const ordersByMonth: Record<string, { count: number; revenue: number }> =
      {};
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      ordersByMonth[key] = { count: 0, revenue: 0 };
    }

    recentOrders.forEach((order) => {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (ordersByMonth[key]) {
        ordersByMonth[key].count += 1;
        ordersByMonth[key].revenue += order.total;
      }
    });

    // Top 5 products by order quantity
    const topProductsData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topProductIds = topProductsData.map((p) => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true, images: true },
    });

    const topProducts = topProductsData.map((p) => {
      const product = topProductDetails.find((d) => d.id === p.productId);
      return {
        ...product,
        totalQuantity: p._sum.quantity,
      };
    });

    // Category sales
    const categorySalesData = await prisma.orderItem.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const categorySalesMap: Record<
      string,
      { categoryName: string; count: number; revenue: number }
    > = {};

    categorySalesData.forEach((item) => {
      const categoryName = item.product.category?.name || "Uncategorized";
      const categoryId = item.product.categoryId || "uncategorized";

      if (!categorySalesMap[categoryId]) {
        categorySalesMap[categoryId] = {
          categoryName,
          count: 0,
          revenue: 0,
        };
      }

      categorySalesMap[categoryId].count += item.quantity;
      categorySalesMap[categoryId].revenue += item.price * item.quantity;
    });

    const categorySales = Object.values(categorySalesMap);

    return Response.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      returnedOrders,
      totalRevenue,
      totalCost,
      profit,
      ordersByMonth,
      topProducts,
      categorySales,
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json(
        { error: error.message || "Forbidden" },
        { status: error.status }
      );
    }
    console.error("Analytics error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
