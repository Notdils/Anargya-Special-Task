"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/lib/format";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("denied")) setError("Akun ini tidak memiliki akses admin.");
    supabase()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace("/admin");
      });
  }, [params, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return setError(friendlyError(error));
    router.replace("/admin");
  }

  const input =
    "w-full rounded-lg border border-brand bg-black px-4 py-3.5 text-[15px] text-white placeholder:text-muted outline-none focus:ring-2 focus:ring-brand/50";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[440px] animate-[fadeUp_.6s_ease-out_both] flex-col items-center gap-5 rounded-2xl border border-brand bg-panel px-8 py-10"
      >
        <Logo className="w-40" />
        <h1 className="font-outfit text-3xl">ADMIN PANEL</h1>
        <p className="-mt-2 text-sm text-muted">Masuk untuk mengelola produk &amp; pesanan.</p>
        <label className="flex w-full flex-col gap-2 text-[15px]">
          Email
          <input className={input} type="email" placeholder="admin@anargya.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="flex w-full flex-col gap-2 text-[15px]">
          Password
          <input className={input} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="w-full text-sm text-danger">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand py-3.5 font-outfit text-lg text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Memproses…" : "MASUK"}
        </button>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Kembali ke website
        </Link>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
