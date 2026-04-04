import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { flashSaleSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/adminLogger";

export async function GET() {
  try {
    await requireAdmin();

    const flashSales = await prisma.flashSale.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ flashSales });
  } catch (error: any) {
    console.error("Admin flash sales list error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const validation = flashSaleSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const flashSale = await prisma.flashSale.create({
      data: {
        name: data.name,
        discount: data.discount,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        isActive: data.isActive,
        productIds: data.productIds,
      },
    });

    await logAdminAction({
      userId: session.userId,
      action: "CREATE_FLASH_SALE",
      entity: "FlashSale",
      entityId: flashSale.id,
    });

    return Response.json({ flashSale }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create flash sale error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
