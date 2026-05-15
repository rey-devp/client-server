document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const btnSend = document.getElementById('btn-send');
    const inputReq = document.getElementById('request-data');
    const clientResponse = document.getElementById('client-response');
    const serverLogs = document.getElementById('server-logs');
    const cursor = document.getElementById('cursor');
    
    const nodeClient = document.querySelector('.node-client');
    const nodeNetwork = document.getElementById('network-hub');
    const nodeServer = document.querySelector('.node-server');
    const databaseIcon = document.getElementById('database-icon');
    
    const pathBg = document.getElementById('path-bg');
    const pathFlowReq = document.getElementById('path-flow-req');
    const pathFlowRes = document.getElementById('path-flow-res');
    
    const packetReq = document.getElementById('packet-request');
    const packetRes = document.getElementById('packet-response');

    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-desc');
    const statusPanel = document.querySelector('.status-panel');

    // --- State ---
    let isSimulating = false;

    // --- Dynamic SVG Paths ---
    // Update SVG paths dynamically based on node positions
    function updatePaths() {
        const svgContainer = document.getElementById('svg-paths');
        const svgRect = svgContainer.getBoundingClientRect();

        function getCenterPoint(el) {
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - svgRect.left,
                y: rect.top + rect.height / 2 - svgRect.top
            };
        }

        const clientCenter = getCenterPoint(nodeClient);
        const netCenter = getCenterPoint(nodeNetwork);
        const serverCenter = getCenterPoint(nodeServer);

        // Path string for the lines
        const d = `M ${clientCenter.x} ${clientCenter.y} L ${netCenter.x} ${netCenter.y} L ${serverCenter.x} ${serverCenter.y}`;
        
        pathBg.setAttribute('d', d);
        pathFlowReq.setAttribute('d', d);
        pathFlowRes.setAttribute('d', d);

        // Hide packets initially
        packetReq.style.opacity = '0';
        packetRes.style.opacity = '0';
    }

    window.addEventListener('resize', updatePaths);
    // Initial draw (with slight delay to ensure layout is done)
    setTimeout(updatePaths, 100);

    // --- Animation Logic ---

    // Simple tween function
    function animatePacket(packet, path, reverse, duration, onComplete) {
        const totalLength = path.getTotalLength();
        let startTime = null;

        packet.style.opacity = '1';

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Calculate point
            const currentLen = reverse ? totalLength * (1 - progress) : totalLength * progress;
            const pt = path.getPointAtLength(currentLen);
            
            packet.setAttribute('cx', pt.x);
            packet.setAttribute('cy', pt.y);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                packet.style.opacity = '0';
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(step);
    }

    function addLog(message, typeClass = '') {
        const div = document.createElement('div');
        div.innerHTML = `<span class="text-gray">[${new Date().toLocaleTimeString()}]</span> <span class="${typeClass}">${message}</span>`;
        serverLogs.insertBefore(div, cursor);
        serverLogs.scrollTop = serverLogs.scrollHeight;
    }

    // --- State Machine ---
    
    function setStatus(state) {
        statusPanel.setAttribute('data-state', state);
        if (state === 'idle') {
            statusTitle.textContent = 'Status: Idle';
            statusDesc.textContent = 'Siap menerima request dari klien.';
        } else if (state === 'request') {
            statusTitle.textContent = 'Status: Mengirim Request...';
            statusDesc.textContent = 'Paket data dikirim melalui internet menuju server.';
        } else if (state === 'process') {
            statusTitle.textContent = 'Status: Server Memproses...';
            statusDesc.textContent = 'Server mengolah payload, berinteraksi dengan database.';
        } else if (state === 'response') {
            statusTitle.textContent = 'Status: Mengembalikan Response...';
            statusDesc.textContent = 'Data hasil olahan dikirim kembali ke klien.';
        }
    }

    btnSend.addEventListener('click', () => {
        if (isSimulating) return;
        
        const payload = inputReq.value.trim() || 'GET /api/data';
        startSimulation(payload);
    });

    inputReq.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnSend.click();
    });

    function startSimulation(payload) {
        isSimulating = true;
        btnSend.disabled = true;
        
        // Reset UIs
        nodeServer.classList.remove('server-processing');
        nodeClient.classList.remove('client-success');
        clientResponse.innerHTML = '<span class="placeholder-text">Menunggu respons...</span>';
        clientResponse.className = 'client-response';
        
        // State 1: Request
        setStatus('request');
        pathFlowReq.classList.add('active');
        nodeNetwork.classList.add('network-active');
        
        addLog(`Incoming Connection...`, 'text-gray');

        animatePacket(packetReq, pathBg, false, 1500, () => {
            // End of Request phase
            pathFlowReq.classList.remove('active');
            
            // State 2: Process
            setStatus('process');
            nodeServer.classList.add('server-processing');
            addLog(`Request: ${payload}`, 'text-req');
            addLog(`Querying Database...`, 'text-db');
            
            databaseIcon.classList.add('db-processing');
            
            setTimeout(() => {
                databaseIcon.classList.remove('db-processing');
                addLog(`Database Query OK. Data found.`, 'text-db');
                addLog(`Preparing Response 200 OK...`, 'text-res');
                
                // State 3: Response
                setStatus('response');
                pathFlowRes.classList.add('active');
                
                animatePacket(packetRes, pathBg, true, 1500, () => {
                    // End of Simulation
                    pathFlowRes.classList.remove('active');
                    nodeNetwork.classList.remove('network-active');
                    nodeServer.classList.remove('server-processing');
                    nodeClient.classList.add('client-success');
                    
                    clientResponse.className = 'client-response success';
                    clientResponse.innerHTML = `<div style="text-align: left; width: 100%;"><strong>200 OK</strong><br><pre style="margin-top: 0.5rem; white-space: pre-wrap; font-family: inherit;">{
  "message": "Success",
  "data": "Menerima respons dari ${payload}"
}</pre></div>`;
                    
                    setStatus('idle');
                    statusTitle.textContent = 'Status: Selesai!';
                    statusDesc.textContent = 'Siklus Request-Response selesai. Anda dapat mencoba mengirim request lain.';
                    
                    btnSend.disabled = false;
                    isSimulating = false;
                });
                
            }, 1500); // 1.5s DB Processing time
        });
    }
});
