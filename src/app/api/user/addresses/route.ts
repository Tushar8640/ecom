import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireAuth();

    const addresses = await prisma.address.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return Response.json({ addresses });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Addresses get error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: auth.userId,
      },
    });

    return Response.json({ address }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Address create error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
