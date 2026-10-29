import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import ShardCarousel from "@/components/ShardCarousel";
import MirrorImage from "@/components/MirrorImage";
import { SPEAKERS } from "@/lib/energize";

export const metadata: Metadata = {
  title: "Energize Talk 2026 — Anargya EV ITS Team",
  description: "Energize Talk 2026: Sustain the Future — Youth as Agents of Change. 14 June 2026 via Zoom.",
};

// Batas pendaftaran (proof of concept). Ubah tanggal ini untuk menghidupkan countdown.
const REG_CLOSES = "2026-06-14T17:00:00+07:00";

const G = "#29D970";
const S = { stroke: G, strokeWidth: 2 } as const;
const IC = {
  cal: (<><rect x="3" y="5" width="18" height="16" rx="2" {...S} /><path d="M3 10h18M8 3v4M16 3v4" {...S} strokeLinecap="round" /></>),
  video: (<><rect x="2" y="6" width="14" height="12" rx="2" {...S} /><path d="m16 10 6-3v10l-6-3" {...S} strokeLinejoin="round" /></>),
  award: (<><circle cx="12" cy="9" r="6" {...S} /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" {...S} strokeLinejoin="round" /></>),
  chat: (<><path d="M4 5h16v11H9l-5 4z" {...S} strokeLinejoin="round" /><path d="M9 10h6" {...S} strokeLinecap="round" /></>),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" {...S} strokeLinejoin="round" />,
  clock: (<><circle cx="12" cy="12" r="9" {...S} /><path d="M12 7v5l3 2" {...S} strokeLinecap="round" /></>),
  users: <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21c0-4 3-7 7-7s7 3 7 7M16 4a4 4 0 0 1 0 8M22 21c0-3-2-6-5-7" {...S} strokeLinecap="round" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
};
const icon = (paths: React.ReactNode, cls = "h-[18px] w-[18px]") => (
  <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
    {paths}
  </svg>
);

const BENEFITS: [string, string, React.ReactNode][] = [
  ["E-Certificate", "E-Certificate for all participants.", IC.award],
  ["Interactive Q&A", "Interactive Q&A session with industry professionals and practitioners.", IC.chat],
  ["Deep Insights", "Deep insights into sustainability, renewable energy engineering and more from the experts.", IC.bolt],
];

const DETAILS: [string, string, React.ReactNode][] = [
  ["DATE", "Sunday, 14 June 2026", IC.cal],
  ["REGISTRATION CLOSES", "14 June 2026 · 17:00 WIB", IC.clock],
  ["PLATFORM", "Zoom Meeting (link dikirim via email)", IC.video],
  ["OPEN FOR", "Mahasiswa & umum *", IC.users],
];

const PARTNERS = ["Anargya ITS", "AIESEC Surabaya", "AnakTeknikIndonesia", "ITS Automotive Team"];

function Eyebrow({ children }: { children: string }) {
  return <p className="font-robomono text-[13px] font-medium tracking-[0.16em] text-brand">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-3.5 font-inter text-4xl font-black leading-[1.05] tracking-[-0.02em] lg:text-[56px]">{children}</h2>;
}
function RegisterButton({ className = "" }: { className?: string }) {
  // Form registrasi belum dibuat (fase berikutnya) → sementara mengarah ke detail event.
  return (
    <a
      href="#details"
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand px-7 py-4 font-outfit text-lg text-black shadow-[0_8px_32px_rgba(41,217,112,.4)] transition hover:-translate-y-0.5 md:text-xl ${className}`}
    >
      Register Now {icon(IC.arrow, "h-5 w-5")}
    </a>
  );
}

export default function EnergizeTalkPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-[.12]" style={{ backgroundImage: "url(/images/texture.jpg)" }} />
          <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-[.07]" style={{ backgroundImage: "url(/images/hero.jpg)" }} />
          <div aria-hidden className="absolute right-[-10%] top-[15%] h-[45vw] max-h-[620px] w-[45vw] max-w-[620px] rounded-full bg-brand/30 blur-[160px]" />
          <div aria-hidden className="absolute -left-40 top-[60%] h-[420px] w-[420px] rounded-full bg-[#db2e33]/20 blur-[160px]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black" />

          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pb-16 pt-6 md:flex-row-reverse md:items-center md:gap-6 md:px-10 md:pb-20 md:pt-12 lg:px-[120px] lg:pr-10">
            <div className="hidden w-full md:block md:w-[46%] md:max-w-[620px] md:shrink-0">
              <ShardCarousel speakers={SPEAKERS} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-[26px]">
              <h1 className="font-inter font-black leading-[0.95] tracking-[-0.03em]">
                <span className="block text-[46px] md:text-[56px] lg:text-[76px]">ENERGIZE TALK</span>
                <span className="block text-[56px] italic text-brand [text-shadow:0_0_40px_rgba(41,217,112,.45)] md:text-[64px] lg:text-[92px]">
                  Watt&apos;s Up!
                </span>
              </h1>
              <div>
                <p className="font-outfit text-base tracking-[0.06em] text-brand md:text-xl">SUSTAIN THE FUTURE:</p>
                <p className="mt-1 font-outfit text-[26px] font-semibold md:text-[34px]">Youth as Agents of Change</p>
              </div>
              <ul className="flex flex-wrap gap-2.5 md:gap-3">
                {(
                  [
                    [IC.cal, "14 June 2026"],
                    [IC.video, "Via Zoom"],
                    [IC.award, "E-Certificate"],
                  ] as const
                ).map(([ic, label]) => (
                  <li key={label} className="flex items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.06] py-2.5 pl-3.5 pr-4 font-medium">
                    {icon(ic)} {label}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <RegisterButton />
                <a
                  href="#speakers"
                  className="inline-flex items-center justify-center rounded-xl border-[1.5px] border-white/40 px-7 py-4 font-outfit text-lg font-semibold transition hover:border-brand hover:text-brand md:text-xl"
                >
                  Meet the Speakers
                </a>
              </div>
              <Countdown target={REG_CLOSES} closedLabel="Registration closed on 14 June 2026 at 17:00 WIB." />
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="px-4 pb-16 pt-12 md:px-10 lg:px-[120px] lg:pb-[120px] lg:pt-20">
          <Reveal className="mx-auto grid max-w-[1040px] gap-8 md:grid-cols-2 md:gap-20">
            <div>
              <Eyebrow>ABOUT THE EVENT</Eyebrow>
              <H2>
                What is
                <br />
                Energize Talk?
              </H2>
            </div>
            <div className="flex flex-col gap-7 md:pt-11">
              <p className="text-[17px] leading-[1.65] text-[#d1d1d1] md:text-[19px]">
                Welcome to Energize 2026! A collaborative event presented by Anargya ITS EV Team to bring together innovators,
                students, and future leaders who are passionate about technology, sustainability, and electric vehicle
                development. Through this event, participants will gain valuable insights, expand their network, and experience
                the spirit of innovation that drives the future of mobility. Energize is more than just an event — it is a
                platform to inspire new ideas, empower collaboration, and accelerate the growth of Indonesia&apos;s electric
                vehicle ecosystem.
              </p>
              <p className="font-outfit text-[22px] text-brand">Always Energize ⚡</p>
              <ul className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  ["3", "Expert Speakers"],
                  ["3", "Collaborators"],
                  ["1", "Day · Online"],
                ].map(([v, l]) => (
                  <li key={l} className="rounded-[14px] border border-white/[0.08] bg-[#0e120f] px-3 py-4 md:px-5 md:py-[18px]">
                    <p className="font-inter text-3xl font-black text-brand md:text-[40px]">{v}</p>
                    <p className="text-xs font-medium text-white/60 md:text-[15px]">{l}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* ================= SPEAKERS ================= */}
        <section id="speakers" className="scroll-mt-28 px-4 py-16 md:px-10 lg:px-[120px] lg:py-[120px]">
          <div className="mx-auto max-w-[1040px]">
            <Reveal>
              <Eyebrow>THE SPEAKERS</Eyebrow>
              <H2>Meet the Experts</H2>
              <p className="mt-3.5 max-w-[640px] text-[17px] leading-normal text-white/60 md:text-[19px]">
                Praktisi dan akademisi yang akan membagikan wawasan tentang sustainability, energi terbarukan, dan peran anak
                muda.
              </p>
            </Reveal>
            <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-4 lg:gap-8">
              {SPEAKERS.map((s, i) => (
                <Reveal as="li" key={s.name} delay={i * 100} className="flex flex-col gap-5 rounded-[20px] border border-white/[0.08] bg-[#0e120f] p-5 lg:p-6">
                  <div className="grid place-items-center rounded-[14px] bg-[radial-gradient(circle,rgba(41,217,112,.18),transparent_70%)] py-4">
                    <MirrorImage id={`card-${i}`} src={s.src} alt={s.name} shape={s.shape} className="w-[78%]" />
                  </div>
                  <span className="w-fit rounded-md bg-brand/[0.12] px-2.5 py-1 font-robomono text-[11px] font-medium tracking-[0.08em] text-brand">
                    {s.tag.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-outfit text-xl leading-tight md:text-lg lg:text-2xl">{s.name}</h3>
                    <p className="mt-2 text-sm leading-[1.45] text-white/60 lg:text-base">{s.org}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= BENEFITS ================= */}
        <section className="bg-[#050806] px-4 py-16 md:px-10 lg:px-[120px] lg:py-[120px]">
          <div className="mx-auto max-w-[1040px]">
            <Reveal>
              <Eyebrow>WHAT YOU WILL GET</Eyebrow>
              <H2>Benefits</H2>
            </Reveal>
            <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 lg:gap-6">
              {BENEFITS.map(([t, d, ic], i) => (
                <Reveal as="li" key={t} delay={i * 100} className="flex flex-col gap-[18px] rounded-[20px] border border-brand/25 bg-[#0e120f] p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-[14px] border border-brand/40 bg-brand/10">{icon(ic, "h-7 w-7")}</span>
                    <span className="font-geistmono text-white/60">0{i + 1}</span>
                  </div>
                  <h3 className="font-outfit text-[22px] lg:text-[26px]">{t}</h3>
                  <p className="text-[15px] leading-normal text-white/60 lg:text-[17px]">{d}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= SAVE THE DATE ================= */}
        <section id="details" className="scroll-mt-28 px-4 py-16 md:px-10 lg:px-[120px] lg:py-[120px]">
          <div className="mx-auto max-w-[1040px]">
            <Reveal>
              <Eyebrow>EVENT DETAILS</Eyebrow>
              <H2>Save the Date</H2>
            </Reveal>
            <Reveal className="mt-10 rounded-[20px] border border-white/[0.08] bg-[#0e120f] px-6 py-2 md:mt-14 md:max-w-[520px] lg:px-9 lg:py-4">
              <ul>
                {DETAILS.map(([k, v, ic], i) => (
                  <li key={k} className={`flex items-center gap-[18px] py-[22px] ${i < DETAILS.length - 1 ? "border-b border-white/[0.08]" : ""}`}>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10">{icon(ic, "h-[22px] w-[22px]")}</span>
                    <div className="min-w-0">
                      <p className="font-robomono text-xs font-medium tracking-[0.12em] text-white/60">{k}</p>
                      <p className="mt-1 font-outfit text-lg font-semibold md:text-[22px]">{v}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <div className="mt-10 flex flex-col gap-4 md:mt-14 md:flex-row md:flex-wrap md:items-center">
              <p className="font-robomono text-xs font-medium tracking-[0.12em] text-white/60">IN COLLABORATION WITH</p>
              <ul className="flex flex-wrap gap-3 md:gap-4">
                {PARTNERS.map((p) => (
                  <li key={p} className="rounded-full border border-white/20 px-[18px] py-2.5 font-outfit text-base font-semibold">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="relative overflow-hidden px-5 py-24 text-center md:px-10 md:py-28">
          <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-[.14]" style={{ backgroundImage: "url(/images/texture.jpg)" }} />
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[400px] w-[700px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-[200px]" />
          <Reveal className="relative mx-auto flex max-w-[900px] flex-col items-center gap-6">
            <p className="font-robomono text-[11px] font-medium tracking-[0.16em] text-brand md:text-sm">ARE YOU READY TO BE PART OF THE FUTURE?</p>
            <h2 className="font-inter text-[40px] font-black leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-[72px]">Secure Your Seat Now</h2>
            <p className="text-base text-white/60 md:text-xl">Join the conversation that drives change. ⚡🌍</p>
            <RegisterButton className="px-10 py-[22px]" />
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
