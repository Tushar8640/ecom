import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ coupons });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, startsAt, expiresAt } = body;

    if (!code || !discountValue) {
      return Response.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || "",
        discountType: discountType || "PERCENTAGE",
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxUses: maxUses || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return Response.json({ coupon }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
