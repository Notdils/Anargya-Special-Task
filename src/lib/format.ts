import type { OrderStatus } from "./types";

export const rupiah = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export const orderCode = (id: number) => "#ANR-" + String(id).padStart(4, "0");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "text-warn border-warn bg-warn/15" },
  processing: { label: "Diproses", cls: "text-sky-300 border-sky-300 bg-sky-300/15" },
  completed: { label: "Selesai", cls: "text-brand border-brand bg-brand/15" },
  cancelled: { label: "Dibatalkan", cls: "text-danger border-danger bg-danger/15" },
};

export const METHOD = { pickup: "Ambil di Workshop", delivery: "Dikirim" } as const;

/** Ubah pesan error Supabase/Postgres jadi kalimat yang ramah. */
export function friendlyError(e: unknown): string {
  const msg =
    typeof e === "object" && e && "message" in e ? String((e as { message: string }).message) : String(e);
  if (/Failed to fetch|NetworkError/i.test(msg))
    return "Tidak bisa terhubung ke server. Cek koneksi internet / konfigurasi .env.local.";
  if (/Invalid login credentials/i.test(msg)) return "Email atau password salah.";
  return msg;
}
