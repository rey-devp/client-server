# Simulasi Arsitektur Client-Server Interaktif

Proyek ini adalah sebuah **Simulasi Interaktif Waktu-Nyata (Real-time)** yang mendemonstrasikan model arsitektur **Client-Server**. Dibangun sepenuhnya menggunakan teknologi Vanilla modern (**HTML, CSS, JavaScript** murni tanpa _framework_), proyek ini dirancang untuk di-hosting dengan mudah di **GitHub Pages** dan menawarkan pengalaman visual tingkat lanjut.

## 🌟 Live Demo

Akses simulasi interaktif ini secara langsung melalui GitHub Pages:
**[https://rey-devp.github.io/client-server/](https://client-server-zeta.vercel.app/)**

---

## 🎯 Konsep Simulasi Client-Server

Dalam arsitektur **Client-Server**, peran dalam sistem dibagi secara spesifik:

1. **Klien (Aplikasi Klien)**: Berfungsi sebagai antarmuka pengguna (contoh: browser atau aplikasi _mobile_). Klien merakit data _request_ dan mengirimkannya melalui internet.
2. **Jaringan (Internet)**: Media perantara fisik atau nirkabel yang mengantarkan paket data menggunakan protokol (contoh: HTTP/TCP).
3. **Server Backend**: Komputer tangguh yang selalu sedia (_listening_) untuk menerima _request_ Klien, memvalidasi keamanan, mengolah logika bisnis, dan seringkali berinteraksi dengan **Basis Data** untuk mengambil atau menyimpan informasi.
4. **Response**: Setelah data selesai diolah, Server mengembalikan status (contoh: `200 OK`) beserta data hasilnya (biasanya format JSON) kembali ke Klien.

Proyek ini **bukan sekadar diagram statis**; melainkan sebuah sistem berbasis _state-machine_ di mana Anda bisa langsung mempraktekkan siklus di atas secara riil.

---

## ✨ Fitur Utama

- **Terminal Interaktif Nyata**: Anda dapat mengetik sendiri _Payload Request_ (seperti `GET /api/users` atau `POST /data`) pada kolom Aplikasi Klien.
- **Logika Aliran Waktu-Nyata**: Terdapat animasi _Packet_ data fisik yang bergerak presisi mengikuti kawat/jalur SVG dinamis.
- **Log Terminal Server**: Sisi Server menampilkan log terminal (_console_) sungguhan yang mencatat kapan paket diterima, kapan _query database_ dilakukan, dan kapan respons disiapkan.
- **Desain UI/UX Premium (_Glassmorphism_)**: Antarmuka dirancang menyerupai kaca (_frosted glass_) dengan _Dark Mode_ elegan yang dipadukan dengan efek Neon Glow yang merespons perubahan _state_ jaringan.
- **100% Responsif & Anti-Bug**: Jika Anda membuka proyek ini melalui perangkat _Mobile_ (HP), layout akan secara otomatis berubah menjadi kolom vertikal tanpa merusak sedikitpun animasi aliran data jalurnya (mendukung _resize_ dinamis).

---

## 📂 Struktur Direktori

```text
├── index.html        # Kerangka UI, Terminal Mockup, dan Jalur SVG
├── css/
│   ├── base.css      # Variabel warna dasar, background glow, typography
│   ├── diagram.css   # Layout CSS Grid utama dan styling Glassmorphism
│   └── animation.css # Logika animasi interaktif dan transisi state
└── js/
    └── simulation.js # State-machine simulasi, manipulasi DOM, dan gerak SVG
```

_(Perhatian: File JS lama seperti `main.js`, `scenes.js`, dan `animation-controller.js` tidak lagi digunakan karena seluruh kecerdasan simulasi kini telah disatukan secara efisien ke dalam `simulation.js`)_

---

## 🚀 Menjalankan Secara Lokal

**Cara Termudah (No-Install)**:  
Cukup _double-click_ atau _drag-and-drop_ file `index.html` ke dalam _browser_ (Chrome/Firefox/Edge) Anda.

**Menggunakan Server Lokal (Direkomendasikan)**:  
Jika Anda menggunakan VS Code, Anda bisa menginstal ekstensi **Live Server** dan mengklik "Go Live".  
Atau, jika Anda memiliki Python:

```bash
python -m http.server 8080
```

Lalu buka `http://localhost:8080` di browser.

---

## 📜 Lisensi

Kode ini disusun untuk keperluan demonstrasi akademik arsitektur jaringan. Modifikasi sepenuhnya diperbolehkan.
