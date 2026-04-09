"use client";

import { useEffect, useState, useCallback } from "react";

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

const STORAGE_KEY = "shopnest_recently_viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const addItem = useCallback((product: RecentProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  return { items, addItem };
}
