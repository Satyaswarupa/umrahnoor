import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-emerald-900/10 bg-emerald-950 text-emerald-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-900">
                UN
              </span>
              <span className="text-lg font-semibold text-white">UmrahNoor</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-emerald-200/80">
              A trusted directory to help you find verified Umrah travel agents near you.
              UmrahNoor does not process bookings or payments &mdash; connect directly with
              agents by phone or WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-12">
            <div>
              <p className="font-semibold text-white">Explore</p>
              <ul className="mt-3 space-y-2 text-emerald-200/80">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="hover:text-white">
                    Find Umrah Agents
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">For Agents</p>
              <ul className="mt-3 space-y-2 text-emerald-200/80">
                <li>
                  <Link href="/admin/signup" className="hover:text-white">
                    Become an Agent
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white">
                    Agent Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-emerald-200/60">
          &copy; {new Date().getFullYear()} UmrahNoor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
