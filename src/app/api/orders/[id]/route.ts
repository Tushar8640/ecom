import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== auth.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json({ order });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Order get error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
