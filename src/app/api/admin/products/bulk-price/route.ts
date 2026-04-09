import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { productIds, type, value } = await request.json();

    if (!productIds?.length || !type || !value) {
      return Response.json({ error: "productIds, type (percentage|fixed), and value are required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    let updated = 0;

    for (const product of products) {
      let newPrice = product.price;
      if (type === "percentage") {
        newPrice = Math.round(product.price * (1 + value / 100) * 100) / 100;
      } else {
        newPrice = Math.round((product.price + value) * 100) / 100;
      }
      if (newPrice < 0) newPrice = 0;

      await prisma.product.update({ where: { id: product.id }, data: { price: newPrice } });
      updated++;
    }

    return Response.json({ updated, message: `${updated} products updated` });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
