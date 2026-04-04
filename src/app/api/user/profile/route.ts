import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    return Response.json({ user });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile get error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: auth.userId },
        },
      });

      if (existingUser) {
        return Response.json(
          { error: "Email already taken" },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    return Response.json({ user });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
