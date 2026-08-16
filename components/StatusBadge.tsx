const STYLES: Record<string, string> = {
  INCOMPLETE: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
};

const LABELS: Record<string, string> = {
  INCOMPLETE: "Incomplete",
  PENDING: "Verification Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        STYLES[status] ?? STYLES.INCOMPLETE
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
