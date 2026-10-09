"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import StatusBadge from "@/components/StatusBadge";
import { ErrorBox, Spinner } from "@/components/States";
import { ChevronDown } from "@/components/Icons";
import { formatDate, friendlyError, METHOD, orderCode, rupiah, STATUS } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

function Detail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const [o, it] = await Promise.all([
      sb.from("orders").select("*").eq("id", Number(id)).maybeSingle(),
      sb.from("order_items").select("*").eq("order_id", Number(id)).order("id"),
    ]);
    if (o.error || it.error) setError(friendlyError(o.error ?? it.error));
    else if (!o.data) setError(`Order ${id} tidak ditemukan.`);
    else {
      setOrder(o.data as Order);
      setStatus((o.data as Order).status);
      setItems(it.data as OrderItem[]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase().from("orders").update({ status }).eq("id", order.id);
    setSaving(false);
    if (error) return setToast("Gagal: " + friendlyError(error));
    setOrder({ ...order, status });
    setToast("Status berhasil diperbarui ✓");
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) return <Spinner label="Memuat order…" />;
  if (error || !order)
    return (
      <div className="p-8">
        <ErrorBox message={error ?? "Order tidak ditemukan"} />
        <Link href="/admin#orders" className="block text-center text-brand">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );

  const info: [string, string][] = [
    ["Nama", order.customer_name],
    ["No. WhatsApp", order.phone],
    ["Email", order.email],
    ["Metode", METHOD[order.method]],
    ["Alamat", order.address || "—"],
    ["Catatan", order.note || "—"],
  ];

  return (
    <div className="space-y-7 px-4 pb-16 pt-8 md:px-8 lg:px-10 lg:pt-10">
      <Link href="/admin#orders" className="text-brand hover:underline">
        ← Kembali ke Dashboard
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-outfit text-4xl md:text-[44px]">Order {orderCode(order.id)}</h1>
          <p className="text-muted">Dibuat {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge s={order.status} />
          <div className="relative">
            <select
              aria-label="Ubah status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="appearance-none rounded-lg border border-brand bg-panel py-2.5 pl-3.5 pr-10 text-[15px] outline-none focus:ring-2 focus:ring-brand/50"
            >
              {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS[s].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
          </div>
          <button
            onClick={save}
            disabled={saving || status === order.status}
            className="rounded-lg bg-brand px-5 py-2.5 font-outfit text-black transition hover:brightness-110 disabled:opacity-40"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>

      {toast && (
        <p className="animate-[fadeUp_.3s_ease-out] rounded-lg border border-brand/60 bg-brand/10 px-4 py-2 text-brand">{toast}</p>
      )}

      <div className="space-y-3 rounded-xl border border-brand bg-panel p-5 md:p-6">
        <h2 className="font-outfit text-2xl">Data Pembeli</h2>
        {info.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 text-[15px] md:flex-row md:gap-6">
            <span className="shrink-0 text-muted md:w-40">{k}</span>
            <span className="break-words">{v}</span>
          </div>
        ))}
        <a
          href={`https://wa.me/${order.phone.replace(/^0/, "62").replace(/^\+/, "")}?text=${encodeURIComponent(
            `Halo ${order.customer_name}, pesanan ${orderCode(order.id)} kamu di Anargya Merch sudah kami terima.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-lg border border-brand px-4 py-2 font-outfit text-sm text-brand hover:bg-brand hover:text-black"
        >
          Hubungi via WhatsApp
        </a>
      </div>

      <h2 className="font-outfit text-3xl">Rincian Pesanan</h2>

      {/* tabel desktop/tablet */}
      <div className="hidden overflow-hidden border-2 border-brand text-brand md:block">
        <table className="w-full text-left text-lg lg:text-xl">
          <thead>
            <tr className="border-b-2 border-brand">
              <th className="p-3 font-normal">Product Name</th>
              <th className="p-3 font-normal">Quantity</th>
              <th className="p-3 text-right font-normal">Cost per Item</th>
              <th className="p-3 text-right font-normal">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td className="p-3">
                  {i + 1}. {it.product_name}
                  {it.size && ` (${it.size})`}
                </td>
                <td className="p-3">{it.qty}</td>
                <td className="p-3 text-right">{rupiah(it.unit_price)}</td>
                <td className="p-3 text-right">{rupiah(it.qty * it.unit_price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand">
              <td className="p-3" colSpan={3}>
                TOTAL
              </td>
              <td className="p-3 text-right">{rupiah(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* kartu mobile */}
      <div className="border-2 border-brand text-brand md:hidden">
        {items.map((it) => (
          <div key={it.id} className="space-y-1 border-b-2 border-brand p-3 text-lg">
            <p>
              {it.product_name}
              {it.size && ` (${it.size})`}
            </p>
            <p>Quantity : {it.qty}</p>
            <p>Cost : {rupiah(it.unit_price)}</p>
            <p>Total : {rupiah(it.qty * it.unit_price)}</p>
          </div>
        ))}
        <div className="flex justify-between p-3 text-lg">
          <span>TOTAL</span>
          <span>{rupiah(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AdminShell>
      <Detail />
    </AdminShell>
  );
}
