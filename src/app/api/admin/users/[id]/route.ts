import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/adminLogger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        phone: true,
        avatar: true,
        isBanned: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error: any) {
    console.error("Admin get user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (typeof body.isBanned === "boolean") data.isBanned = body.isBanned;
    if (body.role) data.role = body.role;
    if (body.adminRole !== undefined) data.adminRole = body.adminRole;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        isBanned: true,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "UPDATE_USER",
      entity: "User",
      entityId: id,
      details: JSON.stringify(data),
    });

    return Response.json({ user });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
