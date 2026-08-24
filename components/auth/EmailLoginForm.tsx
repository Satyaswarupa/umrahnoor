"use client";

import Link from "next/link";
import EmailLoginFields from "@/components/auth/EmailLoginFields";

// Standalone page shell around EmailLoginFields — for a direct link/bookmark
// to email login, outside the tabbed LoginForm/AdminLoginForm experience.
export default function EmailLoginForm({ portal }: { portal: "user" | "admin" }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-900/10">
      <h1 className="text-2xl font-bold text-emerald-950">Log in with email</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        For accounts created before mobile login was added.
      </p>

      <div className="mt-6">
        <EmailLoginFields portal={portal} />
      </div>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        <Link
          href={portal === "admin" ? "/admin/login" : "/login"}
          className="font-medium text-emerald-800 hover:text-emerald-600"
        >
          Back to mobile login
        </Link>
      </p>
    </div>
  );
}
