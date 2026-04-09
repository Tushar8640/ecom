import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return Response.json({ error: "Code is required" }, { status: 400 });

    const card = await prisma.giftCard.findUnique({ where: { code: code.toUpperCase() } });
    if (!card || !card.isActive) return Response.json({ error: "Invalid gift card" }, { status: 404 });
    if (card.expiresAt && new Date() > card.expiresAt) return Response.json({ error: "Gift card expired" }, { status: 400 });

    return Response.json({ balance: card.balance, code: card.code });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
