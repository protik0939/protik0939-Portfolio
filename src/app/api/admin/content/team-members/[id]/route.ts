import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asOptionalString, asString, slugify } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteParams) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const nameEn = asString(body.nameEn, "nameEn");
    const memberCode = asString(body.memberCode ?? slugify(nameEn), "memberCode");

    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        memberCode,
        nameEn,
        nameBn: asString(body.nameBn, "nameBn"),
        imageUrl: asOptionalString(body.imageUrl),
        portfolioUrl: asOptionalString(body.portfolioUrl),
        sortOrder: asNumber(body.sortOrder, "sortOrder", 0),
        isPublished: asBoolean(body.isPublished, true),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
