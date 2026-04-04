import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = newsletterSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email },
      update: { active: true },
      create: { email },
    });

    return Response.json({ subscription }, { status: 201 });
  } catch (error: any) {
    console.error("Newsletter subscribe error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
