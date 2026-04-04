"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store/store";
import CartItem from "@/components/cart/CartItem";
import FreeShippingIndicator from "@/components/cart/FreeShippingIndicator";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          actionLabel="Browse Products"
          onAction={() => router.push("/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FreeShippingIndicator subtotal={total} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
