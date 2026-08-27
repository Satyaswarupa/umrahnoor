"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );

export default function SiteLoader() {
  const [progress, setProgress] = useState(4);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const tick = window.setInterval(() => {
      setProgress((p) => (p < 88 ? p + (88 - p) * 0.12 + 0.4 : p));
    }, 120);

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.clearInterval(tick);
      setProgress(100);
      window.setTimeout(() => setFading(true), 260);
    };

    const onLoad = () => finish();
    if (document.readyState === "complete") {
      window.setTimeout(finish, 700);
    } else {
      window.addEventListener("load", onLoad);
    }
    const fallback = window.setTimeout(finish, 4000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(fallback);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (!fading) return;
    document.body.style.overflow = "";
    const t = window.setTimeout(() => setMounted(false), 550);
    return () => window.clearTimeout(t);
  }, [fading]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={fading}
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-[#FBF9F3] transition-opacity duration-500 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ fontFamily: "var(--font-amiri), serif" }}
    >
      {/* film-grain / vintage paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "140px 140px" }}
      />
      {/* warm vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(120,95,45,0.10) 100%)",
        }}
      />
      {/* sepia corner fade */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_40px_rgba(176,141,87,0.08)]" />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative flex h-[188px] w-[188px] items-center justify-center rounded-full border border-[#C9A85C]/50">
          <div className="absolute inset-[8px] rounded-full border border-[#C9A85C]/30" />
          <div className="absolute inset-0 animate-[spin_5s_linear_infinite] rounded-full border border-dashed border-[#C9A85C]/25" />
          <Image
            src="/logo-emblem.png"
            alt="Umrah Jao"
            width={661}
            height={699}
            priority
            className="relative h-[132px] w-[132px] object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
          />
        </div>

        <div className="mt-5 text-[21px] font-bold tracking-[0.32em] text-[#2A2313]">
          UMRAH JAO
        </div>
        <div className="mt-2 h-px w-10 bg-[#C9A85C]" />
        <div className="mt-3 text-[12.5px] italic tracking-wide text-[#6E6455]">
          Every journey begins with a sincere heart
        </div>

        <div className="mt-7 h-[3px] w-[220px] overflow-hidden rounded-full bg-[#E7E0CC]">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-[#8A6D3B] via-[#C9A85C] to-[#8A6D3B] transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        <div
          className="mt-2 text-[10.5px] font-sans font-semibold tracking-[0.2em] text-[#9A8B5E]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.min(100, Math.round(progress))}%
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
