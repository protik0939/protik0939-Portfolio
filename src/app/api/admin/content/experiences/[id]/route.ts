import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asString } from "@/lib/content-validation";
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

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        titleEn: asString(body.titleEn, "titleEn"),
        titleBn: asString(body.titleBn, "titleBn"),
        companyEn: asString(body.companyEn, "companyEn"),
        companyBn: asString(body.companyBn, "companyBn"),
        periodEn: asString(body.periodEn, "periodEn"),
        periodBn: asString(body.periodBn, "periodBn"),
        detailsEn: asString(body.detailsEn ?? "-", "detailsEn"),
        detailsBn: asString(body.detailsBn ?? "-", "detailsBn"),
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
    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
