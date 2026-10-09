import type { Metadata, Viewport } from "next";
import "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anargya EV ITS Team",
  description:
    "Company profile & official merchandise store Anargya — ITS Formula EV Team.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-black text-white antialiased">{children}</body>
    </html>
  );
}
