"use client";

import { useMemo, useState } from "react";
import SearchInput from "@/components/superadmin/SearchInput";

const ROLE_STYLES: Record<string, { fg: string; bg: string }> = {
  SUPERADMIN: { fg: "#0A4438", bg: "rgba(14,91,74,.14)" },
  ADMIN: { fg: "#8A5A12", bg: "rgba(192,138,46,.18)" },
  USER: { fg: "#5B5346", bg: "rgba(120,110,95,.18)" },
};

type SafeUser = { id: string; name: string; email: string; role: string; createdAt: string | Date };

export default function UsersTable({ users }: { users: SafeUser[] }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.name + " " + u.email).toLowerCase().includes(q));
  }, [users, query]);

  return (
    <>
      <div className="flex justify-end px-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search users…" />
      </div>

      <div className="neu-raised mt-4 rounded-3xl bg-[#EAE5DB] px-[10px] pb-[6px] pt-[10px]">
        <div className="grid grid-cols-[1.4fr_1.8fr_1fr_1fr] gap-4 px-[18px] py-4">
          {["NAME", "EMAIL", "ROLE", "JOINED"].map((c) => (
            <div key={c} className="text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">
              {c}
            </div>
          ))}
        </div>

        {shown.map((user, i) => {
          const role = ROLE_STYLES[user.role] ?? ROLE_STYLES.USER;
          return (
            <div
              key={user.id}
              className={"grid grid-cols-[1.4fr_1.8fr_1fr_1fr] items-center gap-4 rounded-[18px] px-[18px] py-3.5 " + (i % 2 ? "neu-pressed" : "")}
            >
              <div className="flex items-center gap-2.5">
                <div className="neu-pressed grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-xs font-extrabold text-[#0E5B4A]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-[13px] font-bold text-[#24201A]">{user.name}</span>
              </div>
              <div className="truncate text-[12.5px] text-[#6E6455]">{user.email}</div>
              <div>
                <span
                  className="rounded-full px-2.5 py-[5px] text-[10px] font-extrabold tracking-[0.06em]"
                  style={{ color: role.fg, background: role.bg }}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-[12.5px] text-[#6E6455]">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          );
        })}

        {shown.length === 0 && (
          <div className="neu-inset m-2 rounded-[22px] px-6 py-14 text-center">
            <p className="text-[15px] font-extrabold text-[#6E6455]">No users yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
