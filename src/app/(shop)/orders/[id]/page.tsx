"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product: { id: string; name: string; images: string[] };
}

interface StatusEntry {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  items: OrderItem[];
  statusHistory: StatusEntry[];
}

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  RETURNED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.status === 401) {
          router.push("/login?callbackUrl=/orders");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          router.push("/orders");
        }
      } catch {
        router.push("/orders");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id, router]);

  if (loading) return <LoadingSpinner className="py-24" />;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push("/orders")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={statusColor[order.status] || ""}>
            {order.status}
          </Badge>
          <span className="text-lg font-semibold">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items + Shipping */}
        <div className="space-y-8 lg:col-span-2">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {item.product.images?.[0] ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.product.name}</p>
                            {(item.size || item.color) && (
                              <p className="text-xs text-muted-foreground">
                                {[item.size, item.color].filter(Boolean).join(" / ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.quantity * item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}</p>
              <p>{order.shippingPhone}</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline statusHistory={order.statusHistory || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
