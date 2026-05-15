/**
 * Single source of truth for animation steps (Client-Server architecture).
 * @global SCENES
 */
const SCENES = [
  {
    id: 0,
    titleId: "Siap",
    titleEn: "Idle",
    descriptionId:
      "Diagram dalam keadaan diam. Client-Server berarti klien dan server terpisah: klien meminta layanan, server menyediakannya.",
    descriptionEn:
      "The diagram is at rest. In client-server architecture, the client requests services and the server provides them.",
    activeNodes: [],
    activeConnectors: [],
    packet: null,
    pulseServer: false,
  },
  {
    id: 1,
    titleId: "Pengguna mengirim aksi",
    titleEn: "User action",
    descriptionId:
      "Pengguna berinteraksi dengan antarmuka di sisi klien (klik, formulir, dll.). Aksi ini belum dikirim ke server.",
    descriptionEn:
      "The user interacts with the client-side interface. This action has not yet been sent to the server.",
    activeNodes: ["user", "client"],
    activeConnectors: ["user-client"],
    packet: null,
    pulseServer: false,
  },
  {
    id: 2,
    titleId: "Klien membangun permintaan",
    titleEn: "Client builds request",
    descriptionId:
      "Klien membungkus aksi menjadi permintaan HTTP (misalnya GET atau POST) dengan header dan body jika perlu.",
    descriptionEn:
      "The client wraps the action into an HTTP request (e.g. GET or POST) with headers and optional body.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "request", state: "at-client" },
    pulseServer: false,
  },
  {
    id: 3,
    titleId: "Permintaan melintasi jaringan",
    titleEn: "Request over network",
    descriptionId:
      "Paket permintaan dikirim melalui jaringan (internet/LAN) ke alamat server. Protokol umum: HTTP di atas TCP.",
    descriptionEn:
      "The request packet travels over the network to the server address, typically HTTP over TCP.",
    activeNodes: ["client", "network", "server"],
    activeConnectors: [],
    packet: { type: "request", state: "traveling" },
    pulseServer: false,
  },
  {
    id: 4,
    titleId: "Server memproses",
    titleEn: "Server processing",
    descriptionId:
      "Server menerima permintaan, menjalankan logika bisnis, dan sering mengakses basis data untuk membaca atau menulis data.",
    descriptionEn:
      "The server handles the request, runs business logic, and often reads or writes data in the database.",
    activeNodes: ["server", "database"],
    activeConnectors: ["server-db"],
    packet: { type: "request", state: "at-server" },
    pulseServer: true,
  },
  {
    id: 5,
    titleId: "Respons kembali",
    titleEn: "Response returns",
    descriptionId:
      "Server mengirim respons HTTP (status, header, body) kembali melalui jaringan ke klien.",
    descriptionEn:
      "The server sends an HTTP response (status, headers, body) back through the network to the client.",
    activeNodes: ["server", "network", "client"],
    activeConnectors: [],
    packet: { type: "response", state: "traveling" },
    pulseServer: false,
  },
  {
    id: 6,
    titleId: "Klien menampilkan data",
    titleEn: "Client renders UI",
    descriptionId:
      "Klien mem-parsing respons dan memperbarui tampilan untuk pengguna. Siklus request–response selesai.",
    descriptionEn:
      "The client parses the response and updates the UI for the user. One request–response cycle is complete.",
    activeNodes: ["client", "user"],
    activeConnectors: ["user-client"],
    packet: { type: "response", state: "at-client" },
    pulseServer: false,
  },
];

const SCENE_COUNT = SCENES.length;
const LAST_STEP_INDEX = SCENE_COUNT - 1;
