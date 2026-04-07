import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import BlogMediaSlider from "@/Components/BlogMediaSlider";
import BlogShareButton from "@/Components/BlogShareButton";
import { getPublishedBlogBySlug, pickLocalized, resolveLanguage } from "@/lib/public-content";

type BlogDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function renderDetailsWithAnchors(text: string): ReactNode[] {
  const lines = text.split(/\r?\n/);

  return lines.map((line, lineIndex) => {
    if (line.trim().length === 0) {
      return <div key={`line-${lineIndex + 1}`} className="h-4" aria-hidden />;
    }

    const parts: ReactNode[] = [];
    const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;

    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = anchorRegex.exec(line)) !== null) {
      const [fullMatch, href, label] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push(line.slice(lastIndex, startIndex));
      }

      parts.push(
        <a
          key={`line-${lineIndex + 1}-anchor-${startIndex + 1}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary underline underline-offset-4 transition hover:text-secondary"
        >
          {label}
        </a>,
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return <p key={`line-${lineIndex + 1}`}>{parts.length > 0 ? parts : line}</p>;
  });
}

export async function generateMetadata({ params, searchParams }: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const language = resolveLanguage(query.lang);
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found",
    };
  }

  const title = pickLocalized(language, blog.titleEn, blog.titleBn);
  const description = pickLocalized(language, blog.fullDetailsEn, blog.fullDetailsBn).slice(0, 160);
  const tags = pickLocalized(language, blog.tagsEn, blog.tagsBn)
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return {
    title,
    description,
    keywords: tags,
    alternates: {
      canonical: `/blogs/${blog.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: blog.uploadedAt.toISOString(),
      authors: [pickLocalized(language, blog.authorNameEn, blog.authorNameBn)],
      images: blog.coverImageUrl ? [{ url: blog.coverImageUrl }] : [],
      locale: language === "bn" ? "bn_BD" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailsPage({ params, searchParams }: BlogDetailsPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const language = resolveLanguage(query.lang);
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const title = pickLocalized(language, blog.titleEn, blog.titleBn);
  const fullDetails = pickLocalized(language, blog.fullDetailsEn, blog.fullDetailsBn);
  const author = pickLocalized(language, blog.authorNameEn, blog.authorNameBn);
  const tags = pickLocalized(language, blog.tagsEn, blog.tagsBn)
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const formattedDate = blog.uploadedAt.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/blogs?lang=${language}`}
              className="inline-flex rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
            >
              {language === "bn" ? "সব ব্লগ" : "All Blogs"}
            </Link>
            <BlogShareButton title={title} text={fullDetails.slice(0, 140)} />
          </div>

          <article className="glass-panel overflow-hidden rounded-[2rem] border border-outline-variant/30">
            <BlogMediaSlider title={title} mediaUrls={blog.mediaUrls} coverImageUrl={blog.coverImageUrl} variant="detail" />

            <div className="p-6 sm:p-10">
              <p className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">Article</p>
              <h1 className="font-headline text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                <span>{author || "Unknown"}</span>
                <span>{formattedDate}</span>
                <span>{blog.timeToReadMinutes} min read</span>
              </div>

              {tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] tracking-wide text-on-surface-variant uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 space-y-2 leading-relaxed text-on-surface-variant">
                {renderDetailsWithAnchors(fullDetails)}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
