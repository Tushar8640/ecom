import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ posts });
  } catch (error: any) {
    console.error("Admin blog list error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const validation = blogPostSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const post = await prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "CREATE_BLOG_POST",
      entity: "BlogPost",
      entityId: post.id,
    });

    return Response.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create blog post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
