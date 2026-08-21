export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-choose-a-verified-umrah-agent",
    title: "How to Choose a Verified Umrah Agent",
    excerpt:
      "Not every agent advertising Umrah packages is licensed. Here's what to check before you pay anyone a rupee.",
    date: "2026-07-02",
    readMinutes: 5,
    body: [
      "Every year, pilgrims lose money to unlicensed operators who disappear after taking a deposit. Before you commit to any Umrah package, verify the basics: a valid GST registration, a government-issued ID for the person you're dealing with, and a track record you can actually check.",
      "On UmrahJao, every listed agent has been manually reviewed — their GST number, verification certificate, and government ID are checked by our team before they're allowed to appear publicly. Look for the Verified badge, and prefer Gold-verified agents where available.",
      "Beyond verification, ask specific questions: What exactly is included in the package price? Is the visa processing handled directly or outsourced? What's the cancellation policy? A legitimate agent will answer these clearly and in writing.",
    ],
  },
  {
    slug: "hajj-vs-umrah-whats-the-difference",
    title: "Hajj vs Umrah: What's the Difference?",
    excerpt:
      "Both are sacred journeys to Mecca, but they differ in timing, obligation, and rituals. Here's a clear breakdown.",
    date: "2026-06-18",
    readMinutes: 4,
    body: [
      "Hajj is one of the Five Pillars of Islam — a mandatory pilgrimage for every able-bodied Muslim who can afford it, performed once in a lifetime during a fixed period of the Islamic calendar (Dhul Hijjah).",
      "Umrah, often called the 'lesser pilgrimage,' can be performed at any time of the year and is not obligatory, though highly recommended. It involves fewer rituals than Hajj and typically takes less time to complete.",
      "Because Hajj has fixed dates and a government-regulated quota system for each country, planning needs to start much earlier — often a year in advance. Umrah packages, by contrast, are far more flexible and can usually be booked within weeks.",
    ],
  },
  {
    slug: "umrah-packing-checklist",
    title: "Umrah Packing Checklist: What to Bring",
    excerpt:
      "From Ihram clothing to comfortable walking shoes — a practical packing list for first-time pilgrims.",
    date: "2026-05-30",
    readMinutes: 6,
    body: [
      "Ihram clothing (two unstitched white sheets for men; modest, plain clothing for women), a money belt, a small prayer mat, and comfortable, easy-to-remove sandals are non-negotiable essentials.",
      "Pack light but don't skip the basics: a refillable water bottle, sunscreen, lip balm, and any personal medication with a copy of the prescription. Mecca and Medina can be intensely hot, so breathable fabrics matter more than you'd expect.",
      "Keep photocopies of your passport, visa, and travel insurance separate from the originals. Many verified agents on UmrahJao also provide a full packing checklist as part of their package — worth asking for when you book.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
