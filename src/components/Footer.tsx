import Logo from "./Logo";
import { Facebook, Instagram, Tiktok } from "./Icons";

export default function Footer() {
  return (
    <footer id="contact" className="scroll-mt-28 bg-black px-4 pb-6 pt-12 md:px-5 md:pt-16">
      <div className="mx-auto grid max-w-[1240px] gap-6 md:grid-cols-[1fr_1.1fr] md:gap-10">
        <div className="space-y-4 text-center md:text-left">
          <p className="font-gowun text-lg tracking-[-0.03em] text-[#fcfaf6] md:text-[22px] lg:text-[30px]">
            Copyright 2026 © Anargya ITS EV Team
          </p>
          <div className="flex justify-center gap-6 md:justify-start">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="transition hover:text-brand">
              <Facebook className="h-9 w-9 lg:h-12 lg:w-12" />
            </a>
            <a href="https://www.instagram.com/anargya_its/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:text-brand">
              <Instagram className="h-9 w-9 lg:h-12 lg:w-12" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="transition hover:text-brand">
              <Tiktok className="h-9 w-9 lg:h-12 lg:w-12" />
            </a>
          </div>
        </div>
        <address className="font-gowun text-base not-italic tracking-[-0.03em] text-[#fcfaf6] md:text-[20px] lg:text-[26px]">
          Jl. Teknik Sipil No. 2, Keputih, Kec. Sukolilo, Kota Surabaya, Jawa Timur 60111
          <br />
          <a href="mailto:anargya.its@gmail.com" className="text-brand hover:underline">
            anargya.its@gmail.com
          </a>
        </address>
      </div>
      <Logo className="mx-auto mt-10 w-[62%] max-w-[1240px] md:mt-14 md:w-full" />
    </footer>
  );
}
