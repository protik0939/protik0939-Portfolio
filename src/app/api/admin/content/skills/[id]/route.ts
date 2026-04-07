import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asOptionalString, asString } from "@/lib/content-validation";
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
    const categoryTitleEn = asString(body.categoryTitleEn, "categoryTitleEn");
    const categoryKey = asString(
      body.categoryKey ?? categoryTitleEn.toLowerCase().replace(/\s+/g, "-"),
      "categoryKey",
    );

    const updated = await prisma.skill.update({
      where: { id },
      data: {
        categoryKey,
        categoryTitleEn,
        categoryTitleBn: asString(body.categoryTitleBn, "categoryTitleBn"),
        nameEn: asString(body.nameEn, "nameEn"),
        nameBn: asString(body.nameBn, "nameBn"),
        percentage: asNumber(body.percentage, "percentage", 0),
        logoUrl: asOptionalString(body.logoUrl),
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
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
