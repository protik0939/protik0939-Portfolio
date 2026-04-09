import type { Metadata } from "next";
import Link from "next/link";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import BlogMediaSlider from "@/Components/BlogMediaSlider";
import BlogFilters from "@/Components/BlogFilters";
import SubpageTopBar from "@/Components/SubpageTopBar";
import { getPublishedBlogs, getSiteConfig, pickLocalized } from "@/lib/public-content";
import { resolveRequestLanguage } from "@/lib/request-language";

type BlogsPageProps = {
  searchParams: Promise<{ lang?: string; category?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: BlogsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const siteConfig = await getSiteConfig();

  const blogs = await getPublishedBlogs();
  const firstImage = blogs.find((blog) => blog.coverImageUrl)?.coverImageUrl ?? undefined;

  return {
    title: siteConfig
      ? `${pickLocalized(language, siteConfig.blogsSectionTitleEn, siteConfig.blogsSectionTitleBn)} | ${pickLocalized(language, siteConfig.siteTitleEn, siteConfig.siteTitleBn)}`
      : "Blogs",
    description: siteConfig
      ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn)
      : "Blog list",
    openGraph: {
      title: siteConfig
        ? `${pickLocalized(language, siteConfig.blogsSectionTitleEn, siteConfig.blogsSectionTitleBn)} | ${pickLocalized(language, siteConfig.siteTitleEn, siteConfig.siteTitleBn)}`
        : "Blogs",
      description: siteConfig
        ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn)
        : "Blog list",
      type: "website",
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const blogs = await getPublishedBlogs();
  const selectedCategory = (params.category ?? "").trim();
  const query = (params.q ?? "").trim();

  const parseTags = (raw: string) =>
    raw
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

  const categories: string[] = [];
  const seenCategoryKeys = new Set<string>();

  for (const blog of blogs) {
    const tags = parseTags(pickLocalized(language, blog.tagsEn, blog.tagsBn));

    for (const tag of tags) {
      const key = tag.toLowerCase();
      if (seenCategoryKeys.has(key)) {
        continue;
      }

      seenCategoryKeys.add(key);
      categories.push(tag);
    }
  }

  const sortedCategories = categories.sort((left, right) =>
    left.localeCompare(right, language === "bn" ? "bn-BD" : "en-US", { sensitivity: "base" }),
  );

  const normalizedCategory = selectedCategory.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  const filteredBlogs = blogs.filter((blog) => {
    const title = pickLocalized(language, blog.titleEn, blog.titleBn);
    const details = pickLocalized(language, blog.fullDetailsEn, blog.fullDetailsBn);
    const author = pickLocalized(language, blog.authorNameEn, blog.authorNameBn);
    const tags = parseTags(pickLocalized(language, blog.tagsEn, blog.tagsBn));

    const categoryMatched =
      normalizedCategory.length === 0 || tags.some((tag) => tag.toLowerCase() === normalizedCategory);

    if (!categoryMatched) {
      return false;
    }

    if (normalizedQuery.length === 0) {
      return true;
    }

    const searchableText = [title, details, author, ...tags].join(" ").toLowerCase();
    return searchableText.includes(normalizedQuery);
  });

  const formatDate = (value: Date) =>
    value.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-7xl">
        <SubpageTopBar language={language} />
        <section className="glass-panel mb-12 rounded-[2rem] border border-outline-variant/30 p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">Knowledge</p>
              <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">
                {language === "bn" ? "ব্লগসমূহ" : "Latest Blogs"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
                {language === "bn"
                  ? "অ্যাডমিন প্যানেল থেকে আপডেট হওয়া সব আর্টিকেল এখানে সাজানো আছে।"
                  : "All published articles are loaded directly from your CMS and presented in a reader-first layout."}
              </p>
            </div>

            <Link
              href={`/?lang=${language}`}
              className="inline-flex w-fit rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
            >
              {language === "bn" ? "হোমে ফিরুন" : "Back Home"}
            </Link>
          </div>
        </section>

        <BlogFilters
          language={language}
          categories={sortedCategories}
          initialCategory={selectedCategory}
          initialQuery={query}
        />

        <p className="mb-4 text-xs tracking-[0.14em] text-on-surface-variant uppercase">
          {language === "bn"
            ? `দেখাচ্ছে ${filteredBlogs.length} / ${blogs.length} টি ব্লগ`
            : `Showing ${filteredBlogs.length} of ${blogs.length} blogs`}
        </p>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBlogs.map((blog) => {
            const title = pickLocalized(language, blog.titleEn, blog.titleBn);
            const details = pickLocalized(language, blog.fullDetailsEn, blog.fullDetailsBn);
            const author = pickLocalized(language, blog.authorNameEn, blog.authorNameBn);
            const tagsRaw = pickLocalized(language, blog.tagsEn, blog.tagsBn);
            const tags = tagsRaw
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
              .slice(0, 3);

            return (
              <article key={blog.id} className="glass-panel group flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/30 p-4">
                <div className="mb-4">
                  <BlogMediaSlider title={title} mediaUrls={blog.mediaUrls} coverImageUrl={blog.coverImageUrl} variant="card" />
                </div>

                <div className="mb-2 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{author || "Unknown"}</span>
                  <span>{blog.timeToReadMinutes}m</span>
                </div>

                <h2 className="mb-2 line-clamp-2 text-xl font-bold">{title}</h2>
                <p className="line-clamp-3 text-sm text-on-surface-variant">{details}</p>

                <p className="mt-3 text-xs text-on-surface-variant">{formatDate(blog.uploadedAt)}</p>

                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] tracking-wide text-on-surface-variant uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <Link
                  href={`/blogs/${blog.slug}?lang=${language}`}
                  className="mt-4 inline-flex w-fit rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
                >
                  {language === "bn" ? "Read" : "Read"}
                </Link>
              </article>
            );
          })}
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="glass-panel mt-6 rounded-3xl border border-outline-variant/30 p-8 text-center text-sm text-on-surface-variant">
            {language === "bn"
              ? "এই ফিল্টারে কোন ব্লগ পাওয়া যায়নি।"
              : "No blogs found for the selected filters."}
          </div>
        ) : null}
        </div>
      </main>
    </div>
  );
}
