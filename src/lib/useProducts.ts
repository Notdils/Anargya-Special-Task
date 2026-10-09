"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { friendlyError } from "./format";
import type { Product } from "./types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase()
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setError(friendlyError(error));
    else {
      setError(null);
      setProducts((data ?? []) as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, loading, error, reload };
}
