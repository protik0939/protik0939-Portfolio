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

    const updated = await prisma.education.update({
      where: { id },
      data: {
        degreeEn: asString(body.degreeEn, "degreeEn"),
        degreeBn: asString(body.degreeBn, "degreeBn"),
        subjectEn: asString(body.subjectEn, "subjectEn"),
        subjectBn: asString(body.subjectBn, "subjectBn"),
        yearLabel: asString(body.yearLabel, "yearLabel"),
        resultEn: asString(body.resultEn, "resultEn"),
        resultBn: asString(body.resultBn, "resultBn"),
        institutionEn: asString(body.institutionEn, "institutionEn"),
        institutionBn: asString(body.institutionBn, "institutionBn"),
        detailsEn: asString(body.detailsEn ?? "-", "detailsEn"),
        detailsBn: asString(body.detailsBn ?? "-", "detailsBn"),
        imageUrl: asOptionalString(body.imageUrl),
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
    await prisma.education.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
