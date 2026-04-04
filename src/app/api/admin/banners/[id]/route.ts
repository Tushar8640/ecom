import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bannerSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const validation = bannerSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "UPDATE_BANNER",
      entity: "Banner",
      entityId: id,
    });

    return Response.json({ banner });
  } catch (error: any) {
    console.error("Admin update banner error:", error);
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

    await prisma.banner.delete({ where: { id } });

    await logAdminAction({
      userId: session.userId,
      action: "DELETE_BANNER",
      entity: "Banner",
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete banner error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
