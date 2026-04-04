import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { productId } = await params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: auth.userId },
    });

    if (!wishlist) {
      return Response.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (!wishlistItem) {
      return Response.json(
        { error: "Product not found in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return Response.json({ message: "Product removed from wishlist" });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Wishlist remove error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
