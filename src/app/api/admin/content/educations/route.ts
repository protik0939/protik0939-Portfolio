import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asOptionalString, asString } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const educations = await prisma.education.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(educations);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const education = await prisma.education.create({
      data: {
        adminId: guard.admin.id,
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

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
