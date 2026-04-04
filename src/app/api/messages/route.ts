import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { messageSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireAuth();

    const messages = await prisma.message.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ messages });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Messages list error:", error);
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
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        ...validation.data,
        userId: auth.userId,
      },
    });

    return Response.json({ message }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Message create error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
