"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { RootState } from "@/store/store";
import { clearCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, ShoppingBag, MapPin, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "India",
  "Japan",
  "Brazil",
  "Mexico",
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/user/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
        }
      } catch {
        // silently fail — saved addresses are optional
      }
    }
    fetchAddresses();
  }, []);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    notes: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const addr = addresses.find((a) => a.id === addressId);
    if (addr) {
      setForm((f) => ({
        ...f,
        fullName: addr.fullName || f.fullName,
        phone: addr.phone || f.phone,
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        zipCode: addr.zipCode || "",
        country: addr.country || "",
      }));
    }
  };

  if (!isAuthenticated) {
    router.push("/login?callbackUrl=/cart");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.zipCode ||
      !form.country
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setPlacing(true);
    try {
      // Clear server cart first to avoid duplicate quantities
      await fetch("/api/cart", { method: "DELETE" });

      // Sync cart items to server
      for (const item of items) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size || "",
            color: item.color || "",
          }),
        });
      }

      // Place order with shipping info
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to place order");
        return;
      }

      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: Shipping Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" /> Saved Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedAddress}
                    onValueChange={handleAddressSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id}>
                          {addr.label || "Address"} &mdash; {addr.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Street Address *</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="San Francisco"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Province *</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="California"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP / Postal Code *</Label>
                  <Input
                    value={form.zipCode}
                    onChange={(e) => update("zipCode", e.target.value)}
                    placeholder="94102"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => update("country", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Special delivery instructions, gift message, etc."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" /> Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                          {(item.size || item.color) &&
                            ` · ${[item.size, item.color].filter(Boolean).join(" / ")}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Items ({itemCount})
                    </span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={placing}
                >
                  {placing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Place Order &mdash; {formatPrice(total)}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
