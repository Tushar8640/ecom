import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.adminLog.count(),
    ]);

    return Response.json({ logs, total, page, limit });
  } catch (error: any) {
    console.error("Admin logs error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
