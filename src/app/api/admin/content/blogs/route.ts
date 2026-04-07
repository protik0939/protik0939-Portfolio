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

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const blogs = await prisma.blog.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(blogs);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const titleEn = asString(body.titleEn, "titleEn");
    const slug = slugify(asString(body.slug ?? titleEn, "slug"));
    const uploadedAtValue = body.uploadedAt ?? body.publishedAt;

    const blog = await prisma.blog.create({
      data: {
        adminId: guard.admin.id,
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

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
