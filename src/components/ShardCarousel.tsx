"use client";

import { useEffect, useRef, useState } from "react";
import MirrorImage from "./MirrorImage";
import type { Speaker } from "@/lib/energize";

const INTERVAL = 4000; // ms, posisi bertukar setiap 4 detik
const SLOTS = ["front", "tr", "bl"] as const;

/**
 * Carousel 3 foto pembicara berbentuk keping cermin.
 * Saat berganti, cermin di belakang maju ke depan dan cermin depan mundur
 * (transisi posisi/ukuran via CSS, lihat .shard-slot di globals.css).
 */
export default function ShardCarousel({ speakers }: { speakers: Speaker[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = speakers.length;
  const go = (i: number) => setActive((i + n) % n);

  // autoplay
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [active, paused, n]);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="shard-stage relative w-full">
        {speakers.map((s, i) => {
          const slot = SLOTS[(i - active + n) % n];
          const isFront = slot === "front";
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => go(i)}
              tabIndex={isFront ? -1 : 0}
              aria-label={isFront ? s.name : `Tampilkan ${s.name}`}
              className={`shard-slot shard-slot--${slot}`}
            >
              <MirrorImage id={`hero-${i}`} src={s.src} alt={s.name} shape={s.shape} className="h-auto w-full" />
            </button>
          );
        })}
      </div>

      {/* caption speaker aktif */}
      <div className="shard-caption mt-4 rounded-2xl border border-brand/45 bg-[#0a0f0c]/85 px-5 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <p className="font-robomono text-xs font-medium tracking-[0.08em] text-brand">
            SPEAKER {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            {[
              { label: "Sebelumnya", d: "M15 6l-6 6 6 6", to: active - 1 },
              { label: "Berikutnya", d: "M9 6l6 6-6 6", to: active + 1 },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-label={b.label}
                onClick={() => go(b.to)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/30 transition hover:border-brand hover:text-brand"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path d={b.d} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        {/* Semua caption ditumpuk di satu sel grid → tinggi box = caption terpanjang,
            jadi layout tidak bergeser saat speaker berganti. Hanya yang aktif terlihat. */}
        <div className="mt-3 grid" aria-live="polite">
          {speakers.map((s, i) => (
            <div
              key={s.name}
              aria-hidden={i !== active}
              className={`[grid-area:1/1] transition-opacity duration-300 ${i === active ? "opacity-100" : "invisible opacity-0"}`}
            >
              <p className="font-outfit text-xl md:text-2xl">{s.name}</p>
              <p className="mt-1 text-sm text-white/60 md:text-[15px]">{s.org}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-1.5">
          {speakers.map((s, i) => (
            <span key={s.name} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              {i < active && <span className="block h-full w-full bg-brand" />}
              {i === active && (
                <span
                  key={active}
                  className="block h-full bg-brand"
                  style={{ animation: `shardProgress ${INTERVAL}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
