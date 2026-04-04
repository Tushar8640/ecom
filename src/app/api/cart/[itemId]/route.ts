import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { itemId } = await params;

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return Response.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== auth.userId) {
      return Response.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return Response.json({ cartItem: updatedItem });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cart item update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { itemId } = await params;

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== auth.userId) {
      return Response.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return Response.json({ message: "Item removed from cart" });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cart item delete error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
