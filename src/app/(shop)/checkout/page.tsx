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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, MapPin, User, CreditCard, Check, Tag, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import confetti from "@/lib/confetti";

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "India", "Japan", "Brazil", "Mexico"];
const steps = [
  { id: 1, label: "Contact", icon: User },
  { id: 2, label: "Shipping", icon: MapPin },
  { id: 3, label: "Review", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.name || "", email: user?.email || "", phone: "",
    address: "", city: "", state: "", zipCode: "", country: "", notes: "",
  });

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/user/addresses");
        if (res.ok) { const data = await res.json(); setAddresses(data.addresses || []); }
      } catch {}
    }
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const addr = addresses.find((a) => a.id === addressId);
    if (addr) {
      setForm((f) => ({
        ...f,
        fullName: addr.fullName || f.fullName, phone: addr.phone || f.phone,
        address: addr.address || "", city: addr.city || "", state: addr.state || "",
        zipCode: addr.zipCode || "", country: addr.country || "",
      }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: total }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data.coupon.discount);
        setCouponApplied(data.coupon.code);
        toast.success(`Coupon applied: -${formatPrice(data.coupon.discount)}`);
      } else {
        toast.error(data.error || "Invalid coupon");
      }
    } catch { toast.error("Failed to validate coupon"); }
    finally { setApplyingCoupon(false); }
  };

  const removeCoupon = () => { setCouponDiscount(0); setCouponApplied(""); setCouponCode(""); };

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, orderPlaced, router]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-3 text-muted-foreground">Thank you for your purchase. You&apos;ll receive a confirmation email shortly.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/orders")}>View Orders</Button>
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const validateStep1 = () => form.fullName && form.email && form.phone;
  const validateStep2 = () => form.address && form.city && form.state && form.zipCode && form.country;

  const handleNext = () => {
    if (step === 1 && !validateStep1()) { toast.error("Please fill in all contact fields"); return; }
    if (step === 2 && !validateStep2()) { toast.error("Please fill in all shipping fields"); return; }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      if (isAuthenticated) {
        await fetch("/api/cart", { method: "DELETE" });
        for (const item of items) {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.productId, quantity: item.quantity, size: item.size || "", color: item.color || "" }),
          });
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, couponCode: couponApplied || undefined, discount: couponDiscount }),
      });

      if (!res.ok) { const data = await res.json(); toast.error(data.error || "Failed to place order"); return; }

      dispatch(clearCart());
      confetti();
      setOrderPlaced(true);
    } catch { toast.error("Something went wrong"); }
    finally { setPlacing(false); }
  };

  const finalTotal = Math.max(total - couponDiscount, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {step > 1 ? "Back" : "Back to Cart"}
      </Button>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`h-0.5 w-8 sm:w-16 ${isDone ? "bg-primary" : "bg-muted"}`} />}
              <button
                onClick={() => isDone && setStep(s.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Contact */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Contact Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="John Doe" required /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" required /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 123-4567" required /></div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleNext}>Continue to Shipping <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="space-y-6">
              {addresses.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Saved Addresses</CardTitle></CardHeader>
                  <CardContent>
                    <Select value={selectedAddress} onValueChange={(v) => v && handleAddressSelect(v)}>
                      <SelectTrigger><SelectValue placeholder="Select a saved address" /></SelectTrigger>
                      <SelectContent>
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>{addr.label} — {addr.city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" /> Shipping Address</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label>Street Address *</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" required /></div>
                  <div className="space-y-2"><Label>City *</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} required /></div>
                  <div className="space-y-2"><Label>State *</Label><Input value={form.state} onChange={(e) => update("state", e.target.value)} required /></div>
                  <div className="space-y-2"><Label>ZIP Code *</Label><Input value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} required /></div>
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Select value={form.country} onValueChange={(v) => update("country", v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button onClick={handleNext}>Continue to Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Order Notes (Optional)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Special delivery instructions..." rows={3} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Review Your Order</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium">{form.fullName}</p>
                      <p className="text-sm text-muted-foreground">{form.email}</p>
                      <p className="text-sm text-muted-foreground">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Shipping</p>
                      <p className="text-sm">{form.address}</p>
                      <p className="text-sm text-muted-foreground">{form.city}, {form.state} {form.zipCode}</p>
                      <p className="text-sm text-muted-foreground">{form.country}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" /> : (
                            <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-4 w-4 text-muted-foreground/40" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}{(item.size || item.color) && ` · ${[item.size, item.color].filter(Boolean).join(" / ")}`}</p>
                        </div>
                        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={placing}>
                    {placing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Order — {formatPrice(finalTotal)}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              {/* Coupon */}
              {!couponApplied ? (
                <div className="flex gap-2">
                  <Input placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="text-sm" />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                    {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                  <span className="text-green-700"><Tag className="mr-1 inline h-3 w-3" />{couponApplied}</span>
                  <button onClick={removeCoupon} className="text-xs text-green-600 hover:underline">Remove</button>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
