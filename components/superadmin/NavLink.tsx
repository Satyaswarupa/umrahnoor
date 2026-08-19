"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  item,
}: {
  item: { href: string; label: string; icon: string; count?: number; tone?: "pending" | "neutral" };
}) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname?.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={
        "flex items-center gap-2.5 rounded-[14px] px-[13px] py-3 transition " +
        (active ? "text-[#F6E2B4] shadow-sm" : "neu-raised-sm text-[#4A4238] hover:text-[#0E5B4A]")
      }
      style={active ? { background: "#06042a" } : undefined}
    >
      <span className="w-[18px] text-center text-[13px]">{item.icon}</span>
      <span className="flex-1 text-[13.5px] font-bold">{item.label}</span>
      {item.count != null && item.count > 0 && (
        <span
          className="rounded-full px-2 py-[3px] text-[10px] font-extrabold"
          style={
            active
              ? { color: "#F6E2B4", background: "rgba(246,226,180,.2)" }
              : item.tone === "pending"
                ? { color: "#8A5A12", background: "rgba(192,138,46,.18)" }
                : { color: "#5B5346", background: "rgba(120,110,95,.16)" }
          }
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}
