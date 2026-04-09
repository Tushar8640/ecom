"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface StickyAddToCartProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  selectedVariant?: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
}

export default function StickyAddToCart({ product, selectedVariant, variantSize, variantColor, quantity }: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const handleAdd = () => {
    dispatch(addToCart({
      id: `${product.id}-${selectedVariant || "default"}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      quantity,
      size: variantSize || "",
      color: variantColor || "",
    }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur shadow-lg animate-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
        <Button size="lg" onClick={handleAdd}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
