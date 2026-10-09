"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { CartIcon, CloseIcon, MenuIcon } from "./Icons";
import { useCartCount } from "@/lib/cart";

const LINKS = [
  { label: "About us", href: "/#about" },
  { label: "Details", href: "/#details" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Contact Us", href: "#contact" },
  { label: "Merch", href: "/merch" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const count = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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
        scrolled || open ? "bg-black/90 backdrop-blur-md" : "bg-black"
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
          {LINKS.map((l, i) => (
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
