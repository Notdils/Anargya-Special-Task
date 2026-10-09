"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorBox, Spinner } from "@/components/States";
import { useProducts } from "@/lib/useProducts";
import { readCart, writeCart, type Cart } from "@/lib/cart";
import { friendlyError, rupiah } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { SIZES, type Product } from "@/lib/types";

type Form = { name: string; phone: string; email: string; method: "pickup" | "delivery"; address: string; note: string };
const EMPTY: Form = { name: "", phone: "", email: "", method: "pickup", address: "", note: "" };

const keyOf = (p: Product, size?: string) => (size ? `${p.id}:${size}` : p.id);

function Stepper({
  value,
  onDec,
  onInc,
  canInc,
  size = "md",
  label,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  canInc: boolean;
  size?: "md" | "sm";
  label: string;
}) {
  const btn =
    "grid place-items-center rounded-full bg-brand font-outfit text-black transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div
      className={
        size === "md"
          ? "flex w-full items-center justify-between px-2 py-1.5 md:px-3"
          : "flex items-center gap-2 rounded-md border border-brand bg-black px-1.5 py-1"
      }
    >
      <button
        type="button"
        aria-label={`Kurangi ${label}`}
        onClick={onDec}
        disabled={value <= 0}
        className={`${btn} ${size === "md" ? "h-6 w-9 text-2xl leading-none md:w-14" : "h-5 w-5 rounded text-base"}`}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={size === "md" ? "font-outfit text-base text-black" : "min-w-4 text-center font-rethink text-base"}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        onClick={onInc}
        disabled={!canInc}
        className={`${btn} ${size === "md" ? "h-6 w-9 text-2xl leading-none md:w-14" : "h-5 w-5 rounded text-base"}`}
      >
        +
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="font-rethink text-base font-medium md:text-lg">
        {label}
        {required && " *"}
      </span>
      {children}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border bg-panel px-4 py-3 font-rethink text-base text-white placeholder:text-muted outline-none transition focus:ring-2 focus:ring-brand/50 md:text-[17px]";

export default function PurchasePage() {
  const router = useRouter();
  const { products, loading, error, reload } = useProducts();
  const [cart, setCart] = useState<Cart>({});
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form | "cart", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => setCart(readCart()), []);

  const update = (next: Cart) => {
    setCart(next);
    writeCart(next);
    setErrors((e) => ({ ...e, cart: undefined }));
  };

  const qtyOfProduct = (p: Product) =>
    p.has_sizes ? SIZES.reduce((s, z) => s + (cart[keyOf(p, z)] ?? 0), 0) : cart[keyOf(p)] ?? 0;

  const change = (p: Product, delta: number, size?: string) => {
    const k = keyOf(p, size);
    const cur = cart[k] ?? 0;
    if (delta > 0 && qtyOfProduct(p) >= p.stock) return;
    update({ ...cart, [k]: Math.max(0, cur + delta) });
  };

  const total = useMemo(
    () => products.reduce((sum, p) => sum + qtyOfProduct(p) * p.price, 0),
    [products, cart]
  );

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate() {
    const e: typeof errors = {};
    if (total <= 0) e.cart = "Pilih minimal 1 produk terlebih dahulu.";
    if (form.name.trim().length < 3) e.name = "Nama minimal 3 karakter.";
    if (!/^(\+62|62|0)8\d{7,12}$/.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Format No. WhatsApp tidak valid (contoh: 081234567890).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Format email tidak valid.";
    if (form.method === "delivery" && form.address.trim().length < 10) e.address = "Alamat lengkap wajib diisi untuk pengiriman.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) {
      setTimeout(
        () => document.querySelector("[data-first-error], .border-danger")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        50
      );
      return;
    }
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([k, qty]) => {
        const [product_id, size] = k.split(":");
        return { product_id, size: size ?? null, qty };
      })
      .filter((i) => products.some((p) => p.id === i.product_id));

    setSubmitting(true);
    const { data, error } = await supabase().rpc("place_order", {
      customer: { ...form, phone: form.phone.replace(/[\s-]/g, "") },
      items,
    });
    setSubmitting(false);
    if (error) {
      setServerError(friendlyError(error));
      reload();
      return;
    }
    try {
      sessionStorage.setItem("anargya-last-order", JSON.stringify(data));
    } catch {
      /* abaikan */
    }
    writeCart({});
    router.push("/purchase/success");
  }

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <section className="px-4 pb-6 pt-10 md:px-10 md:pt-14">
          <h1 className="mx-auto max-w-[1240px] font-inter text-5xl font-black tracking-[-0.03em] md:text-7xl lg:text-[93px]">
            PURCHASE
          </h1>
        </section>

        <form onSubmit={submit} noValidate>
          {/* ------------ daftar produk ------------ */}
          <section className="mx-auto max-w-[1280px] px-4 md:px-5">
            {loading && <Spinner label="Memuat produk…" />}
            {error && <ErrorBox message={error} onRetry={reload} />}
            {errors.cart && (
              <p data-first-error className="mb-4 rounded-lg border border-danger/60 bg-danger/10 p-3 text-center text-danger">
                {errors.cart}
              </p>
            )}
            <ul className="divide-y divide-white/10">
              {products.map((p) => {
                const q = qtyOfProduct(p);
                const soldOut = p.stock <= 0;
                return (
                  <li
                    key={p.id}
                    className="grid grid-cols-[120px_1fr] items-center gap-x-4 gap-y-3 py-6 md:grid-cols-[180px_1fr_auto] md:gap-x-8 lg:grid-cols-[228px_1fr_auto] lg:py-10"
                  >
                    {/* kartu gambar */}
                    <div
                      className={`row-span-2 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_3px_#29d970] md:row-span-1 ${
                        q > 0 ? "shadow-[0_0_0_3px_#29d970,0_0_24px_2px_rgba(41,217,112,.45)]" : ""
                      } transition-shadow`}
                    >
                      <div className="relative aspect-[228/189] overflow-hidden rounded-b-2xl">
                        <img src={p.image_url || "/images/logo.png"} alt={p.name} className="h-full w-full object-cover" />
                        {soldOut && (
                          <span className="absolute inset-0 grid place-items-center bg-black/70 font-outfit text-sm text-danger">
                            STOK HABIS
                          </span>
                        )}
                      </div>
                      {!p.has_sizes && (
                        <Stepper
                          label={p.name}
                          value={q}
                          onDec={() => change(p, -1)}
                          onInc={() => change(p, 1)}
                          canInc={q < p.stock}
                        />
                      )}
                      {p.has_sizes && <div className="h-3" />}
                    </div>

                    {/* nama + size */}
                    <div className="min-w-0">
                      <h2 className="font-outfit text-xl uppercase md:text-3xl lg:text-[36px]">{p.name}</h2>
                      <p className="mt-1 font-outfit text-base tracking-[-0.02em] text-brand md:hidden">{rupiah(p.price)}</p>
                      <p className="mt-1 text-xs text-muted md:text-sm">Stok tersedia: {p.stock}</p>
                      {p.has_sizes && (
                        <div className="mt-3 flex flex-wrap gap-3 md:gap-5">
                          {SIZES.map((z) => (
                            <div key={z} className="flex flex-col items-center gap-1.5">
                              <span className="font-outfit text-sm md:text-[17px]">{z}</span>
                              <Stepper
                                size="sm"
                                label={`${p.name} ukuran ${z}`}
                                value={cart[keyOf(p, z)] ?? 0}
                                onDec={() => change(p, -1, z)}
                                onInc={() => change(p, 1, z)}
                                canInc={q < p.stock}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* harga */}
                    <p className="hidden text-right font-outfit text-2xl tracking-[-0.02em] md:block lg:text-[36px]">
                      {rupiah(p.price)}
                      {q > 0 && <span className="block text-base text-brand">× {q} = {rupiah(q * p.price)}</span>}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ------------ data pembeli ------------ */}
          <section className="mt-6 border-t border-brand/35 px-4 py-12 md:px-12 lg:px-[120px] lg:py-14">
            <div className="mx-auto max-w-[1040px]">
              <h2 className="font-outfit text-3xl md:text-[41px]">DATA PEMBELI</h2>
              <p className="mt-3 text-muted md:text-[17px]">
                Tidak perlu pembayaran online. Tim kami akan menghubungi kamu via WhatsApp untuk konfirmasi pesanan.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Field label="Nama Lengkap" required error={errors.name}>
                  <input
                    className={`${inputCls} ${errors.name ? "border-danger" : "border-brand"}`}
                    placeholder="Contoh: Budi Santoso"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="No. WhatsApp" required error={errors.phone}>
                  <input
                    className={`${inputCls} ${errors.phone ? "border-danger" : "border-brand"}`}
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input
                    type="email"
                    className={`${inputCls} ${errors.email ? "border-danger" : "border-brand"}`}
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <div className="flex flex-col gap-2">
                  <span className="font-rethink text-base font-medium md:text-lg">Metode Pengambilan *</span>
                  <div role="radiogroup" className="grid grid-cols-2 gap-3">
                    {(["pickup", "delivery"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={form.method === m}
                        onClick={() => set("method", m)}
                        className={`rounded-lg border border-brand px-3 py-3 font-outfit text-[15px] transition md:text-[17px] ${
                          form.method === m ? "bg-brand text-black" : "bg-panel text-white hover:bg-brand/10"
                        }`}
                      >
                        {m === "pickup" ? "Ambil di Workshop" : "Dikirim"}
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  label="Alamat Pengiriman"
                  required={form.method === "delivery"}
                  error={errors.address}
                  className="md:col-span-2"
                >
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-y ${errors.address ? "border-danger" : "border-brand"} ${
                      form.method === "pickup" ? "opacity-50" : ""
                    }`}
                    placeholder={
                      form.method === "pickup"
                        ? "Tidak perlu diisi — pesanan diambil di Workshop Anargya (Jl. Teknik Sipil No. 2, ITS)"
                        : 'Wajib diisi jika memilih "Dikirim"'
                    }
                    disabled={form.method === "pickup"}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    autoComplete="street-address"
                  />
                </Field>
                <Field label="Catatan" className="md:col-span-2">
                  <textarea
                    rows={2}
                    className={`${inputCls} resize-y border-brand`}
                    placeholder="Opsional — contoh: ambil hari Sabtu"
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ------------ total + buy ------------ */}
          <section className="px-4 pb-20 pt-6 md:px-5">
            <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 font-inter font-black tracking-[-0.03em]">
              <span className="text-3xl md:text-6xl lg:text-[93px]">TOTAL :</span>
              <span className="text-right text-3xl transition-all md:text-6xl lg:text-[93px]">{rupiah(total)}</span>
            </div>
            {serverError && (
              <p className="mx-auto mt-6 max-w-xl rounded-lg border border-danger/60 bg-danger/10 p-3 text-center text-danger">
                {serverError}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={submitting || loading}
                className="rounded-xl bg-brand px-9 py-1 font-inter text-5xl font-black tracking-[-0.03em] text-black transition hover:-translate-y-1 hover:shadow-[0_0_40px_6px_rgba(41,217,112,.4)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none md:text-7xl lg:text-[93px]"
              >
                {submitting ? "…" : "BUY"}
              </button>
              <Link href="/merch" className="text-sm text-muted underline-offset-4 hover:text-brand hover:underline">
                ← Kembali ke katalog
              </Link>
            </div>
          </section>
        </form>
      </main>
      <Footer />
    </>
  );
}
