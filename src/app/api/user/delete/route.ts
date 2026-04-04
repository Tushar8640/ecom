import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE() {
  try {
    const auth = await requireAuth();

    await prisma.user.update({
      where: { id: auth.userId },
      data: { deletedAt: new Date() },
    });

    return Response.json({ message: "Account deleted" });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Account delete error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
