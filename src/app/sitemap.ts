import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

// Built on request so newly published blogs/projects appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blogs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/resume`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [projects, blogs] = await Promise.all([
      prisma.project.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.blog.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticEntries,
      ...projects.map((project) => ({
        url: `${siteUrl}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...blogs.map((blog) => ({
        url: `${siteUrl}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    // Never fail the sitemap because of a database hiccup; serve the static pages.
    return staticEntries;
  }
}
