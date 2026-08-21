import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Hajj & Umrah Travel Guides",
  description: "Guides and tips for planning your Hajj, Umrah, or Zyarat journey, from choosing a verified agent to what to pack.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />

      <main className="flex-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <section className="mx-auto max-w-3xl px-4 pb-6 pt-16 text-center sm:px-6">
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#24201A] sm:text-[40px]">Blog</h1>
          <p className="mt-3 text-sm leading-[1.7] text-[#7A705E]">
            Guides and tips for planning your Hajj, Umrah, or Zyarat journey.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
          {BLOG_POSTS.length === 0 ? (
            <div className="neu-inset rounded-[26px] px-6 py-14 text-center">
              <p className="text-sm font-semibold text-[#6E6455]">No posts yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="neu-raised-sm block rounded-[26px] bg-white p-6 transition hover:-translate-y-0.5"
                >
                  <div className="text-[11px] font-bold tracking-wide text-[#9A907C]">
                    {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}
                    {post.readMinutes} min read
                  </div>
                  <h2 className="mt-2 text-[18px] font-extrabold leading-snug tracking-tight text-[#24201A]">
                    {post.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-[1.6] text-[#7A705E]">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-[13px] font-bold text-[#0E5B4A]">Read more →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
