import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { asNumber, asOptionalString, asString } from "@/lib/content-validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getDefaultConfig(adminId: string) {
  return {
    adminId,
    siteTitleEn: "DevPortfolio",
    siteTitleBn: "ডেভপোর্টফোলিও",
    siteDescriptionEn: "Portfolio website",
    siteDescriptionBn: "পোর্টফোলিও ওয়েবসাইট",
    heroDescriptionEn: "",
    heroDescriptionBn: "",
    heroImageUrl: "",
    aboutDescriptionEn: "",
    aboutDescriptionBn: "",
    aboutSecondaryDescriptionEn: "",
    aboutSecondaryDescriptionBn: "",
    yearsExperience: 5,
    aboutImagePrimaryUrl: "",
    aboutImageSecondaryUrl: "",
    aboutImageTertiaryUrl: "",
    problemSolvingSummaryEn: "",
    problemSolvingSummaryBn: "",
    projectsSectionTitleEn: "Projects",
    projectsSectionTitleBn: "প্রজেক্ট",
    blogsSectionTitleEn: "Blogs",
    blogsSectionTitleBn: "ব্লগসমূহ",
  };
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  const config = await prisma.siteConfig.findUnique({
    where: { singletonKey: 1 },
  });

  if (config) {
    return NextResponse.json(config);
  }

  const created = await prisma.siteConfig.create({
    data: getDefaultConfig(guard.admin.id),
  });

  return NextResponse.json(created);
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdminAccess(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.siteConfig.findUnique({
      where: { singletonKey: 1 },
    });

    const data = {
      siteTitleEn: asString(body.siteTitleEn ?? existing?.siteTitleEn, "siteTitleEn"),
      siteTitleBn: asString(body.siteTitleBn ?? existing?.siteTitleBn, "siteTitleBn"),
      siteDescriptionEn: asString(body.siteDescriptionEn ?? existing?.siteDescriptionEn, "siteDescriptionEn"),
      siteDescriptionBn: asString(body.siteDescriptionBn ?? existing?.siteDescriptionBn, "siteDescriptionBn"),
      navHomeEn: asString(body.navHomeEn ?? existing?.navHomeEn ?? "Home", "navHomeEn"),
      navHomeBn: asString(body.navHomeBn ?? existing?.navHomeBn ?? "হোম", "navHomeBn"),
      navAboutEn: asString(body.navAboutEn ?? existing?.navAboutEn ?? "About", "navAboutEn"),
      navAboutBn: asString(body.navAboutBn ?? existing?.navAboutBn ?? "পরিচিতি", "navAboutBn"),
      navEducationEn: asString(body.navEducationEn ?? existing?.navEducationEn ?? "Education", "navEducationEn"),
      navEducationBn: asString(body.navEducationBn ?? existing?.navEducationBn ?? "শিক্ষা", "navEducationBn"),
      navSkillsEn: asString(body.navSkillsEn ?? existing?.navSkillsEn ?? "Skills", "navSkillsEn"),
      navSkillsBn: asString(body.navSkillsBn ?? existing?.navSkillsBn ?? "দক্ষতা", "navSkillsBn"),
      navProjectsEn: asString(body.navProjectsEn ?? existing?.navProjectsEn ?? "Projects", "navProjectsEn"),
      navProjectsBn: asString(body.navProjectsBn ?? existing?.navProjectsBn ?? "প্রজেক্ট", "navProjectsBn"),
      navBlogsEn: asString(body.navBlogsEn ?? existing?.navBlogsEn ?? "Blogs", "navBlogsEn"),
      navBlogsBn: asString(body.navBlogsBn ?? existing?.navBlogsBn ?? "ব্লগসমূহ", "navBlogsBn"),
      navContactEn: asString(body.navContactEn ?? existing?.navContactEn ?? "Contact", "navContactEn"),
      navContactBn: asString(body.navContactBn ?? existing?.navContactBn ?? "যোগাযোগ", "navContactBn"),
      navCvEn: asString(body.navCvEn ?? existing?.navCvEn ?? "CV", "navCvEn"),
      navCvBn: asString(body.navCvBn ?? existing?.navCvBn ?? "সিভি", "navCvBn"),
      logoLightUrl: asOptionalString(body.logoLightUrl),
      logoDarkUrl: asOptionalString(body.logoDarkUrl),
      heroHelloEn: asString(body.heroHelloEn ?? existing?.heroHelloEn ?? "Hello!", "heroHelloEn"),
      heroHelloBn: asString(body.heroHelloBn ?? existing?.heroHelloBn ?? "হ্যালো!", "heroHelloBn"),
      heroIamEn: asString(body.heroIamEn ?? existing?.heroIamEn ?? "I am", "heroIamEn"),
      heroIamBn: asString(body.heroIamBn ?? existing?.heroIamBn ?? "আমি", "heroIamBn"),
      heroFirstNameEn: asString(body.heroFirstNameEn ?? existing?.heroFirstNameEn ?? "", "heroFirstNameEn"),
      heroFirstNameBn: asString(body.heroFirstNameBn ?? existing?.heroFirstNameBn ?? "", "heroFirstNameBn"),
      heroLastNameEn: asString(body.heroLastNameEn ?? existing?.heroLastNameEn ?? "", "heroLastNameEn"),
      heroLastNameBn: asString(body.heroLastNameBn ?? existing?.heroLastNameBn ?? "", "heroLastNameBn"),
      heroDescriptionEn: asString(body.heroDescriptionEn ?? existing?.heroDescriptionEn ?? "", "heroDescriptionEn"),
      heroDescriptionBn: asString(body.heroDescriptionBn ?? existing?.heroDescriptionBn ?? "", "heroDescriptionBn"),
      heroImageUrl: asOptionalString(body.heroImageUrl),
      aboutDescriptionEn: asString(body.aboutDescriptionEn ?? existing?.aboutDescriptionEn ?? "", "aboutDescriptionEn"),
      aboutDescriptionBn: asString(body.aboutDescriptionBn ?? existing?.aboutDescriptionBn ?? "", "aboutDescriptionBn"),
      aboutSecondaryDescriptionEn: asString(
        body.aboutSecondaryDescriptionEn ?? existing?.aboutSecondaryDescriptionEn ?? "",
        "aboutSecondaryDescriptionEn",
      ),
      aboutSecondaryDescriptionBn: asString(
        body.aboutSecondaryDescriptionBn ?? existing?.aboutSecondaryDescriptionBn ?? "",
        "aboutSecondaryDescriptionBn",
      ),
      yearsExperience: asNumber(body.yearsExperience ?? existing?.yearsExperience, "yearsExperience", 5),
      aboutImagePrimaryUrl: asOptionalString(body.aboutImagePrimaryUrl),
      aboutImageSecondaryUrl: asOptionalString(body.aboutImageSecondaryUrl),
      aboutImageTertiaryUrl: asOptionalString(body.aboutImageTertiaryUrl),
      problemSolvingSummaryEn: asString(
        body.problemSolvingSummaryEn ?? existing?.problemSolvingSummaryEn ?? "",
        "problemSolvingSummaryEn",
      ),
      problemSolvingSummaryBn: asString(
        body.problemSolvingSummaryBn ?? existing?.problemSolvingSummaryBn ?? "",
        "problemSolvingSummaryBn",
      ),
      projectsSectionTitleEn: asString(
        body.projectsSectionTitleEn ?? existing?.projectsSectionTitleEn ?? "Projects",
        "projectsSectionTitleEn",
      ),
      projectsSectionTitleBn: asString(
        body.projectsSectionTitleBn ?? existing?.projectsSectionTitleBn ?? "প্রজেক্ট",
        "projectsSectionTitleBn",
      ),
      blogsSectionTitleEn: asString(body.blogsSectionTitleEn ?? existing?.blogsSectionTitleEn ?? "Blogs", "blogsSectionTitleEn"),
      blogsSectionTitleBn: asString(body.blogsSectionTitleBn ?? existing?.blogsSectionTitleBn ?? "ব্লগসমূহ", "blogsSectionTitleBn"),
      contactEmail: asOptionalString(body.contactEmail),
      contactPhone: asOptionalString(body.contactPhone),
      contactLocationEn: asOptionalString(body.contactLocationEn),
      contactLocationBn: asOptionalString(body.contactLocationBn),
      cvUrl: asOptionalString(body.cvUrl),
    };

    const saved = await prisma.siteConfig.upsert({
      where: { singletonKey: 1 },
      create: {
        ...data,
        adminId: guard.admin.id,
      },
      update: data,
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
