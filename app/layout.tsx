import type { Metadata } from "next";
import { Geist_Mono, Roboto, Plus_Jakarta_Sans, Amiri } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_LOGO_PATH, SITE_NAME, SITE_OG_IMAGE_PATH, SITE_URL } from "@/lib/site-config";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Find Verified Umrah Travel Agents in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  generator: "Next.js",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: SITE_LOGO_PATH,
    apple: SITE_LOGO_PATH,
    shortcut: SITE_LOGO_PATH,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Find Verified Umrah Travel Agents in India`,
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_OG_IMAGE_PATH, width: 1200, height: 630, alt: `${SITE_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Find Verified Umrah Travel Agents in India`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE_PATH],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ["UmrahJao", "Umrah Noor", "Umrajao", "Umrahchalo", "Umrah Chalo", "Umrah Chal", "Umrahjaa"],
  url: SITE_URL,
  logo: `${SITE_URL}${SITE_LOGO_PATH}`,
  description: SITE_DESCRIPTION,
  areaServed: { "@type": "Country", name: "India" },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${geistMono.variable} ${jakarta.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-emerald-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
        {children}
      </body>
    </html>
  );
}
