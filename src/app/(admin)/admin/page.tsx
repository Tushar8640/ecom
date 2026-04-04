"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

interface Analytics {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  profit: number;
}

interface Order {
  id: string;
  user: { name: string; email: string };
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ id: string }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/orders"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.orders?.slice(0, 5) || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Orders",
      value: analytics?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Revenue",
      value: formatPrice(analytics?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Profit",
      value: formatPrice(analytics?.profit ?? 0),
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    RETURNED: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your store performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">
            <ClipboardList className="mr-2 h-4 w-4" />
            View Orders
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            View Messages
          </Link>
        </Button>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders from your store</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No orders yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {order.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColor[order.status] || ""}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
