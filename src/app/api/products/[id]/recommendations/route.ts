import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find orders that contain this product
    const ordersWithProduct = await prisma.orderItem.findMany({
      where: { productId: id },
      select: { orderId: true },
    });

    const orderIds = ordersWithProduct.map((item) => item.orderId);

    if (orderIds.length === 0) {
      return Response.json({ products: [] });
    }

    // Find other products frequently ordered together
    const coItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { not: id },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 4,
    });

    const productIds = coItems.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return Response.json({ products });
  } catch (error) {
    console.error("Recommendations error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
