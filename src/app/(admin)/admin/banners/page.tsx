"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const emptyForm = { title: "", subtitle: "", image: "", link: "", isActive: true, sortOrder: 0 };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => { setDialogMode("create"); setForm(emptyForm); setSelected(null); };
  const openEdit = (b: Banner) => {
    setDialogMode("edit");
    setSelected(b);
    setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, isActive: b.isActive, sortOrder: b.sortOrder });
  };
  const openDelete = (b: Banner) => { setDialogMode("delete"); setSelected(b); };
  const closeDialog = () => { setDialogMode(null); setSelected(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      const url = dialogMode === "edit" ? `/api/admin/banners/${selected!.id}` : "/api/admin/banners";
      const method = dialogMode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(dialogMode === "edit" ? "Banner updated" : "Banner created");
        closeDialog();
        fetchBanners();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${selected.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Banner deleted");
        closeDialog();
        fetchBanners();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, isActive: !b.isActive, sortOrder: b.sortOrder }),
      });
      if (res.ok) {
        toast.success(b.isActive ? "Banner deactivated" : "Banner activated");
        fetchBanners();
      }
    } catch { toast.error("Something went wrong"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage banners</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : banners.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No banners yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="relative h-10 w-20 overflow-hidden rounded bg-muted">
                      {b.image && (
                        <Image src={b.image} alt={b.title} fill className="object-cover" sizes="80px" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-gray-500">{b.subtitle}</p>}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(b)}>
                      <Badge variant={b.isActive ? "default" : "secondary"}>
                        {b.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>{b.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDelete(b)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <Input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <Input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <Input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-28" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogMode === "edit" ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{selected?.title}&quot;?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
