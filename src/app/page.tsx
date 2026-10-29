import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import EnergizePopup from "@/components/EnergizePopup";
import HeroCarousel from "@/components/HeroCarousel";
import MirrorImage from "@/components/MirrorImage";
import { SPEAKERS } from "@/lib/energize";

const SPECS = [
  { title: "Track", body: "Measured at 10 Km/ Kilowatt, demonstrating efficient fuel to distance ratio" },
  { title: "Speed", body: "Top speed recorded at 100 Km / Hour" },
  { title: "Safety", body: "99.7% survivability after rigorous safety tests conducted on several different environments" },
  { title: "Frame and Materials", body: "Efficient and aerodynamic body composed from titanium metal" },
];

const CIRCUITS = [
  { name: "FSAE JAPAN 2025", img: "/images/circuit-fsae.jpg" },
  { name: "JAKARTA FORMULA E-PRIX 2022", img: "/images/circuit-formula-e.jpg" },
  { name: "PI-EV", img: "/images/circuit-piev.jpg" },
];

/** latar tekstur grunge yang dipakai beberapa section */
function Texture({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url(/images/texture.jpg)", opacity }}
    />
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ---------------- HERO (carousel: 1 Energize Talk, 2 Anargya) ---------------- */}
        <HeroCarousel
          labels={["Energize Talk 2026", "Anargya ITS Formula EV Team"]}
          slides={[
            <div key="energize" className="relative flex h-full items-center">
              <Texture />
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center opacity-[.08]"
                style={{ backgroundImage: "url(/images/hero.jpg)" }}
              />
              <div className="relative mx-auto flex w-full max-w-[1280px] items-center gap-6 px-4 md:px-10 lg:pl-[120px] lg:pr-20">
                <div className="flex min-w-0 flex-1 flex-col gap-[18px] md:gap-6">
                  <p className="font-robomono text-xs font-medium tracking-[0.12em] text-brand md:text-[13px] lg:text-base">
                    NEW EVENT · REGISTRATION OPEN
                  </p>
                  <h2 className="font-inter font-extrabold leading-none tracking-[-0.03em]">
                    <span className="block text-[40px] md:text-[44px] lg:text-[72px]">ENERGIZE TALK 2026</span>
                    <span className="block font-black italic text-brand text-[48px] md:text-[52px] lg:text-[84px]">Watt&apos;s Up!</span>
                  </h2>
                  <p className="font-radio text-[19px] leading-tight tracking-[-0.02em] md:text-xl lg:text-[28px]">
                    Sustain the Future: Youth as Agents of Change
                  </p>
                  <p className="font-robomono text-sm font-medium md:text-[15px] lg:text-lg">
                    14 June 2026 <span className="text-brand">/</span> Zoom <span className="text-brand">/</span> E-Certificate
                  </p>
                  <Link
                    href="/energize-talk"
                    className="w-full rounded-[10px] border-2 border-brand bg-brand px-5 py-2.5 text-center font-robomono text-xl font-bold tracking-[-0.03em] text-black transition hover:-translate-y-0.5 md:w-fit lg:text-[26px]"
                  >
                    LEARN MORE
                  </Link>
                </div>
                <div aria-hidden className="shard-stage relative hidden w-[320px] shrink-0 md:block lg:w-[600px]">
                  {SPEAKERS.map((s, i) => (
                    <div key={s.name} className={`shard-slot shard-slot--${["front", "tr", "bl"][i]}`}>
                      <MirrorImage id={`home-${i}`} src={s.src} alt="" shape={s.shape} className="h-auto w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            <div key="anargya" className="relative flex h-full items-center justify-center">
              <Texture />
              <div
                aria-hidden
                className="absolute inset-0 animate-[heroZoom_18s_ease-out_forwards] bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url(/images/hero.jpg)" }}
              />
              <div className="relative flex flex-col items-center gap-8 px-4 text-center md:gap-10">
                <Logo className="w-[260px] md:w-[420px] lg:w-[529px]" />
                <Link
                  href="#about"
                  className="rounded-xl bg-brand px-5 py-2 font-robomono text-2xl font-bold tracking-[-0.03em] text-black shadow-[0_0_0_0_rgba(41,217,112,.6)] transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_4px_rgba(41,217,112,.45)] md:text-[40px] md:py-3"
                >
                  ABOUT US
                </Link>
              </div>
            </div>,
          ]}
        />

        {/* ---------------- ABOUT ---------------- */}
        <section id="about" className="relative scroll-mt-24 px-4 py-20 md:px-10 md:py-28 lg:py-32">
          <Texture />
          <Reveal className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
            <p className="font-anon text-2xl tracking-[-0.03em] md:text-[33px]">ABOUT US</p>
            <h1 className="mt-2 font-robomono text-[28px] leading-tight tracking-[-0.03em] text-brand md:text-6xl lg:text-[79px]">
              EV RESEARCH TEAM
            </h1>
            <div className="mt-12 rounded-2xl bg-white/[0.07] px-5 py-10 md:mt-20 md:px-14 md:py-16 lg:max-w-[920px]">
              <p className="font-sourceserif text-lg leading-snug text-brand md:font-robomono md:text-xl md:font-bold lg:text-[25px] lg:leading-[1.25]">
                Operating under ITS PUI-SKO, Anargya EV ITS Team is a student research team dedicated to developing
                high-performance electric formula cars and autonomous vehicle systems. We push the boundaries of green
                engineering, turning ambitious concepts into track-proven reality.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---------------- DETAILS / MARK 6.0 ---------------- */}
        <section id="details" className="relative scroll-mt-24 pb-20 pt-16 md:pb-28 lg:pt-28">
          <Texture />
          <div className="relative">
            <Reveal className="px-4 text-center">
              <h2 className="font-plexmono text-[32px] font-medium tracking-[-0.03em] md:text-5xl lg:text-[60px]">
                BUILD TO <span className="text-brand underline decoration-[3px] underline-offset-8">LAST</span>
              </h2>
              <p className="mt-3 font-plexmono text-sm font-medium tracking-[-0.03em] md:text-xl">
                Driven by Precision. Measured by Excellence.
              </p>
            </Reveal>
            <div className="mx-5 mt-10 h-[3px] bg-brand md:mt-14" />

            <div className="mx-auto max-w-[1280px] px-4 md:px-5">
              <Reveal className="mt-10 text-center md:text-left">
                <h3 className="font-crimson text-4xl font-semibold tracking-[0.1em] lg:text-[51px]">MARK 6.0</h3>
                <p className="mt-1 font-crimson text-xl font-semibold tracking-[0.19em] md:text-[31px]">
                  Our <span className="text-brand">Newest</span> Release
                </p>
              </Reveal>

              <div className="mt-8 grid items-center gap-10 md:mt-10 lg:grid-cols-[693fr_507fr] lg:gap-10">
                <Reveal className="group relative aspect-[693/502] overflow-hidden rounded-[30px] border-[6px] border-brand">
                  <img
                    src="/images/mark6.jpg"
                    alt="Tim Anargya merakit Mark 6.0"
                    className="h-full w-full object-cover opacity-[.67] transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                  />
                </Reveal>
                <ul className="md:grid md:grid-cols-2 md:gap-x-8 lg:block">
                  {SPECS.map((s, i) => (
                    <Reveal as="li" key={s.title} delay={i * 90} className="border-b-2 border-brand py-4 first:border-t-2 md:first:border-t-0 lg:first:border-t-2 lg:py-5">
                      <p className="font-radio text-lg font-medium tracking-[-0.02em] lg:text-xl">{s.title}</p>
                      <p className="mt-3 font-sourceserif text-base tracking-[-0.04em] text-white/90 lg:text-xl">{s.body}</p>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- ACHIEVEMENTS ---------------- */}
        <section id="achievements" className="scroll-mt-24 px-4 py-16 md:px-5 md:py-24 lg:py-28">
          <Reveal className="text-center">
            <h2 className="font-inter text-[34px] font-extrabold tracking-[-0.04em] text-brand md:text-6xl lg:text-[80px]">
              Our Past Circuits
            </h2>
            <p className="font-radio text-lg tracking-[-0.05em] md:text-3xl lg:text-[46px] lg:leading-tight">
              Victory is another step towards improvement
            </p>
          </Reveal>
          <ul className="mx-auto mt-10 grid max-w-[1240px] gap-5 md:grid-cols-3 lg:mt-12">
            {CIRCUITS.map((c, i) => (
              <Reveal as="li" key={c.name} delay={i * 120}>
                <figure className="group relative aspect-[403/246] overflow-hidden rounded-xl border-[3px] border-brand md:aspect-[403/400] lg:aspect-[403/246]">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <figcaption className="absolute bottom-3 left-3 right-3 font-radio text-lg font-medium leading-tight tracking-[-0.02em] text-black lg:text-[25px]">
                    <span className="box-decoration-clone bg-white/75 px-1">{c.name}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="flex min-h-[380px] flex-col items-center justify-center px-4 py-16 md:min-h-[443px] lg:min-h-[923px]">
          <Reveal className="w-full max-w-[1240px] text-center">
            <h2 className="font-inter text-5xl font-extrabold tracking-[0.1em] text-[#fffefe] md:text-7xl lg:text-[96px]">
              Interested?
            </h2>
            <div className="mt-6 grid gap-2 rounded-xl border border-brand p-1.5 sm:grid-cols-2 md:mt-8">
              <Link
                href="/merch"
                className="rounded-md bg-brand px-4 py-3 font-geistmono text-base font-medium text-black transition hover:bg-white md:text-xl lg:text-[25px]"
              >
                Check Out Our Merchandise!
              </Link>
              <a
                href="mailto:anargya.its@gmail.com?subject=Sponsorship%20Anargya%20EV%20ITS%20Team"
                className="rounded-md bg-brand px-4 py-3 font-geistmono text-base font-medium text-black transition hover:bg-white md:text-xl lg:text-[25px]"
              >
                Become Our Sponsor!
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
      <EnergizePopup />
    </>
  );
}
