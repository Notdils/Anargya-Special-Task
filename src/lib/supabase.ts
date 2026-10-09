import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Pesan jelas bila file .env.local belum dibuat (lihat README)
  console.error(
    "[Anargya] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum di-set. Salin .env.example menjadi .env.local."
  );
}

let client: SupabaseClient | null = null;

/** Supabase client untuk komponen browser (singleton). */
export function supabase(): SupabaseClient {
  if (!client) client = createBrowserClient(url ?? "", key ?? "");
  return client;
}
