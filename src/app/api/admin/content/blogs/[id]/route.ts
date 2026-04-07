import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import {
  asBoolean,
  asDate,
  asNumber,
  asOptionalString,
  asString,
  slugify,
} from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getMediaUrls(body: Record<string, unknown>) {
  if (Array.isArray(body.mediaUrls)) {
    return body.mediaUrls.map((value) => String(value));
  }
  const images = Array.isArray(body.imageUrls) ? body.imageUrls.map((value) => String(value)) : [];
  const videos = Array.isArray(body.videoUrls) ? body.videoUrls.map((value) => String(value)) : [];
  return [...images, ...videos];
}

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
    const uploadedAtValue = body.uploadedAt ?? body.publishedAt;

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        slug,
        titleEn,
        titleBn: asString(body.titleBn, "titleBn"),
        fullDetailsEn: asString(body.fullDetailsEn, "fullDetailsEn"),
        fullDetailsBn: asString(body.fullDetailsBn, "fullDetailsBn"),
        mediaUrls: getMediaUrls(body),
        coverImageUrl: asOptionalString(body.coverImageUrl),
        authorNameEn: asString(body.authorNameEn ?? body.authorEn ?? "", "authorNameEn"),
        authorNameBn: asString(body.authorNameBn ?? body.authorBn ?? "", "authorNameBn"),
        tagsEn: asString(body.tagsEn ?? "", "tagsEn"),
        tagsBn: asString(body.tagsBn ?? "", "tagsBn"),
        timeToReadMinutes: asNumber(body.timeToReadMinutes ?? body.readTimeMinutes, "timeToReadMinutes", 5),
        uploadedAt: uploadedAtValue ? asDate(uploadedAtValue, "uploadedAt") : new Date(),
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
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
