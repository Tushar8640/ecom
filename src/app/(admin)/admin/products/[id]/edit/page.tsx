"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Category { id: string; name: string; }
interface Variant { size: string; color: string; stock: number; }

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", price: "", costPrice: "",
    brand: "", model: "", sku: "", warranty: "",
    categoryId: "", images: "", tags: "", salePrice: "",
    processor: "", ram: "", storage: "", display: "",
    battery: "", os: "", graphics: "", camera: "", connectivity: "",
    material: "", gender: "", fit: "",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/categories"),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          setCategories(d.categories || []);
        }
        if (!prodRes.ok) { router.push("/admin/products"); return; }
        const { product: p } = await prodRes.json();
        setForm({
          name: p.name || "", description: p.description || "",
          price: String(p.price || ""), costPrice: String(p.costPrice || ""),
          brand: p.brand || "", model: p.model || "", sku: p.sku || "",
          warranty: p.warranty || "", categoryId: p.categoryId || "",
          images: (p.images || []).join(", "),
          tags: (p.tags || []).join(", "),
          salePrice: p.salePrice ? String(p.salePrice) : "",
          processor: p.processor || "", ram: p.ram || "", storage: p.storage || "",
          display: p.display || "", battery: p.battery || "", os: p.operatingSystem || "",
          graphics: p.graphics || "", camera: p.camera || "", connectivity: p.connectivity || "",
          material: p.material || "", gender: p.gender || "", fit: p.fit || "",
        });
        setIsFeatured(!!p.isFeatured);
        setVariants((p.variants || []).map((v: any) => ({ size: v.size || "", color: v.color || "", stock: v.stock || 0 })));
      } catch { router.push("/admin/products"); }
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id, router]);

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const addVariant = () => setVariants(v => [...v, { size: "", color: "", stock: 0 }]);
  const removeVariant = (i: number) => setVariants(v => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, key: keyof Variant, value: string | number) =>
    setVariants(v => v.map((item, idx) => idx === i ? { ...item, [key]: value } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Name, price, and category are required");
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
        categoryId: form.categoryId,
        images: form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        isFeatured,
        ...(form.salePrice ? { salePrice: parseFloat(form.salePrice) } : { salePrice: null }),
      };
      ["brand","model","sku","warranty","processor","ram","storage","display",
       "battery","os","connectivity","camera","graphics","material","gender","fit"
      ].forEach(k => { if (form[k as keyof typeof form]) body[k] = form[k as keyof typeof form]; });
      if (variants.length > 0) body.variants = variants.map(v => ({ ...v, stock: Number(v.stock) }));

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const selectedCategory = categories.find(c => c.id === form.categoryId)?.name?.toLowerCase() || "";
  const isTech = selectedCategory === "electronics";
  const isClothing = selectedCategory === "clothing";

  if (loading) return <LoadingSpinner className="py-24" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => updateForm("name", e.target.value)} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => updateForm("description", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => updateForm("price", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price</Label>
                  <Input type="number" step="0.01" value={form.costPrice} onChange={e => updateForm("costPrice", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={v => updateForm("categoryId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={e => updateForm("sku", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input type="number" step="0.01" value={form.salePrice} onChange={e => updateForm("salePrice", e.target.value)} placeholder={form.price ? formatPrice(parseFloat(form.price)) : ""} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input value={form.tags} onChange={e => updateForm("tags", e.target.value)} placeholder="e.g. new, trending, sale" />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(!!v)} />
                  <Label htmlFor="isFeatured" className="cursor-pointer">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={e => updateForm("brand", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input value={form.model} onChange={e => updateForm("model", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Warranty</Label>
                  <Input value={form.warranty} onChange={e => updateForm("warranty", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Image URLs (comma-separated)</Label>
                  <Textarea value={form.images} onChange={e => updateForm("images", e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Clothing Attributes - only for Clothing */}
            {isClothing && (
              <Card>
                <CardHeader><CardTitle>Clothing Attributes</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Input value={form.material} onChange={e => updateForm("material", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={form.gender} onChange={e => updateForm("gender", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fit</Label>
                    <Input value={form.fit} onChange={e => updateForm("fit", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tech Attributes - only for Electronics */}
            {isTech && (
              <Card>
                <CardHeader><CardTitle>Tech Attributes</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["processor","Processor"],["ram","RAM"],["storage","Storage"],["display","Display"],
                    ["battery","Battery"],["os","Operating System"],["graphics","Graphics"],
                    ["camera","Camera"],["connectivity","Connectivity"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input value={form[key as keyof typeof form]} onChange={e => updateForm(key, e.target.value)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Variants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {variants.length === 0 && <p className="text-sm text-muted-foreground">No variants. Click &quot;Add&quot; to create size/color variants.</p>}
                {variants.map((v, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Size</Label>
                      <Input value={v.size} onChange={e => updateVariant(i, "size", e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Color</Label>
                      <Input value={v.color} onChange={e => updateVariant(i, "color", e.target.value)} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input type="number" value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeVariant(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
