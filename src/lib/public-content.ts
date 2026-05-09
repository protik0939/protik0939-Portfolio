import { prisma } from "@/lib/prisma";

export type Language = "en" | "bn";

export function resolveLanguage(raw: string | undefined): Language {
  return raw?.toLowerCase() === "bn" ? "bn" : "en";
}

export function pickLocalized(language: Language, en: string, bn: string) {
  return language === "bn" ? bn : en;
}

export async function getSiteConfig() {
  return prisma.siteConfig.findUnique({
    where: { singletonKey: 1 },
  });
}

export async function getHomeContent() {
  const [siteConfig, educations, experiences, skills, projects, blogs, projectCount, blogCount] = await Promise.all([
    getSiteConfig(),
    prisma.education.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    }),
    prisma.experience.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    }),
    prisma.skill.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    }),
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
      take: 6,
    }),
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
      take: 6,
    }),
    prisma.project.count({
      where: { isPublished: true },
    }),
    prisma.blog.count({
      where: { isPublished: true },
    }),
  ]);

  const programmingLanguageNames = new Set([
    "c",
    "c++",
    "c#",
    "java",
    "javascript",
    "typescript",
    "python",
    "go",
    "rust",
    "php",
    "ruby",
    "kotlin",
    "swift",
    "dart",
    "scala",
    "r",
    "matlab",
    "sql",
  ]);

  const languageCountByCategory = skills.filter((skill) => {
    const key = skill.categoryKey.toLowerCase();
    const titleEn = skill.categoryTitleEn.toLowerCase();
    const titleBn = skill.categoryTitleBn.toLowerCase();
    return key.includes("language") || titleEn.includes("language") || titleBn.includes("ভাষা");
  }).length;

  const languageCountByName = new Set(
    skills
      .map((skill) => skill.nameEn.trim().toLowerCase())
      .filter((name) => programmingLanguageNames.has(name)),
  ).size;

  const languageCount = Math.max(languageCountByCategory, languageCountByName);

  return {
    siteConfig,
    educations,
    experiences,
    skills,
    projects,
    blogs,
    stats: {
      projectCount,
      blogCount,
      skillCount: skills.length,
      experienceCount: experiences.length,
      languageCount,
    },
  };
}

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });
}

export async function getPublishedProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
}

export async function getPublishedSkills() {
  return prisma.skill.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    select: {
      nameEn: true,
      nameBn: true,
      logoUrl: true,
    },
  });
}

export async function getPublishedTeamMembersByCodes(memberCodes: string[]) {
  if (memberCodes.length === 0) {
    return [];
  }

  return prisma.teamMember.findMany({
    where: {
      isPublished: true,
      memberCode: {
        in: memberCodes,
      },
    },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    select: {
      memberCode: true,
      nameEn: true,
      nameBn: true,
      imageUrl: true,
      portfolioUrl: true,
    },
  });
}

export async function getPublishedBlogs() {
  return prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });
}

export async function getPublishedBlogBySlug(slug: string) {
  return prisma.blog.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
}
