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

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteParams) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const titleEn = asString(body.titleEn, "titleEn");
    const slug = slugify(asString(body.slug ?? titleEn, "slug"));

    const updated = await prisma.project.update({
      where: { id },
      data: {
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
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
