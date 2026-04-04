import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ products: related });
  } catch (error) {
    console.error("Related products error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
