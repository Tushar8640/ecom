"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "PERCENTAGE",
    discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) { const data = await res.json(); setCoupons(data.coupons || []); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) { toast.error("Code and discount value are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountValue: parseFloat(form.discountValue),
          minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (res.ok) {
        toast.success("Coupon created");
        setDialogOpen(false);
        setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
        fetchCoupons();
      } else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Something went wrong"); } finally { setSaving(false); }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      fetchCoupons();
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-gray-500">Manage promo codes and discounts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : coupons.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No coupons yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell>
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                  </TableCell>
                  <TableCell>{c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : "—"}</TableCell>
                  <TableCell>{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={c.isActive ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "bg-gray-100 text-gray-500 cursor-pointer"}
                      onClick={() => toggleActive(c)}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm(f => ({ ...f, discountType: v ?? "PERCENTAGE" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Save 20% on your order" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input type="number" value={form.discountValue} onChange={(e) => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label>Min Order</Label>
                <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
