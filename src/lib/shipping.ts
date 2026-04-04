export const SHIPPING_METHODS = {
  STANDARD: { label: "Standard Delivery", cost: 60, days: "5-7 business days" },
  EXPRESS: { label: "Express Delivery", cost: 150, days: "2-3 business days" },
  SAME_DAY: { label: "Same Day Delivery", cost: 300, days: "Today" },
} as const;

export const FREE_SHIPPING_THRESHOLD = 5000;

export function calculateShippingCost(method: keyof typeof SHIPPING_METHODS, subtotal: number): number {
  if (method === "STANDARD" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_METHODS[method].cost;
}

export function getEstimatedDelivery(method: keyof typeof SHIPPING_METHODS): Date {
  const now = new Date();
  const daysMap = { STANDARD: 7, EXPRESS: 3, SAME_DAY: 0 };
  now.setDate(now.getDate() + daysMap[method]);
  return now;
}
