import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword, comparePassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isValid = await comparePassword(currentPassword, user.password);

    if (!isValid) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword },
    });

    return Response.json({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Password update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
