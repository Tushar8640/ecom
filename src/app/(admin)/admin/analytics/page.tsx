"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart, Clock, CheckCircle, RotateCcw,
  DollarSign, TrendingUp, BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Analytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  returnedOrders: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  ordersByMonth: Record<string, { count: number; revenue: number }>;
  topProducts: { id: string; name: string; price: number; totalQuantity: number }[];
  categorySales: { categoryName: string; count: number; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) setData(await res.json());
      } catch {} finally { setLoading(false); }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="py-12 text-center text-muted-foreground">Failed to load analytics.</p>;

  const fmt = formatPrice;

  const stats = [
    { title: "Total Orders", value: data.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Pending", value: data.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Completed", value: data.completedOrders, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Returned", value: data.returnedOrders, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
    { title: "Revenue", value: fmt(data.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Cost", value: fmt(data.totalCost), icon: BarChart3, color: "text-gray-600", bg: "bg-gray-50" },
    { title: "Profit", value: fmt(data.profit), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const months = Object.entries(data.ordersByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500">Detailed store performance metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{s.title}</p>
                    <p className="mt-1 text-2xl font-bold">{s.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders by Month */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Orders by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {months.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {months.map(([month, info]) => {
                const maxCount = Math.max(...months.map(([, m]) => m.count), 1);
                const pct = (info.count / maxCount) * 100;
                return (
                  <div key={month} className="flex items-center gap-4">
                    <span className="w-20 shrink-0 text-sm text-muted-foreground">{month}</span>
                    <div className="flex-1">
                      <div className="h-6 rounded bg-muted">
                        <div
                          className="flex h-full items-center rounded bg-primary/20 px-2 text-xs font-medium"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        >
                          {info.count}
                        </div>
                      </div>
                    </div>
                    <span className="w-24 text-right text-sm font-medium">{fmt(info.revenue)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts.map((p, i) => (
                    <TableRow key={p.id || i}>
                      <TableCell className="font-medium text-sm">{p.name || "Unknown"}</TableCell>
                      <TableCell>{p.totalQuantity}</TableCell>
                      <TableCell>{formatPrice(p.price || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Category Sales */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categorySales.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Items Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.categorySales.map((c) => (
                    <TableRow key={c.categoryName}>
                      <TableCell>
                        <Badge variant="secondary">{c.categoryName}</Badge>
                      </TableCell>
                      <TableCell>{c.count}</TableCell>
                      <TableCell className="font-medium">{fmt(c.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
