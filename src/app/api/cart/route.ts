import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();

    const cart = await prisma.cart.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId },
      update: {},
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json({ cart });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cart get error:", error);
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
    const { productId, quantity, size, color } = body;

    if (!productId || !quantity) {
      return Response.json(
        { error: "productId and quantity are required" },
        { status: 400 }
      );
    }

    // Find or create cart
    const cart = await prisma.cart.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId },
      update: {},
    });

    // Upsert cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: size || "",
        color: color || "",
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size: size || "",
          color: color || "",
        },
        include: { product: true },
      });
    }

    return Response.json({ cartItem }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cart add error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const auth = await requireAuth();

    const cart = await prisma.cart.findUnique({
      where: { userId: auth.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return Response.json({ message: "Cart cleared successfully" });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cart clear error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
