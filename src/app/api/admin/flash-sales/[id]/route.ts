import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { flashSaleSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const validation = flashSaleSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: {
        name: data.name,
        discount: data.discount,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        isActive: data.isActive,
        productIds: data.productIds,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "UPDATE_FLASH_SALE",
      entity: "FlashSale",
      entityId: id,
    });

    return Response.json({ flashSale });
  } catch (error: any) {
    console.error("Admin update flash sale error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    await prisma.flashSale.delete({ where: { id } });

    await logAdminAction({
      userId: session.userId,
      action: "DELETE_FLASH_SALE",
      entity: "FlashSale",
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete flash sale error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
