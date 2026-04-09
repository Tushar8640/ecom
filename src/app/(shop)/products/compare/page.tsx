"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  images: string[];
  category?: { name: string };
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  battery?: string;
  operatingSystem?: string;
  graphics?: string;
  camera?: string;
  connectivity?: string;
  material?: string;
}

const specRows = [
  { key: "brand", label: "Brand" },
  { key: "category", label: "Category" },
  { key: "processor", label: "Processor" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "display", label: "Display" },
  { key: "battery", label: "Battery" },
  { key: "operatingSystem", label: "OS" },
  { key: "graphics", label: "Graphics" },
  { key: "camera", label: "Camera" },
  { key: "connectivity", label: "Connectivity" },
  { key: "material", label: "Material" },
] as const;

export default function CompareProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-24" />}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = searchParams.get("ids") || "";

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }
    fetch(`/api/products/compare?ids=${ids}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading) return <LoadingSpinner className="py-24" />;

  function getValue(product: Product, key: string): string {
    if (key === "category") return product.category?.name || "—";
    return (product as unknown as Record<string, unknown>)[key] as string || "—";
  }

  // Filter spec rows to only show rows where at least one product has a value
  const visibleSpecs = specRows.filter((row) =>
    products.some((p) => getValue(p, row.key) !== "—")
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">Compare Products</h1>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No products to compare. Add product IDs via the <code>?ids=</code> parameter.
        </p>
      ) : (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Feature</TableHead>
                  {products.map((p) => (
                    <TableHead key={p.id} className="min-w-[180px] text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Price row */}
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  {products.map((p) => (
                    <TableCell key={p.id} className="text-center font-semibold text-primary">
                      {formatPrice(p.price)}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Spec rows */}
                {visibleSpecs.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    {products.map((p) => (
                      <TableCell key={p.id} className="text-center">
                        {getValue(p, row.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
