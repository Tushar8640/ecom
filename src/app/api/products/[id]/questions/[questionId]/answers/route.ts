import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { answerSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { questionId } = await params;

    const body = await request.json();
    const validation = answerSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const answer = await prisma.productAnswer.create({
      data: {
        questionId,
        userId: auth.userId,
        answer: validation.data.answer,
        isAdmin: auth.role === "ADMIN",
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return Response.json({ answer }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Answer create error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
