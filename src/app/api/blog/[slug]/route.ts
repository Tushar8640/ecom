import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug, published: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ post });
  } catch (error: any) {
    console.error("Blog post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
