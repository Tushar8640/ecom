"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        } else {
          router.push("/blog");
        }
      } catch {
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchPost();
  }, [slug, router]);

  if (loading) return <LoadingSpinner className="py-24" />;
  if (!post) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push("/blog")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
      </Button>

      {post.coverImage && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {new Date(post.publishedAt).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>

      <div
        className="prose prose-neutral mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
