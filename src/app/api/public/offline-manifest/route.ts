import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [siteConfig, projects, blogs, skills, educations, experiences, teamMembers] = await Promise.all([
      prisma.siteConfig.findUnique({
        where: { singletonKey: 1 },
        select: {
          heroImageUrl: true,
          aboutImagePrimaryUrl: true,
          aboutImageSecondaryUrl: true,
          aboutImageTertiaryUrl: true,
        },
      }),
      prisma.project.findMany({
        where: { isPublished: true },
        select: { slug: true, coverImageUrl: true, logoUrl: true },
      }),
      prisma.blog.findMany({
        where: { isPublished: true },
        select: { slug: true, coverImageUrl: true, mediaUrls: true },
      }),
      prisma.skill.findMany({
        where: { isPublished: true },
        select: { logoUrl: true },
      }),
      prisma.education.findMany({
        where: { isPublished: true },
        select: { imageUrl: true, logoUrl: true },
      }),
      prisma.experience.findMany({
        where: { isPublished: true },
        select: { imageUrl: true },
      }),
      prisma.teamMember.findMany({
        where: { isPublished: true },
        select: { imageUrl: true },
      }),
    ]);

    const baseRoutes = ["/", "/projects", "/blogs", "/cv", "/offline"];
    const projectRoutes = projects.map((p) => `/projects/${encodeURIComponent(p.slug)}`);
    const blogRoutes = blogs.map((b) => `/blogs/${encodeURIComponent(b.slug)}`);

    const routes = Array.from(new Set([...baseRoutes, ...projectRoutes, ...blogRoutes]));

    const staticImages = [
      "/manifest.webmanifest",
      "/favicon.svg",
      "/favicon.ico",
      "/icon-192.png",
      "/icon-512.png",
      "/icon-maskable-192.png",
      "/icon-maskable-512.png",
      "/apple-touch-icon.png",
      "/locales/en.json",
      "/locales/bn.json",
    ];

    const imageSet = new Set<string>(staticImages);

    if (siteConfig?.heroImageUrl) imageSet.add(siteConfig.heroImageUrl);
    if (siteConfig?.aboutImagePrimaryUrl) imageSet.add(siteConfig.aboutImagePrimaryUrl);
    if (siteConfig?.aboutImageSecondaryUrl) imageSet.add(siteConfig.aboutImageSecondaryUrl);
    if (siteConfig?.aboutImageTertiaryUrl) imageSet.add(siteConfig.aboutImageTertiaryUrl);

    for (const project of projects) {
      if (project.coverImageUrl) imageSet.add(project.coverImageUrl);
      if (project.logoUrl) imageSet.add(project.logoUrl);
    }

    for (const blog of blogs) {
      if (blog.coverImageUrl) imageSet.add(blog.coverImageUrl);
      if (Array.isArray(blog.mediaUrls)) {
        for (const url of blog.mediaUrls) {
          if (url) imageSet.add(url);
        }
      }
    }

    for (const skill of skills) {
      if (skill.logoUrl) imageSet.add(skill.logoUrl);
    }

    for (const edu of educations) {
      if (edu.imageUrl) imageSet.add(edu.imageUrl);
      if (edu.logoUrl) imageSet.add(edu.logoUrl);
    }

    for (const exp of experiences) {
      if (exp.imageUrl) imageSet.add(exp.imageUrl);
    }

    for (const member of teamMembers) {
      if (member.imageUrl) imageSet.add(member.imageUrl);
    }

    const images = Array.from(imageSet).filter((url) => typeof url === "string" && url.trim().length > 0);

    return NextResponse.json(
      {
        routes,
        images,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        routes: ["/", "/projects", "/blogs", "/cv", "/offline"],
        images: [
          "/manifest.webmanifest",
          "/favicon.svg",
          "/favicon.ico",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-touch-icon.png",
          "/locales/en.json",
          "/locales/bn.json",
        ],
        timestamp: Date.now(),
      },
      { status: 200 },
    );
  }
}
