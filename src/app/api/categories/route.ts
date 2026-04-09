import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return Response.json({ categories });
  } catch (error) {
    console.error("Categories list error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: validation.data,
    });

    return Response.json({ category }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json(
        { error: error.message || "Forbidden" },
        { status: error.status }
      );
    }
    console.error("Category create error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
