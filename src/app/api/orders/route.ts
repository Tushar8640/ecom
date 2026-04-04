import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();

    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ orders });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Orders list error:", error);
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

    const { fullName, email, phone, address, city, state, zipCode, country, notes } = body;

    if (!fullName || !email || !phone || !address || !city || !state || !zipCode || !country) {
      return Response.json(
        { error: "All shipping fields are required" },
        { status: 400 }
      );
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: auth.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return Response.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total from current product prices
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: auth.userId,
          total,
          fullName,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          country,
          notes: notes || "",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              size: item.size,
              color: item.color,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return Response.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Order create error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
