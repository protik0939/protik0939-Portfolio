import AboutSection from "@/Components/AboutSection";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import BlogsSection from "@/Components/BlogsSection";
import ContactSection from "@/Components/ContactSection";
import EducationExperienceSection from "@/Components/EducationExperienceSection";
import GithubContributionSection from "@/Components/GithubContributionSection";
import HeroSection from "@/Components/HeroSection";
import PortfolioAnimations from "@/Components/PortfolioAnimations";
import ProblemSolvingSection from "@/Components/ProblemSolvingSection";
import ProjectsSection from "@/Components/ProjectsSection";
import SiteFooter from "@/Components/SiteFooter";
import SkillsSection from "@/Components/SkillsSection";
import TopAppBar from "@/Components/TopAppBar";
import { getHomeContent, getSiteConfig, pickLocalized } from "@/lib/public-content";
import { resolveRequestLanguage } from "@/lib/request-language";
import { getSiteUrl, pickSeoDescription, SITE_NAME, SOCIAL_PROFILES } from "@/lib/site-url";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  const language = await resolveRequestLanguage(query.lang);
  const siteConfig = await getSiteConfig();

  const description = pickSeoDescription(
    siteConfig ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn) : "",
  );

  return {
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: "/",
      title: `${SITE_NAME} | Full Stack Developer (Next.js, React, Node.js)`,
      description,
      locale: language === "bn" ? "bn_BD" : "en_US",
    },
    twitter: { card: "summary_large_image", description },
  };
}

