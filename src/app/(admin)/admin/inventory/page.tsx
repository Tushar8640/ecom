"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, Loader2 } from "lucide-react";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  variants: Variant[];
  category: { id: string; name: string };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = lowStockOnly ? "?lowStock=true" : "";
      const [invRes, alertRes] = await Promise.all([
        fetch(`/api/admin/inventory${params}`),
        fetch("/api/admin/inventory/alerts"),
      ]);
      if (invRes.ok) {
        const data = await invRes.json();
        setProducts(data.products || []);
      }
      if (alertRes.ok) {
        const data = await alertRes.json();
        setAlertCount(data.count || 0);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [lowStockOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-gray-500">Monitor stock levels across all products</p>
      </div>

      <div className="flex items-center gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{products.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{alertCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        variant={lowStockOnly ? "default" : "outline"}
        onClick={() => setLowStockOnly(!lowStockOnly)}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        {lowStockOnly ? "Showing Low Stock Only" : "Show Low Stock Only"}
      </Button>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.flatMap((product) =>
                product.variants.length > 0
                  ? product.variants.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{product.category.name}</TableCell>
                        <TableCell>{v.size || "—"}</TableCell>
                        <TableCell>{v.color || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={v.stock < 10 ? "destructive" : "secondary"}>
                            {v.stock}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  : [
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{product.category.name}</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell><Badge variant="secondary">0</Badge></TableCell>
                      </TableRow>,
                    ]
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
