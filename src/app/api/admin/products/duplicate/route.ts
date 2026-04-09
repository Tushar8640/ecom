import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const { productId } = await request.json();
    if (!productId) return Response.json({ error: "productId is required" }, { status: 400 });

    const original = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });
    if (!original) return Response.json({ error: "Product not found" }, { status: 404 });

    const { id, sku, createdAt, updatedAt, ...productData } = original;

    const duplicate = await prisma.product.create({
      data: {
        ...productData,
        name: `${original.name} (Copy)`,
        variants: {
          create: original.variants.map(({ id, productId, ...v }) => v),
        },
      },
      include: { category: true, variants: true },
    });

    return Response.json({ product: duplicate }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    console.error("Product duplicate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
