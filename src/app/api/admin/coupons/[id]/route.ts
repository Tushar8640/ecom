import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const coupon = await prisma.coupon.update({ where: { id }, data: body });
    return Response.json({ coupon });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return Response.json({ message: "Coupon deleted" });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
