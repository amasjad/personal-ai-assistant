require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const { WebSocketServer } = require('ws');
const { sessionOps, messageOps, memoryOps, settingsOps } = require('./db');
const { streamChat, generateTitle, getApiKey } = require('./ai');
const { humanizeText, analyzeTextAILikeness, analyzeSentenceBreakdown, rerollSingleSentence } = require('./humanizer');
const { BridgeRelay } = require('./bridgeRelay');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Antigravity PC Bridge Relay
const bridgeRelay = new BridgeRelay(process.env.BRIDGE_SECRET_KEY);
const wss = new WebSocketServer({ server, path: '/ws/bridge' });
wss.on('connection', (ws, req) => {
  bridgeRelay.handleConnection(ws, req);
});

// Initialize default settings if missing
if (process.env.GEMINI_API_KEY && !settingsOps.get('gemini_api_key')) {
  settingsOps.set('gemini_api_key', process.env.GEMINI_API_KEY.trim());
}
if (!settingsOps.get('default_model') || settingsOps.get('default_model').includes('2.5') || settingsOps.get('default_model') === 'gemini-3.8-flash') {
  settingsOps.set('default_model', 'gemini-3.1-flash-lite');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Never cache HTML, Service Worker, or Manifest on mobile browsers/proxies
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.path === '/sw.js' || req.path === '/manifest.json') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- Sessions API -----------------
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = sessionOps.list();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const id = crypto.randomUUID();
    const title = (req.body.title || 'New Chat').trim();
    const session = sessionOps.create(id, title);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/:id', (req, res) => {
  try {
    const session = sessionOps.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const messages = messageOps.listBySession(req.params.id);
    res.json({ session, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sessions/:id', (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    sessionOps.updateTitle(req.params.id, title.trim());
    res.json({ success: true, title: title.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', (req, res) => {
  try {
    sessionOps.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Antigravity PC Bridge Status -----------------
app.get('/api/bridge/status', (req, res) => {
  res.json(bridgeRelay.getStatus());
});

// ----------------- Chat Streaming (SSE) -----------------
app.post('/api/chat/stream', async (req, res) => {
  let { sessionId, message, attachment, enableSearch, model, useBridge } = req.body;

  // Auto-generate sessionId if missing so request NEVER fails with 400
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    sessionId = 'sess-' + crypto.randomUUID();
  }
  if (!message && !attachment) {
    return res.status(400).json({ error: 'Message or attachment is required' });
  }

  // Ensure session exists
  let session = sessionOps.get(sessionId);
  if (!session) {
    session = sessionOps.create(sessionId, 'New Chat');
  }

  // Save user message to database
  const userMsgId = crypto.randomUUID();
  const userMsg = messageOps.create({
    id: userMsgId,
    sessionId: sessionId,
    role: 'user',
    content: message || '',
    attachmentName: attachment ? attachment.name : null,
    attachmentType: attachment ? attachment.mimeType : null,
    attachmentData: attachment ? attachment.data : null
  });

  // Fetch prior conversation history for context
  const priorMessages = messageOps.listBySession(sessionId).filter(m => m.id !== userMsgId);

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let selectedModel = model || settingsOps.get('default_model') || 'gemini-3.1-flash-lite';
  if (selectedModel.includes('2.5') || selectedModel === 'gemini-3.8-flash') {
    selectedModel = 'gemini-3.1-flash-lite';
  }
  const shouldSearch = enableSearch !== undefined ? Boolean(enableSearch) : (settingsOps.get('web_search_enabled') === 'true');

  // If user requested Antigravity PC Bridge execution
  if (useBridge || model === 'antigravity') {
    if (!bridgeRelay.isOnline()) {
      // Rather than hanging or throwing an error, notify user and answer immediately with Cloud AI!
      sendEvent('chunk', {
        text: `> 💻 _[PC Bridge Offline]_ Your computer is asleep or offline, answering directly via Cloud AI:\n\n`
      });
      // Fall through to streamChat below!
    } else {
      const taskId = crypto.randomUUID();
      let accumulatedText = '';

      try {
        const taskEmitter = bridgeRelay.executeTask(taskId, message || 'Hello', {
          conversationId: sessionId
        });

      taskEmitter.on('event', (data) => {
        if (!data) return;

        if (data.event === 'step_update' && data.step_update) {
          const su = data.step_update;
          if (su.text_delta) {
            accumulatedText += su.text_delta;
            sendEvent('chunk', { text: su.text_delta });
          } else if (su.step_type === 'tool_execution' || su.step_type === 'call_tool') {
            sendEvent('tool_call', {
              tool: su.tool_name || su.name || 'tool',
              state: su.state,
              info: su.description || ''
            });
          }
        } else if (data.event === 'result' && data.result) {
          if (data.result.response && !accumulatedText) {
            accumulatedText = data.result.response;
            sendEvent('chunk', { text: accumulatedText });
          }
        } else if (data.event === 'raw_output' && data.text) {
          accumulatedText += data.text + '\n';
          sendEvent('chunk', { text: data.text + '\n' });
        }
      });

      taskEmitter.on('done', (result) => {
        const modelMsgId = crypto.randomUUID();
        messageOps.create({
          id: modelMsgId,
          sessionId: sessionId,
          role: 'model',
          content: accumulatedText || 'Task completed.',
          groundingData: JSON.stringify({ mode: 'antigravity_cli' })
        });
        sendEvent('done', {
          id: modelMsgId,
          content: accumulatedText || 'Task completed.',
          groundingData: { mode: 'antigravity_cli' }
        });
        res.end();
      });

      taskEmitter.on('error', (err) => {
        sendEvent('error', { error: typeof err === 'string' ? err : (err.message || 'Execution error') });
        res.end();
      });

      return;
    } catch (err) {
      sendEvent('error', { error: err.message });
      res.end();
      return;
    }
    }
  }

  await streamChat({
    apiKey: getApiKey(),
    model: selectedModel,
    history: priorMessages,
    newMessage: message,
    attachment: attachment,
    enableSearch: shouldSearch,
    onChunk: (delta) => {
      sendEvent('chunk', { text: delta });
    },
    onGrounding: (groundingData) => {
      sendEvent('grounding', groundingData);
    },
    onComplete: async ({ fullText, groundingData }) => {
      // Save model reply to database
      const modelMsgId = crypto.randomUUID();
      messageOps.create({
        id: modelMsgId,
        sessionId: sessionId,
        role: 'model',
        content: fullText,
        groundingData: groundingData ? JSON.stringify(groundingData) : null
      });

      sendEvent('done', {
        id: modelMsgId,
        content: fullText,
        groundingData: groundingData
      });

      // If the session title is still default, auto-generate title in background
      if (session.title === 'New Chat' || priorMessages.length === 0) {
        generateTitle(getApiKey(), message || 'Image query', fullText).then(newTitle => {
          if (newTitle && newTitle !== 'New Chat') {
            sessionOps.updateTitle(sessionId, newTitle);
            sendEvent('title_updated', { title: newTitle });
          }
        }).catch(() => {});
      }

      res.end();
    },
    onError: (err) => {
      sendEvent('error', { error: err.message || 'Error communicating with Gemini' });
      res.end();
    }
  });
});

// ----------------- Memory Bank API -----------------
app.get('/api/memories', (req, res) => {
  try {
    const memories = memoryOps.list();
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memories', (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Memory content cannot be empty' });
    }
    const memory = memoryOps.add(content.trim(), category || 'general');
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/memories/:id', (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Memory content cannot be empty' });
    }
    memoryOps.update(req.params.id, content.trim(), category || 'general');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/memories/:id', (req, res) => {
  try {
    memoryOps.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Settings API -----------------
app.get('/api/settings', (req, res) => {
  try {
    const all = settingsOps.getAll();
    const envKey = process.env.GEMINI_API_KEY || '';
    res.json({
      ...all,
      has_env_key: Boolean(envKey && envKey.length > 5),
      masked_key: all.gemini_api_key ? (all.gemini_api_key.slice(0, 4) + '...' + all.gemini_api_key.slice(-4)) : (envKey ? 'Configured via .env' : '')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { gemini_api_key, default_model, web_search_enabled, system_persona } = req.body;
    if (gemini_api_key !== undefined && gemini_api_key !== 'Configured via .env') {
      settingsOps.set('gemini_api_key', gemini_api_key.trim());
    }
    if (default_model !== undefined) {
      settingsOps.set('default_model', default_model);
    }
    if (web_search_enabled !== undefined) {
      settingsOps.set('web_search_enabled', String(web_search_enabled));
    }
    if (system_persona !== undefined) {
      settingsOps.set('system_persona', system_persona.trim());
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- StealthWriter AI Humanizer & Detector API -----------------
app.post('/api/humanize', async (req, res) => {
  try {
    const { text, mode, level, tone, freezeWords } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text to humanize cannot be empty.' });
    }
    const result = await humanizeText({
      text: text.trim(),
      mode: mode || 'ghost',
      level: level || 'balanced',
      tone: tone || 'academic',
      freezeWords: freezeWords || []
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to humanize text' });
  }
});

app.post('/api/humanize/sentence', async (req, res) => {
  try {
    const { fullContext, targetSentence, tone, freezeWords } = req.body;
    if (!targetSentence || !targetSentence.trim()) {
      return res.status(400).json({ error: 'targetSentence is required.' });
    }
    const alternatives = await rerollSingleSentence({
      fullContext: fullContext || targetSentence,
      targetSentence: targetSentence.trim(),
      tone: tone || 'academic',
      freezeWords: freezeWords || []
    });
    res.json({ alternatives });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reroll sentence' });
  }
});

app.post('/api/humanize/scan', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty.' });
    }
    const sentences = analyzeSentenceBreakdown(text.trim());
    const overall = analyzeTextAILikeness(text.trim());
    res.json({ sentences, overall });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai-detect', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty.' });
    }
    const stats = analyzeTextAILikeness(text.trim());
    const sentences = analyzeSentenceBreakdown(text.trim());
    res.json({ ...stats, sentences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Personal AI Assistant running at http://localhost:${PORT}`);
  console.log(`📱 Available on local network at your computer's IP address (port ${PORT})`);
});
