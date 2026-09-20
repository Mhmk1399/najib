import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { blogPosts } from "@/lib/content/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  return {
    title: post ? `${post.title} | نجیب‌زاده` : "مجله نجیب‌زاده",
    description:
      post?.excerpt ?? "یادداشت‌های نجیب‌زاده درباره سبک، ساخت و زندگی سنجیده.",
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const publishedDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.publishedAt));

  return (
    <main dir="rtl" lang="fa" className="bg-[#F6F2EB] text-[#0B0B0B]">
      <section className="border-b border-black/[0.1] bg-[#0B0B0B] text-white">
        <div className="mx-auto grid min-h-[min(760px,100svh)] w-full max-w-[1920px] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="order-2 flex flex-col justify-between px-6 py-10 sm:px-10 sm:py-14 lg:order-1 lg:px-16 lg:py-20 xl:px-24">
            <Link
              href="/blog"
              className="inline-flex w-fit items-center gap-2 border-b border-white/25 pb-2 text-[10px] text-white/68 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]"
            >
              بازگشت به مجله
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>

            <div className="mt-16 max-w-[640px]">
              <div className="flex items-center gap-3 text-[10px] font-medium text-[#C69A73]">
                <span className="h-px w-8 bg-[#B7835A]" aria-hidden="true" />
                {post.category}
              </div>
              <h1 className="mt-6 text-balance text-[clamp(2.35rem,5vw,5.4rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
                {post.title}
              </h1>
              <p className="mt-7 max-w-[560px] text-pretty text-[13px] leading-8 text-white/62 sm:text-[15px]">
                {post.excerpt}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] text-white/44">
                <span>{post.author ?? "تحریریه نجیب‌زاده"}</span>
                <span aria-hidden="true">/</span>
                <time dateTime={post.publishedAt}>{publishedDate}</time>
                {post.readingTime ? (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>{post.readingTime}</span>
                  </>
                ) : null}
              </div>
            </div>

            <span className="mt-14 text-[8px] font-medium tracking-[0.24em] text-white/32" dir="ltr">
              NAJIBZADEH JOURNAL
            </span>
          </div>

          <div className="relative order-1 min-h-[48svh] overflow-hidden lg:order-2 lg:min-h-0">
            <Image
              src={post.image}
              alt={post.imageAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 58vw"
              className="object-cover"
              style={{ objectPosition: post.imagePosition ?? "center" }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.2))] lg:bg-[linear-gradient(90deg,rgba(11,11,11,0.35),transparent_42%)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-24 lg:py-32">
        <p className="text-[15px] leading-[2.25] text-black/72 sm:text-[17px]">
          {post.excerpt}
        </p>
        <div className="mt-12 border-t border-black/[0.12] pt-7 text-[10px] leading-7 text-black/48">
          این یادداشت بخشی از نگاه نجیب‌زاده به پوشش، کیفیت و جزئیاتی است که با گذر زمان ارزشمندتر می‌شوند.
        </div>
      </section>
    </main>
  );
}
