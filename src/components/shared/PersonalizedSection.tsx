"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: { id: string; name: string };
}

export default function PersonalizedSection() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Get recently viewed categories from localStorage
    try {
      const stored = localStorage.getItem("shopnest_recently_viewed");
      if (!stored) return;
      const recent = JSON.parse(stored);
      if (recent.length === 0) return;

      // Fetch recommended products
      fetch("/api/products?limit=4&sort=newest")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.products) {
            // Filter out recently viewed products
            const recentIds = new Set(recent.map((r: any) => r.id));
            const filtered = data.products.filter((p: Product) => !recentIds.has(p.id));
            setProducts(filtered.slice(0, 4));
          }
        })
        .catch(() => {});
    } catch {}
  }, [isAuthenticated]);

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight">Recommended for You</h2>
        <p className="mt-1 text-sm text-muted-foreground">Based on your browsing history</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
