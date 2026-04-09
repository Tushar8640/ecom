"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { RootState } from "@/store/store";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        }
      />
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" size="sm" onClick={() => { setOpen(false); router.push("/products"); }}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <Button
                          variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => { dispatch(removeFromCart(item.id)); toast.success("Removed from cart"); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); router.push("/cart"); }}>
                  View Cart
                </Button>
                <Button className="flex-1" onClick={() => { setOpen(false); router.push("/checkout"); }}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
