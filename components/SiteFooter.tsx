import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className="mt-[88px] border-t border-white/70 bg-[#EAE5DB] text-[#24201A]"
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-11 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="UmrahChal logo" width={36} height={36} className="h-9 w-9 rounded-xl" />
            <div className="text-[15px] font-extrabold">UmrahChal</div>
          </div>
          <p className="mt-3.5 max-w-xs text-xs leading-[1.7] text-[#8A7F6C]">
            A directory of licensed Hajj and Umrah operators across India. We list agents and
            their contact numbers &mdash; nothing is sold on this site.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-extrabold tracking-[0.12em] text-[#6E6455]">AGENCIES</p>
          <ul className="mt-3.5 space-y-2.5 text-[13px] text-[#7A705E]">
            <li>
              <Link href="/admin/signup" className="hover:text-[#0E5B4A]">
                List your agency
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-[#0E5B4A]">
                Agent Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-9 text-[11px] text-[#9A907C] sm:flex-row sm:justify-between sm:px-6">
        <span>&copy; {new Date().getFullYear()} UmrahChal &middot; Directory only, not a travel agent</span>
        <span>Privacy &middot; Terms &middot; Report an agent</span>
      </div>
    </footer>
  );
}
