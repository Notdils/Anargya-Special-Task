"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["DAYS", 86_400_000],
  ["HRS", 3_600_000],
  ["MIN", 60_000],
  ["SEC", 1_000],
] as const;

/** Hitung mundur ke `target`. Setelah lewat, tampil teks "Registration Closed". */
export default function Countdown({ target, closedLabel }: { target: string; closedLabel: string }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null); // null saat SSR agar tidak hydration mismatch

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = now === null ? null : Math.max(0, end - now);

  if (left === 0) {
    return (
      <div>
        <p className="font-robomono text-xs font-medium tracking-[0.08em] text-white/60">REGISTRATION CLOSED</p>
        <p className="mt-2 text-base text-white/80">{closedLabel}</p>
      </div>
    );
  }

  let rest = left ?? 0;
  return (
    <div>
      <p className="font-robomono text-xs font-medium tracking-[0.08em] text-white/60">REGISTRATION CLOSES IN</p>
      <div className="mt-2.5 flex gap-2.5" role="timer" aria-live="off">
        {UNITS.map(([label, ms]) => {
          const v = Math.floor(rest / ms);
          rest -= v * ms;
          return (
            <div key={label} className="flex flex-col items-center rounded-[10px] border border-brand/35 bg-white/[0.04] px-4 py-2.5">
              <span className="font-geistmono text-[28px] font-medium leading-tight">
                {left === null ? "--" : String(v).padStart(2, "0")}
              </span>
              <span className="font-robomono text-[10px] font-medium tracking-[0.1em] text-white/60">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
