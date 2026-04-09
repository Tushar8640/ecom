import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bannerSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function GET() {
  try {
    await requireAdmin();

    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return Response.json({ banners });
  } catch (error: any) {
    console.error("Admin banners list error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const validation = bannerSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const banner = await prisma.banner.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "CREATE_BANNER",
      entity: "Banner",
      entityId: banner.id,
    });

    return Response.json({ banner }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create banner error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
