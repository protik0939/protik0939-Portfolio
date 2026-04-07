import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asBoolean, asNumber, asOptionalString, asString } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(skills);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const categoryTitleEn = asString(body.categoryTitleEn, "categoryTitleEn");
    const categoryKey = asString(
      body.categoryKey ?? categoryTitleEn.toLowerCase().replace(/\s+/g, "-"),
      "categoryKey",
    );

    const skill = await prisma.skill.create({
      data: {
        adminId: guard.admin.id,
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

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
