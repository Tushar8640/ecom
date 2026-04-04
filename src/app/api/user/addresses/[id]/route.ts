import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== auth.userId) {
      return Response.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const data = validation.data;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data,
    });

    return Response.json({ address });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Address update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== auth.userId) {
      return Response.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return Response.json({ message: "Address deleted" });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Address delete error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
