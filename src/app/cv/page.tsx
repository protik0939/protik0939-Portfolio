import type { Metadata } from "next";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import ResumeWorkspace from "@/Components/ResumeWorkspace";
import SubpageTopBar from "@/Components/SubpageTopBar";
import { normalizeCvSource } from "@/lib/cv";
import { getSiteConfig, pickLocalized } from "@/lib/public-content";
import { resolveRequestLanguage } from "@/lib/request-language";
import { pickSeoDescription } from "@/lib/site-url";

type CvPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: CvPageProps): Promise<Metadata> {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const siteConfig = await getSiteConfig();
  const title = "CV";

  return {
    alternates: { canonical: "/cv" },
    title: siteConfig ? `${title} | ${pickLocalized(language, siteConfig.siteTitleEn, siteConfig.siteTitleBn)}` : title,
    description: pickSeoDescription(
      siteConfig ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn) : "",
    ),
  };
}

export default async function CvPage({ searchParams }: CvPageProps) {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const siteConfig = await getSiteConfig();
  const cvHref = normalizeCvSource(siteConfig?.cvUrl);

  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SubpageTopBar language={language} />
          <ResumeWorkspace cvHref={cvHref} />
        </div>
      </main>
    </div>
  );
}
