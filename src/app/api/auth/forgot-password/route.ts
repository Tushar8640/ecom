import crypto from "crypto";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { passwordResetRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = passwordResetRequestSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp,
      },
    });

    return Response.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
      token,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
