# Ilustrasi Arsitektur Client-Server (Klien-Server)

Proyek tugas: animasi interaktif **HTML, CSS, dan JavaScript** yang menjelaskan model arsitektur **Client-Server**, di-hosting dengan **GitHub Pages**.

## Live demo

Setelah repo di-push dan GitHub Pages diaktifkan, URL biasanya:

`https://<username-github>.github.io/<nama-repo>/`

Ganti placeholder di atas dengan URL Pages Anda, lalu lampirkan di laporan tugas.

## Tentang model Client-Server

Dalam arsitektur **client-server**, sistem dibagi menjadi dua peran utama. **Klien** (browser atau aplikasi di perangkat pengguna) mengirim **permintaan** ke **server** melalui **jaringan**. **Server** memproses permintaan, sering berinteraksi dengan **basis data**, lalu mengembalikan **respons** ke klien. Klien menampilkan hasil ke pengguna. Pemisahan ini memudahkan pemeliharaan, skala server, dan banyak klien yang mengakses layanan yang sama.

## Fitur halaman

- Label bilingual (Indonesia + English) per langkah
- Autoplay saat **Putar** (dapat dimatikan lewat checkbox)
- **Jeda**, **Sebelumnya**, **Berikutnya**, **Reset**
- Pintasan keyboard: `←` `→` (langkah), `Space` (putar/jeda)
- Animasi paket **request** (oranye) dan **response** (hijau)

## Struktur folder

```text
├── index.html
├── css/
│   ├── base.css
│   ├── diagram.css
│   └── animation.css
├── js/
│   ├── scenes.js
│   ├── animation-controller.js
│   └── main.js
└── assets/icons/
```

## Menjalankan lokal

**Opsi 1 — buka file langsung**

Buka `index.html` di browser (double-click atau drag ke jendela browser).

**Opsi 2 — server sederhana (disarankan)**

Di WSL / Linux:

```bash
cd /mnt/c/Users/Hype\ AMD/Documents/Training/Client-server
python3 -m http.server 8080
```

Buka `http://localhost:8080`

Atau dengan Node:

```bash
npx --yes serve .
```

## Deploy ke GitHub Pages

1. Buat repository di GitHub (misalnya `client-server-arch`).
2. Push isi folder ini ke branch `main`:

   ```bash
   git init
   git add .
   git commit -m "Add client-server architecture illustration"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

3. Di GitHub: **Settings → Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `main` / **/(root)**
4. Tunggu beberapa menit; status hijau menampilkan URL situs.

## Data tugas (isi sendiri)

| Field | Isi |
|-------|-----|
| Nama | … |
| NPM / Kelas | … |
| Link GitHub Pages | … |
| Link repository | … |

## Lisensi

Gunakan untuk keperluan tugas akademik; sesuaikan aturan pengumpulan dosen Anda.
