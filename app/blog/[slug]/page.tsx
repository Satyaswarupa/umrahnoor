import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
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
