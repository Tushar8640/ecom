import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: { endsAt: "asc" },
    });

    return Response.json({ flashSales });
  } catch (error: any) {
    console.error("Active flash sales error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
