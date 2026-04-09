import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Only show published products on public API (unless admin)
    const isAdminRequest = request.headers.get("x-admin") === "true";
    if (!isAdminRequest) {
      where.isPublished = true;
      where.OR_scheduled = undefined;
      // Filter out products scheduled for the future
      where.AND = [
        { OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products list error:", error);
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
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { variants, ...productData } = validation.data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        ...(variants && variants.length > 0
          ? {
              variants: {
                create: variants,
              },
            }
          : {}),
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return Response.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json(
        { error: error.message || "Forbidden" },
        { status: error.status }
      );
    }
    console.error("Product create error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
