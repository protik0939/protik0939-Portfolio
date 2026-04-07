"use client";

import Image from "next/image";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";

type AboutSiteConfig = {
  aboutDescriptionEn: string;
  aboutDescriptionBn: string;
  aboutSecondaryDescriptionEn: string;
  aboutSecondaryDescriptionBn: string;
  yearsExperience: number;
  aboutImagePrimaryUrl: string | null;
  aboutImageSecondaryUrl: string | null;
  aboutImageTertiaryUrl: string | null;
};

type AboutSectionProps = {
  siteConfig?: AboutSiteConfig | null;
  projectCount?: number;
};

export default function AboutSection({ siteConfig, projectCount = 0 }: Readonly<AboutSectionProps>) {
  const { language, t } = useAppUI();
  const aboutDescription = siteConfig
    ? language === "bn"
      ? siteConfig.aboutDescriptionBn
      : siteConfig.aboutDescriptionEn
    : "";
  const aboutSecondaryDescription = siteConfig
    ? language === "bn"
      ? siteConfig.aboutSecondaryDescriptionBn
      : siteConfig.aboutSecondaryDescriptionEn
    : "";
  const yearsExperience = siteConfig?.yearsExperience ?? 5;
  const aboutImagePrimaryUrl = siteConfig?.aboutImagePrimaryUrl?.trim()
    ? siteConfig.aboutImagePrimaryUrl
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuD_49BIEolK3xxBxZdaKm22PaXs-JofQAN06OGhWdeD0MalY27ok10561xANQkgKZW_tpcDVA6IBIwOr4VARQnDEFsWCLd9B1p1nMJuBLZDiQx_O2keob1rLg5rAnDnUQytW8wpwkHic5JNA67bfaH19I2zBewoKT9rUM5_uax3OztQw6C8z9Sm-BzNsahy_C5tWjDwUcUfq8A36wUDl-mitAJPUfs4-E-N4y_uf4oeBDIJFnmxS_iRSpd5vlGJx-O9XEwpS7K_f-5s";
  const aboutImageSecondaryUrl = siteConfig?.aboutImageSecondaryUrl?.trim()
    ? siteConfig.aboutImageSecondaryUrl
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBBKiLi5Wi3HbUSr-dk00gXPzdGOGhkZJ5gqFMo5pL6AqC86A13PoPS--43A9Fu1lCUzGaUgzziEc9A65M_mQMNqbntO0G8ZvPuZg7bZZggzKor3vKDXnphzsAAtYOfyRPmAAtxFziKVcrWDwQqj81sL6W1lnko_iMjtETTJWpbJXHmBXKMK4I2eTZFBS0qIHsHVKDLaqqj5uhWORhIcKqrbf8op6pZLIn9AJv-6Gc6fomlf8w05Ui-c7yiYU8j_TEvwZy54E3_OP9s";
  const aboutImageTertiaryUrl = siteConfig?.aboutImageTertiaryUrl?.trim()
    ? siteConfig.aboutImageTertiaryUrl
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBL3T2Robd6kCaILizypDK9IVlFCI0bz6YIpLWXSYLCdaNz5mXUXxhISqg2NN5-piRILAl_HF7ZZnXSBgwEXz05M0hTB9HxI-Bxeo54FweG8wA3OTn0KaJ7orp0IwCpjGtQA9NZXntUNtl52JlYZ5r7Ksoe9tnJkdAAWb-v9iV6UJRqAzgcE7yUPDY-PTI4i0lKyoMAMBI9d0W7u6S17KSj4auyhGlaMBW2U3Jg-u6bAdnTvHNAvCdT4xW6SmnsUogNrK_VFLLlLdeK";

  return (
    <section className="bg-surface-container-low px-8 py-32" id="about">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          <AnimatedReveal delay={0.05}>
            <div data-reveal>
              <h2 className="mb-8 font-headline text-4xl font-bold">
                <span className="text-gradient-primary">{t("sections.journey", "The Journey")}</span>
              </h2>
              <div className="glass-panel space-y-6 rounded-3xl p-8 leading-loose text-on-surface-variant md:p-12">
                <p>{aboutDescription || "My journey is now loaded from database and editable from admin panel."}</p>
                <p>{aboutSecondaryDescription || "I specialize in React ecosystem, Node.js microservices, and cloud-native architecture."}</p>
                <div className="flex gap-8 pt-6">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-on-surface">{yearsExperience}+</span>
                    <span className="text-xs tracking-widest text-secondary uppercase">{t("about.yearsExp", "Years Exp.")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-on-surface">{projectCount}+</span>
                    <span className="text-xs tracking-widest text-secondary uppercase">{t("about.projects", "Projects")}</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.15}>
            <div className="grid grid-cols-2 gap-4" data-reveal>
              <div className="space-y-4 pt-12">
                <div className="relative aspect-square overflow-hidden rounded-3xl">
                  <Image
                    fill
                    sizes="(min-width: 1024px) 18vw, 44vw"
                    className="h-full w-full object-contain transition-all"
                    src={aboutImagePrimaryUrl}
                    alt="Minimalist desk setup"
                  />
                </div>
                <div className="relative aspect-video overflow-hidden rounded-3xl">
                  <Image
                    fill
                    sizes="(min-width: 1024px) 18vw, 44vw"
                    className="h-full w-full object-contain transition-all"
                    src={aboutImageSecondaryUrl}
                    alt="Code on monitor"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative aspect-3/4 overflow-hidden rounded-3xl">
                  <Image
                    fill
                    sizes="(min-width: 1024px) 18vw, 44vw"
                    className="h-full w-full object-contain transition-all"
                    src={aboutImageTertiaryUrl}
                    alt="Art supplies"
                  />
                </div>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  );
}
