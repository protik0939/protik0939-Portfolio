import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asString } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(experiences);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const experience = await prisma.experience.create({
      data: {
        adminId: guard.admin.id,
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

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
