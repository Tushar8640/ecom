"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  productId: string;
  product: { id: string; name: string; price: number; images: string[] };
}

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.status === 401) { router.push("/login?callbackUrl=/wishlist"); return; }
        if (res.ok) { const data = await res.json(); setItems(data.wishlist?.items || []); }
      } catch {} finally { setLoading(false); }
    }
    fetchWishlist();
  }, [router]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const handleBulkAddToCart = () => {
    const toAdd = items.filter((i) => selected.has(i.id));
    toAdd.forEach((item) => {
      dispatch(addToCart({
        id: `${item.product.id}-default`,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || "",
        quantity: 1,
      }));
    });
    toast.success(`${toAdd.length} item(s) added to cart`);
    setSelected(new Set());
  };

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      toast.success("Removed from wishlist");
    } catch { toast.error("Failed to remove"); }
  };

  const handleMoveToCart = (item: WishlistProduct) => {
    dispatch(addToCart({
      id: `${item.product.id}-default`,
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0] || "",
      quantity: 1,
    }));
    handleRemove(item.product.id);
    toast.success(`${item.product.name} moved to cart`);
  };

  if (loading) return <LoadingSpinner className="py-24" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selected.size === items.length ? "Deselect All" : "Select All"}
            </Button>
            {selected.size > 0 && (
              <Button size="sm" onClick={handleBulkAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add {selected.size} to Cart
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love to your wishlist."
            actionLabel="Browse Products"
            onAction={() => router.push("/products")}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <div className="absolute left-3 top-3 z-10">
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]} alt={item.product.name} fill
                      className="cursor-pointer object-cover" sizes="(max-width: 640px) 100vw, 25vw"
                      onClick={() => router.push(`/products/${item.product.id}`)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="truncate text-sm font-medium">{item.product.name}</h3>
                  <p className="mt-1 text-lg font-bold">{formatPrice(item.product.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 text-xs" onClick={() => handleMoveToCart(item)}>
                      <ShoppingCart className="mr-1 h-3 w-3" /> Move to Cart
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRemove(item.product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
