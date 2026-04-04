"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import { Truck } from "lucide-react";

interface FreeShippingIndicatorProps {
  subtotal: number;
}

export default function FreeShippingIndicator({ subtotal }: FreeShippingIndicatorProps) {
  const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (qualifies) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        <Truck className="h-4 w-4 shrink-0" />
        <span>You qualify for free standard shipping!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="h-4 w-4 shrink-0" />
        <span>Add {formatPrice(remaining)} more for free shipping</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
