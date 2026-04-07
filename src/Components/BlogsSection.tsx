"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";

type BlogItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  fullDetailsEn: string;
  fullDetailsBn: string;
  coverImageUrl: string | null;
  authorNameEn: string;
  authorNameBn: string;
  timeToReadMinutes: number;
};

type SiteConfigSubset = {
  blogsSectionTitleEn: string;
  blogsSectionTitleBn: string;
};

type BlogsSectionProps = {
  blogs?: BlogItem[];
  siteConfig?: SiteConfigSubset | null;
};

export default function BlogsSection({ blogs = [], siteConfig = null }: Readonly<BlogsSectionProps>) {
  const { language, t } = useAppUI();

  const heading = language === "bn" ? siteConfig?.blogsSectionTitleBn : siteConfig?.blogsSectionTitleEn;
  const items = blogs.slice(0, 3);

  return (
    <section className="bg-surface-container-low px-8 py-32" id="blogs">
      <AnimatedReveal className="mx-auto mb-16 flex max-w-7xl items-end justify-between gap-6" delay={0.05}>
        <div data-reveal>
          <span className="mb-2 block text-xs tracking-widest text-primary uppercase">{t("sections.latestBlogs", "Latest Blogs")}</span>
          <h2 className="font-headline text-5xl font-bold tracking-tighter">{heading || t("sections.blogs", "Blogs")}</h2>
        </div>
        <Link href="/blogs" className="text-sm font-semibold text-primary hover:underline" data-reveal>
          {t("blogs.viewAll", "View All")}
        </Link>
      </AnimatedReveal>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
        {(items.length > 0
          ? items
          : [
              {
                id: "fallback-blog",
                slug: "",
                titleEn: "No blogs yet",
                titleBn: "এখনও কোনো ব্লগ নেই",
                fullDetailsEn: "Add blogs from admin panel to show them here.",
                fullDetailsBn: "এখানে দেখানোর জন্য অ্যাডমিন প্যানেল থেকে ব্লগ যোগ করুন।",
                coverImageUrl: null,
                authorNameEn: "",
                authorNameBn: "",
                timeToReadMinutes: 0,
              },
            ]
        ).map((blog, index) => {
          const title = language === "bn" ? blog.titleBn : blog.titleEn;
          const details = language === "bn" ? blog.fullDetailsBn : blog.fullDetailsEn;
          const author = language === "bn" ? blog.authorNameBn : blog.authorNameEn;
          const href = blog.slug ? `/blogs/${blog.slug}` : "/admin";

          return (
            <AnimatedReveal key={blog.id} className="h-full" delay={0.08 + index * 0.05}>
              <article className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/30 p-4" data-reveal>
                <Link href={href} className="group block">
                  <div className="relative mb-4 h-44 overflow-hidden rounded-2xl bg-surface-container">
                    {blog.coverImageUrl ? (
                      <Image
                        fill
                        sizes="(min-width: 768px) 30vw, 92vw"
                        src={blog.coverImageUrl}
                        alt={title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-on-surface-variant">{t("blogs.noCover", "No cover image")}</div>
                    )}
                  </div>
                </Link>

                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-on-surface">{title}</h3>
                <p className="mb-4 line-clamp-3 text-sm text-on-surface-variant">{details}</p>
                <p className="mt-auto text-xs text-on-surface-variant">{author ? `${author} • ${blog.timeToReadMinutes}m` : ""}</p>
                <Link
                  href={href}
                  className="mt-4 inline-flex w-fit rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
                >
                  {t("blogs.read", "Read")}
                </Link>
              </article>
            </AnimatedReveal>
          );
        })}
      </div>
    </section>
  );
}
