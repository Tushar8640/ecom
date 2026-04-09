import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return Response.json({ error: "Invalid or expired coupon" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return Response.json({ error: "This coupon is not yet active" }, { status: 400 });
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return Response.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return Response.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }
    if (orderTotal < coupon.minOrderAmount) {
      return Response.json({ error: `Minimum order amount is ৳${coupon.minOrderAmount}` }, { status: 400 });
    }

    const discount = coupon.discountType === "PERCENTAGE"
      ? Math.min((orderTotal * coupon.discountValue) / 100, orderTotal)
      : Math.min(coupon.discountValue, orderTotal);

    return Response.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
