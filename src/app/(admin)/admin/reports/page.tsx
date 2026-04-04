"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DaySales {
  count: number;
  total: number;
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [groupedByDay, setGroupedByDay] = useState<Record<string, DaySales>>({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/reports/sales?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGroupedByDay(data.groupedByDay || {});
        setGrandTotal(data.grandTotal || 0);
        setOrderCount(data.orderCount || 0);
        setFetched(true);
      }
    } catch {} finally { setLoading(false); }
  };

  const days = Object.entries(groupedByDay).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-sm text-gray-500">View sales data by date range</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={fetchReport} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Report
        </Button>
      </div>

      {fetched && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{formatPrice(grandTotal)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{orderCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {orderCount > 0 ? formatPrice(grandTotal / orderCount) : formatPrice(0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {days.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No sales data for this period.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map(([date, data]) => (
                    <TableRow key={date}>
                      <TableCell className="font-medium">{date}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell className="font-medium">{formatPrice(data.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
