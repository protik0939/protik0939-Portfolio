import "dotenv/config";

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const directDatabaseUrl = process.env.DIRECT_DATABASE_URL;

function createPrismaClient() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for seeding admin user.");
  }

  if (databaseUrl.startsWith("prisma+")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  const connectionString = directDatabaseUrl ?? databaseUrl;
  const adapter = new PrismaPg(new Pool({ connectionString }));

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

type SeedAdminInput = {
  email: string;
  password: string;
  fullName?: string;
};

type LocaleMap = Record<string, string>;

type LegacyTopBarItem = {
  first: string;
  second: string;
  third: string;
  fourth: string;
};

type LegacyEducationItem = {
  dType: string;
  dOn: string;
  dYear: string;
  dResult: string;
  institution: string;
  iImage?: string | null;
  iLogo?: string | null;
  iDetails: string;
};

type LegacySkillInfo = {
  id: string;
  name: string;
  logo?: string | null;
  percentage?: string;
};

type LegacySkillGroup = {
  id: string;
  title: string;
  sdInfos: LegacySkillInfo[];
};

type LegacyProject = {
  pId: string;
  pTitle: string;
  pImgSrc?: string | null;
  pType: string;
  pLevel: string;
  pLink?: string | null;
  pDetails: string;
  pMaterials?: string[];
  pCategory: string;
  pMembers?: string[];
  pLogo?: string | null;
};

type LegacyTeamMember = {
  tId: string;
  tName: string;
  tImage?: string | null;
  prtlink?: string | null;
};

type LegacyBlog = {
  _id: string;
  title: string;
  author: string;
  uploadTime?: string;
  timeToRead?: string;
  fullDetails: string;
  tags?: string[];
  imageSource?: string[];
};

type LegacySeedBundle = {
  en: LocaleMap;
  bn: LocaleMap;
  topBarData: LegacyTopBarItem[];
  eduData: LegacyEducationItem[];
  skillData: LegacySkillGroup[];
  projectsInfo: LegacyProject[];
  teamInfo: LegacyTeamMember[];
  blogPost: LegacyBlog[];
};

export async function seedAdmin(input: SeedAdminInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 12);

  const admin = await prisma.admin.upsert({
    where: { singletonKey: 1 },
    create: {
      singletonKey: 1,
      email: normalizedEmail,
      passwordHash,
      fullName: input.fullName,
      isActive: true,
    },
    update: {
      passwordHash,
      fullName: input.fullName,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  return admin;
}

function txt(locale: LocaleMap, key: string, fallback = "") {
  const value = locale[key];
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeDigits(value: string) {
  const banglaDigits: Record<string, string> = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };

  return value.replace(/[০-৯]/g, (digit) => banglaDigits[digit] ?? digit);
}

function parseMinutes(text: string) {
  const normalized = normalizeDigits(text);
  const match = normalized.match(/\d+/);
  if (!match) return 5;
  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : 5;
}

function parsePercent(text: string | undefined) {
  if (!text) return 0;
  const normalized = normalizeDigits(text);
  const match = normalized.match(/\d+/);
  if (!match) return 0;
  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : 0;
}

async function resolveDataFile(fileName: string) {
  const candidates = [
    process.env.LEGACY_DATA_DIR ? path.join(process.env.LEGACY_DATA_DIR, fileName) : "",
    path.join(process.cwd(), "prisma", "seed-data", fileName),
    path.join(process.cwd(), "seed-data", fileName),
    process.env.USERPROFILE ? path.join(process.env.USERPROFILE, "Downloads", fileName) : "",
  ].filter((candidate) => candidate.length > 0);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`Could not find ${fileName}. Checked: ${candidates.join(", ")}`);
}

function evaluateTsExports(source: string, exportNames: string[]) {
  const withoutImports = source.replace(/^\s*import\s+[^\n]*\n/gm, "");
  const withoutExportKeyword = withoutImports.replace(/^\s*export\s+const\s+/gm, "const ");
  const wrapped = `${withoutExportKeyword}\nmodule.exports = { ${exportNames.join(", ")} };`;

  const moduleRef: { exports: Record<string, unknown> } = { exports: {} };
  const context = {
    module: moduleRef,
    exports: moduleRef.exports,
  };

  vm.runInNewContext(wrapped, context, { timeout: 10000 });
  return moduleRef.exports;
}

async function loadLegacyBundle(): Promise<LegacySeedBundle> {
  const [enPath, bnPath, jsonDataPath] = await Promise.all([
    resolveDataFile("en.ts"),
    resolveDataFile("bn.ts"),
    resolveDataFile("jsonData.ts"),
  ]);

  const [enSource, bnSource, jsonDataSource] = await Promise.all([
    readFile(enPath, "utf-8"),
    readFile(bnPath, "utf-8"),
    readFile(jsonDataPath, "utf-8"),
  ]);

  const enParsed = evaluateTsExports(enSource, ["en"]);
  const bnParsed = evaluateTsExports(bnSource, ["bn"]);
  const dataParsed = evaluateTsExports(jsonDataSource, [
    "topBarData",
    "eduData",
    "skillData",
    "projectsInfo",
    "teamInfo",
    "blogPost",
  ]);

  const en = (enParsed.en ?? {}) as LocaleMap;
  const bn = (bnParsed.bn ?? {}) as LocaleMap;

  return {
    en,
    bn,
    topBarData: (dataParsed.topBarData ?? []) as LegacyTopBarItem[],
    eduData: (dataParsed.eduData ?? []) as LegacyEducationItem[],
    skillData: (dataParsed.skillData ?? []) as LegacySkillGroup[],
    projectsInfo: (dataParsed.projectsInfo ?? []) as LegacyProject[],
    teamInfo: (dataParsed.teamInfo ?? []) as LegacyTeamMember[],
    blogPost: (dataParsed.blogPost ?? []) as LegacyBlog[],
  };
}

function firstCover(mediaUrls: string[]) {
  const withImageExt = mediaUrls.find((url) => /\.(png|jpe?g|webp|gif|svg)$/i.test(url));
  if (withImageExt) return withImageExt;

  const withLocalPath = mediaUrls.find((url) => url.startsWith("/"));
  if (withLocalPath) return withLocalPath;

  return mediaUrls[0] ?? null;
}

async function seedCmsContent(adminId: string) {
  const legacy = await loadLegacyBundle();
  const { en, bn, topBarData, eduData, skillData, projectsInfo, teamInfo, blogPost } = legacy;

  const banner = topBarData[0];

  const materialLabels = new Map<string, { en: string; bn: string }>();
  for (const skillGroup of skillData) {
    for (const skill of skillGroup.sdInfos ?? []) {
      materialLabels.set(skill.id, {
        en: txt(en, skill.name, skill.id),
        bn: txt(bn, skill.name, skill.id),
      });
    }
  }

  await prisma.siteConfig.upsert({
    where: { singletonKey: 1 },
    create: {
      adminId,
      singletonKey: 1,
      siteTitleEn: txt(en, "brand", "DevPortfolio"),
      siteTitleBn: txt(bn, "brand", "ডেভপোর্টফোলিও"),
      siteDescriptionEn: txt(en, "ui.readMore", "Portfolio Website"),
      siteDescriptionBn: txt(bn, "ui.readMore", "পোর্টফোলিও ওয়েবসাইট"),
      navHomeEn: txt(en, "home", "Home"),
      navHomeBn: txt(bn, "home", "হোম"),
      navAboutEn: txt(en, "about", "About"),
      navAboutBn: txt(bn, "about", "পরিচিতি"),
      navEducationEn: txt(en, "education", "Education"),
      navEducationBn: txt(bn, "education", "শিক্ষা"),
      navSkillsEn: txt(en, "skills", "Skills"),
      navSkillsBn: txt(bn, "skills", "দক্ষতা"),
      navProjectsEn: txt(en, "projects", "Projects"),
      navProjectsBn: txt(bn, "projects", "প্রজেক্ট"),
      navBlogsEn: txt(en, "blogs", "Blogs"),
      navBlogsBn: txt(bn, "blogs", "ব্লগসমূহ"),
      navContactEn: txt(en, "contact", "Contact"),
      navContactBn: txt(bn, "contact", "যোগাযোগ"),
      navCvEn: txt(en, "cv", "CV"),
      navCvBn: txt(bn, "cv", "সিভি"),
      heroHelloEn: txt(en, banner?.first ?? "banner.hello", "Hello!"),
      heroHelloBn: txt(bn, banner?.first ?? "banner.hello", "হ্যালো!"),
      heroIamEn: txt(en, banner?.second ?? "banner.iam", "I am"),
      heroIamBn: txt(bn, banner?.second ?? "banner.iam", "আমি"),
      heroFirstNameEn: txt(en, banner?.third ?? "banner.firstName", "Sadat Alam"),
      heroFirstNameBn: txt(bn, banner?.third ?? "banner.firstName", "সাদাত আলম"),
      heroLastNameEn: txt(en, banner?.fourth ?? "banner.lastName", "Protik"),
      heroLastNameBn: txt(bn, banner?.fourth ?? "banner.lastName", "প্রতীক"),
      heroDescriptionEn: txt(en, "ui.readMore", "Read More"),
      heroDescriptionBn: txt(bn, "ui.readMore", "আরও পড়ুন"),
      aboutDescriptionEn:
        "Portfolio profile and project showcase. You can edit this text from admin panel now.",
      aboutDescriptionBn:
        "এটি একটি পোর্টফোলিও প্রোফাইল এবং প্রজেক্ট শোকেস। এখন আপনি অ্যাডমিন প্যানেল থেকে এই টেক্সট সম্পাদনা করতে পারবেন।",
      projectsSectionTitleEn: txt(en, "projectsbyme", "Projects By me"),
      projectsSectionTitleBn: txt(bn, "projectsbyme", "আমার প্রজেক্টসমূহ"),
      blogsSectionTitleEn: txt(en, "blogs", "Blogs"),
      blogsSectionTitleBn: txt(bn, "blogs", "ব্লগসমূহ"),
      contactEmail: "hello@devportfolio.com",
      contactPhone: "+8801000000000",
      contactLocationEn: "Bangladesh",
      contactLocationBn: "বাংলাদেশ",
    },
    update: {
      adminId,
      siteTitleEn: txt(en, "brand", "DevPortfolio"),
      siteTitleBn: txt(bn, "brand", "ডেভপোর্টফোলিও"),
      siteDescriptionEn: txt(en, "ui.readMore", "Portfolio Website"),
      siteDescriptionBn: txt(bn, "ui.readMore", "পোর্টফোলিও ওয়েবসাইট"),
      navHomeEn: txt(en, "home", "Home"),
      navHomeBn: txt(bn, "home", "হোম"),
      navAboutEn: txt(en, "about", "About"),
      navAboutBn: txt(bn, "about", "পরিচিতি"),
      navEducationEn: txt(en, "education", "Education"),
      navEducationBn: txt(bn, "education", "শিক্ষা"),
      navSkillsEn: txt(en, "skills", "Skills"),
      navSkillsBn: txt(bn, "skills", "দক্ষতা"),
      navProjectsEn: txt(en, "projects", "Projects"),
      navProjectsBn: txt(bn, "projects", "প্রজেক্ট"),
      navBlogsEn: txt(en, "blogs", "Blogs"),
      navBlogsBn: txt(bn, "blogs", "ব্লগসমূহ"),
      navContactEn: txt(en, "contact", "Contact"),
      navContactBn: txt(bn, "contact", "যোগাযোগ"),
      navCvEn: txt(en, "cv", "CV"),
      navCvBn: txt(bn, "cv", "সিভি"),
      heroHelloEn: txt(en, banner?.first ?? "banner.hello", "Hello!"),
      heroHelloBn: txt(bn, banner?.first ?? "banner.hello", "হ্যালো!"),
      heroIamEn: txt(en, banner?.second ?? "banner.iam", "I am"),
      heroIamBn: txt(bn, banner?.second ?? "banner.iam", "আমি"),
      heroFirstNameEn: txt(en, banner?.third ?? "banner.firstName", "Sadat Alam"),
      heroFirstNameBn: txt(bn, banner?.third ?? "banner.firstName", "সাদাত আলম"),
      heroLastNameEn: txt(en, banner?.fourth ?? "banner.lastName", "Protik"),
      heroLastNameBn: txt(bn, banner?.fourth ?? "banner.lastName", "প্রতীক"),
      heroDescriptionEn: txt(en, "ui.readMore", "Read More"),
      heroDescriptionBn: txt(bn, "ui.readMore", "আরও পড়ুন"),
      projectsSectionTitleEn: txt(en, "projectsbyme", "Projects By me"),
      projectsSectionTitleBn: txt(bn, "projectsbyme", "আমার প্রজেক্টসমূহ"),
      blogsSectionTitleEn: txt(en, "blogs", "Blogs"),
      blogsSectionTitleBn: txt(bn, "blogs", "ব্লগসমূহ"),
    },
  });

  const educations = eduData.map((item, index) => ({
    adminId,
    degreeEn: txt(en, item.dType, item.dType),
    degreeBn: txt(bn, item.dType, item.dType),
    subjectEn: txt(en, item.dOn, item.dOn),
    subjectBn: txt(bn, item.dOn, item.dOn),
    yearLabel: txt(en, item.dYear, item.dYear),
    resultEn: txt(en, item.dResult, item.dResult),
    resultBn: txt(bn, item.dResult, item.dResult),
    institutionEn: txt(en, item.institution, item.institution),
    institutionBn: txt(bn, item.institution, item.institution),
    detailsEn: txt(en, item.iDetails, ""),
    detailsBn: txt(bn, item.iDetails, ""),
    imageUrl: item.iImage ?? null,
    logoUrl: item.iLogo ?? null,
    sortOrder: index + 1,
    isPublished: true,
  }));

  await prisma.education.deleteMany({ where: { adminId } });
  if (educations.length > 0) {
    await prisma.education.createMany({ data: educations });
  }

  const skills = skillData.flatMap((group, groupIndex) =>
    (group.sdInfos ?? []).map((skill, skillIndex) => ({
      adminId,
      categoryKey: group.id,
      categoryTitleEn: txt(en, group.title, group.title),
      categoryTitleBn: txt(bn, group.title, group.title),
      nameEn: txt(en, skill.name, skill.id),
      nameBn: txt(bn, skill.name, skill.id),
      percentage: parsePercent(skill.percentage),
      logoUrl: skill.logo ?? null,
      sortOrder: groupIndex * 100 + skillIndex + 1,
      isPublished: true,
    })),
  );

  await prisma.skill.deleteMany({ where: { adminId } });
  if (skills.length > 0) {
    await prisma.skill.createMany({ data: skills });
  }

  const teamMembers = teamInfo.map((member, index) => ({
    adminId,
    memberCode: member.tId,
    nameEn: txt(en, member.tName, member.tId),
    nameBn: txt(bn, member.tName, member.tId),
    imageUrl: member.tImage ?? null,
    portfolioUrl: member.prtlink ?? null,
    sortOrder: index + 1,
    isPublished: true,
  }));

  await prisma.teamMember.deleteMany({ where: { adminId } });
  if (teamMembers.length > 0) {
    await prisma.teamMember.createMany({ data: teamMembers });
  }

  const projects = projectsInfo.map((project, index) => {
    const materials = (project.pMaterials ?? []).map((materialId) => materialLabels.get(materialId));

    return {
      adminId,
      slug: project.pId,
      titleEn: txt(en, project.pTitle, project.pId),
      titleBn: txt(bn, project.pTitle, project.pId),
      typeEn: txt(en, project.pType, project.pType),
      typeBn: txt(bn, project.pType, project.pType),
      detailsEn: txt(en, project.pDetails, ""),
      detailsBn: txt(bn, project.pDetails, ""),
      level: txt(en, project.pLevel, "Beginner"),
      categoryEn: txt(en, project.pCategory, project.pCategory),
      categoryBn: txt(bn, project.pCategory, project.pCategory),
      liveUrl: project.pLink ?? null,
      logoUrl: project.pLogo ?? null,
      coverImageUrl: project.pImgSrc ?? null,
      technologiesEn: materials
        .map((material, materialIndex) => material?.en ?? project.pMaterials?.[materialIndex] ?? "")
        .filter(Boolean)
        .join(", "),
      technologiesBn: materials
        .map((material, materialIndex) => material?.bn ?? project.pMaterials?.[materialIndex] ?? "")
        .filter(Boolean)
        .join(", "),
      memberCodes: project.pMembers ?? [],
      sortOrder: index + 1,
      isPublished: true,
    };
  });

  await prisma.project.deleteMany({ where: { adminId } });
  if (projects.length > 0) {
    await prisma.project.createMany({ data: projects });
  }

  const blogs = blogPost.map((blog, index) => {
    const tagsEn = (blog.tags ?? []).map((tag) => txt(en, `tag.${tag}`, tag)).join(", ");
    const tagsBn = (blog.tags ?? []).map((tag) => txt(bn, `tag.${tag}`, tag)).join(", ");
    const timeEn = txt(en, blog.timeToRead ?? "", "5");
    const mediaUrls = (blog.imageSource ?? []).map((url) => String(url));

    return {
      adminId,
      slug: blog._id,
      titleEn: txt(en, blog.title, blog._id),
      titleBn: txt(bn, blog.title, blog._id),
      authorNameEn: txt(en, blog.author, blog.author),
      authorNameBn: txt(bn, blog.author, blog.author),
      timeToReadMinutes: parseMinutes(timeEn),
      uploadedAt: blog.uploadTime ? new Date(blog.uploadTime) : new Date(),
      fullDetailsEn: txt(en, blog.fullDetails, ""),
      fullDetailsBn: txt(bn, blog.fullDetails, ""),
      tagsEn,
      tagsBn,
      mediaUrls,
      coverImageUrl: firstCover(mediaUrls),
      sortOrder: index + 1,
      isPublished: true,
    };
  });

  await prisma.blog.deleteMany({ where: { adminId } });
  if (blogs.length > 0) {
    await prisma.blog.createMany({ data: blogs });
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME ?? "Default Admin";

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin user.");
  }

  const admin = await seedAdmin({ email, password, fullName });
  console.info("[seed] Admin user is ready:", admin);

  await seedCmsContent(admin.id);
  console.info("[seed] Full EN/BN + jsonData content imported.");
}

main()
  .catch((error) => {
    console.error("[seed] Failed to seed admin/CMS:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
