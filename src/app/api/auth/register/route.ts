import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cart: {
          create: {},
        },
      },
    });

    const token = await signToken({ userId: user.id, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
