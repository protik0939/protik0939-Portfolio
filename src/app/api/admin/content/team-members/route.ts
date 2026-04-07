import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asOptionalString, asString, slugify } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const members = await prisma.teamMember.findMany({
    orderBy: [{ createdAt: "asc" }],
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nameEn = asString(body.nameEn, "nameEn");
    const memberCode = asString(body.memberCode ?? slugify(nameEn), "memberCode");

    const member = await prisma.teamMember.create({
      data: {
        adminId: guard.admin.id,
        memberCode,
        nameEn,
        nameBn: asString(body.nameBn, "nameBn"),
        imageUrl: asOptionalString(body.imageUrl),
        portfolioUrl: asOptionalString(body.portfolioUrl),
        sortOrder: asNumber(body.sortOrder, "sortOrder", 0),
        isPublished: asBoolean(body.isPublished, true),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
