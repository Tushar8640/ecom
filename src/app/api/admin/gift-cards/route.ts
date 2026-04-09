import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  try {
    await requireAdmin();
    const cards = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ giftCards: cards });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { value, recipientEmail, expiresAt } = await request.json();
    if (!value || value <= 0) return Response.json({ error: "Value must be positive" }, { status: 400 });

    const card = await prisma.giftCard.create({
      data: {
        code: generateCode(),
        balance: value,
        initialValue: value,
        recipientEmail: recipientEmail || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return Response.json({ giftCard: card }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
