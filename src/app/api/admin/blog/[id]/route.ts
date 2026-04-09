import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const validation = blogPostSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "UPDATE_BLOG_POST",
      entity: "BlogPost",
      entityId: id,
    });

    return Response.json({ post });
  } catch (error: any) {
    console.error("Admin update blog post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    await prisma.blogPost.delete({ where: { id } });

    await logAdminAction({
      userId: session.userId,
      action: "DELETE_BLOG_POST",
      entity: "BlogPost",
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete blog post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
