/**
 * Main controller — Algoritma State Machine Visualizer
 * Menyinkronkan: FSM Diagram (kiri) + Visualisasi Client-Server (tengah) + Pseudocode (kanan)
 */
(function initStateMachineDemo() {
  // ─── DOM References ───────────────────────────────────────────────────────
  const stepCounterEl  = document.getElementById('step-counter');
  const progressFillEl = document.getElementById('progress-fill');
  const stepTitleEl    = document.getElementById('step-title');
  const stepDescEl     = document.getElementById('step-desc');
  const eventBadgeEl   = document.getElementById('event-badge');
  const currentStateEl = document.getElementById('current-state-label');

  const btnPrev  = document.getElementById('btn-prev');
  const btnPlay  = document.getElementById('btn-play');
  const btnNext  = document.getElementById('btn-next');
  const btnReset = document.getElementById('btn-reset');

  // FSM Nodes (kiri)
  const fsmNodes = {
    idle:     document.getElementById('fsm-idle'),
    request:  document.getElementById('fsm-request'),
    process:  document.getElementById('fsm-process'),
    response: document.getElementById('fsm-response'),
  };

  // Visualization Nodes (tengah)
  const vizNodes = {
    client:   document.querySelector('.node-client'),
    network:  document.getElementById('network-hub'),
    server:   document.querySelector('.node-server'),
    database: document.getElementById('database-icon'),
  };

  // SVG Packet Elements
  const svgPaths   = document.getElementById('svg-paths');
  const pathBg     = document.getElementById('path-bg');
  const pathReq    = document.getElementById('path-flow-req');
  const pathRes    = document.getElementById('path-flow-res');
  const packetReq  = document.getElementById('packet-request');
  const packetRes  = document.getElementById('packet-response');

  // Server Logs
  const serverLogsEl = document.getElementById('server-logs');
  const cursorEl     = document.getElementById('log-cursor');

  // Pseudocode Lines (kanan)
  const pseudoLines = document.querySelectorAll('.pseudo-line[data-line]');

  // ─── State ────────────────────────────────────────────────────────────────
  let lastRenderedStep = -1;
  let animationActive  = false;

  // ─── Animation Controller ─────────────────────────────────────────────────
  const controller = new AnimationController({
    scenes: SCENES,
    intervalMs: 3200,
    onStepChange: renderStep,
  });

  // ─── SVG Path Logic (ported from simulation.js) ───────────────────────────
  function updatePaths() {
    if (!svgPaths || !vizNodes.client || !vizNodes.network || !vizNodes.server) return;
    const svgRect = svgPaths.getBoundingClientRect();

    function center(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - svgRect.left, y: r.top + r.height / 2 - svgRect.top };
    }

    const c = center(vizNodes.client);
    const n = center(vizNodes.network);
    const s = center(vizNodes.server);
    const d = `M ${c.x} ${c.y} L ${n.x} ${n.y} L ${s.x} ${s.y}`;

    [pathBg, pathReq, pathRes].forEach(p => { if (p) p.setAttribute('d', d); });
    if (packetReq) { packetReq.style.opacity = '0'; }
    if (packetRes) { packetRes.style.opacity = '0'; }
  }

  window.addEventListener('resize', updatePaths);
  setTimeout(updatePaths, 150);

  // ─── Tween Packet Animation ───────────────────────────────────────────────
  function animatePacket(packet, path, reverse, duration, onComplete) {
    if (!packet || !path) { if (onComplete) onComplete(); return; }
    const totalLen = path.getTotalLength();
    let startTime  = null;
    packet.style.opacity = '1';

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const len = reverse ? totalLen * (1 - progress) : totalLen * progress;
      const pt  = path.getPointAtLength(len);
      packet.setAttribute('cx', pt.x);
      packet.setAttribute('cy', pt.y);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        packet.style.opacity = '0.8';
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(step);
  }

  function positionPacketAt(packet, path, atEnd) {
    if (!packet || !path) return;
    const len = atEnd ? path.getTotalLength() : 0;
    const pt  = path.getPointAtLength(len);
    packet.setAttribute('cx', pt.x);
    packet.setAttribute('cy', pt.y);
    packet.style.opacity = '1';
  }

  function hideAllPackets() {
    [packetReq, packetRes].forEach(p => { if (p) p.style.opacity = '0'; });
    if (pathReq) pathReq.classList.remove('active');
    if (pathRes) pathRes.classList.remove('active');
  }

  // ─── Server Log Helper ────────────────────────────────────────────────────
  const LOG_MESSAGES = {
    0: null,
    1: { text: 'Connection request detected from client...', cls: 'text-gray' },
    2: { text: 'Building HTTP Request packet...', cls: 'text-req' },
    3: { text: 'Packet in transit over TCP/IP...', cls: 'text-req' },
    4: { text: 'Request received. Querying database...', cls: 'text-db' },
    5: { text: 'Query OK. Building HTTP 200 OK response...', cls: 'text-res' },
    6: { text: 'Response delivered. State reset to IDLE.', cls: 'text-green' },
  };

  function addLog(step) {
    if (!serverLogsEl || !cursorEl) return;
    const msg = LOG_MESSAGES[step];
    if (!msg) return;
    const div = document.createElement('div');
    div.innerHTML = `<span class="text-gray">[${new Date().toLocaleTimeString()}]</span> <span class="${msg.cls}">${msg.text}</span>`;
    serverLogsEl.insertBefore(div, cursorEl);
    serverLogsEl.scrollTop = serverLogsEl.scrollHeight;
  }

  // ─── Render Step (Core) ───────────────────────────────────────────────────
  function renderStep(step, scene) {
    // Update play button
    btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';

    if (step === lastRenderedStep) return;
    lastRenderedStep = step;

    // 1. Progress bar & counter
    const pct = LAST_STEP_INDEX === 0 ? 0 : (step / LAST_STEP_INDEX) * 100;
    if (progressFillEl) progressFillEl.style.width = `${pct}%`;
    if (stepCounterEl)  stepCounterEl.textContent = `Langkah ${step} / ${LAST_STEP_INDEX}`;

    // 2. Step description
    if (stepTitleEl) stepTitleEl.textContent = scene.titleId;
    if (stepDescEl)  stepDescEl.textContent  = scene.descriptionId;

    // 3. Event badge
    if (eventBadgeEl) {
      if (scene.eventLabel) {
        eventBadgeEl.textContent = `event: ${scene.eventLabel}()`;
        eventBadgeEl.classList.add('visible');
      } else {
        eventBadgeEl.classList.remove('visible');
      }
    }

    // 4. Current state label
    if (currentStateEl) {
      currentStateEl.textContent = `currentState = ${scene.machineState.toUpperCase()}`;
      currentStateEl.className = `current-state-label state-${scene.machineState}`;
    }

    // 5. FSM Node Highlight (kiri)
    Object.entries(fsmNodes).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('fsm-active', key === scene.machineState);
    });

    // 6. Visualization Node Highlight (tengah)
    const activeSet = new Set(scene.activeNodes);
    Object.entries(vizNodes).forEach(([key, el]) => {
      if (!el) return;
      const isActive = activeSet.has(key);
      el.classList.toggle('node-is-active', isActive);
      if (key === 'database') el.classList.toggle('db-processing', scene.activeConnectors.includes('server-db'));
    });

    // 7. Pseudocode Highlight (kanan)
    const activeLines = new Set(scene.pseudoLines);
    pseudoLines.forEach(el => {
      const ln = parseInt(el.dataset.line, 10);
      el.classList.toggle('pseudo-active', activeLines.has(ln));
    });

    // 8. Packet Animation
    updatePaths();
    hideAllPackets();

    if (scene.packet) {
      const { type, state } = scene.packet;
      const pkt    = type === 'request' ? packetReq : packetRes;
      const flow   = type === 'request' ? pathReq   : pathRes;

      if (state === 'at-client') {
        positionPacketAt(pkt, pathBg, false);
      } else if (state === 'at-server') {
        positionPacketAt(pkt, pathBg, true);
      } else if (state === 'traveling') {
        if (flow) flow.classList.add('active');
        animationActive = true;
        const reverse = type === 'response';
        animatePacket(pkt, pathBg, reverse, 1400, () => { animationActive = false; });
      }
    }

    // 9. Server logs
    addLog(step);
  }

  // ─── Button Event Listeners ───────────────────────────────────────────────
  btnPlay.addEventListener('click', () => {
    controller.togglePlay();
    renderStep(controller.currentStep, controller.scene);
  });
  btnNext.addEventListener('click', () => controller.next(true));
  btnPrev.addEventListener('click', () => controller.prev(true));
  btnReset.addEventListener('click', () => {
    if (serverLogsEl && cursorEl) {
      // Clear logs except the cursor
      while (serverLogsEl.firstChild && serverLogsEl.firstChild !== cursorEl) {
        serverLogsEl.removeChild(serverLogsEl.firstChild);
      }
    }
    hideAllPackets();
    controller.reset();
    renderStep(controller.currentStep, controller.scene);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.code === 'ArrowRight') { e.preventDefault(); controller.next(true); }
    else if (e.code === 'ArrowLeft')  { e.preventDefault(); controller.prev(true); }
    else if (e.code === 'Space') {
      e.preventDefault();
      controller.togglePlay();
      renderStep(controller.currentStep, controller.scene);
    }
  });

  // ─── Initial Render ───────────────────────────────────────────────────────
  renderStep(0, SCENES[0]);
})();
