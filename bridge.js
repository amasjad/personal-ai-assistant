const { WebSocket } = require('ws');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// Configuration
const CONFIG_FILE = path.join(__dirname, 'bridge_config.json');
let config = {
  serverUrl: 'wss://ai.liorablossoms.com/ws/bridge',
  secretKey: 'agy_bridge_sec_7f9e8d4a2b1c6e5f3091ab74cd82ef01',
  agyPath: 'C:\\Users\\moham\\AppData\\Local\\agy\\bin\\agy.exe',
  defaultDir: 'C:\\Users\\moham\\Desktop\\AGY stuffs',
  machineName: 'Moham-Laptop'
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config = { ...config, ...loaded };
  } catch (e) {
    console.warn('Could not read bridge_config.json, using defaults.');
  }
}

let ws = null;
let reconnectTimer = null;
let activeProcess = null;

function connect() {
  console.log(`\n======================================================`);
  console.log(`⚡ Antigravity PC Bridge: Starting...`);
  console.log(`🌐 Connecting to Cloud Server: ${config.serverUrl}`);
  console.log(`📂 Working Directory: ${config.defaultDir}`);
  console.log(`======================================================\n`);

  try {
    ws = new WebSocket(config.serverUrl);
  } catch (err) {
    console.error('Socket init error:', err.message);
    scheduleReconnect();
    return;
  }

  ws.on('open', () => {
    console.log('✅ Connected to Cloud Relay! Sending authentication...');
    ws.send(JSON.stringify({
      type: 'auth',
      secret: config.secretKey,
      machine: config.machineName,
      cwd: config.defaultDir
    }));
  });

  ws.on('message', (dataRaw) => {
    try {
      const msg = JSON.parse(dataRaw.toString());
      if (msg.type === 'auth_ok') {
        console.log('\n🎉 [ONLINE] Antigravity Bridge is authenticated and active!');
        console.log(`📱 Your phone can now send tasks from https://ai.liorablossoms.com\n`);
      } else if (msg.type === 'auth_fail') {
        console.error('❌ Authentication rejected by server:', msg.error);
      } else if (msg.type === 'execute') {
        handleTask(msg);
      }
    } catch (err) {
      console.error('Message error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Disconnected from Cloud Server. Will retry in 5s...');
    scheduleReconnect();
  });

  ws.on('error', (err) => {
    console.error('Bridge connection error:', err.message);
  });
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, 5000);
}

function handleTask({ taskId, prompt, conversationId, dir }) {
  console.log(`\n📥 [Task ${taskId ? taskId.slice(0, 8) : 'unknown'}] Remote instruction received: "${prompt}"`);

  const workDir = dir || config.defaultDir;
  const args = [
    '--dangerously-skip-permissions',
    '--output-format', 'stream-json',
    '--add-dir', workDir,
    '-p', prompt
  ];

  console.log(`🚀 Executing Antigravity Agent in: ${workDir}`);
  activeProcess = spawn(config.agyPath, args, {
    cwd: workDir,
    env: process.env,
    windowsHide: true
  });

  let buffer = '';

  activeProcess.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep partial trailing line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const eventData = JSON.parse(line.trim());
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'task_event',
            taskId,
            data: eventData
          }));
        }
      } catch (e) {
        // Line is raw text, send as delta
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'task_event',
            taskId,
            data: { event: 'raw_output', text: line }
          }));
        }
      }
    }
  });

  activeProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    console.warn(`[agy log]`, text.trim());
  });

  activeProcess.on('close', (code) => {
    console.log(`🏁 [Task ${taskId ? taskId.slice(0, 8) : ''}] Completed (exit code: ${code})`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'task_done',
        taskId,
        data: { exitCode: code }
      }));
    }
    activeProcess = null;
  });

  activeProcess.on('error', (err) => {
    console.error(`💥 Execution error:`, err.message);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'task_error',
        taskId,
        error: err.message
      }));
    }
    activeProcess = null;
  });
}

// Keep connection alive with heartbeat ping
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 25000);

// Start connection
connect();
