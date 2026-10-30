# Energize Talk 2027 — Sistem Pendaftaran Peserta

Website pendaftaran **Energize Talk 2027: *Watt's Up!* — Sustain the Future: Youth as Agents of Change**, webinar dari **Anargya EV ITS Team** yang diadakan pada **14 Juni 2027 via Zoom**.

Isinya halaman event, form pendaftaran peserta yang datanya disimpan langsung ke database, dan panel admin untuk melihat daftar pendaftar.

| | |
|---|---|
| **Framework** | Next.js 15.5 (App Router) + React 19.2 + TypeScript |
| **Styling** | Tailwind CSS v4, font self-hosted via `@fontsource` |
| **Backend** | Supabase: PostgreSQL, Auth (login admin), Row Level Security, fungsi RPC `register_energize` |
| **Desain UI** | Figma (Desktop 1280px · Tablet 800px · Mobile 375px) |

---

## Daftar Isi
1. [Fitur](#1-fitur)
2. [Arsitektur & Alur Data](#2-arsitektur--alur-data)
3. [Keamanan & Konsistensi Data](#3-keamanan--konsistensi-data)
4. [Prasyarat](#4-prasyarat)
5. [Cara Menjalankan (Quick Start)](#5-cara-menjalankan-quick-start)
6. [Konfigurasi Environment](#6-konfigurasi-environment)
7. [Setup Database](#7-setup-database)
8. [Akun Admin](#8-akun-admin)
9. [Mengubah Data Event](#9-mengubah-data-event)
10. [Struktur Project](#10-struktur-project)
11. [Skema Database](#11-skema-database)
12. [Troubleshooting](#12-troubleshooting)
13. [Fitur Lain di Repository Ini](#13-fitur-lain-di-repository-ini)

---

## 1. Fitur

### Halaman event `/energize-talk`
| Bagian | Isi |
|---|---|
| Hero | Judul event, tanggal & platform, tombol **Register Now** yang langsung scroll ke form (`#register`), **countdown** ke batas pendaftaran |
| Meet the Experts | 3 pembicara. Di tablet/desktop tampil sebagai **carousel keping cermin** (SVG `clipPath`): posisi bertukar tiap 4 detik, berhenti saat hover, bisa digeser dengan tombol ‹ › atau swipe. Di mobile disembunyikan agar info pendaftaran langsung terlihat |
| About, Benefits, Save the Date | Info acara, manfaat untuk peserta, detail waktu & platform |
| **Form Registrasi** | Bagian `#register` di halaman yang sama (lihat di bawah) |

### Form registrasi
| | |
|---|---|
| Field | **Full Name**, **Email**, **WhatsApp Number**, **Institution** (isi "Umum" bila bukan dari instansi mana pun) |
| Validasi | Di browser (pesan langsung di bawah field yang salah, halaman scroll ke field pertama yang error) **dan** diulang di database oleh fungsi `register_energize` |
| Anti-duplikat | Satu email hanya bisa mendaftar sekali (huruf besar/kecil dianggap sama). Jika sudah terdaftar, muncul pesan *"This email is already registered."* |
| Deadline | Pendaftaran ditutup **14 Juni 2027, 17:00 WIB**. Setelah lewat, form terkunci dan tombol berubah menjadi *Registration Closed*. Database juga menolak pendaftaran setelah deadline, walaupun request dikirim tanpa lewat website |
| Tanpa kuota | Jumlah peserta tidak dibatasi |
| Setelah berhasil | Tampil *"You're registered, {nama}!"*, tombol **Join the LINE Group** (link Zoom dibagikan di grup LINE), dan **Registration ID** dengan format `ET-0001` |
| Saat proses | Semua field & tombol dikunci (*Registering…*) agar tidak terkirim dua kali |

### Panel admin `/admin#energize`
| | |
|---|---|
| Daftar pendaftar | Nama, email, No. WhatsApp (bisa diklik untuk membuka WhatsApp), instansi, waktu daftar. Urut dari yang terbaru |
| Pencarian | Berdasarkan nama, email, atau instansi (otomatis setelah berhenti mengetik 300 ms) |
| Pagination | **10 pendaftar per halaman**, diproses di database (`offset/limit`). Yang dikirim lewat jaringan hanya 10 baris, bukan seluruh data |
| Tampilan | Tabel di desktop, kartu di mobile |
| Akses | Hanya akun yang terdaftar sebagai admin. Publik tidak bisa membaca data pendaftar sama sekali |

### Cara pengunjung menemukan event
- Slide pertama **hero carousel** di Home (tombol *Learn More*)
- Dropdown **Programs** di navbar
- Link di **footer** semua halaman
- **Pop-up pengumuman** di Home khusus mobile. Setelah ditutup tidak muncul lagi (disimpan di `localStorage`)

### Umum
- Responsif 3 breakpoint sesuai Figma: Desktop (≥1024px), Tablet (≥768px), Mobile (<768px)
- Animasi *reveal on scroll* dan smooth scroll, menghormati pengaturan `prefers-reduced-motion`
- Aksesibel: label pada setiap input, `aria-invalid` dan pesan error yang terhubung ke field, carousel dengan `aria-roledescription`

---

## 2. Arsitektur & Alur Data

```
                ┌───────────────────────────────┐
  Pengunjung ──▶│  Next.js (halaman statis)     │  HTML/JS/CSS dikirim sekali
                │  /energize-talk, /admin       │
                └──────────────┬────────────────┘
                               │ HTTPS (supabase-js, dari browser)
                               ▼
                ┌───────────────────────────────┐
                │  Supabase                     │
                │  API Gateway  → cek apikey    │
                │  PostgREST    → cek JWT, role │
                │  PostgreSQL   → RLS + fungsi  │
                └───────────────────────────────┘
```

**Pendaftaran (publik)**
```
Isi form → validasi di browser
  → POST /rest/v1/rpc/register_energize   { p_name, p_email, p_phone, p_institution }
      fungsi register_energize (1 transaksi):
        1. cek deadline        → REGISTRATION_CLOSED
        2. validasi ulang data
        3. INSERT ke energize_registrations
           unique index lower(email) → EMAIL_ALREADY_REGISTERED
  ← { id, name }  → tampil sukses + Registration ID
```

**Melihat pendaftar (admin)**
```
Login (Supabase Auth) → browser menyimpan token JWT
  → GET /rest/v1/energize_registrations?order=created_at.desc&offset=0&limit=10
     Header: Authorization: Bearer <JWT>, Prefer: count=exact
     RLS: is_admin() harus true, jika tidak hasilnya kosong
  ← 10 baris + header Content-Range: 0-9/47 (total untuk pagination)
```

Halaman tidak punya server/API sendiri. Semua aturan bisnis ada di database, sehingga aturan yang sama berlaku walaupun request dikirim langsung tanpa lewat website (misalnya lewat Postman).

---

## 3. Keamanan & Konsistensi Data

| Ancaman | Penanganan |
|---|---|
| Pendaftaran ganda (klik dua kali, koneksi putus lalu kirim ulang, dua request bersamaan) | **Unique index** pada `lower(email)`. Database memproses insert secara berurutan, sehingga hanya satu yang berhasil. Tombol juga dikunci selama request berjalan |
| Mendaftar setelah deadline | Dicek di fungsi database dengan waktu server (`now()`), bukan jam di perangkat pengguna |
| Data tidak valid dikirim langsung ke API | Validasi diulang di fungsi `register_energize`. Validasi di browser hanya untuk kenyamanan pengguna |
| SQL injection | Input dikirim sebagai JSON dan diteruskan ke fungsi sebagai **parameter bertipe `text`**. Tidak ada query yang dirakit dari string. Pencarian admin juga membuang karakter `,` `(` `)` agar tidak mengubah struktur filter |
| XSS (nama berisi `<script>`) | React otomatis meng-escape teks saat ditampilkan |
| Publik membaca data pendaftar | **Row Level Security**: tabel `energize_registrations` hanya bisa diakses admin. Publik (role `anon`) hanya diberi izin `EXECUTE` ke fungsi `register_energize`, tidak bisa `SELECT/INSERT/UPDATE/DELETE` langsung ke tabel |
| Publishable key terlihat di browser | Memang didesain publik. Hak akses ditentukan oleh JWT dan RLS, bukan oleh key |

**Batasan yang diketahui** (bisa dikembangkan):
- Belum ada *rate limiting* atau captcha. Bot bisa mengirim banyak pendaftaran dengan email berbeda. Solusi: pindahkan pemanggilan ke Next.js Route Handler dengan rate limit per IP + Cloudflare Turnstile.
- No. WhatsApp belum dibuat unik.
- Deadline ditulis di dua tempat (lihat [bagian 9](#9-mengubah-data-event)).

---

## 4. Prasyarat

- **Node.js 18.18 atau lebih baru** (disarankan Node 20/22/24). Cek: `node -v`
- **npm** (sudah termasuk dalam Node.js). Cek: `npm -v`
- Git
- Koneksi internet (untuk `npm install` dan koneksi ke Supabase)

> Tidak perlu install database lokal. Database berjalan di Supabase cloud.

---

## 5. Cara Menjalankan (Quick Start)

```bash
# 1. Clone repository
git clone https://github.com/Notdils/Anargya-Special-Task.git
cd Anargya-Special-Task

# 2. Install dependencies
npm install

# 3. File .env SUDAH disertakan, tidak perlu diubah.

# 4. Jalankan development server
npm run dev
```

| Halaman | URL |
|---|---|
| Halaman event + form | http://localhost:3000/energize-talk |
| Login admin | http://localhost:3000/admin/login |
| Daftar pendaftar | http://localhost:3000/admin#energize |

Mode production:

```bash
npm run build
npm start
```

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server (hot reload) di port 3000 |
| `npm run build` | Build production |
| `npm start` | Menjalankan hasil build production |
| `npm run typecheck` | Cek tipe TypeScript |

---

## 6. Konfigurasi Environment

File **`.env`** di root project sudah disertakan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kinjdxpffvkpgdftebrl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xOQZx5HguX7w790CmpyRbw_5oYINc-o
```

| Variabel | Keterangan | Lokasi di Supabase |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Project Settings → API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key, aman dipakai di browser | Project Settings → API Keys → *Publishable key* |

> *Secret / service role key* **tidak** dipakai dan **tidak boleh** dimasukkan ke repository.
>
> Ingin memakai project Supabase lain? Buat `.env.local` (prioritasnya lebih tinggi dari `.env`) dengan format seperti `.env.example`, lalu **restart** `npm run dev`.

---

## 7. Setup Database

Jika memakai database bawaan, cukup pastikan langkah 2 dan 3 sudah pernah dijalankan.

1. (Hanya untuk project baru) Buat project di [supabase.com](https://supabase.com), lalu buat akun admin: *Authentication → Users → Add user → Create new user* dengan email `admin@anargya.com`, password `Anargya2026!`, centang **Auto Confirm User**.
2. **Jalankan skema**: *SQL Editor → New query*, tempel **seluruh isi** [`supabase/schema.sql`](supabase/schema.sql), klik **Run**. Untuk Energize Talk, file ini membuat:
   - tabel `energize_registrations` + unique index email
   - Row Level Security (hanya admin)
   - fungsi `register_energize()` + izin `EXECUTE` untuk publik
   - tabel `admin_users`, fungsi `is_admin()`, dan mendaftarkan `admin@anargya.com` sebagai admin
3. (Opsional) **Isi data contoh**: jalankan [`supabase/seed-energize.sql`](supabase/seed-energize.sql) untuk menambahkan 47 pendaftar contoh, berguna untuk mencoba pencarian dan pagination. Aman dijalankan ulang (email yang sudah ada dilewati).
4. (Disarankan) *Authentication → Sign In / Providers →* matikan **Allow new users to sign up**.

> `schema.sql` aman dijalankan ulang (idempotent).

---

## 8. Akun Admin

| Email | Password |
|---|---|
| `admin@anargya.com` | `Anargya2026!` |

Menambah admin lain: buat user baru di Supabase Auth, lalu jalankan di SQL Editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email-admin-baru@contoh.com';
```

---

## 9. Mengubah Data Event

| Yang diubah | Lokasi |
|---|---|
| **Deadline pendaftaran** | Ubah di **dua tempat** agar sama: `REG_CLOSES` di `src/app/energize-talk/page.tsx` (countdown & kunci form) **dan** `v_deadline` di fungsi `register_energize` (`supabase/schema.sql`, lalu jalankan ulang di SQL Editor) |
| Link grup LINE | `LINE_GROUP_URL` di `src/components/EnergizeRegisterForm.tsx` (saat ini masih placeholder `#`) |
| Data pembicara | `src/lib/energize.ts` |
| Foto pembicara | `public/images/energize/kemas.webp`, `arkastra.webp`, `hosta.webp`. Selama file belum ada, keping cermin tampil sebagai kaca hijau |
| Teks halaman (About, Benefits, Save the Date) | `src/app/energize-talk/page.tsx` |

---

## 10. Struktur Project

```
├── public/images/energize/          # Foto pembicara
├── supabase/
│   ├── schema.sql                   # Tabel, RLS, fungsi register_energize
│   └── seed-energize.sql            # 47 pendaftar contoh (opsional)
├── src/
│   ├── app/
│   │   ├── energize-talk/page.tsx   # Halaman event + section #register
│   │   ├── admin/login/page.tsx     # Login admin
│   │   ├── admin/page.tsx           # Dashboard admin (section Pendaftar Energize Talk)
│   │   ├── page.tsx                 # Home (hero carousel berisi slide Energize Talk)
│   │   └── layout.tsx, fonts.ts, globals.css
│   ├── components/
│   │   ├── EnergizeRegisterForm.tsx # Form registrasi + tampilan sukses
│   │   ├── Countdown.tsx            # Hitung mundur ke deadline
│   │   ├── ShardCarousel.tsx        # Carousel keping cermin pembicara
│   │   ├── MirrorImage.tsx          # Bentuk keping cermin (SVG clipPath)
│   │   ├── HeroCarousel.tsx         # Carousel hero Home
│   │   ├── EnergizePopup.tsx        # Pop-up pengumuman (mobile)
│   │   └── Navbar, Footer, AdminShell, Reveal, Icons, ...
│   └── lib/
│       ├── energize.ts              # Data pembicara
│       ├── supabase.ts              # Supabase client
│       └── useAdmin.ts, format.ts, ...
├── .env / .env.example
└── package.json
```

---

## 11. Skema Database

```
auth.users ── admin_users          energize_registrations
```

| Tabel | Kolom |
|---|---|
| `energize_registrations` | `id` (identity, dipakai untuk Registration ID `ET-xxxx`), `full_name`, `email` (unik, tidak peka huruf besar/kecil, disimpan lowercase), `phone`, `institution`, `created_at` |
| `admin_users` | `user_id` (FK ke `auth.users`) |

| Fungsi | Dipanggil oleh | Tugas |
|---|---|---|
| `register_energize(p_name, p_email, p_phone, p_institution)` | Publik (`anon`) | Cek deadline, validasi, insert. Mengembalikan `{ id, name }`. Error: `REGISTRATION_CLOSED`, `EMAIL_ALREADY_REGISTERED`, atau pesan validasi |
| `is_admin()` | Policy RLS | `true` jika user yang login ada di `admin_users` |

**Aturan validasi (sama di browser dan database)**

| Field | Aturan |
|---|---|
| Nama | Minimal 3 karakter |
| Email | Format `nama@domain.tld` |
| WhatsApp | Diawali `08`, `628`, atau `+628`, total 9–14 digit setelah `8` (spasi dan `-` dihapus otomatis) |
| Instansi | Minimal 2 karakter |

---

## 12. Troubleshooting

| Masalah | Solusi |
|---|---|
| Submit form muncul error koneksi | Pastikan `.env` ada di root project dan tidak berubah, lalu **restart** `npm run dev`. Cek juga apakah project Supabase sedang *paused* |
| Error `function register_energize does not exist` | Bagian Energize di `supabase/schema.sql` belum dijalankan. Jalankan seluruh file di SQL Editor |
| Form langsung *Registration Closed* | Deadline sudah lewat atau jam perangkat salah. Cek `REG_CLOSES` (lihat bagian 9) |
| Daftar pendaftar di admin kosong | Belum ada pendaftar, atau akun belum terdaftar di `admin_users`. Jalankan query di bagian 8, atau isi data contoh dengan `seed-energize.sql` |
| Login admin: *"Akun ini tidak memiliki akses admin"* | User belum terdaftar di `admin_users`. Jalankan query di bagian 8 |
| Login admin: *"Email atau password salah"* | Pastikan user dibuat dengan *Auto Confirm User* |
| Project Supabase *paused* | Project free tier dijeda setelah 7 hari tidak aktif. Buka dashboard Supabase lalu klik **Restore project** |
| `'next' is not recognized as an internal or external command` | `npm install` belum selesai atau gagal. Jalankan ulang dan pastikan selesai tanpa `npm error` |
| `ENOSPC: no space left on device` | Ruang disk penuh. Kosongkan minimal ±1 GB (misalnya `npm cache clean --force`, hapus `node_modules` yang setengah jadi), lalu ulangi `npm install` |
| Port 3000 sudah dipakai | `npm run dev -- -p 3001` |

---

## 13. Fitur Lain di Repository Ini

Repository ini awalnya dibuat untuk Special Task Web Design & Development Anargya (company profile + toko merchandise). Bagian tersebut masih ada dan berfungsi, tetapi bukan fokus project ini:

| Halaman | Isi |
|---|---|
| `/` | Company profile Anargya (About, Mark 6.0, Achievements, Contact) |
| `/merch`, `/purchase` | Katalog dan checkout merchandise lewat fungsi `place_order` (stok dikunci dengan `SELECT ... FOR UPDATE`) |
| `/admin` | Selain pendaftar Energize Talk: kelola stok produk, daftar order & customer, detail order di `/admin/orders/[id]` |

Tabel terkait: `products`, `orders`, `order_items` (semuanya di `supabase/schema.sql`).
