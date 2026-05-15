(function initClientServerDemo() {
  const app = document.getElementById("app");
  const stepCounter = document.getElementById("step-counter");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const titleId = document.getElementById("title-id");
  const titleEn = document.getElementById("title-en");
  const descId = document.getElementById("desc-id");
  const descEn = document.getElementById("desc-en");
  const btnPrev = document.getElementById("btn-prev");
  const btnPlay = document.getElementById("btn-play");
  const btnNext = document.getElementById("btn-next");
  const btnReset = document.getElementById("btn-reset");
  const toggleAutoplay = document.getElementById("toggle-autoplay");
  const packetRequest = document.getElementById("packet-request");
  const packetResponse = document.getElementById("packet-response");

  const nodeMap = {
    user: document.getElementById("node-user"),
    client: document.getElementById("node-client"),
    network: document.getElementById("node-network"),
    server: document.getElementById("node-server"),
    database: document.getElementById("node-database"),
  };

  const connectorUserClient = document.querySelector(".connector--user-client");
  const connectorServerDb = document.querySelector(".connector--server-db");

  const connectorMap = {
    "user-client": connectorUserClient,
    "server-db": connectorServerDb,
  };

  const controller = new AnimationController({
    scenes: SCENES,
    intervalMs: 2800,
    onStepChange: renderStep,
  });

  let lastRenderedStep = -1;

  function renderStep(step, scene) {
    const playing = controller.isPlaying;
    btnPlay.textContent = playing ? "Jeda" : "Putar";
    btnPlay.setAttribute("aria-label", playing ? "Jeda animasi" : "Putar animasi");

    packetRequest.style.animationPlayState = playing ? 'running' : 'paused';
    packetResponse.style.animationPlayState = playing ? 'running' : 'paused';

    if (step === lastRenderedStep) {
      return;
    }
    lastRenderedStep = step;

    app.setAttribute("data-step", String(step));

    stepCounter.textContent = `Langkah ${step} / ${LAST_STEP_INDEX}`;
    progressBar.setAttribute("aria-valuenow", String(step));
    progressBar.setAttribute("aria-valuemax", String(LAST_STEP_INDEX));
    const percent = LAST_STEP_INDEX === 0 ? 0 : (step / LAST_STEP_INDEX) * 100;
    progressFill.style.width = `${percent}%`;

    titleId.textContent = scene.titleId;
    titleEn.textContent = scene.titleEn;
    descId.textContent = scene.descriptionId;
    descEn.textContent = scene.descriptionEn;

    Object.values(nodeMap).forEach((el) => {
      if (el) {
        el.classList.remove("is-active", "is-pulsing");
      }
    });
    Object.values(connectorMap).forEach((el) => {
      if (el) {
        el.classList.remove("is-active");
      }
    });

    scene.activeNodes.forEach((name) => {
      const el = nodeMap[name];
      if (el) {
        el.classList.add("is-active");
      }
    });

    scene.activeConnectors.forEach((name) => {
      const el = connectorMap[name];
      if (el) {
        el.classList.add("is-active");
      }
    });

    if (scene.pulseServer && nodeMap.server) {
      nodeMap.server.classList.add("is-pulsing");
    }

    updatePackets(scene.packet);
  }

  function resetPacketClasses(el) {
    if (!el) {
      return;
    }
    el.classList.remove(
      "is-visible",
      "is-traveling",
      "is-at-client",
      "is-at-server"
    );
  }

  function updatePackets(packet) {
    resetPacketClasses(packetRequest);
    resetPacketClasses(packetResponse);

    if (!packet) {
      return;
    }

    const el = packet.type === "request" ? packetRequest : packetResponse;
    if (!el) {
      return;
    }

    el.classList.add("is-visible");

    switch (packet.state) {
      case "at-client":
        el.classList.add("is-at-client");
        break;
      case "at-server":
        el.classList.add("is-at-server");
        break;
      case "traveling":
        void el.offsetWidth;
        el.classList.add("is-traveling");
        break;
      default:
        break;
    }
  }

  btnPlay.addEventListener("click", () => {
    controller.togglePlay();
    renderStep(controller.currentStep, controller.scene);
  });

  btnNext.addEventListener("click", () => {
    controller.next(true);
  });

  btnPrev.addEventListener("click", () => {
    controller.prev(true);
  });

  btnReset.addEventListener("click", () => {
    controller.reset();
    renderStep(controller.currentStep, controller.scene);
  });

  toggleAutoplay.addEventListener("change", (e) => {
    controller.setAutoplay(e.target.checked);
    if (controller.isPlaying && e.target.checked) {
      controller.play();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.code === "ArrowRight") {
      e.preventDefault();
      controller.next(true);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      controller.prev(true);
    } else if (e.code === "Space") {
      e.preventDefault();
      controller.togglePlay();
      renderStep(controller.currentStep, controller.scene);
    }
  });

  renderStep(0, SCENES[0]);
})();
