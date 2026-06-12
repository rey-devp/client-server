/**
 * main.js — State Machine Visualizer
 * Auto-play on page load, keyboard navigation (← → Space)
 */
(function () {

  // ─── DOM References ───────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };

  var stepCounterEl  = $('step-counter');
  var progressFillEl = $('progress-fill');
  var eventBadgeEl   = $('event-badge');
  var currentStateEl = $('current-state-label');

  var btnPrev  = $('btn-prev');
  var btnPlay  = $('btn-play');
  var btnNext  = $('btn-next');
  var btnReset = $('btn-reset');

  var fsmNodes = {
    idle:     $('fsm-idle'),
    request:  $('fsm-request'),
    process:  $('fsm-process'),
    response: $('fsm-response'),
  };

  var vizClient  = $('viz-client');
  var vizServer  = $('viz-server');
  var networkHub = $('network-hub');
  var dbIcon     = $('database-icon');
  var serverLogs = $('server-logs');
  var logCursor  = $('log-cursor');

  var vizNodeMap = {
    client:   vizClient,
    server:   vizServer,
    network:  networkHub,
    database: dbIcon,
  };

  var svgEl     = $('svg-paths');
  var pathBg    = $('path-bg');
  var pathReq   = $('path-flow-req');
  var pathRes   = $('path-flow-res');
  var packetReq = $('packet-request');
  var packetRes = $('packet-response');

  var pseudoLines = document.querySelectorAll('.pseudo-line[data-line]');

  // ─── State ────────────────────────────────────────────────────────
  var lastStep = -1;

  // ─── Controller ───────────────────────────────────────────────────
  var controller = new AnimationController({
    scenes: SCENES,
    intervalMs: 3200,
    onStepChange: renderStep,
  });

  // ═══════════════════════════════════════════════════════════════════
  // SVG PATH
  // ═══════════════════════════════════════════════════════════════════
  function updatePaths() {
    if (!svgEl || !vizClient || !vizServer || !networkHub) return;
    var svgRect = svgEl.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    function mid(el) {
      var r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - svgRect.left,
        y: r.top  + r.height / 2 - svgRect.top,
      };
    }

    var C = mid(vizClient);
    var N = mid(networkHub);
    var S = mid(vizServer);
    var d = 'M ' + C.x + ' ' + C.y + ' L ' + N.x + ' ' + N.y + ' L ' + S.x + ' ' + S.y;

    [pathBg, pathReq, pathRes].forEach(function (p) { if (p) p.setAttribute('d', d); });
  }

  window.addEventListener('resize', updatePaths);

  // ═══════════════════════════════════════════════════════════════════
  // PACKET HELPERS
  // ═══════════════════════════════════════════════════════════════════
  function hidePackets() {
    [packetReq, packetRes].forEach(function (p) { if (p) p.style.opacity = '0'; });
    if (pathReq) pathReq.classList.remove('active');
    if (pathRes) pathRes.classList.remove('active');
  }

  function placePacket(pkt, atEnd) {
    if (!pkt || !pathBg) return;
    try {
      var len = atEnd ? pathBg.getTotalLength() : 0;
      var pt  = pathBg.getPointAtLength(len);
      pkt.setAttribute('cx', pt.x);
      pkt.setAttribute('cy', pt.y);
      pkt.style.opacity = '1';
    } catch (e) { /* path belum ready */ }
  }

  function animatePacket(pkt, flow, reverse, ms) {
    if (!pkt || !pathBg) return;
    try { pathBg.getTotalLength(); } catch (e) { return; }
    if (flow) flow.classList.add('active');
    var total = pathBg.getTotalLength();
    var t0 = null;
    pkt.style.opacity = '1';

    function tick(ts) {
      if (!t0) t0 = ts;
      var prog = Math.min((ts - t0) / ms, 1);
      var len  = reverse ? total * (1 - prog) : total * prog;
      var pt   = pathBg.getPointAtLength(len);
      pkt.setAttribute('cx', pt.x);
      pkt.setAttribute('cy', pt.y);
      if (prog < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SERVER LOG
  // ═══════════════════════════════════════════════════════════════════
  var LOGS = {
    1: { text: 'User action detected...', cls: 'log-req' },
    2: { text: 'Building HTTP Request...', cls: 'log-req' },
    3: { text: 'Packet sent via TCP/IP...', cls: 'log-req' },
    4: { text: 'Request received. Querying DB...', cls: 'log-db' },
    5: { text: 'DB OK. Building Response...', cls: 'log-res' },
    6: { text: 'Response sent. Back to IDLE.', cls: 'log-done' },
  };

  function addLog(step) {
    if (!serverLogs || !logCursor || !LOGS[step]) return;
    var info = LOGS[step];
    var div = document.createElement('div');
    var t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    div.innerHTML = '<span class="log-sys">[' + t + ']</span> <span class="' + info.cls + '">' + info.text + '</span>';
    serverLogs.insertBefore(div, logCursor);
    serverLogs.scrollTop = serverLogs.scrollHeight;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER STEP
  // ═══════════════════════════════════════════════════════════════════
  function renderStep(step, scene) {
    // Update play button text
    btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';

    // Skip if same step
    if (step === lastStep) return;
    lastStep = step;

    // 1. Progress
    var pct = LAST_STEP_INDEX === 0 ? 0 : (step / LAST_STEP_INDEX) * 100;
    if (progressFillEl) progressFillEl.style.width = pct + '%';
    if (stepCounterEl) stepCounterEl.textContent = 'Langkah ' + step + ' / ' + LAST_STEP_INDEX;


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
      currentStateEl.className = 'current-state-label state-' + scene.machineState;
    }

    // 5. FSM nodes
    Object.keys(fsmNodes).forEach(function (key) {
      if (fsmNodes[key]) fsmNodes[key].classList.toggle('fsm-active', key === scene.machineState);
    });

    // 6. Viz nodes
    var activeSet = scene.activeNodes;
    Object.keys(vizNodeMap).forEach(function (key) {
      if (!vizNodeMap[key]) return;
      vizNodeMap[key].classList.toggle('node-is-active', activeSet.indexOf(key) !== -1);
      if (key === 'database') {
        vizNodeMap[key].classList.toggle('db-processing', scene.activeConnectors.indexOf('server-db') !== -1);
      }
    });

    // 7. Pseudocode
    var activeLines = scene.pseudoLines;
    pseudoLines.forEach(function (el) {
      var ln = parseInt(el.getAttribute('data-line'), 10);
      el.classList.toggle('pseudo-active', activeLines.indexOf(ln) !== -1);
    });

    // 8. Packet
    updatePaths();
    hidePackets();

    if (scene.packet) {
      var pkt  = scene.packet.type === 'request' ? packetReq : packetRes;
      var flow = scene.packet.type === 'request' ? pathReq   : pathRes;

      if (scene.packet.state === 'at-client') placePacket(pkt, false);
      else if (scene.packet.state === 'at-server') placePacket(pkt, true);
      else if (scene.packet.state === 'traveling') animatePacket(pkt, flow, scene.packet.type === 'response', 1400);
    }

    // 9. Log
    addLog(step);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════════════════════
  btnPlay.addEventListener('click', function () {
    controller.togglePlay();
    btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';
  });

  btnNext.addEventListener('click', function () { controller.next(true); });
  btnPrev.addEventListener('click', function () { controller.prev(true); });

  btnReset.addEventListener('click', function () {
    controller.reset();
    lastStep = -1;
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
  });

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD: ← → Space
  // ═══════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      controller.next(true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      controller.prev(true);
    } else if (e.key === ' ') {
      e.preventDefault();
      controller.togglePlay();
      btnPlay.textContent = controller.isPlaying ? '⏸ Pause' : '▶ Play';
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // AUTO-START: langsung play saat halaman dimuat
  // ═══════════════════════════════════════════════════════════════════
  setTimeout(function () {
    updatePaths();
    lastStep = -1;
    renderStep(0, SCENES[0]);
    controller.play();
  }, 200);

})();
