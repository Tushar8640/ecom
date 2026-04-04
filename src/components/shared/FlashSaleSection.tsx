"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface FlashSale {
  id: string;
  name: string;
  discountPercent: number;
  endsAt: string;
}

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return "Ended";
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

function FlashSaleBanner({ sale }: { sale: FlashSale }) {
  const countdown = useCountdown(sale.endsAt);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
      <div className="flex items-center gap-3">
        <Zap className="h-6 w-6" />
        <div>
          <p className="font-bold text-lg">{sale.name}</p>
          <p className="text-sm text-white/90">Up to {sale.discountPercent}% off</p>
        </div>
      </div>
      <Badge variant="secondary" className="bg-white/20 text-white text-base px-4 py-1 font-mono">
        {countdown}
      </Badge>
    </div>
  );
}

export default function FlashSaleSection() {
  const [sales, setSales] = useState<FlashSale[]>([]);

  useEffect(() => {
    fetch("/api/flash-sales/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sales?.length) setSales(data.sales);
      })
      .catch(() => {});
  }, []);

  if (sales.length === 0) return null;

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <FlashSaleBanner key={sale.id} sale={sale} />
      ))}
    </div>
  );
}
