export type VerificationBadgeColor = "BLUE" | "GOLD";

const BADGE_COLORS: Record<VerificationBadgeColor, string> = {
  BLUE: "#1D6FD8",
  GOLD: "#D4A017",
};

// Icon-only version of the badge — the seal/checkmark glyph used in superadmin
// pickers, agent cards, and the pill badge below.
export function VerifiedTick({ badge, className }: { badge: VerificationBadgeColor; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={BADGE_COLORS[badge]} className={className ?? "h-4 w-4 shrink-0"}>
      <path d="M12 1.8l2.4 1.9 3-.3 1 2.9 2.6 1.6-1 2.9 1 2.9-2.6 1.6-1 2.9-3-.3L12 22.2 9.6 20.3l-3 .3-1-2.9L3 16.1l1-2.9-1-2.9 2.6-1.6 1-2.9 3 .3z" />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.8" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export default function VerifiedBadge({
  badge = "BLUE",
  className,
}: {
  badge?: VerificationBadgeColor;
  className?: string;
}) {
  const gold = badge === "GOLD";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " +
        (gold ? "bg-[#D4A017]/10 text-[#8A6A0A] ring-[#D4A017]/30" : "bg-[#1D6FD8]/10 text-[#1652A3] ring-[#1D6FD8]/25") +
        " " +
        (className ?? "")
      }
    >
      <VerifiedTick badge={badge} className="h-3.5 w-3.5" />
      {gold ? "Gold Verified" : "Verified"}
    </span>
  );
}
