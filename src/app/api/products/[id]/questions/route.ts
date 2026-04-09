import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { questionSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const questions = await prisma.productQuestion.findMany({
      where: { productId: id },
      include: {
        user: { select: { id: true, name: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ questions });
  } catch (error) {
    console.error("Questions list error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validation = questionSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const question = await prisma.productQuestion.create({
      data: {
        productId: id,
        userId: auth.userId,
        question: validation.data.question,
      },
      include: {
        user: { select: { id: true, name: true } },
        answers: true,
      },
    });

    return Response.json({ question }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Question create error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
