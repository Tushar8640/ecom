import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock") === "true";

    const products = await prisma.product.findMany({
      where: lowStock
        ? { variants: { some: { stock: { lt: 10 } } } }
        : undefined,
      include: {
        variants: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return Response.json({ products });
  } catch (error: any) {
    console.error("Admin inventory error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
