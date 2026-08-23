import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";
import { SITE_LOGO_PATH, SITE_NAME, SITE_URL } from "@/lib/site-config";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: "en-IN",
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE_LOGO_PATH}` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([blogPostingJsonLd, breadcrumbJsonLd]) }}
      />
      <SiteHeader />

      <main className="flex-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <article className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
          <Link href="/blog" className="text-[13px] font-bold text-[#0E5B4A] hover:underline">
            ← Back to Blog
          </Link>

          <div className="mt-5 text-[11px] font-bold tracking-wide text-[#9A907C]">
            {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            {" · "}
            {post.readMinutes} min read
          </div>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight text-[#24201A] sm:text-[36px]">
            {post.title}
          </h1>

          <div className="mt-7 space-y-5">
            {post.body.map((paragraph, i) => (
              <p key={i} className="text-[15px] leading-[1.8] text-[#4A4238]">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
