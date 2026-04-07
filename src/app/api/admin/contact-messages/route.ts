import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) {
    return guard.response;
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 300,
  });

  return NextResponse.json(messages);
}
