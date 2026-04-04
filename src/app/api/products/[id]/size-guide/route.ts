import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sizeGuide = await prisma.sizeGuide.findUnique({
      where: { productId: id },
    });

    if (!sizeGuide) {
      return Response.json({ error: "Size guide not found" }, { status: 404 });
    }

    return Response.json({ sizeGuide });
  } catch (error) {
    console.error("Size guide get error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const sizeGuide = await prisma.sizeGuide.upsert({
      where: { productId: id },
      update: { content },
      create: { productId: id, content },
    });

    return Response.json({ sizeGuide });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Size guide upsert error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
