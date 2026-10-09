"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/** Guard halaman admin: harus login DAN terdaftar di tabel admin_users. */
export function useAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabase();
      const { data } = await sb.auth.getUser();
      if (!data.user) return router.replace("/admin/login");
      const { data: row } = await sb.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (!row) {
        await sb.auth.signOut();
        return router.replace("/admin/login?denied=1");
      }
      if (alive) {
        setUser(data.user);
        setReady(true);
      }
    })();
    const { data: sub } = supabase().auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_OUT") router.replace("/admin/login");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    await supabase().auth.signOut();
    router.replace("/admin/login");
  };

  return { user, ready, logout };
}
