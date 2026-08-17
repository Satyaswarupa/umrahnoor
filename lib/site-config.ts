export const SITE_NAME = "UmrahChal";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://umrahnoor.vercel.app").replace(
  /\/$/,
  ""
);

export const SITE_DESCRIPTION =
  "UmrahChal is a free directory of verified, GST-registered Umrah travel agents across India. Search by city, compare agents, and contact them directly by call or WhatsApp — no middlemen, no booking fees.";

export const SITE_KEYWORDS = [
  "Umrah agents",
  "Umrah travel agents in India",
  "verified Umrah agents",
  "Umrah packages",
  "Hajj and Umrah travel agency",
  "book Umrah",
  "Umrah agent near me",
];

export const SITE_LOGO_PATH = "/logo.png";
export const SITE_OG_IMAGE_PATH = "/og-image.png";
