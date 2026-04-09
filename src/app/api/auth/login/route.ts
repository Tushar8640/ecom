import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Check for suspicious activity
    const key = email.toLowerCase();
    const attempts = failedAttempts.get(key);
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - attempts.lastAttempt;
      if (elapsed < LOCKOUT_MS) {
        const minutesLeft = Math.ceil((LOCKOUT_MS - elapsed) / 60000);
        return Response.json(
          { error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
          { status: 429 }
        );
      }
      failedAttempts.delete(key);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      trackFailedAttempt(key);
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return Response.json(
        { error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      trackFailedAttempt(key);
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Clear failed attempts on success
    failedAttempts.delete(key);

    const token = await signToken({ userId: user.id, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function trackFailedAttempt(key: string) {
  const existing = failedAttempts.get(key);
  failedAttempts.set(key, {
    count: (existing?.count || 0) + 1,
    lastAttempt: Date.now(),
  });
}
