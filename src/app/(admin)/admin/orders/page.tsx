"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, MapPin, User, Phone, Mail, Package, StickyNote, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product: { name: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
}

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/orders${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Order status updated");
        setSelected(null);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-gray-500">Manage customer orders</p>
      </div>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Orders</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="RETURNED">Returned</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No orders found.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Ship To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.fullName || "—"}</p>
                      <p className="text-xs text-gray-500">
                        {order.city && order.country
                          ? `${order.city}, ${order.country}`
                          : "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor[order.status] || ""}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setSelected(order); setNewStatus(order.status); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order #{selected?.id.slice(0, 8)}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selected && new Date(selected.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* Customer & Shipping Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4 text-muted-foreground" /> Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-medium">{selected.fullName || selected.user.name}</p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {selected.email || selected.user.email}
                    </p>
                    {selected.phone && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {selected.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {selected.address ? (
                      <div className="space-y-0.5 text-muted-foreground">
                        <p>{selected.address}</p>
                        <p>
                          {[selected.city, selected.state, selected.zipCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>{selected.country}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No address provided</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Notes */}
              {selected.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <StickyNote className="h-4 w-4 text-muted-foreground" /> Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selected.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-muted-foreground" /> Items ({selected.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
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
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                          {(item.size || item.color) &&
                            ` · ${[item.size, item.color].filter(Boolean).join(" / ")}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between pt-1">
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <span className="text-sm text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selected.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status */}
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Update Status:</span>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={handleUpdateStatus} disabled={updating || newStatus === selected?.status}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
