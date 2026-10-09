"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "./Footer";
import { Spinner } from "./States";
import { CloseIcon, MenuIcon } from "./Icons";
import { useAdmin } from "@/lib/useAdmin";

const NAV = [
  { label: "Stock", n: "01", href: "/admin#stock" },
  { label: "Orders", n: "02", href: "/admin#orders" },
  { label: "Customers", n: "03", href: "/admin#customers" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready, user, logout } = useAdmin();
  const [open, setOpen] = useState(false);

  if (!ready) return <Spinner label="Memeriksa sesi admin…" />;

  const links = (
    <>
      <ul className="space-y-3">
        {NAV.map((l) => (
          <li key={l.label}>
            <Link href={l.href} onClick={() => setOpen(false)} className="font-rethink text-base transition hover:text-brand">
              {l.label}
              <sup className="ml-0.5 text-[10px]">{l.n}</sup>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 space-y-3">
        <Link href="/" className="block font-rethink text-base transition hover:text-brand">
          Lihat Website
        </Link>
        <a href="mailto:anargya.its@gmail.com" className="block font-rethink text-base transition hover:text-brand">
          Contact Us
        </a>
        <button onClick={logout} className="block font-rethink text-base text-danger transition hover:underline">
          Logout
        </button>
      </div>
      <p className="mt-6 truncate text-xs text-muted">{user?.email}</p>
    </>
  );

  return (
    <div className="lg:flex">
      {/* sidebar desktop */}
      <aside className="hidden w-[250px] shrink-0 lg:block">
        <div className="sticky top-0 px-6 py-8">
          <Link href="/admin" className="mb-10 block text-center font-outfit text-2xl">
            Admin Panel
          </Link>
          {links}
        </div>
      </aside>

      {/* top bar tablet/mobile */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-black lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu admin" className="text-brand">
            {open ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
          </button>
          <Link href="/admin" className="font-rethink text-xl tracking-wide md:text-2xl">
            ADMIN PANEL
          </Link>
          <span className="w-7" />
        </div>
        <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-2">{links}</div>
          </div>
        </div>
      </header>

      <div className="min-w-0 flex-1 lg:border-l lg:border-white/60">
        {children}
        <div className="border-t border-white/60">
          <Footer />
        </div>
      </div>
    </div>
  );
}
