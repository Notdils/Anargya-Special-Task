"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/AdminShell";
import ProductModal from "@/components/ProductModal";
import StatusBadge from "@/components/StatusBadge";
import { ErrorBox, Spinner } from "@/components/States";
import { formatDate, friendlyError, orderCode, rupiah, STATUS } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Order, OrderStatus, Product } from "@/lib/types";

/** Customer unik = kombinasi nama + No. WhatsApp (checkout tanpa akun). */
const customerKey = (o: Order) => `${o.customer_name.trim().toLowerCase()}|${o.phone}`;

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "processing", "completed", "cancelled"];

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-white/60 px-4 py-10 md:px-8 lg:px-8 lg:py-12">
      <h2 className="font-rethink text-4xl font-medium md:text-5xl lg:text-[60px]">{title}</h2>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      <div className="mt-6 md:mt-8">{children}</div>
    </section>
  );
}

type Registrant = { id: number; full_name: string; email: string; phone: string; institution: string; created_at: string };
const PAGE_SIZE = 10;

/** Daftar pendaftar Energize Talk: pencarian + pagination di server (10 per halaman). */
function EnergizeRegistrants() {
  const [rows, setRows] = useState<Registrant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState(""); // q yang sudah di-debounce
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      let req = supabase()
        .from("energize_registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      // karakter , ( ) dipakai sintaks filter PostgREST → dibuang dari kata kunci
      const k = query.replace(/[,()]/g, " ");
      if (k) req = req.or(`full_name.ilike.%${k}%,email.ilike.%${k}%,institution.ilike.%${k}%`);
      const { data, count, error } = await req;
      if (!alive) return;
      if (error) setError(friendlyError(error));
      else {
        setError(null);
        setRows((data ?? []) as Registrant[]);
        setTotal(count ?? 0);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [page, query]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <Section id="energize" title="Pendaftar Energize Talk">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari nama / email / instansi…"
        className="mb-5 w-full rounded-lg border border-white/30 bg-panel px-3 py-2 text-sm outline-none focus:border-brand md:w-80"
      />
      {error ? (
        <ErrorBox message={error} />
      ) : loading && rows.length === 0 ? (
        <Spinner label="Memuat pendaftar…" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-muted">{query ? "Tidak ada pendaftar yang cocok." : "Belum ada pendaftar."}</p>
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <table className="hidden w-full text-left md:table">
            <thead className="text-sm text-white/80 lg:text-base">
              <tr>
                <th className="py-3 font-medium">No.</th>
                <th className="font-medium">Nama</th>
                <th className="font-medium">Email</th>
                <th className="font-medium">No. WhatsApp</th>
                <th className="font-medium">Instansi</th>
                <th className="font-medium">Waktu Daftar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t border-white/10 text-sm lg:text-base">
                  <td className="py-3.5">{from + i}.</td>
                  <td>{r.full_name}</td>
                  <td className="max-w-[200px] truncate">{r.email}</td>
                  <td>
                    <a className="hover:text-brand" href={`https://wa.me/${r.phone.replace(/^0/, "62").replace(/^\+/, "")}`} target="_blank" rel="noreferrer">
                      {r.phone}
                    </a>
                  </td>
                  <td>{r.institution}</td>
                  <td>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/20 bg-panel p-4">
                <div className="flex justify-between gap-3">
                  <span>{r.full_name}</span>
                  <span className="shrink-0 text-sm text-muted">{formatDate(r.created_at)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-brand">{r.email}</p>
                <p className="text-sm text-muted">
                  {r.phone} · {r.institution}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {total > 0 && (
        <nav aria-label="Pagination pendaftar" className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="text-sm text-white/60">
            Menampilkan {from}–{to} dari {total} pendaftar
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
              className="rounded-lg border border-white/25 px-3 py-1.5 disabled:opacity-35"
            >
              ‹
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-2">
                  {i > 0 && p - arr[i - 1] > 1 && <span className="text-white/40">…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`min-w-9 rounded-lg px-3 py-1.5 ${p === page ? "bg-brand text-black" : "border border-white/25 hover:border-brand"}`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pages}
              aria-label="Halaman berikutnya"
              className="rounded-lg border border-white/25 px-3 py-1.5 disabled:opacity-35"
            >
              ›
            </button>
          </div>
        </nav>
      )}
    </Section>
  );
}

function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ product: Product | null } | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const [p, o] = await Promise.all([
      sb.from("products").select("*").order("sort_order").order("created_at"),
      sb.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.error || o.error) setError(friendlyError(p.error ?? o.error));
    else {
      setError(null);
      setProducts(p.data as Product[]);
      setOrders(o.data as Order[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // realtime-ish: refresh saat tab kembali fokus
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0);
    const customers = new Set(orders.map(customerKey)).size;
    return { revenue, orders: orders.length, customers };
  }, [orders]);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email: string; count: number; last: string; spent: number }>();
    for (const o of orders) {
      const k = customerKey(o);
      const c = map.get(k);
      if (!c) map.set(k, { name: o.customer_name, phone: o.phone, email: o.email, count: 1, last: o.created_at, spent: o.total });
      else {
        c.count++;
        c.spent += o.total;
      }
    }
    return [...map.values()];
  }, [orders]);

  const shown = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (q === "" || `${orderCode(o.id)} ${o.customer_name} ${o.phone}`.toLowerCase().includes(q.toLowerCase()))
  );

  if (loading) return <Spinner label="Memuat dashboard…" />;
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <>
      {/* statistik */}
      <div className="grid gap-4 px-4 py-8 sm:grid-cols-3 md:px-8 lg:py-10">
        {[
          { v: rupiah(stats.revenue), l: "Revenue (order Selesai)" },
          { v: stats.orders, l: "Orders" },
          { v: stats.customers, l: "Customers" },
        ].map((c) => (
          <div key={c.l} className="rounded-lg bg-[#15a352] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-brand/90">
            <p className="font-rethink text-2xl font-medium md:text-[29px]">{c.v}</p>
            <p className="text-sm md:text-base">{c.l}</p>
          </div>
        ))}
      </div>

      {/* stok */}
      <Section id="stock" title="Stock">
        <ol className="space-y-1">
          {products.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-lg transition hover:bg-white/5 md:text-xl lg:text-[25px]">
              <span className="w-8 shrink-0">{i + 1}.</span>
              <span className="min-w-0 flex-1 truncate">
                {p.name}
                <span className="ml-2 align-middle text-xs text-muted md:text-sm">{rupiah(p.price)}</span>
              </span>
              <span className={`shrink-0 ${p.stock <= 5 ? "text-warn" : ""}`}>
                <span className="hidden sm:inline">Stock left : </span>
                {p.stock}
              </span>
              <button
                onClick={() => setModal({ product: p })}
                className="shrink-0 rounded-md border border-brand px-2.5 py-0.5 font-outfit text-sm text-brand transition hover:bg-brand hover:text-black"
              >
                Edit
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setModal({ product: null })}
            className="w-full rounded-lg bg-[#15a352] px-4 py-2 text-lg transition hover:bg-brand hover:text-black sm:w-auto md:text-[25px]"
          >
            Add another merch (+)
          </button>
        </div>
      </Section>

      {/* orders */}
      <Section id="orders" title="Order list" hint="Klik salah satu order untuk melihat detail & mengubah status.">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1 font-outfit text-sm transition ${
                  filter === f ? "border-brand bg-brand text-black" : "border-white/30 text-white/80 hover:border-brand"
                }`}
              >
                {f === "all" ? "Semua" : STATUS[f].label}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari ID / nama / no. WA…"
            className="rounded-lg border border-white/30 bg-panel px-3 py-2 text-sm outline-none focus:border-brand md:ml-auto md:w-64"
          />
        </div>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-muted">Belum ada order.</p>
        ) : (
          <>
            {/* tabel (tablet & desktop) */}
            <table className="hidden w-full text-left md:table">
              <thead className="text-sm text-white/80 lg:text-base">
                <tr>
                  <th className="py-3 font-medium">No.</th>
                  <th className="font-medium">Order ID</th>
                  <th className="font-medium">Pelanggan</th>
                  <th className="font-medium">Waktu Order</th>
                  <th className="text-right font-medium">Total</th>
                  <th className="text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o, i) => (
                  <tr
                    key={o.id}
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                    className="cursor-pointer border-t border-white/10 text-sm transition hover:bg-brand/10 lg:text-base"
                  >
                    <td className="py-4">{i + 1}.</td>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-brand" onClick={(e) => e.stopPropagation()}>
                        {orderCode(o.id)}
                      </Link>
                    </td>
                    <td>{o.customer_name}</td>
                    <td>{formatDate(o.created_at)}</td>
                    <td className="text-right">{rupiah(o.total)}</td>
                    <td className="text-right">
                      <StatusBadge s={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* kartu (mobile) */}
            <ul className="space-y-3 md:hidden">
              {shown.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="block rounded-xl border border-brand/60 bg-panel p-4 transition active:scale-[.99]">
                    <div className="flex items-center justify-between">
                      <span className="font-outfit">{orderCode(o.id)}</span>
                      <StatusBadge s={o.status} />
                    </div>
                    <p className="mt-2">{o.customer_name}</p>
                    <div className="mt-1 flex justify-between text-sm text-muted">
                      <span>{formatDate(o.created_at)}</span>
                      <span className="text-white">{rupiah(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      {/* customers */}
      <Section id="customers" title="Customer List">
        {customers.length === 0 ? (
          <p className="py-8 text-center text-muted">Belum ada customer.</p>
        ) : (
          <>
            <table className="hidden w-full text-left md:table">
              <thead className="text-sm text-white/80 lg:text-base">
                <tr>
                  <th className="py-3 font-medium">No.</th>
                  <th className="font-medium">Nama</th>
                  <th className="font-medium">No. WhatsApp</th>
                  <th className="font-medium">Email</th>
                  <th className="text-right font-medium">Order</th>
                  <th className="text-right font-medium">Order Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.phone + c.name} className="border-t border-white/10 text-sm lg:text-base">
                    <td className="py-4">{i + 1}.</td>
                    <td>{c.name}</td>
                    <td>
                      <a className="hover:text-brand" href={`https://wa.me/${c.phone.replace(/^0/, "62").replace(/^\+/, "")}`} target="_blank" rel="noreferrer">
                        {c.phone}
                      </a>
                    </td>
                    <td className="max-w-[180px] truncate">{c.email}</td>
                    <td className="text-right">{c.count}×</td>
                    <td className="text-right">{formatDate(c.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="space-y-3 md:hidden">
              {customers.map((c) => (
                <li key={c.phone + c.name} className="rounded-xl border border-white/20 bg-panel p-4">
                  <div className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-sm text-muted">{c.count}× order</span>
                  </div>
                  <p className="mt-1 text-sm text-brand">{c.phone}</p>
                  <p className="text-sm text-muted">Terakhir: {formatDate(c.last)}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <EnergizeRegistrants />

      {modal && (
        <ProductModal
          product={modal.product}
          nextSort={products.length + 1}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </>
  );
}

export default function AdminPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
