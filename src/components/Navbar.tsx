"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { CartIcon, ChevronDown, CloseIcon, MenuIcon } from "./Icons";
import { useCartCount } from "@/lib/cart";

const LINKS = [
  { label: "About us", href: "/#about" },
  { label: "Details", href: "/#details" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Contact Us", href: "#contact" },
];

// Dikelompokkan dalam dropdown "Programs" agar navbar tidak penuh
const PROGRAMS = [
  { label: "Merch", href: "/merch" },
  { label: "Energize Talk", href: "/energize-talk" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progOpen, setProgOpen] = useState(false);
  const progRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const count = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProgOpen(false);
  }, [pathname]);

  // tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!progOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!progRef.current?.contains(e.target as Node)) setProgOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProgOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [progOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const Cart = (
    <Link href="/purchase" aria-label="Keranjang" className="relative text-brand transition hover:scale-110">
      <CartIcon className="h-7 w-7 lg:h-8 lg:w-8" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 font-outfit text-[11px] text-black">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        // backdrop-blur tidak dipakai saat menu mobile terbuka: backdrop-filter membuat menu `fixed` terkurung di tinggi header
        open ? "bg-black" : scrolled ? "bg-black/90 backdrop-blur-md" : "bg-black"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 md:h-[100px] md:px-10 lg:h-[131px]">
        {/* mobile: hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="text-brand md:hidden"
        >
          {open ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
        </button>

        <Link href="/" aria-label="Beranda Anargya" className="shrink-0">
          <Logo className="h-11 w-auto md:h-16 lg:h-[91px]" />
        </Link>

        <ul className="hidden items-center gap-5 md:flex lg:gap-9">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href === "#contact" ? "#contact" : l.href}
                className="group relative font-inter text-[19px] font-extrabold tracking-[-0.03em] text-brand lg:text-[28px]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-[3px] w-0 bg-brand transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
          <li ref={progRef} className="relative">
            <button
              type="button"
              onClick={() => setProgOpen((v) => !v)}
              aria-expanded={progOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 font-inter text-[19px] font-extrabold tracking-[-0.03em] text-brand lg:text-[28px]"
            >
              Programs
              <ChevronDown className={`h-4 w-4 transition-transform lg:h-5 lg:w-5 ${progOpen ? "rotate-180" : ""}`} />
            </button>
            <ul
              className={`absolute right-0 top-full mt-3 min-w-[220px] rounded-xl border border-brand/40 bg-black p-2 transition-all duration-200 ${
                progOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
              }`}
            >
              {PROGRAMS.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    onClick={() => setProgOpen(false)}
                    className={`block rounded-lg px-4 py-3 font-outfit text-lg transition hover:bg-brand/10 ${
                      pathname === p.href ? "text-brand" : "text-white"
                    }`}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="ml-1">{Cart}</li>
        </ul>

        <div className="md:hidden">{Cart}</div>
      </nav>

      {/* mobile menu */}
      <div
        className={`fixed inset-x-0 top-[72px] bottom-0 bg-black transition-all duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="px-6 pt-4">
          {[...LINKS, ...PROGRAMS].map((l, i) => (
            <li
              key={l.label}
              style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
              className={`border-b border-brand/30 transition-all duration-300 ${
                open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
            >
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-[18px] font-outfit text-2xl text-brand"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
