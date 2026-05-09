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
import { getHomeContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homeContent = await getHomeContent();

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
      <AnimatedBackgroundGlow />
      <PortfolioAnimations />
      <TopAppBar siteConfig={siteConfig} />

      <main className="relative z-10 pt-20">
        <HeroSection siteConfig={siteConfig} stats={heroStats} />
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
