import Link from "next/link";

export default function AgencyCTA() {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div className="neu-inset flex flex-col items-start gap-8 rounded-[30px] p-9 sm:flex-row sm:items-center sm:p-11">
        <div className="flex-1">
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#24201A] sm:text-[26px]">
            Run a Hajj or Umrah agency?
          </h2>
          <p className="mt-2.5 max-w-lg text-sm leading-[1.65] text-[#7A705E]">
            List your GST registration, services and numbers. Pilgrims call you directly &mdash;
            we take no commission on any booking.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/admin/signup"
            className="rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F3EFE6] shadow-sm"
            style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
          >
            List your agency
          </Link>
        </div>
      </div>
    </section>
  );
}
