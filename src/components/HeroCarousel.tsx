"use client";

import { useEffect, useRef, useState } from "react";

const INTERVAL = 4000; // ms

/**
 * Carousel hero Home berbasis scroll horizontal (scroll-snap).
 * - User bisa langsung geser (swipe / trackpad / shift+scroll) ke slide yang diinginkan.
 * - Autoplay tetap jalan walau di-hover; timer di-reset setiap kali slide berganti.
 * - Dot untuk lompat ke slide tertentu.
 */
export default function HeroCarousel({ slides, labels }: { slides: React.ReactNode[]; labels: string[] }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const n = slides.length;

  const scrollTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  // slide aktif mengikuti posisi scroll (termasuk saat user menggeser sendiri)
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  // autoplay
  useEffect(() => {
    const t = setTimeout(() => scrollTo((active + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [active, n]);

  return (
    <section aria-roledescription="carousel" aria-label="Highlight" className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${n}: ${labels[i]}`}
            aria-hidden={i !== active}
            inert={i !== active}
            className="relative min-h-[600px] w-full shrink-0 snap-start overflow-hidden md:min-h-[800px] lg:min-h-[976px]"
          >
            <div className="absolute inset-0">{slide}</div>
          </div>
        ))}
      </div>

      {/* indikator (gaya web resmi Anargya) */}
      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3.5 md:bottom-12">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Slide ${i + 1}: ${labels[i]}`}
            aria-current={i === active}
            className={`rounded-full border-[1.5px] transition-all ${
              i === active ? "h-4 w-4 border-white" : "h-3 w-3 border-white/50 hover:border-white"
            }`}
          />
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-11 right-10 hidden font-robomono text-base font-medium tracking-[0.2em] text-white/60 md:block lg:right-[120px] lg:bottom-12">
        {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
      </p>
    </section>
  );
}
