# Anargya EV ITS Team — Company Profile & Merch Store

Website company profile **Anargya — ITS Formula EV Team** yang diperluas menjadi platform e-commerce merchandise lengkap dengan **admin panel** (tanpa payment gateway).

Special Task Web Design & Development — Anargya 9th Gen (target: **LOW + MED**).

| | |
|---|---|
| **Framework** | Next.js 15.5 (App Router, versi patch keamanan terbaru) + React 19.2 + TypeScript |
| **Styling** | Tailwind CSS v4, font self-hosted via `@fontsource` |
| **Backend** | Supabase — PostgreSQL, Auth (login admin), Storage (gambar produk), RPC function (checkout) |
| **Desain UI** | Figma (link ada di dokumen pengumpulan) |

---

## Daftar Isi
1. [Fitur](#1-fitur)
2. [Prasyarat](#2-prasyarat)
3. [Cara Menjalankan (Quick Start)](#3-cara-menjalankan-quick-start)
4. [Konfigurasi Environment](#4-konfigurasi-environment)
5. [Setup Database Supabase Sendiri (opsional)](#5-setup-database-supabase-sendiri-opsional)
6. [Akun Admin](#6-akun-admin)
7. [Struktur Project](#7-struktur-project)
8. [Skema Database](#8-skema-database)
9. [Alur Aplikasi](#9-alur-aplikasi)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Fitur

### Company Profile (LOW)
| Halaman | Isi |
|---|---|
| `/` Home | **Hero carousel** (slide 1: Energize Talk + tombol *Learn More*, slide 2: logo Anargya; bisa digeser horizontal/swipe, autoplay tiap 4 detik tetap jalan saat hover, pilih lewat dot), **About Us** (EV Research Team), **Details** (Mark 6.0 + spesifikasi), **Achievements** (Our Past Circuits), CTA (Merch & Sponsor via email), Footer/Contact |
| Navbar | Sticky, link anchor ke tiap section + dropdown **Programs** (Merch, Energize Talk) + ikon keranjang (badge jumlah item). Di mobile berubah menjadi **hamburger menu** dengan animasi |
| Interaksi | Animasi *reveal on scroll*, hover zoom gambar, smooth scroll, menghormati `prefers-reduced-motion` |
| Responsif | 3 breakpoint sesuai Figma: Desktop (≥1024px), Tablet (≥768px), Mobile (<768px) |

### E-commerce (MED)
| Halaman | Isi |
|---|---|
| `/merch` | Katalog produk (data **dari database**), label stok habis, tombol **BUY NOW** |
| `/purchase` | Semua produk + stepper qty. Kaos punya stepper **per ukuran (S/M/L/XL)**. Total dihitung otomatis. Form **Data Pembeli** (Nama, No. WhatsApp, Email, Metode Ambil/Dikirim, Alamat, Catatan) dengan validasi. Isi keranjang tersimpan di `localStorage` |
| `/purchase/success` | Konfirmasi pesanan: Order ID, rincian item, total |
| Checkout | Lewat fungsi database `place_order` (atomik): validasi data, **cek & kurangi stok otomatis**, total dihitung dari harga di database (tidak bisa dimanipulasi dari browser) |

### Admin Panel (MED)
| Halaman | Isi |
|---|---|
| `/admin/login` | Login admin (Supabase Auth) |
| `/admin` | Statistik (Revenue dari order *Selesai*, jumlah Order, jumlah Customer) · **Stock**: tambah / edit / hapus produk + upload gambar · **Order list**: filter status & pencarian, klik untuk detail · **Customer list** |
| `/admin/orders/[id]` | Detail order: data pembeli, tombol WhatsApp, rincian item, **ubah status** (Pending → Diproses → Selesai / Dibatalkan) |
| Keamanan | Row Level Security: publik hanya bisa *membaca produk* dan *membuat order lewat RPC*. Data order hanya bisa dibaca/diubah oleh user yang terdaftar di tabel `admin_users` |

### Event: Energize Talk 2026 (proof of concept)
| Bagian | Isi |
|---|---|
| `/energize-talk` | Halaman event: hero, About, **Meet the Experts**, Benefits, Save the Date, CTA. Form registrasi menyusul di fase berikutnya (tombol *Register Now* sementara mengarah ke detail event) |
| Carousel keping cermin | Foto 3 pembicara berbentuk keping cermin (SVG `clipPath`). Posisi bertukar tiap 4 detik: cermin di belakang maju ke depan, cermin depan mundur. Pause saat hover, tombol ‹ ›, swipe. Disembunyikan di mobile agar info registrasi langsung terlihat |
| Countdown | Hitung mundur ke batas pendaftaran (konstanta `REG_CLOSES` di `src/app/energize-talk/page.tsx`). Setelah lewat, tampil "Registration Closed" |
| Akses | Slide pertama hero Home, dropdown **Programs** di navbar, link di footer semua halaman, dan pop-up pengumuman di Home khusus mobile (tidak muncul lagi setelah ditutup, disimpan di `localStorage`) |
| Foto pembicara | Simpan sebagai `public/images/energize/kemas.webp`, `arkastra.webp`, `hosta.webp` (data di `src/lib/energize.ts`). Selama file belum ada, keping tampil sebagai kaca hijau |

---

## 2. Prasyarat

- **Node.js 18.18 atau lebih baru** (disarankan Node 20/22/24). Cek: `node -v`
- **npm** (sudah termasuk dalam Node.js). Cek: `npm -v`
- Koneksi internet (untuk `npm install` dan koneksi ke Supabase)
- Git

> Tidak perlu install database lokal. Database sudah berjalan di Supabase cloud.

---

## 3. Cara Menjalankan (Quick Start)

```bash
# 1. Clone repository
git clone https://github.com/Notdils/Anargya-Special-Task.git
cd Anargya-Special-Task

# 2. Install dependencies
npm install

# 3. File environment SUDAH disertakan (.env) — tidak perlu diubah.
#    Langsung terhubung ke database Supabase yang sudah berisi data & akun admin.

# 4. Jalankan development server
npm run dev
```

Buka **http://localhost:3000**. Admin panel ada di **http://localhost:3000/admin/login**.

Untuk mode production:

```bash
npm run build
npm start
```

### Perintah yang tersedia
| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server (hot reload) di port 3000 |
| `npm run build` | Build production |
| `npm start` | Menjalankan hasil build production |
| `npm run typecheck` | Cek tipe TypeScript |

---

## 4. Konfigurasi Environment

File **`.env`** di root project (sejajar dengan `package.json`) **sudah disertakan di repository** dan berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kinjdxpffvkpgdftebrl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xOQZx5HguX7w790CmpyRbw_5oYINc-o
```

| Variabel | Keterangan | Lokasi di Supabase |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Project Settings → API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key. Aman dipakai di browser karena semua akses dijaga oleh RLS | Project Settings → API Keys → *Publishable key* |

> **Kenapa key ini aman di-commit?** *Publishable key* memang didesain untuk dipakai di browser (publik). Semua akses data dijaga oleh **Row Level Security** di database: publik hanya bisa membaca produk dan membuat order lewat fungsi `place_order`, sedangkan data order hanya bisa diakses admin yang sudah login. *Secret / service role key* **tidak** dipakai dan **tidak** disertakan.
>
> Ingin memakai project Supabase lain? Buat file `.env.local` (prioritasnya lebih tinggi dari `.env`) dengan format seperti `.env.example`, lalu **restart** `npm run dev`.

### Cek koneksi database
Setelah `npm run dev`, buka `/merch`. Jika 5 produk (White Shirt, Black Shirt, Sticker Pack, Tumbler, Keychain) tampil, berarti koneksi ke database berhasil.

---

## 5. Setup Database Supabase Sendiri (opsional)

Bagian ini **hanya diperlukan jika ingin memakai project Supabase baru** (bukan database bawaan).

1. Buat project baru di [supabase.com](https://supabase.com).
2. **Buat akun admin**: *Authentication → Users → Add user → Create new user*
   - Email `admin@anargya.com`, Password `Anargya2026!`, centang **Auto Confirm User**.
3. **Jalankan skema**: *SQL Editor → New query*, tempel **seluruh isi** [`supabase/schema.sql`](supabase/schema.sql), lalu klik **Run**. File ini membuat:
   - tabel `products`, `orders`, `order_items`, `admin_users`
   - Row Level Security + policies
   - fungsi checkout `place_order()`
   - bucket storage `products` (public) + policies
   - 5 produk awal (seed)
   - mendaftarkan `admin@anargya.com` sebagai admin
4. (Disarankan) *Authentication → Sign In / Providers →* matikan **Allow new users to sign up**.
5. Buat `.env.local` berisi URL dan publishable key project baru, lalu restart `npm run dev`.

> `schema.sql` aman dijalankan ulang (idempotent). Jika user admin dibuat **setelah** menjalankan schema, jalankan ulang file tersebut atau perintah di bagian paling bawahnya.

---

## 6. Akun Admin

| Email | Password |
|---|---|
| `admin@anargya.com` | `Anargya2026!` |

Login di `/admin/login`. Untuk menambah admin lain: buat user baru di Supabase Auth, lalu jalankan di SQL Editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email-admin-baru@contoh.com';
```

---

## 7. Struktur Project

```
├── public/images/            # Gambar (logo, hero, foto produk, dll.) hasil export dari Figma
├── supabase/schema.sql       # Skema database + RLS + fungsi checkout + seed
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home (company profile)
│   │   ├── merch/page.tsx            # Katalog
│   │   ├── purchase/page.tsx         # Keranjang + form pembeli + checkout
│   │   ├── purchase/success/page.tsx # Konfirmasi order
│   │   ├── admin/login/page.tsx      # Login admin
│   │   ├── admin/page.tsx            # Dashboard admin
│   │   ├── admin/orders/[id]/page.tsx# Detail order
│   │   ├── energize-talk/page.tsx    # Halaman event Energize Talk
│   │   ├── layout.tsx, fonts.ts, globals.css
│   ├── components/   # Navbar, Footer, AdminShell, ProductModal, Reveal, Icons, HeroCarousel, ShardCarousel, MirrorImage, Countdown, EnergizePopup, dll.
│   └── lib/          # supabase client, cart (localStorage), format Rupiah/tanggal, hooks, types, energize (data pembicara)
├── .env.example
└── package.json
```

---

## 8. Skema Database

```
products ──< order_items >── orders
admin_users ── auth.users
```

| Tabel | Kolom penting |
|---|---|
| `products` | `id`, `name`, `price` (Rupiah), `stock`, `image_url`, `has_sizes`, `unit`, `sort_order` |
| `orders` | `id`, `customer_name`, `phone`, `email`, `method` (`pickup`/`delivery`), `address`, `note`, `total`, `status` (`pending`/`processing`/`completed`/`cancelled`), `created_at` |
| `order_items` | `order_id`, `product_id`, `product_name`, `size` (S/M/L/XL/null), `qty`, `unit_price` |
| `admin_users` | `user_id` (FK ke `auth.users`) |

**Aturan bisnis**
- Stok dihitung per produk (semua ukuran digabung) dan **berkurang otomatis** saat order dibuat. Jika stok tidak cukup, checkout ditolak.
- Harga di `order_items` disimpan sebagai snapshot, sehingga perubahan harga produk tidak mengubah order lama.
- **Revenue** di dashboard = total order berstatus *Selesai*.
- **Customer** = pembeli unik berdasarkan kombinasi **nama + No. WhatsApp** (checkout tanpa akun / guest).

---

## 9. Alur Aplikasi

**Pembeli:** Home → *Check Out Our Merchandise* / menu Merch → `/merch` → **BUY NOW** → `/purchase` → atur qty (dan ukuran kaos) → isi Data Pembeli → **BUY** → `/purchase/success`

**Admin:** `/admin/login` → `/admin` → kelola stok / tambah produk → klik order → `/admin/orders/[id]` → ubah status → **Simpan**

---

## 10. Troubleshooting

| Masalah | Solusi |
|---|---|
| Halaman `/merch` menampilkan *"Tidak bisa terhubung ke server"* | Pastikan file `.env` ada di root project (ikut ter-clone) dan isinya tidak berubah. Jika memakai `.env.local`, pastikan nama filenya tepat (bukan `.env.local.txt`). Setelah itu **restart** `npm run dev`. Cek juga apakah project Supabase sedang *paused* |
| `Invalid API key` / `JWT` error | Publishable key salah salin. Salin ulang tanpa spasi atau tanda kutip |
| Produk kosong padahal koneksi berhasil | Seed belum dijalankan. Jalankan `supabase/schema.sql` di SQL Editor |
| Login admin: *"Akun ini tidak memiliki akses admin"* | User belum terdaftar di `admin_users`. Jalankan query di bagian 6 |
| Login admin: *"Email atau password salah"* | Pastikan user dibuat dengan *Auto Confirm User* |
| Project Supabase *paused* | Project free tier dijeda setelah 7 hari tidak aktif. Buka dashboard Supabase lalu klik **Restore project** |
| `'next' is not recognized as an internal or external command` | `npm install` belum selesai atau gagal, sehingga folder `node_modules` tidak lengkap. Jalankan ulang `npm install` dan pastikan selesai tanpa `npm error` |
| `ENOSPC: no space left on device` saat `npm install` | Ruang disk penuh. Kosongkan ruang (minimal ±1 GB), misalnya dengan `npm cache clean --force`, hapus folder `node_modules` yang setengah jadi, lalu ulangi `npm install` |
| Port 3000 sudah dipakai | `npm run dev -- -p 3001` |
| Error saat `npm install` | Pastikan Node ≥ 18.18, hapus folder `node_modules` dan `package-lock.json`, lalu ulangi `npm install` |
