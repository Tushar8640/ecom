import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const count = await prisma.notification.count({
      where: { userId: session.userId, read: false },
    });

    return Response.json({ count });
  } catch (error: any) {
    console.error("Unread count error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
