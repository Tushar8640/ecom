import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const groupedByDay: Record<string, { count: number; total: number }> = {};
    let grandTotal = 0;

    for (const order of orders) {
      const day = order.createdAt.toISOString().split("T")[0];
      if (!groupedByDay[day]) groupedByDay[day] = { count: 0, total: 0 };
      groupedByDay[day].count += 1;
      groupedByDay[day].total += order.total;
      grandTotal += order.total;
    }

    return Response.json({
      orders,
      groupedByDay,
      grandTotal,
      orderCount: orders.length,
    });
  } catch (error: any) {
    console.error("Sales report error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
