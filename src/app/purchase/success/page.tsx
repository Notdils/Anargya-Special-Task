"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "@/components/Icons";
import { METHOD, orderCode, rupiah } from "@/lib/format";

type Result = {
  id: number;
  total: number;
  status: string;
  method: "pickup" | "delivery";
  name: string;
  items: { name: string; size: string | null; qty: number; unit_price: number }[];
};

export default function SuccessPage() {
  const [order, setOrder] = useState<Result | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("anargya-last-order");
      setOrder(raw ? (JSON.parse(raw) as Result) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="px-4 pb-24 pt-14 md:px-20 md:pt-20 lg:px-60">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-6 text-center">
          <CheckCircle className="h-20 w-20 animate-[pop_.5s_ease-out_both] text-brand md:h-24 md:w-24" />
          <h1 className="font-outfit text-4xl text-brand md:text-[56px] md:leading-tight">PESANAN BERHASIL!</h1>

          {order === null && (
            <p className="text-muted">
              Tidak ada pesanan terbaru di sesi ini.{" "}
              <Link href="/merch" className="text-brand underline">
                Lihat katalog
              </Link>
            </p>
          )}

          {order && (
            <>
              <p className="text-base text-muted md:text-lg">
                Terima kasih, {order.name}! Pesananmu sudah kami terima. Tim Anargya akan menghubungi kamu via WhatsApp untuk
                konfirmasi &amp; pengambilan.
              </p>
              <div className="w-full space-y-3 rounded-xl border border-brand bg-panel p-5 text-left md:p-7">
                <Row a="Order ID" b={orderCode(order.id)} bold />
                <Row a="Status" b="Pending" />
                <Row a="Metode" b={METHOD[order.method]} />
                <hr className="border-brand/40" />
                {order.items.map((it, i) => (
                  <Row
                    key={i}
                    a={`${it.name}${it.size ? ` (${it.size})` : ""} × ${it.qty}`}
                    b={rupiah(it.qty * it.unit_price)}
                  />
                ))}
                <hr className="border-brand/40" />
                <Row a="TOTAL" b={rupiah(order.total)} bold />
              </div>
              <p className="text-sm text-muted">Simpan Order ID ini untuk konfirmasi.</p>
            </>
          )}

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link href="/" className="rounded-lg border-[1.5px] border-brand px-7 py-3 font-outfit text-brand transition hover:bg-brand/10">
              Kembali ke Home
            </Link>
            <Link href="/merch" className="rounded-lg bg-brand px-7 py-3 font-outfit text-black transition hover:brightness-110">
              Belanja Lagi
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ a, b, bold }: { a: string; b: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${bold ? "font-outfit text-xl md:text-[22px]" : "text-sm md:text-base"}`}>
      <span>{a}</span>
      <span className={bold ? "text-brand" : ""}>{b}</span>
    </div>
  );
}
