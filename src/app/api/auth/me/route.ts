import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const auth = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword });
  } catch (error: any) {
    if (error.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Me error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return Response.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
