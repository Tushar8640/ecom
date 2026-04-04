import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: auth.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json({ wishlist });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Wishlist get error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return Response.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Create wishlist if it doesn't exist
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId },
      update: {},
    });

    // Check if product already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (existingItem) {
      return Response.json(
        { error: "Product already in wishlist" },
        { status: 409 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: true,
      },
    });

    return Response.json({ wishlistItem }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Wishlist add error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