export default async function Home() {
  const homeContent = await getHomeContent();
  const siteUrl = getSiteUrl();

  // Structured data: tells Google who this site is about and ties the social profiles together.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        inLanguage: ["en", "bn"],
        publisher: { "@id": `${siteUrl}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: SITE_NAME,
        alternateName: "Protik",
        url: siteUrl,
        jobTitle: "Full Stack Developer",
        description: pickSeoDescription(homeContent.siteConfig?.siteDescriptionEn),
        image: homeContent.siteConfig?.heroImageUrl ?? undefined,
        email: homeContent.siteConfig?.contactEmail ? `mailto:${homeContent.siteConfig.contactEmail}` : undefined,
        address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
        knowsAbout: homeContent.skills.slice(0, 20).map((skill) => skill.nameEn),
        sameAs: SOCIAL_PROFILES,
      },
    ],
  };

  const siteConfig = homeContent.siteConfig
    ? {
        siteTitleEn: homeContent.siteConfig.siteTitleEn,
        siteTitleBn: homeContent.siteConfig.siteTitleBn,
        navHomeEn: homeContent.siteConfig.navHomeEn,
        navHomeBn: homeContent.siteConfig.navHomeBn,
        navAboutEn: homeContent.siteConfig.navAboutEn,
        navAboutBn: homeContent.siteConfig.navAboutBn,
        navSkillsEn: homeContent.siteConfig.navSkillsEn,
        navSkillsBn: homeContent.siteConfig.navSkillsBn,
        navProjectsEn: homeContent.siteConfig.navProjectsEn,
        navProjectsBn: homeContent.siteConfig.navProjectsBn,
        navContactEn: homeContent.siteConfig.navContactEn,
        navContactBn: homeContent.siteConfig.navContactBn,
        navCvEn: homeContent.siteConfig.navCvEn,
        navCvBn: homeContent.siteConfig.navCvBn,
        heroHelloEn: homeContent.siteConfig.heroHelloEn,
        heroHelloBn: homeContent.siteConfig.heroHelloBn,
        heroIamEn: homeContent.siteConfig.heroIamEn,
        heroIamBn: homeContent.siteConfig.heroIamBn,
        heroFirstNameEn: homeContent.siteConfig.heroFirstNameEn,
        heroFirstNameBn: homeContent.siteConfig.heroFirstNameBn,
        heroLastNameEn: homeContent.siteConfig.heroLastNameEn,
        heroLastNameBn: homeContent.siteConfig.heroLastNameBn,
        heroDescriptionEn: homeContent.siteConfig.heroDescriptionEn,
        heroDescriptionBn: homeContent.siteConfig.heroDescriptionBn,
        heroImageUrl: homeContent.siteConfig.heroImageUrl,
        aboutDescriptionEn: homeContent.siteConfig.aboutDescriptionEn,
        aboutDescriptionBn: homeContent.siteConfig.aboutDescriptionBn,
        aboutSecondaryDescriptionEn: homeContent.siteConfig.aboutSecondaryDescriptionEn,
        aboutSecondaryDescriptionBn: homeContent.siteConfig.aboutSecondaryDescriptionBn,
        yearsExperience: homeContent.siteConfig.yearsExperience,
        aboutImagePrimaryUrl: homeContent.siteConfig.aboutImagePrimaryUrl,
        aboutImageSecondaryUrl: homeContent.siteConfig.aboutImageSecondaryUrl,
        aboutImageTertiaryUrl: homeContent.siteConfig.aboutImageTertiaryUrl,
        projectsSectionTitleEn: homeContent.siteConfig.projectsSectionTitleEn,
        projectsSectionTitleBn: homeContent.siteConfig.projectsSectionTitleBn,
        blogsSectionTitleEn: homeContent.siteConfig.blogsSectionTitleEn,
        blogsSectionTitleBn: homeContent.siteConfig.blogsSectionTitleBn,
        problemSolvingSummaryEn: homeContent.siteConfig.problemSolvingSummaryEn,
        problemSolvingSummaryBn: homeContent.siteConfig.problemSolvingSummaryBn,
        contactEmail: homeContent.siteConfig.contactEmail,
        contactPhone: homeContent.siteConfig.contactPhone,
        contactLocationEn: homeContent.siteConfig.contactLocationEn,
        contactLocationBn: homeContent.siteConfig.contactLocationBn,
        cvUrl: homeContent.siteConfig.cvUrl,
      }
    : null;

  const educations = homeContent.educations.map((item) => ({
    id: item.id,
    degreeEn: item.degreeEn,
    degreeBn: item.degreeBn,
    subjectEn: item.subjectEn,
    subjectBn: item.subjectBn,
    yearLabel: item.yearLabel,
    resultEn: item.resultEn,
    resultBn: item.resultBn,
    institutionEn: item.institutionEn,
    institutionBn: item.institutionBn,
    detailsEn: item.detailsEn,
    detailsBn: item.detailsBn,
    imageUrl: item.imageUrl,
    link: item.link,
    isCurrent: item.isCurrent,
  }));

  const skills = homeContent.skills.map((item) => ({
    id: item.id,
    categoryKey: item.categoryKey,
    categoryTitleEn: item.categoryTitleEn,
    categoryTitleBn: item.categoryTitleBn,
    nameEn: item.nameEn,
    nameBn: item.nameBn,
    percentage: item.percentage,
    logoUrl: item.logoUrl,
  }));

  const experiences = homeContent.experiences.map((item) => ({
    id: item.id,
    titleEn: item.titleEn,
    titleBn: item.titleBn,
    companyEn: item.companyEn,
    companyBn: item.companyBn,
    periodEn: item.periodEn,
    periodBn: item.periodBn,
    detailsEn: item.detailsEn,
    detailsBn: item.detailsBn,
    imageUrl: item.imageUrl,
    link: item.link,
    isCurrent: item.isCurrent,
  }));

  const projects = homeContent.projects.map((item) => ({
    id: item.id,
    slug: item.slug,
    titleEn: item.titleEn,
    titleBn: item.titleBn,
    typeEn: item.typeEn,
    typeBn: item.typeBn,
    detailsEn: item.detailsEn,
    detailsBn: item.detailsBn,
    coverImageUrl: item.coverImageUrl,
  }));

  const blogs = homeContent.blogs.map((item) => ({
    id: item.id,
    slug: item.slug,
    titleEn: item.titleEn,
    titleBn: item.titleBn,
    fullDetailsEn: item.fullDetailsEn,
    fullDetailsBn: item.fullDetailsBn,
    coverImageUrl: item.coverImageUrl,
    authorNameEn: item.authorNameEn,
    authorNameBn: item.authorNameBn,
    timeToReadMinutes: item.timeToReadMinutes,
  }));

  const heroStats = {
    projectsCompleted: homeContent.stats.projectCount,
    skillsCount: homeContent.stats.skillCount,
    languagesCount: homeContent.stats.languageCount,
    blogsCount: homeContent.stats.blogCount,
  };

  return (
    <div className="relative isolate overflow-hidden selection:bg-primary-container selection:text-white">
      <script
        type="application/ld+json"
        // JSON.stringify output is escaped for "<" so the payload can't break out of the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <AnimatedBackgroundGlow />
      <PortfolioAnimations />
      <TopAppBar siteConfig={siteConfig} />

      <main className="relative z-10 pt-20">
        <HeroSection siteConfig={siteConfig} stats={heroStats} skills={skills} />
        <AboutSection siteConfig={siteConfig} projectCount={homeContent.stats.projectCount} />
        <SkillsSection skills={skills} />
        <ProblemSolvingSection siteConfig={siteConfig} />
        <GithubContributionSection />
        <EducationExperienceSection educations={educations} experiences={experiences} />
        <ProjectsSection projects={projects} siteConfig={siteConfig} />
        <BlogsSection blogs={blogs} siteConfig={siteConfig} />
        <ContactSection siteConfig={siteConfig} />
      </main>
      <SiteFooter />
    </div>
  );
}
