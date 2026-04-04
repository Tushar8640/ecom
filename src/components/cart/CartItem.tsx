"use client";

import Image from "next/image";
import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import type { CartItem as CartItemType } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const dispatch = useDispatch();

  const handleQuantityChange = (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > 99) return;
    dispatch(updateQuantity({ id: item.id, quantity: newQty }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
    toast.success(`${item.name} removed from cart`);
  };

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
        <div>
          <h3 className="truncate text-sm font-medium">{item.name}</h3>
          {(item.size || item.color) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                .filter(Boolean)
                .join(" / ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="w-10 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= 99}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          {/* Price & Remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
