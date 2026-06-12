# Algoritma State Machine — Implementasi pada Arsitektur Client-Server

Proyek ini adalah **visualisasi interaktif Algoritma State Machine (FSM — Finite State Machine)** yang didemonstrasikan melalui siklus komunikasi arsitektur **Client-Server**. Dibangun dengan Vanilla HTML, CSS, dan JavaScript murni tanpa framework.

🔗 **Live Demo:** [https://client-server-zeta.vercel.app/](https://client-server-zeta.vercel.app/)

---

## 🧠 Apa itu Algoritma State Machine?

**Finite State Machine (FSM)** adalah model komputasi yang mendefinisikan perilaku sistem melalui sejumlah **state (kondisi)** yang terbatas, beserta aturan **transisi** di antara state-state tersebut.

### Komponen Formal FSM

| Komponen | Notasi | Deskripsi |
|---|---|---|
| **States (Q)** | `{IDLE, REQUEST, PROCESS, RESPONSE}` | Himpunan kondisi yang mungkin ada dalam sistem |
| **Alphabet / Events (Σ)** | `{USER_SEND, PACKET_ARRIVED, DB_QUERY_DONE, RESPONSE_RECEIVED}` | Himpunan event yang dapat diterima mesin |
| **Transition Function (δ)** | `δ(state, event) → state'` | Fungsi yang menentukan state berikutnya |
| **Initial State (q₀)** | `IDLE` | State awal saat sistem pertama berjalan |
| **Final State** | `IDLE` (loop) | Sistem kembali ke state awal setelah satu siklus |

---

## 🔄 State Diagram Client-Server

```
                  ┌──────────────────────────────────────────┐
                  │                                          │
                  ▼               RESPONSE_RECEIVED()        │
              ┌───────┐                                      │
    START ───►│  IDLE │                                      │
              └───┬───┘                                      │
                  │ USER_SEND()                              │
                  ▼                                          │
            ┌─────────┐                                      │
            │ REQUEST │                                      │
            └────┬────┘                                      │
                 │ PACKET_ARRIVED()                          │
                 ▼                                           │
           ┌─────────┐                                       │
           │ PROCESS │                                       │
           └────┬────┘                                       │
                │ DB_QUERY_DONE()                            │
                ▼                                           │
          ┌──────────┐                                      │
          │ RESPONSE │──────────────────────────────────────┘
          └──────────┘
```

---

## 💻 Pseudocode Algoritma

```javascript
// Algoritma State Machine — Client-Server
let currentState = IDLE

function handleEvent(event) {
  switch (currentState) {

    case IDLE:
      if (event == 'USER_SEND') {
        currentState = REQUEST
        buildHttpRequest()
      } break

    case REQUEST:
      // paket melintasi jaringan
      if (event == 'PACKET_ARRIVED') {
        currentState = PROCESS
        runBusinessLogic()
      } break

    case PROCESS:
      // server + database query
      if (event == 'DB_QUERY_DONE') {
        currentState = RESPONSE
        buildHttpResponse()
      } break

    case RESPONSE:
      // respons kembali ke klien
      if (event == 'RESPONSE_RECEIVED') {
        currentState = IDLE
        updateClientUI()
      } break

  } // end switch
}
```

---

## 🔁 Tabel Transisi State

| State Asal | Event Pemicu | State Tujuan | Aksi yang Dijalankan |
|---|---|---|---|
| `IDLE` | `USER_SEND()` | `REQUEST` | `buildHttpRequest()` |
| `REQUEST` | `PACKET_ARRIVED()` | `PROCESS` | `runBusinessLogic()` |
| `PROCESS` | `DB_QUERY_DONE()` | `RESPONSE` | `buildHttpResponse()` |
| `RESPONSE` | `RESPONSE_RECEIVED()` | `IDLE` | `updateClientUI()` |

---

## 🗺️ Penjelasan Setiap State

### 🔵 `IDLE` — Menunggu Event
- Sistem aktif namun tidak memproses apapun
- Server **listening** di port 8080, siap menerima koneksi
- Transisi terjadi saat pengguna men-trigger `USER_SEND()`

### 🟡 `REQUEST` — Membangun & Mengirim Permintaan
- Klien membungkus aksi pengguna menjadi paket **HTTP Request** (GET/POST)
- Paket dikirim melalui jaringan menggunakan protokol **TCP/IP**
- State ini bertahan hingga paket tiba di server dan `PACKET_ARRIVED()` ter-trigger

### 🔵 `PROCESS` — Memproses di Server
- Server menerima request, menjalankan **business logic**
- Melakukan query ke **database** untuk membaca atau menulis data
- State ini berakhir saat query selesai dan `DB_QUERY_DONE()` ter-trigger

### 🟢 `RESPONSE` — Mengembalikan Hasil
- Server membangun **HTTP Response** (200 OK + data JSON)
- Paket response dikirim balik melalui jaringan ke klien
- Siklus selesai saat klien menerima response dan `RESPONSE_RECEIVED()` ter-trigger
- Sistem kembali ke `IDLE` untuk siklus berikutnya

---

## 🏗️ Implementasi dalam Kode

### Arsitektur File

```
client-server/
├── index.html                    ← Struktur UI Grid & styling (menggunakan Tailwind CSS CDN)
└── js/
    ├── animation-controller.js   ← Class AnimationController: mesin manual step-by-step
    ├── scenes.js                 ← Data 7 langkah siklus FSM (machineState, pseudoLines, events)
    └── main.js                   ← Controller utama: sinkronisasi 3 panel + packet animation
```

### Komponen Kode Utama

#### `AnimationController` — Mesin Pengatur Langkah
```javascript
class AnimationController {
  constructor({ scenes, onStepChange }) { ... }
  next()        // Maju satu langkah
  prev()        // Mundur satu langkah
  reset()       // Kembali ke langkah 0
  goTo(step)    // Loncat ke langkah tertentu
}
```

#### `scenes.js` — Definisi Setiap State
Setiap scene memetakan satu langkah FSM ke:
- `machineState` → node FSM mana yang aktif
- `pseudoLines` → baris pseudocode mana yang di-highlight
- `activeNodes` → komponen client/server mana yang aktif
- `packet` → posisi dan animasi paket data

#### `main.js` — Sinkronisasi Tiga Panel
Fungsi `renderStep(step, scene)` dipanggil setiap kali state berubah dan memperbarui:
1. **Panel FSM (kiri)** — node aktif dengan neon glow
2. **Panel Visualisasi (tengah)** — animasi paket SVG + log server
3. **Panel Pseudocode (kanan)** — highlight baris yang berjalan

---

## ✨ Fitur Visualisasi

- **State Diagram Interaktif** — Diagram FSM formal di panel kiri, node aktif bercahaya sesuai state
- **Animasi Paket Real-time** — Paket data bergerak di jalur SVG dari Client → Network → Server → kembali
- **Live Pseudocode Highlight** — Baris kode yang sedang berjalan di-highlight
- **Server Log Terminal** — Log real-time mencatat setiap transisi state
- **Manual Step Navigator** — Kontrol langkah manual (Next/Prev/Reset) via UI atau Keyboard (`←`, `→`)
- **Responsif & Tailwind UI** — Antarmuka mulus menggunakan desain *glassmorphism* dari Tailwind CSS

---

## 🚀 Cara Menjalankan

**Double-click** `index.html` langsung di browser, atau gunakan server lokal:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Lalu buka `http://localhost:8080`.

**Keyboard Shortcuts:**
| Tombol | Fungsi |
|---|---|
| `→` | Langkah berikutnya |
| `←` | Langkah sebelumnya |

---

## 📜 Lisensi

Dibuat untuk keperluan demonstrasi akademik algoritma pemrograman. Modifikasi diperbolehkan.
