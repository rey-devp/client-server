/**
 * SCENES — Data step-by-step untuk visualisasi Algoritma State Machine.
 * Setiap scene merepresentasikan satu langkah dalam siklus FSM Client-Server.
 */
const SCENES = [
  {
    id: 0,
    titleId: "State: IDLE — Sistem Menunggu",
    titleEn: "State: IDLE — System Waiting",
    descriptionId:
      "Sistem berada dalam state IDLE. Server aktif mendengarkan (listening) di port 8080, menunggu event masuk dari pengguna.",
    descriptionEn:
      "System is in IDLE state. Server is listening on port 8080, waiting for an incoming event.",
    activeNodes: [],
    activeConnectors: [],
    packet: null,
    pulseServer: false,
    machineState: "idle",
    pseudoLines: [4, 9],
    eventLabel: null,
  },
  {
    id: 1,
    titleId: "Event: USER_SEND() Diterima",
    titleEn: "Event: USER_SEND() Received",
    descriptionId:
      "Pengguna men-klik tombol, meng-trigger event USER_SEND(). State machine menerima event ini. Kondisi `event == 'USER_SEND'` bernilai TRUE.",
    descriptionEn:
      "User clicks a button, triggering USER_SEND() event. The state machine receives this event. Condition `event == 'USER_SEND'` evaluates TRUE.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "request", state: "at-client" },
    pulseServer: false,
    machineState: "idle",
    pseudoLines: [10, 11],
    eventLabel: "USER_SEND",
  },
  {
    id: 2,
    titleId: "Transisi: IDLE → REQUEST",
    titleEn: "Transition: IDLE → REQUEST",
    descriptionId:
      "currentState berubah menjadi REQUEST. Klien membungkus aksi menjadi HTTP Request dengan method, header, dan body sesuai protokol.",
    descriptionEn:
      "currentState changes to REQUEST. Client wraps the action into an HTTP Request with method, headers, and body.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "request", state: "at-client" },
    pulseServer: false,
    machineState: "request",
    pseudoLines: [11, 12, 16],
    eventLabel: null,
  },
  {
    id: 3,
    titleId: "State: REQUEST — Paket Melintasi Jaringan",
    titleEn: "State: REQUEST — Packet Traversing Network",
    descriptionId:
      "Dalam state REQUEST, paket HTTP dikirim melalui TCP/IP. Mesin menunggu event PACKET_ARRIVED() yang terjadi saat paket tiba di server.",
    descriptionEn:
      "In REQUEST state, HTTP packet is sent over TCP/IP. Machine waits for PACKET_ARRIVED() event when the packet reaches the server.",
    activeNodes: ["client", "network", "server"],
    activeConnectors: [],
    packet: { type: "request", state: "traveling" },
    pulseServer: false,
    machineState: "request",
    pseudoLines: [17, 18],
    eventLabel: "PACKET_ARRIVED",
  },
  {
    id: 4,
    titleId: "Transisi: REQUEST → PROCESS",
    titleEn: "Transition: REQUEST → PROCESS",
    descriptionId:
      "Event PACKET_ARRIVED() ter-trigger. currentState berubah ke PROCESS. Server menjalankan business logic dan melakukan query ke database.",
    descriptionEn:
      "PACKET_ARRIVED() event fires. currentState changes to PROCESS. Server runs business logic and queries the database.",
    activeNodes: ["server", "database"],
    activeConnectors: ["server-db"],
    packet: { type: "request", state: "at-server" },
    pulseServer: true,
    machineState: "process",
    pseudoLines: [23, 24, 25, 26],
    eventLabel: "DB_QUERY_DONE",
  },
  {
    id: 5,
    titleId: "Transisi: PROCESS → RESPONSE",
    titleEn: "Transition: PROCESS → RESPONSE",
    descriptionId:
      "Database query selesai, event DB_QUERY_DONE() ter-trigger. State berpindah ke RESPONSE. Server membangun HTTP Response 200 OK dan mengirimkannya.",
    descriptionEn:
      "DB query completes, DB_QUERY_DONE() fires. State moves to RESPONSE. Server builds HTTP 200 OK Response and sends it back.",
    activeNodes: ["server", "network", "client"],
    activeConnectors: [],
    packet: { type: "response", state: "traveling" },
    pulseServer: false,
    machineState: "response",
    pseudoLines: [30, 31, 32],
    eventLabel: "RESPONSE_RECEIVED",
  },
  {
    id: 6,
    titleId: "Transisi: RESPONSE → IDLE (Siklus Selesai)",
    titleEn: "Transition: RESPONSE → IDLE (Cycle Complete)",
    descriptionId:
      "Event RESPONSE_RECEIVED() ter-trigger. currentState kembali ke IDLE. Klien me-render UI dengan data baru. Satu siklus FSM Request-Response selesai.",
    descriptionEn:
      "RESPONSE_RECEIVED() fires. currentState returns to IDLE. Client renders the UI with new data. One FSM Request-Response cycle is complete.",
    activeNodes: ["client"],
    activeConnectors: [],
    packet: { type: "response", state: "at-client" },
    pulseServer: false,
    machineState: "idle",
    pseudoLines: [32, 33, 4],
    eventLabel: null,
  },
];

const SCENE_COUNT = SCENES.length;
const LAST_STEP_INDEX = SCENE_COUNT - 1;
