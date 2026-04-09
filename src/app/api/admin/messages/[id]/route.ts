import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminReplySchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = adminReplySchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { adminReply } = validation.data;

    const message = await prisma.message.update({
      where: { id },
      data: {
        adminReply,
        status: "RESOLVED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json({ message });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json(
        { error: error.message || "Forbidden" },
        { status: error.status }
      );
    }
    console.error("Admin message reply error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
