import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import {
  asBoolean,
  asNumber,
  asOptionalString,
  asString,
  slugify,
} from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const titleEn = asString(body.titleEn, "titleEn");
    const slug = slugify(asString(body.slug ?? titleEn, "slug"));

    const project = await prisma.project.create({
      data: {
        adminId: guard.admin.id,
        slug,
        titleEn,
        titleBn: asString(body.titleBn, "titleBn"),
        typeEn: asString(body.typeEn, "typeEn"),
        typeBn: asString(body.typeBn, "typeBn"),
        detailsEn: asString(body.detailsEn, "detailsEn"),
        detailsBn: asString(body.detailsBn, "detailsBn"),
        level: asString(body.level ?? "Beginner", "level"),
        categoryEn: asString(body.categoryEn ?? "", "categoryEn"),
        categoryBn: asString(body.categoryBn ?? "", "categoryBn"),
        technologiesEn: asString(body.technologiesEn ?? "", "technologiesEn"),
        technologiesBn: asString(body.technologiesBn ?? "", "technologiesBn"),
        logoUrl: asOptionalString(body.logoUrl),
        coverImageUrl: asOptionalString(body.coverImageUrl),
        liveUrl: asOptionalString(body.liveUrl),
        memberCodes: Array.isArray(body.memberCodes)
          ? body.memberCodes.map((value) => String(value))
          : [],
        sortOrder: asNumber(body.sortOrder, "sortOrder", 0),
        isPublished: asBoolean(body.isPublished, true),
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
