"use client";

import { useEffect, useState } from "react";

/**
 * Keranjang disimpan di localStorage agar qty tidak hilang ketika user
 * pindah halaman. Key: `${productId}` atau `${productId}:${size}`.
 */
export type Cart = Record<string, number>;
const KEY = "anargya-cart";
const EVT = "anargya-cart-change";

export function readCart(): Cart {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Cart;
  } catch {
    return {};
  }
}

export function writeCart(cart: Cart) {
  try {
    const clean = Object.fromEntries(Object.entries(cart).filter(([, q]) => q > 0));
    localStorage.setItem(KEY, JSON.stringify(clean));
  } catch {
    /* storage tidak tersedia */
  }
  window.dispatchEvent(new Event(EVT));
}

export function useCartCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(Object.values(readCart()).reduce((a, b) => a + b, 0));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return n;
}
