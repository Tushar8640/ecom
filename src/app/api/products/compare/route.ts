import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get("ids");

    if (!ids) {
      return Response.json({ error: "ids parameter is required" }, { status: 400 });
    }

    const productIds = ids.split(",").filter(Boolean);

    if (productIds.length === 0) {
      return Response.json({ error: "At least one product id is required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
        category: true,
      },
    });

    return Response.json({ products });
  } catch (error) {
    console.error("Product compare error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
