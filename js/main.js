/**
 * main.js — State Machine Visualizer Controller
 */
(function initStateMachineDemo() {

  // ─── DOM ───────────────────────────────────────────────────────────
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

  const startScreen  = document.getElementById('viz-start-screen');
  const vizContent   = document.getElementById('viz-content');
  const btnStartMain = document.getElementById('btn-start-main');

  const fsmNodes = {
    idle:     document.getElementById('fsm-idle'),
    request:  document.getElementById('fsm-request'),
    process:  document.getElementById('fsm-process'),
    response: document.getElementById('fsm-response'),
  };

  const vizClient  = document.getElementById('viz-client');
  const vizServer  = document.getElementById('viz-server');
  const networkHub = document.getElementById('network-hub');
  const dbIcon     = document.getElementById('database-icon');
  const serverLogs = document.getElementById('server-logs');
  const logCursor  = document.getElementById('log-cursor');

  const vizNodeMap = {
    client:   vizClient,
    server:   vizServer,
    network:  networkHub,
    database: dbIcon,
  };

  const svgEl     = document.getElementById('svg-paths');
  const pathBg    = document.getElementById('path-bg');
  const pathReq   = document.getElementById('path-flow-req');
  const pathRes   = document.getElementById('path-flow-res');
  const packetReq = document.getElementById('packet-request');
  const packetRes = document.getElementById('packet-response');

  const pseudoLines = document.querySelectorAll('.pseudo-line[data-line]');

  // ─── State ────────────────────────────────────────────────────────
  let simulationStarted = false;
  let lastRenderedStep  = -1;

  // ─── Controller ───────────────────────────────────────────────────
  const controller = new AnimationController({
    scenes: SCENES,
    intervalMs: 3200,
    onStepChange: renderStep,
  });

  // ═══════════════════════════════════════════════════════════════════
  // START
  // ═══════════════════════════════════════════════════════════════════
  function startSimulation() {
    if (simulationStarted) return;
    simulationStarted = true;

    startScreen.classList.add('hidden');
    vizContent.classList.add('visible');

    // Tunggu layout selesai baru hitung SVG
    setTimeout(() => {
      updatePaths();
      lastRenderedStep = -1;          // Force render
      renderStep(0, SCENES[0]);       // Render step 0
    }, 100);
  }

  if (btnStartMain) btnStartMain.addEventListener('click', startSimulation);

  // ═══════════════════════════════════════════════════════════════════
  // SVG PATH
  // ═══════════════════════════════════════════════════════════════════
  function updatePaths() {
    if (!svgEl || !vizClient || !vizServer || !networkHub) return;
    const svgRect = svgEl.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    function mid(el) {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - svgRect.left,
        y: r.top  + r.height / 2 - svgRect.top,
      };
    }

    const C = mid(vizClient);
    const N = mid(networkHub);
    const S = mid(vizServer);
    const d = `M ${C.x} ${C.y} L ${N.x} ${N.y} L ${S.x} ${S.y}`;

    [pathBg, pathReq, pathRes].forEach(p => { if (p) p.setAttribute('d', d); });
  }

  window.addEventListener('resize', () => { if (simulationStarted) updatePaths(); });

  // ═══════════════════════════════════════════════════════════════════
  // PACKET HELPERS
  // ═══════════════════════════════════════════════════════════════════
  function hidePackets() {
    [packetReq, packetRes].forEach(p => { if (p) p.style.opacity = '0'; });
    if (pathReq) pathReq.classList.remove('active');
    if (pathRes) pathRes.classList.remove('active');
  }

  function placePacket(pkt, atEnd) {
    if (!pkt || !pathBg) return;
    try {
      const len = atEnd ? pathBg.getTotalLength() : 0;
      const pt  = pathBg.getPointAtLength(len);
      pkt.setAttribute('cx', pt.x);
      pkt.setAttribute('cy', pt.y);
      pkt.style.opacity = '1';
    } catch(_) { /* path belum ada */ }
  }

  function animatePacket(pkt, flow, reverse, ms) {
    if (!pkt || !pathBg) return;
    try { pathBg.getTotalLength(); } catch(_) { return; }
    if (flow) flow.classList.add('active');
    const total = pathBg.getTotalLength();
    let t0 = null;
    pkt.style.opacity = '1';

    function tick(ts) {
      if (!t0) t0 = ts;
      const prog = Math.min((ts - t0) / ms, 1);
      const len  = reverse ? total * (1 - prog) : total * prog;
      const pt   = pathBg.getPointAtLength(len);
      pkt.setAttribute('cx', pt.x);
      pkt.setAttribute('cy', pt.y);
      if (prog < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SERVER LOG
  // ═══════════════════════════════════════════════════════════════════
  const LOGS = {
    1: { text: 'User action diterima...', cls: 'log-req' },
    2: { text: 'Membangun HTTP Request...', cls: 'log-req' },
    3: { text: 'Paket dikirim via TCP/IP...', cls: 'log-req' },
    4: { text: 'Request diterima. Query DB...', cls: 'log-db' },
    5: { text: 'DB OK → Building Response...', cls: 'log-res' },
    6: { text: 'Response terkirim → IDLE.', cls: 'log-done' },
  };

  function addLog(step) {
    if (!serverLogs || !logCursor || !LOGS[step]) return;
    const { text, cls } = LOGS[step];
    const d = document.createElement('div');
    const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    d.innerHTML = `<span class="log-sys">[${t}]</span> <span class="${cls}">${text}</span>`;
    serverLogs.insertBefore(d, logCursor);
    serverLogs.scrollTop = serverLogs.scrollHeight;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER STEP — sinkronisasi 3 panel
  // ═══════════════════════════════════════════════════════════════════
  function renderStep(step, scene) {
    // Selalu update tombol play
    if (btnPlay) btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';

    // Guard: jangan render sebelum start atau step sama
    if (!simulationStarted) return;
    if (step === lastRenderedStep) return;
    lastRenderedStep = step;

    // 1. Progress
    const pct = LAST_STEP_INDEX === 0 ? 0 : (step / LAST_STEP_INDEX) * 100;
    if (progressFillEl) progressFillEl.style.width = pct + '%';
    if (stepCounterEl)  stepCounterEl.textContent  = `Langkah ${step} / ${LAST_STEP_INDEX}`;

    // 2. Deskripsi
    if (stepTitleEl) stepTitleEl.textContent = scene.titleId;
    if (stepDescEl)  stepDescEl.textContent  = scene.descriptionId;

    // 3. Event badge
    if (eventBadgeEl) {
      if (scene.eventLabel) {
        eventBadgeEl.textContent = '⚡ ' + scene.eventLabel + '()';
        eventBadgeEl.classList.add('visible');
      } else {
        eventBadgeEl.textContent = '';
        eventBadgeEl.classList.remove('visible');
      }
    }

    // 4. State label
    if (currentStateEl) {
      currentStateEl.textContent = 'currentState = ' + scene.machineState.toUpperCase();
      currentStateEl.className   = 'current-state-label state-' + scene.machineState;
    }

    // 5. FSM nodes
    Object.entries(fsmNodes).forEach(function([key, el]) {
      if (el) el.classList.toggle('fsm-active', key === scene.machineState);
    });

    // 6. Viz nodes
    const activeSet = new Set(scene.activeNodes);
    Object.entries(vizNodeMap).forEach(function([key, el]) {
      if (!el) return;
      el.classList.toggle('node-is-active', activeSet.has(key));
      if (key === 'database') {
        el.classList.toggle('db-processing', scene.activeConnectors.includes('server-db'));
      }
    });

    // 7. Pseudocode highlight
    const activeLines = new Set(scene.pseudoLines);
    pseudoLines.forEach(function(el) {
      var ln = parseInt(el.getAttribute('data-line'), 10);
      el.classList.toggle('pseudo-active', activeLines.has(ln));
    });

    // 8. Packet animation
    updatePaths();
    hidePackets();

    if (scene.packet) {
      var type = scene.packet.type;
      var st   = scene.packet.state;
      var pkt  = type === 'request' ? packetReq : packetRes;
      var flow = type === 'request' ? pathReq   : pathRes;

      if (st === 'at-client') {
        placePacket(pkt, false);
      } else if (st === 'at-server') {
        placePacket(pkt, true);
      } else if (st === 'traveling') {
        animatePacket(pkt, flow, type === 'response', 1400);
      }
    }

    // 9. Log
    addLog(step);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════════════════════
  btnPlay.addEventListener('click', function() {
    if (!simulationStarted) { startSimulation(); return; }
    controller.togglePlay();
    // Force update tombol
    btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';
  });

  btnNext.addEventListener('click', function() {
    if (!simulationStarted) { startSimulation(); return; }
    controller.next(true);
  });

  btnPrev.addEventListener('click', function() {
    if (!simulationStarted) { startSimulation(); return; }
    controller.prev(true);
  });

  btnReset.addEventListener('click', function() {
    if (!simulationStarted) return;
    controller.reset();
    lastRenderedStep = -1;  // Force re-render
    hidePackets();
    // Clear logs
    if (serverLogs && logCursor) {
      while (serverLogs.firstChild && serverLogs.firstChild !== logCursor) {
        serverLogs.removeChild(serverLogs.firstChild);
      }
      var init = document.createElement('div');
      init.innerHTML = '<span class="log-sys">[SYS]</span> TCP:8080 listening...';
      serverLogs.insertBefore(init, logCursor);
    }
    renderStep(0, SCENES[0]);
    btnPlay.textContent = '▶ Play';
  });

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD — Arrow Left/Right + Space
  // ═══════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (!simulationStarted) { startSimulation(); return; }
      controller.next(true);
    }
    else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!simulationStarted) { startSimulation(); return; }
      controller.prev(true);
    }
    else if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!simulationStarted) { startSimulation(); return; }
      controller.togglePlay();
      btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';
    }
  });

  // ─── Initial state ────────────────────────────────────────────────
  btnPlay.textContent = '▶ Play';

})();
