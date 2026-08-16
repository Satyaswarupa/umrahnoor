export const inputClass =
  "mt-1 w-full rounded-lg border border-emerald-900/15 px-3 py-2 text-sm text-emerald-950 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export const selectClass = inputClass + " bg-white";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-emerald-950">{label}</span>
      {children}
    </label>
  );
}
