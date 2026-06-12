/**
 * SCENES — Data step-by-step Algoritma State Machine
 * pseudoLines merujuk ke data-line di HTML pseudocode panel
 */
const SCENES = [
  {
    id: 0,
    titleId: "State: IDLE — Sistem Menunggu",
    descriptionId:
      "Sistem berada dalam state IDLE. Server aktif mendengarkan (listening) di port 8080, menunggu event masuk dari pengguna.",
    activeNodes: [],
    activeConnectors: [],
    packet: null,
    machineState: "idle",
    pseudoLines: [4, 9],
    eventLabel: null,
  },
  {
    id: 1,
    titleId: "Event: USER_SEND() — Trigger Diterima",
    descriptionId:
      "Pengguna menekan tombol, memicu event USER_SEND(). State machine menerima event ini dan mengevaluasi kondisi pada case IDLE.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "request", state: "at-client" },
    machineState: "idle",
    pseudoLines: [9, 10, 11],
    eventLabel: "USER_SEND",
  },
  {
    id: 2,
    titleId: "Transisi: IDLE → REQUEST",
    descriptionId:
      "currentState berubah menjadi REQUEST. Klien membungkus aksi menjadi HTTP Request (method, header, body) sesuai protokol.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "request", state: "at-client" },
    machineState: "request",
    pseudoLines: [11, 12, 15],
    eventLabel: null,
  },
  {
    id: 3,
    titleId: "State: REQUEST — Paket Melintasi Jaringan",
    descriptionId:
      "Dalam state REQUEST, paket HTTP dikirim melalui TCP/IP ke server. Mesin menunggu event PKT_ARRIVED() saat paket tiba.",
    activeNodes: ["client", "network", "server"],
    activeConnectors: [],
    packet: { type: "request", state: "traveling" },
    machineState: "request",
    pseudoLines: [15, 16, 17],
    eventLabel: "PKT_ARRIVED",
  },
  {
    id: 4,
    titleId: "Transisi: REQUEST → PROCESS",
    descriptionId:
      "Event PKT_ARRIVED() terpicu. currentState berubah ke PROCESS. Server menjalankan business logic dan melakukan query ke database.",
    activeNodes: ["server", "database"],
    activeConnectors: ["server-db"],
    packet: { type: "request", state: "at-server" },
    machineState: "process",
    pseudoLines: [18, 19, 22, 23, 24],
    eventLabel: "DB_DONE",
  },
  {
    id: 5,
    titleId: "Transisi: PROCESS → RESPONSE",
    descriptionId:
      "Database query selesai, event DB_DONE() terpicu. State berpindah ke RESPONSE. Server membangun HTTP Response 200 OK dan mengirimkannya.",
    activeNodes: ["server", "network", "client"],
    activeConnectors: [],
    packet: { type: "response", state: "traveling" },
    machineState: "response",
    pseudoLines: [25, 26, 29, 30, 31],
    eventLabel: "RESP_RECEIVED",
  },
  {
    id: 6,
    titleId: "Transisi: RESPONSE → IDLE (Siklus Selesai)",
    descriptionId:
      "Event RESP_RECEIVED() terpicu. currentState kembali ke IDLE. Klien me-render UI dengan data baru. Satu siklus Request-Response selesai.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "response", state: "at-client" },
    machineState: "idle",
    pseudoLines: [32, 33, 4],
    eventLabel: null,
  },
];

const SCENE_COUNT = SCENES.length;
const LAST_STEP_INDEX = SCENE_COUNT - 1;
