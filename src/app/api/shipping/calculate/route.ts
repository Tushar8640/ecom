import { NextRequest } from "next/server";
import { calculateShippingCost, getEstimatedDelivery, SHIPPING_METHODS } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, subtotal } = body;

    if (!method || subtotal == null) {
      return Response.json(
        { error: "method and subtotal are required" },
        { status: 400 }
      );
    }

    if (!(method in SHIPPING_METHODS)) {
      return Response.json({ error: "Invalid shipping method" }, { status: 400 });
    }

    const cost = calculateShippingCost(method, subtotal);
    const estimatedDelivery = getEstimatedDelivery(method);

    return Response.json({ cost, estimatedDelivery });
  } catch (error) {
    console.error("Shipping calculate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
