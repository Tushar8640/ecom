import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ notifications });
  } catch (error: any) {
    console.error("Notifications list error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "ids array is required" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: session.userId },
      data: { read: true },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Mark notifications read error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
