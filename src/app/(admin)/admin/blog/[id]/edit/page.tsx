"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", coverImage: "", published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/blog");
        if (res.ok) {
          const data = await res.json();
          const post = (data.posts || []).find((p: any) => p.id === id);
          if (post) {
            setForm({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt || "",
              content: post.content,
              coverImage: post.coverImage || "",
              published: post.published,
            });
          } else {
            toast.error("Post not found");
            router.push("/admin/blog");
          }
        }
      } catch { toast.error("Failed to load post"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content are required"); return; }
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Blog post updated");
        router.push("/admin/blog");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/blog")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-sm text-gray-500">Update post details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="post-slug" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Excerpt</label>
            <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your blog post content..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
            <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/blog")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Post
        </Button>
      </div>
    </div>
  );
}
