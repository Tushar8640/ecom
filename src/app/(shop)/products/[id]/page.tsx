"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { ShoppingCart, Heart, ArrowLeft, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSwipe } from "@/hooks/useSwipe";
import StickyAddToCart from "@/components/products/StickyAddToCart";
import RecentlyViewed from "@/components/products/RecentlyViewed";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  warranty: string;
  images: string[];
  category?: { id: string; name: string };
  variants: Variant[];
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  battery?: string;
  operatingSystem?: string;
  graphics?: string;
  camera?: string;
  connectivity?: string;
  material?: string;
  gender?: string;
  fit?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const swipeHandlers = useSwipe(
    () => setSelectedImage((i) => Math.min(i + 1, (product?.images.length || 1) - 1)),
    () => setSelectedImage((i) => Math.max(i - 1, 0))
  );

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          router.push("/products");
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        addRecentlyViewed({
          id: data.product.id,
          name: data.product.name,
          price: data.product.price,
          image: data.product.images?.[0] || "",
        });
        if (data.product.variants?.length > 0) {
          setSelectedVariant(data.product.variants[0].id);
        }
      } catch {
        router.push("/products");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants.find((v) => v.id === selectedVariant);
    dispatch(
      addToCart({
        id: `${product.id}-${selectedVariant || "default"}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        quantity,
        size: variant?.size || "",
        color: variant?.color || "",
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  if (loading) return <LoadingSpinner className="py-24" />;
  if (!product) return null;

  const variant = product.variants.find((v) => v.id === selectedVariant);
  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model },
    { label: "Warranty", value: product.warranty },
    { label: "Processor", value: product.processor },
    { label: "RAM", value: product.ram },
    { label: "Storage", value: product.storage },
    { label: "Display", value: product.display },
    { label: "Battery", value: product.battery },
    { label: "OS", value: product.operatingSystem },
    { label: "Graphics", value: product.graphics },
    { label: "Camera", value: product.camera },
    { label: "Connectivity", value: product.connectivity },
    { label: "Material", value: product.material },
    { label: "Gender", value: product.gender },
    { label: "Fit", value: product.fit },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted" {...swipeHandlers}>
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.category && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-muted-foreground">{product.description}</p>

          {/* Variant Selection */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Variant</label>
              <Select value={selectedVariant} onValueChange={(v) => setSelectedVariant(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {[v.size, v.color].filter(Boolean).join(" / ") || "Default"}{" "}
                      ({v.stock} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(variant?.stock || 10, 10) }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={async () => {
                try {
                  await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: product.id }),
                  });
                  toast.success("Added to wishlist");
                } catch {
                  toast.error("Failed to add to wishlist");
                }
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold">Specifications</h3>
              <div className="grid gap-2 text-sm">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecentlyViewed />

      <StickyAddToCart
        product={product}
        selectedVariant={selectedVariant}
        variantSize={variant?.size}
        variantColor={variant?.color}
        quantity={quantity}
      />
    </div>
  );
}
