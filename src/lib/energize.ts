// Data pembicara Energize Talk — dipakai di halaman /energize-talk dan slide hero Home.
// Foto: public/images/energize/*.webp (placeholder, boleh diganti).
export type Speaker = { name: string; org: string; tag: string; src: string; shape: 0 | 1 | 2 };

export const SPEAKERS: Speaker[] = [
  { name: "Kemas Muhammad Athariq", org: "AIESEC Surabaya", tag: "Youth Leadership", src: "/images/energize/kemas.webp", shape: 0 },
  { name: "Arkastra Bhrevijana", org: "AnakTeknikIndonesia", tag: "Engineering Community", src: "/images/energize/arkastra.webp", shape: 1 },
  {
    name: "Prof. Dr. Eng. Hosta Ardhyananta, S.T., M.Sc",
    org: "Lecturer of Materials and Metallurgical Engineering Department, ITS",
    tag: "Academic Expert",
    src: "/images/energize/hosta.webp",
    shape: 2,
  },
];
