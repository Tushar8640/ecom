import prisma from "@/lib/prisma";

export async function logAdminAction(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.adminLog.create({ data: params });
  } catch {
    console.error("Failed to log admin action:", params);
  }
}
