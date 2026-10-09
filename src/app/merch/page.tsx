"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import { ErrorBox, Spinner } from "@/components/States";
import { useProducts } from "@/lib/useProducts";
import { rupiah } from "@/lib/format";

export default function MerchPage() {
  const { products, loading, error, reload } = useProducts();

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <section className="px-4 pt-6 md:px-5">
          <Logo className="mx-auto w-full max-w-[1240px] animate-[fadeUp_.8s_ease-out_both]" />
        </section>

        <section className="px-4 pb-10 pt-12 text-center md:pt-20">
          <h1 className="text-outline font-inter text-[56px] font-black leading-[0.95] tracking-[-0.03em] md:text-[80px] lg:text-[93px]">
            Our
            <br className="md:hidden" /> Merchandise
          </h1>
        </section>

        <section className="relative mx-auto max-w-[1280px] px-4 pb-20 md:px-10">
          <p className="mb-4 font-outfit text-sm tracking-[0.15em] md:absolute md:left-3 md:top-1 md:mb-0 md:[writing-mode:vertical-rl] md:rotate-180 lg:left-6">
            CATALOG
          </p>

          {loading && <Spinner label="Memuat katalog…" />}
          {error && <ErrorBox message={error} onRetry={reload} />}

          {!loading && !error && (
            <ul className="mx-auto grid max-w-[1110px] grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:pl-12">
              {products.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                  <p className="mb-2 flex flex-wrap items-baseline gap-x-2 font-outfit">
                    <span className="text-sm uppercase md:text-lg">{p.name}</span>
                    <span className="text-xs tracking-[-0.02em] md:text-[15px]">
                      {rupiah(p.price)}/{p.unit}
                    </span>
                  </p>
                  <div className="group relative aspect-[343/318] overflow-hidden rounded-[18px] border-[3px] border-brand md:rounded-[30px] md:border-4">
                    <img
                      src={p.image_url || "/images/logo.png"}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    {p.stock <= 0 && (
                      <span className="absolute inset-0 grid place-items-center bg-black/70 font-outfit text-xl text-danger">
                        STOK HABIS
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="mt-16 flex justify-center md:mt-24">
            <Link
              href="/purchase"
              className="rounded-xl bg-brand px-7 py-2 font-inter text-4xl font-black tracking-[-0.03em] text-black transition hover:-translate-y-1 hover:shadow-[0_0_40px_6px_rgba(41,217,112,.4)] md:text-6xl lg:px-9 lg:text-[93px]"
            >
              BUY NOW
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
