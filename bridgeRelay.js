const { EventEmitter } = require('node:events');

class BridgeRelay extends EventEmitter {
  constructor(secretKey) {
    super();
    this.secretKey = secretKey || process.env.BRIDGE_SECRET_KEY || 'agy_bridge_sec_7f9e8d4a2b1c6e5f3091ab74cd82ef01';
    this.activeSocket = null;
    this.bridgeInfo = null;
    this.taskEmitters = new Map();
  }

  handleConnection(ws, req) {
    let isAuthenticated = false;

    ws.on('message', (messageRaw) => {
      try {
        const msg = JSON.parse(messageRaw.toString());
        if (msg.type === 'auth') {
          if (msg.secret && msg.secret.trim() === this.secretKey.trim()) {
            isAuthenticated = true;
            this.activeSocket = ws;
            this.bridgeInfo = {
              machine: msg.machine || 'Local PC',
              cwd: msg.cwd || '',
              connectedAt: Date.now()
            };
            ws.send(JSON.stringify({ type: 'auth_ok' }));
            console.log(`🔌 Antigravity PC Bridge connected: ${this.bridgeInfo.machine} (${this.bridgeInfo.cwd})`);
            this.emit('status_change', { online: true, info: this.bridgeInfo });
          } else {
            console.warn('❌ Bridge auth rejected: invalid secret key');
            ws.send(JSON.stringify({ type: 'auth_fail', error: 'Invalid secret key' }));
            ws.close();
          }
          return;
        }

        if (!isAuthenticated) {
          ws.close();
          return;
        }

        if (msg.type === 'task_event') {
          const emitter = this.taskEmitters.get(msg.taskId);
          if (emitter) {
            emitter.emit('event', msg.data);
          }
        } else if (msg.type === 'task_done') {
          const emitter = this.taskEmitters.get(msg.taskId);
          if (emitter) {
            emitter.emit('done', msg.data);
            this.taskEmitters.delete(msg.taskId);
          }
        } else if (msg.type === 'task_error') {
          const emitter = this.taskEmitters.get(msg.taskId);
          if (emitter) {
            emitter.emit('error', msg.error);
            this.taskEmitters.delete(msg.taskId);
          }
        } else if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Bridge WS parse error:', err.message);
      }
    });

    ws.on('close', () => {
      if (this.activeSocket === ws) {
        console.log('🔌 Antigravity PC Bridge disconnected');
        this.activeSocket = null;
        this.bridgeInfo = null;
        this.emit('status_change', { online: false });
      }
    });

    ws.on('error', (err) => {
      console.error('Bridge socket error:', err.message);
    });
  }

  isOnline() {
    return Boolean(this.activeSocket && this.activeSocket.readyState === 1);
  }

  getStatus() {
    return {
      online: this.isOnline(),
      machine: this.bridgeInfo ? this.bridgeInfo.machine : null,
      cwd: this.bridgeInfo ? this.bridgeInfo.cwd : null,
      connectedAt: this.bridgeInfo ? this.bridgeInfo.connectedAt : null
    };
  }

  executeTask(taskId, prompt, options = {}) {
    if (!this.isOnline()) {
      throw new Error('Antigravity PC Bridge is currently offline. Ensure your computer is awake and run-bridge.bat is running.');
    }

    const emitter = new EventEmitter();
    this.taskEmitters.set(taskId, emitter);

    this.activeSocket.send(JSON.stringify({
      type: 'execute',
      taskId,
      prompt,
      conversationId: options.conversationId,
      dir: options.dir
    }));

    return emitter;
  }
}

module.exports = { BridgeRelay };
