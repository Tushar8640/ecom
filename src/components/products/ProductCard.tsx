"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const hasImage = product.images.length > 0 && !imageError;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        id: `${product.id}-default`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        quantity: 1,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    try {
      if (next) {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        toast.success("Added to wishlist");
      } else {
        await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" });
        toast.success("Removed from wishlist");
      }
    } catch {
      setWishlisted(!next);
      toast.error("Something went wrong");
    }
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => router.push(`/products/${product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          onClick={toggleWishlist}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            )}
          />
          <span className="sr-only">
            {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          </span>
        </Button>

        {/* Category Badge */}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 text-[10px]"
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="truncate text-sm font-medium leading-tight">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
