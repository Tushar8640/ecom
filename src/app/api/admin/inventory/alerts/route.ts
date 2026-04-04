import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const count = await prisma.product.count({
      where: { variants: { some: { stock: { lt: 10 } } } },
    });

    return Response.json({ count });
  } catch (error: any) {
    console.error("Inventory alerts error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
