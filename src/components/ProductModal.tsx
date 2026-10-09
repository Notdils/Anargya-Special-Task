"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product | null; nextSort: number; onClose: () => void; onSaved: () => void };

export default function ProductModal({ product, nextSort, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [unit, setUnit] = useState(product?.unit ?? "pcs");
  const [hasSizes, setHasSizes] = useState(product?.has_sizes ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return setError("Format gambar harus JPG, PNG, atau WEBP.");
    if (f.size > 2 * 1024 * 1024) return setError("Ukuran gambar maksimal 2 MB.");
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = Number(price),
      s = Number(stock);
    if (name.trim().length < 2) return setError("Nama produk minimal 2 karakter.");
    if (!Number.isInteger(p) || p < 0) return setError("Harga harus bilangan bulat ≥ 0.");
    if (!Number.isInteger(s) || s < 0) return setError("Stok harus bilangan bulat ≥ 0.");
    setBusy(true);
    setError(null);
    try {
      const sb = supabase();
      let image_url = product?.image_url ?? null;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from("products").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        image_url = sb.storage.from("products").getPublicUrl(path).data.publicUrl;
      }
      const row = { name: name.trim(), price: p, stock: s, unit, has_sizes: hasSizes, image_url };
      const res = isEdit
        ? await sb.from("products").update(row).eq("id", product!.id)
        : await sb.from("products").insert({ ...row, sort_order: nextSort });
      if (res.error) throw res.error;
      onSaved();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    const { error } = await supabase().from("products").delete().eq("id", product!.id);
    setBusy(false);
    if (error) return setError(friendlyError(error));
    onSaved();
  }

  const input =
    "w-full rounded-lg border border-brand bg-black px-3.5 py-3 text-[15px] text-white placeholder:text-muted outline-none focus:ring-2 focus:ring-brand/50";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_.2s_ease-out]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Produk" : "Tambah Produk"}
    >
      <form
        onSubmit={save}
        className="max-h-full w-full max-w-[520px] animate-[fadeUp_.25s_ease-out] space-y-4 overflow-y-auto rounded-2xl border border-brand bg-panel p-6 md:p-7"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-outfit text-2xl md:text-[26px]">{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-2xl text-muted hover:text-white">
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
          className="flex w-full items-center gap-4 rounded-xl border border-dashed border-brand bg-black p-3.5 text-left transition hover:bg-brand/5"
        >
          <span className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-lg border border-brand bg-[#1f1f1f]">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl text-brand">+</span>}
          </span>
          <span>
            <span className="block text-[15px]">{file?.name ?? (preview ? "Ganti gambar produk" : "Pilih gambar produk")}</span>
            <span className="block text-[13px] text-muted">JPG/PNG/WEBP, maks. 2 MB — klik atau drag &amp; drop</span>
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />

        <label className="block space-y-2 text-[15px]">
          <span>Nama Produk</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Hoodie Anargya" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-2 text-[15px]">
            <span>Harga (Rp)</span>
            <input className={input} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </label>
          <label className="block space-y-2 text-[15px]">
            <span>Stok</span>
            <input className={input} type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
          </label>
        </div>
        <label className="block space-y-2 text-[15px]">
          <span>Satuan</span>
          <select className={input} value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="pcs">pcs</option>
            <option value="pack">pack</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="h-5 w-5 accent-brand" />
          Produk punya ukuran (S / M / L / XL)
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        {confirmDelete ? (
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg border border-danger/60 bg-danger/10 p-3">
            <span className="mr-auto text-sm text-danger">Hapus produk ini permanen?</span>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-brand px-4 py-2 font-outfit text-brand">
              Batal
            </button>
            <button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-danger px-4 py-2 font-outfit text-black disabled:opacity-60">
              Ya, hapus
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-1">
            {isEdit && (
              <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg border border-danger px-4 py-2 font-outfit text-danger hover:bg-danger/10">
                Hapus
              </button>
            )}
            <span className="flex-1" />
            <button type="button" onClick={onClose} className="rounded-lg border border-brand px-4 py-2 font-outfit text-brand hover:bg-brand/10">
              Batal
            </button>
            <button disabled={busy} className="rounded-lg bg-brand px-5 py-2 font-outfit text-black hover:brightness-110 disabled:opacity-60">
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
