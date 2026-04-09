"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

export default function RecentlyViewed() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight">Recently Viewed</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="group flex w-40 shrink-0 flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-muted">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="160px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <p className="text-sm font-bold">{formatPrice(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
