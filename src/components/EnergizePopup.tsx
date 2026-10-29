"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon } from "./Icons";

const KEY = "anargya-energize-popup-dismissed";

/** Pengumuman kecil di bawah layar Home, khusus mobile (di tablet/desktop sudah ada slide Energize di hero).
 *  Setelah ditutup, tidak muncul lagi (disimpan di localStorage). */
export default function EnergizePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      /* storage tidak tersedia → tetap tampilkan */
    }
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* abaikan */
    }
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Pengumuman Energize Talk"
      className="fixed inset-x-4 bottom-4 z-40 animate-[fadeUp_.4s_ease-out_both] rounded-xl border border-brand/50 bg-black p-5 md:hidden"
    >
      <button type="button" onClick={close} aria-label="Tutup pengumuman" className="absolute right-3 top-3 text-white/60 hover:text-white">
        <CloseIcon className="h-5 w-5" />
      </button>
      <p className="font-robomono text-xs font-medium tracking-[0.12em] text-brand">NEW EVENT</p>
      <p className="mt-2 pr-6 font-inter text-2xl font-black tracking-[-0.02em]">
        Energize Talk 2026 — <span className="italic text-brand">Watt&apos;s Up!</span>
      </p>
      <p className="mt-2 text-sm text-white/70">Sustain the Future: Youth as Agents of Change · 14 June 2026 via Zoom.</p>
      <Link
        href="/energize-talk"
        onClick={close}
        className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 font-outfit text-black transition hover:brightness-110"
      >
        See the Event
      </Link>
    </aside>
  );
}
