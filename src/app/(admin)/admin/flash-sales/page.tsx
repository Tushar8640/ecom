"use client";

import { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

interface FlashSale {
  id: string;
  name: string;
  discount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  productIds: string[];
  createdAt: string;
}

const emptyForm = { name: "", discount: 0, startsAt: "", endsAt: "", isActive: true, productIds: [] as string[] };

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<FlashSale | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/flash-sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data.flashSales || []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const openCreate = () => { setDialogMode("create"); setForm(emptyForm); setSelected(null); };
  const openEdit = (s: FlashSale) => {
    setDialogMode("edit");
    setSelected(s);
    setForm({
      name: s.name,
      discount: s.discount,
      startsAt: s.startsAt.slice(0, 16),
      endsAt: s.endsAt.slice(0, 16),
      isActive: s.isActive,
      productIds: s.productIds,
    });
  };
  const openDelete = (s: FlashSale) => { setDialogMode("delete"); setSelected(s); };
  const closeDialog = () => { setDialogMode(null); setSelected(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.startsAt || !form.endsAt) { toast.error("Start and end dates are required"); return; }
    setSaving(true);
    try {
      const url = dialogMode === "edit" ? `/api/admin/flash-sales/${selected!.id}` : "/api/admin/flash-sales";
      const method = dialogMode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(dialogMode === "edit" ? "Flash sale updated" : "Flash sale created");
        closeDialog();
        fetchSales();
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
      const res = await fetch(`/api/admin/flash-sales/${selected.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Flash sale deleted");
        closeDialog();
        fetchSales();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flash Sales</h1>
          <p className="text-sm text-gray-500">Manage time-limited promotions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Flash Sale
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : sales.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No flash sales yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      {s.name}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{s.discount}%</Badge></TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(s.startsAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(s.endsAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "default" : "secondary"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDelete(s)}>
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
            <DialogTitle>{dialogMode === "edit" ? "Edit Flash Sale" : "New Flash Sale"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Sale name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div>
              <label className="mb-1 block text-sm font-medium">Discount (%)</label>
              <Input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Starts At</label>
              <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ends At</label>
              <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
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
            <DialogTitle>Delete Flash Sale</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{selected?.name}&quot;?
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
