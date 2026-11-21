// Personal AI Assistant - Frontend Application Logic

// ==================== STATE MANAGEMENT ====================
const state = {
  currentSessionId: null,
  sessions: [],
  memories: [],
  settings: {
    gemini_api_key: '',
    default_model: 'gemini-3.8-flash',
    web_search_enabled: false,
    system_persona: '',
    selected_voice: ''
  },
  webSearchEnabled: false,
  autoSpeechEnabled: false,
  currentAttachment: null,
  isRecordingVoice: false,
  isGenerating: false,
  currentView: 'chat',
  humanizerMode: 'ghost',
  humanizerLevel: '5',
  humanizerTone: 'academic',
  isScanView: false,
  sentenceScanData: [],
  isHumanizing: false,
  humanizerDrafts: [],
  activeDraftIndex: 0,
  activeSpeechUtterance: null,
  activeSpeakerMsgId: null,
  abortController: null,
  voices: [],
  antigravityMode: false,
  bridgeOnline: false
};

// ==================== DOM ELEMENTS ====================
const elements = {
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  openSidebarBtn: document.getElementById('open-sidebar-btn'),
  closeSidebarBtn: document.getElementById('close-sidebar-btn'),
  newChatBtn: document.getElementById('new-chat-btn'),
  searchSessionsInput: document.getElementById('search-sessions-input'),
  sessionsList: document.getElementById('sessions-list'),
  openMemoryBtn: document.getElementById('open-memory-btn'),
  memoryCountBadge: document.getElementById('memory-count-badge'),
  openSettingsBtn: document.getElementById('open-settings-btn'),
  activeModelTag: document.getElementById('active-model-tag'),

  // Header
  currentChatTitle: document.getElementById('current-chat-title'),
  headerSearchChip: document.getElementById('header-search-chip'),
  searchChipState: document.getElementById('search-chip-state'),
  headerSpeechChip: document.getElementById('header-speech-chip'),
  speechChipState: document.getElementById('speech-chip-state'),
  headerTabChat: document.getElementById('header-tab-chat'),
  headerTabHumanizer: document.getElementById('header-tab-humanizer'),
  sidebarTabChat: document.getElementById('sidebar-tab-chat'),
  sidebarTabHumanizer: document.getElementById('sidebar-tab-humanizer'),
  headerChatToggles: document.getElementById('header-chat-toggles'),

  // Views
  viewChat: document.getElementById('view-chat'),
  viewHumanizer: document.getElementById('view-humanizer'),

  // StealthWriter Humanizer Elements
  draftsTabBar: document.getElementById('drafts-tab-bar'),
  humanizerInput: document.getElementById('humanizer-input'),
  humanizerOutput: document.getElementById('humanizer-output'),
  humanizerFreezeInput: document.getElementById('humanizer-freeze-input'),
  runHumanizeBtn: document.getElementById('run-humanize-btn'),
  pasteInputBtn: document.getElementById('paste-input-btn'),
  sampleInputBtn: document.getElementById('sample-input-btn'),
  clearInputBtn: document.getElementById('clear-input-btn'),
  copyHumanizedBtn: document.getElementById('copy-humanized-btn'),
  speakHumanizedBtn: document.getElementById('speak-humanized-btn'),
  inputWordCount: document.getElementById('input-word-count'),
  inputCharCount: document.getElementById('input-char-count'),
  outputWordCount: document.getElementById('output-word-count'),
  inputDetectionBadge: document.getElementById('input-detection-badge'),
  inputDetectionText: document.getElementById('input-detection-text'),
  outputScoreBadge: document.getElementById('output-score-badge'),
  outputScoreText: document.getElementById('output-score-text'),
  outputFunctionWordsChip: document.getElementById('output-function-words-chip'),
  detectorsBadgeRow: document.getElementById('detectors-badge-row'),
  modeBtns: document.querySelectorAll('.humanizer-mode-btn'),
  levelBtns: document.querySelectorAll('.humanizer-level-btn'),
  humanizerToneSelect: document.getElementById('humanizer-tone-select'),
  toggleSentenceScanBtn: document.getElementById('toggle-sentence-scan-btn'),
  sentenceScanContainer: document.getElementById('sentence-scan-container'),
  scanBtnLabel: document.getElementById('scan-btn-label'),

  // Live StealthWriter Embedded Elements
  swTabTool: document.getElementById('sw-tab-tool'),
  swTabDashboard: document.getElementById('sw-tab-dashboard'),
  swTabBuiltin: document.getElementById('sw-tab-builtin'),
  swPopoutBtn: document.getElementById('sw-popout-btn'),
  swCopyChatBtn: document.getElementById('sw-copy-chat-btn'),
  swReloadBtn: document.getElementById('sw-reload-btn'),
  swExternalBtn: document.getElementById('sw-external-btn'),
  stealthwriterLiveContainer: document.getElementById('stealthwriter-live-container'),
  stealthwriterBuiltinContainer: document.getElementById('stealthwriter-builtin-container'),
  stealthwriterIframe: document.getElementById('stealthwriter-iframe'),
  stealthwriterClipboardBanner: document.getElementById('stealthwriter-clipboard-banner'),
  stealthwriterClipboardText: document.getElementById('stealthwriter-clipboard-text'),
  closeClipboardBannerBtn: document.getElementById('close-clipboard-banner-btn'),

  // Chat Area
  messagesContainer: document.getElementById('messages-container'),
  welcomeHero: document.getElementById('welcome-hero'),

  // Input Area
  attachmentPreviewContainer: document.getElementById('attachment-preview-container'),
  attachmentPreviewImg: document.getElementById('attachment-preview-img'),
  attachmentPreviewIcon: document.getElementById('attachment-preview-icon'),
  attachmentPreviewName: document.getElementById('attachment-preview-name'),
  attachmentPreviewSize: document.getElementById('attachment-preview-size'),
  removeAttachmentBtn: document.getElementById('remove-attachment-btn'),
  voiceRecordingBanner: document.getElementById('voice-recording-banner'),
  stopVoiceBtn: document.getElementById('stop-voice-btn'),
  chatInput: document.getElementById('chat-input'),
  fileUploadInput: document.getElementById('file-upload-input'),
  uploadBtn: document.getElementById('upload-btn'),
  toggleSearchBtn: document.getElementById('toggle-search-btn'),
  toggleAntigravityBtn: document.getElementById('toggle-antigravity-btn'),
  antigravityStateBadge: document.getElementById('antigravity-state-badge'),
  headerBridgeChip: document.getElementById('header-bridge-chip'),
  bridgeDot: document.getElementById('bridge-dot'),
  bridgeText: document.getElementById('bridge-text'),
  composerHumanizeBtn: document.getElementById('composer-humanize-btn'),
  micBtn: document.getElementById('mic-btn'),
  sendBtn: document.getElementById('send-btn'),
  stopGenerationBtn: document.getElementById('stop-generation-btn'),

  // Memory Modal
  memoryModal: document.getElementById('memory-modal'),
  closeMemoryModalBtn: document.getElementById('close-memory-modal-btn'),
  addMemoryForm: document.getElementById('add-memory-form'),
  newMemoryInput: document.getElementById('new-memory-input'),
  memoriesList: document.getElementById('memories-list'),

  // Settings Modal
  settingsModal: document.getElementById('settings-modal'),
  closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'),
  settingApiKey: document.getElementById('setting-api-key'),
  settingModel: document.getElementById('setting-model'),
  settingPersona: document.getElementById('setting-persona'),
  settingVoice: document.getElementById('setting-voice'),
  saveSettingsBtn: document.getElementById('save-settings-btn')
};

// ==================== MARKDOWN CONFIGURATION ====================
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// Custom renderer to wrap code blocks with header and copy button
const renderer = new marked.Renderer();
const originalCodeRenderer = renderer.code.bind(renderer);
renderer.code = function ({ text, lang }) {
  const language = lang || 'code';
  const highlighted = (language && hljs.getLanguage(language))
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value;

  const escapedText = encodeURIComponent(text);
  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="font-mono text-slate-400 lowercase">${language}</span>
        <button class="code-copy-btn" onclick="copyCode(this, '${escapedText}')">
          <i data-lucide="copy" class="w-3.5 h-3.5 inline"></i>
          <span>Copy</span>
        </button>
      </div>
      <pre><code class="hljs ${language}">${highlighted}</code></pre>
    </div>
  `;
};
marked.use({ renderer });

// Global function for code copy button
window.copyCode = function (button, encodedText) {
  const code = decodeURIComponent(encodedText);
  navigator.clipboard.writeText(code).then(() => {
    button.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 inline text-emerald-400"></i> <span class="text-emerald-400">Copied!</span>';
    lucide.createIcons();
    setTimeout(() => {
      button.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5 inline"></i> <span>Copy</span>';
      lucide.createIcons();
    }, 2000);
  });
};

// ==================== SPEECH SYNTHESIS (TTS) ====================
function initSpeechSynthesis() {
  if (!('speechSynthesis' in window)) return;

  const populateVoices = () => {
    state.voices = window.speechSynthesis.getVoices();
    elements.settingVoice.innerHTML = '<option value="">System Default Voice</option>';
    
    // Sort English/Natural voices to the top
    const sorted = [...state.voices].sort((a, b) => {
      const aEn = a.lang.startsWith('en') ? 1 : 0;
      const bEn = b.lang.startsWith('en') ? 1 : 0;
      return bEn - aEn;
    });

    for (const voice of sorted) {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      if (voice.name === state.settings.selected_voice) {
        option.selected = true;
      }
      elements.settingVoice.appendChild(option);
    }
  };

  populateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
}

function speakText(text, messageId = null) {
  if (!('speechSynthesis' in window)) return;

  // If already speaking this message, stop it
  if (state.activeSpeakerMsgId === messageId && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    state.activeSpeakerMsgId = null;
    updateSpeakerIcons();
    return;
  }

  window.speechSynthesis.cancel();

  // Strip code blocks and markdown for clean speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>-]/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  if (state.settings.selected_voice) {
    const matchedVoice = state.voices.find(v => v.name === state.settings.selected_voice);
    if (matchedVoice) utterance.voice = matchedVoice;
  }

  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  state.activeSpeakerMsgId = messageId;
  updateSpeakerIcons();

  utterance.onend = () => {
    state.activeSpeakerMsgId = null;
    updateSpeakerIcons();
  };

  utterance.onerror = () => {
    state.activeSpeakerMsgId = null;
    updateSpeakerIcons();
  };

  window.speechSynthesis.speak(utterance);
}

function updateSpeakerIcons() {
  document.querySelectorAll('.msg-speak-btn').forEach(btn => {
    const msgId = btn.getAttribute('data-msg-id');
    if (msgId === state.activeSpeakerMsgId) {
      btn.classList.add('text-indigo-400');
      btn.innerHTML = '<i data-lucide="square" class="w-3.5 h-3.5 fill-current"></i>';
    } else {
      btn.classList.remove('text-indigo-400');
      btn.innerHTML = '<i data-lucide="volume-2" class="w-3.5 h-3.5"></i>';
    }
  });
  lucide.createIcons();
}

// ==================== SPEECH RECOGNITION (VOICE NOTES) ====================
let speechRecognitionInstance = null;

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.micBtn.title = 'Speech recognition not supported in this browser';
    return;
  }

  speechRecognitionInstance = new SpeechRecognition();
  speechRecognitionInstance.continuous = true;
  speechRecognitionInstance.interimResults = true;
  speechRecognitionInstance.lang = 'en-US';

  let originalTextBeforeSpeech = '';

  speechRecognitionInstance.onstart = () => {
    state.isRecordingVoice = true;
    originalTextBeforeSpeech = elements.chatInput.value;
    elements.micBtn.classList.add('recording-pulse');
    elements.voiceRecordingBanner.classList.remove('hidden');
  };

  speechRecognitionInstance.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const spacer = originalTextBeforeSpeech.length > 0 && !originalTextBeforeSpeech.endsWith(' ') ? ' ' : '';
    elements.chatInput.value = originalTextBeforeSpeech + spacer + transcript;
    autoResizeTextarea();
  };

  speechRecognitionInstance.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopRecordingVoice();
  };

  speechRecognitionInstance.onend = () => {
    state.isRecordingVoice = false;
    elements.micBtn.classList.remove('recording-pulse');
    elements.voiceRecordingBanner.classList.add('hidden');
  };
}

function toggleVoiceRecording() {
  if (!speechRecognitionInstance) {
    alert('Voice input is best supported in Google Chrome, Microsoft Edge, or Safari.');
    return;
  }

  if (state.isRecordingVoice) {
    stopRecordingVoice();
  } else {
    try {
      speechRecognitionInstance.start();
    } catch (e) {
      speechRecognitionInstance.stop();
    }
  }
}

function stopRecordingVoice() {
  if (speechRecognitionInstance && state.isRecordingVoice) {
    speechRecognitionInstance.stop();
  }
}

// ==================== AUTO RESIZE TEXTAREA ====================
function autoResizeTextarea() {
  const textarea = elements.chatInput;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
}

// ==================== SESSIONS MANAGEMENT ====================
async function loadSessions() {
  try {
    const res = await fetch('/api/sessions');
    state.sessions = await res.json();
    renderSessionsList();

    if (state.sessions.length > 0 && !state.currentSessionId) {
      selectSession(state.sessions[0].id);
    } else if (state.sessions.length === 0) {
      createNewSession();
    }
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
}

function renderSessionsList(filterText = '') {
  elements.sessionsList.innerHTML = '';
  const filtered = state.sessions.filter(s => 
    s.title.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    elements.sessionsList.innerHTML = `
      <div class="p-3 text-center text-xs text-slate-500">
        No conversations found
      </div>
    `;
    return;
  }

  filtered.forEach(session => {
    const isSelected = session.id === state.currentSessionId;
    const item = document.createElement('div');
    item.className = `group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
      isSelected
        ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/30'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
    }`;
    item.setAttribute('data-id', session.id);

    item.innerHTML = `
      <div class="flex items-center gap-2.5 truncate flex-1 min-w-0" onclick="selectSession('${session.id}')">
        <i data-lucide="message-square" class="w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}"></i>
        <span class="truncate session-title-text">${escapeHtml(session.title)}</span>
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button title="Rename" class="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10" onclick="renameSessionPrompt(event, '${session.id}', '${escapeHtml(session.title)}')">
          <i data-lucide="edit-2" class="w-3 h-3"></i>
        </button>
        <button title="Delete" class="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-white/10" onclick="deleteSessionConfirm(event, '${session.id}')">
          <i data-lucide="trash" class="w-3 h-3"></i>
        </button>
      </div>
    `;

    elements.sessionsList.appendChild(item);
  });

  lucide.createIcons();
}

async function createNewSession() {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' })
    });
    const session = await res.json();
    state.sessions.unshift(session);
    selectSession(session.id);
    renderSessionsList();
    closeMobileSidebar();
  } catch (err) {
    console.error('Failed to create new session:', err);
  }
}

async function selectSession(sessionId) {
  state.currentSessionId = sessionId;
  renderSessionsList();

  const current = state.sessions.find(s => s.id === sessionId);
  elements.currentChatTitle.textContent = current ? current.title : 'Conversation';

  // Load messages for this session
  try {
    const res = await fetch(`/api/sessions/${sessionId}`);
    const data = await res.json();
    renderMessages(data.messages || []);
    closeMobileSidebar();
  } catch (err) {
    console.error('Failed to load session messages:', err);
  }
}

async function renameSessionPrompt(e, sessionId, oldTitle) {
  e.stopPropagation();
  const newTitle = prompt('Rename conversation:', oldTitle);
  if (!newTitle || newTitle.trim() === '' || newTitle === oldTitle) return;

  try {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    const session = state.sessions.find(s => s.id === sessionId);
    if (session) session.title = newTitle.trim();
    if (state.currentSessionId === sessionId) {
      elements.currentChatTitle.textContent = newTitle.trim();
    }
    renderSessionsList();
  } catch (err) {
    console.error('Failed to rename session:', err);
  }
}

async function deleteSessionConfirm(e, sessionId) {
  e.stopPropagation();
  if (!confirm('Are you sure you want to delete this conversation?')) return;

  try {
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    state.sessions = state.sessions.filter(s => s.id !== sessionId);
    if (state.currentSessionId === sessionId) {
      if (state.sessions.length > 0) {
        selectSession(state.sessions[0].id);
      } else {
        createNewSession();
      }
    } else {
      renderSessionsList();
    }
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
}

// ==================== MESSAGE RENDERING ====================
function renderMessages(messages) {
  elements.messagesContainer.innerHTML = '';

  if (messages.length === 0) {
    elements.welcomeHero.classList.remove('hidden');
    elements.messagesContainer.appendChild(elements.welcomeHero);
    return;
  }

  elements.welcomeHero.classList.add('hidden');

  for (const msg of messages) {
    appendMessageToDOM(msg);
  }

  scrollToBottom();
  lucide.createIcons();
}

function renderDeepSeekMarkdown(rawText, isStreaming = false) {
  if (!rawText) return '';

  let text = rawText;
  let thinkingHtml = '';

  // Check if complete <think>...</think> exists
  const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const thought = thinkMatch[1].trim();
    text = text.replace(/<think>[\s\S]*?<\/think>/i, '').trim();

    if (thought) {
      thinkingHtml = `
        <details class="deepseek-thinking-accordion mb-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 overflow-hidden shadow-sm" open>
          <summary class="px-3.5 py-2 text-xs font-semibold text-sky-400 bg-sky-950/40 flex items-center justify-between cursor-pointer select-none hover:bg-sky-950/60 transition-colors">
            <div class="flex items-center gap-2">
              <i data-lucide="brain-circuit" class="w-3.5 h-3.5 text-sky-400"></i>
              <span>Thought Process (DeepSeek Reasoning)</span>
            </div>
            <span class="text-[10px] text-sky-300/70 font-mono">Deep Research Mode</span>
          </summary>
          <div class="p-3.5 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap border-t border-sky-500/20 bg-slate-950/60 max-h-80 overflow-y-auto">
            ${escapeHtml(thought)}
          </div>
        </details>
      `;
    }
  } else if (text.includes('<think>')) {
    // Currently streaming inside <think>
    const thought = text.replace('<think>', '').trim();
    thinkingHtml = `
      <div class="deepseek-thinking-accordion mb-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 overflow-hidden p-3 text-xs font-mono text-sky-300/90 leading-relaxed shadow-sm">
        <div class="flex items-center gap-2 mb-2 font-semibold text-sky-400">
          <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>
          <span>DeepSeek Thinking in progress...</span>
        </div>
        <div class="whitespace-pre-wrap max-h-60 overflow-y-auto text-slate-300">${escapeHtml(thought)}</div>
      </div>
    `;
    text = '';
  }

  const parsedBody = text ? marked.parse(text) : '';
  return thinkingHtml + parsedBody;
}

function appendMessageToDOM(msg, isStreaming = false) {
  const isUser = msg.role === 'user';
  const msgWrapper = document.createElement('div');
  msgWrapper.className = `flex gap-2 sm:gap-3 max-w-3xl mx-auto w-full ${isUser ? 'justify-end' : 'justify-start'}`;
  msgWrapper.id = `msg-${msg.id}`;

  if (isUser) {
    let attachmentHtml = '';
    if (msg.attachment_data && msg.attachment_type) {
      if (msg.attachment_type.startsWith('image/')) {
        attachmentHtml = `
          <div class="mb-2">
            <img src="data:${msg.attachment_type};base64,${msg.attachment_data}" class="max-h-60 rounded-xl border border-white/10 object-contain shadow-md" />
          </div>
        `;
      } else {
        attachmentHtml = `
          <div class="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300">
            <i data-lucide="file" class="w-4 h-4"></i>
            <span>${escapeHtml(msg.attachment_name || 'Attached file')}</span>
          </div>
        `;
      }
    }

    msgWrapper.innerHTML = `
      <div class="max-w-[88%] sm:max-w-[75%] space-y-1">
        ${attachmentHtml}
        <div class="bg-indigo-600 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tr-sm text-sm shadow-md whitespace-pre-wrap leading-relaxed break-words">
          ${escapeHtml(msg.content)}
        </div>
      </div>
    `;
  } else {
    // Model Message
    let groundingHtml = '';
    if (msg.grounding_data) {
      try {
        const gd = typeof msg.grounding_data === 'string' ? JSON.parse(msg.grounding_data) : msg.grounding_data;
        if (gd.groundingChunks && gd.groundingChunks.length > 0) {
          const linksHtml = gd.groundingChunks.slice(0, 5).map(c => `
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 text-[11px] transition-colors truncate max-w-[200px]">
              <i data-lucide="globe" class="w-3 h-3 flex-shrink-0"></i>
              <span class="truncate">${escapeHtml(c.title)}</span>
              <i data-lucide="arrow-up-right" class="w-2.5 h-2.5 flex-shrink-0"></i>
            </a>
          `).join('');

          groundingHtml = `
            <div class="mb-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <div class="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                <i data-lucide="search" class="w-3 h-3"></i>
                <span>Google Search Sources:</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${linksHtml}
              </div>
            </div>
          `;
        }
      } catch (e) {}
    }

    const htmlContent = renderDeepSeekMarkdown(msg.content || '', isStreaming);

    msgWrapper.innerHTML = `
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/10">
        <i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"></i>
      </div>
      <div class="flex-1 min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-[85%] space-y-1.5 sm:space-y-2">
        <div id="grounding-box-${msg.id}">
          ${groundingHtml}
        </div>
        <div class="markdown-body bg-slate-900/70 border border-white/5 p-3 sm:p-4 rounded-2xl rounded-tl-sm text-sm break-words overflow-hidden ${isStreaming ? 'typing-cursor' : ''}" id="content-${msg.id}">
          ${htmlContent}
        </div>
        <div class="flex items-center gap-2 pt-0.5 sm:pt-1">
          <button class="msg-speak-btn p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs" data-msg-id="${msg.id}" title="Read aloud" onclick="speakText(document.getElementById('content-${msg.id}').innerText, '${msg.id}')">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
          </button>
          <button class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs" title="Copy full response" onclick="copyFullMessage('${msg.id}')">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button class="msg-humanize-btn p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-xs flex items-center gap-1" title="Humanize this answer with StealthWriter" onclick="humanizeFromChat('${msg.id}')">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span class="text-[11px] font-medium hidden sm:inline text-emerald-400/90">Humanize</span>
          </button>
        </div>
      </div>
    `;
  }

  elements.messagesContainer.appendChild(msgWrapper);
  scrollToBottom();
  lucide.createIcons();
}

window.copyFullMessage = function (msgId) {
  const contentEl = document.getElementById(`content-${msgId}`);
  if (contentEl) {
    navigator.clipboard.writeText(contentEl.innerText).then(() => {
      alert('Message copied to clipboard!');
    });
  }
};

function scrollToBottom() {
  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// ==================== SEND MESSAGE & SSE STREAM ====================
async function handleSendMessage() {
  const messageText = elements.chatInput.value.trim();
  const attachment = state.currentAttachment;

  if (!messageText && !attachment) return;
  if (state.isGenerating) return;

  // Stop recording if active
  stopRecordingVoice();

  // Clear inputs
  elements.chatInput.value = '';
  autoResizeTextarea();
  clearAttachment();

  // Hide welcome hero if first message
  elements.welcomeHero.classList.add('hidden');

  // Render user message immediately
  const tempUserMsg = {
    id: 'user-' + Date.now(),
    role: 'user',
    content: messageText,
    attachment_name: attachment ? attachment.name : null,
    attachment_type: attachment ? attachment.mimeType : null,
    attachment_data: attachment ? attachment.data : null
  };
  appendMessageToDOM(tempUserMsg);

  // Prepare streaming placeholder for AI message
  const assistantMsgId = 'model-' + Date.now();
  const tempAssistantMsg = {
    id: assistantMsgId,
    role: 'model',
    content: ''
  };
  appendMessageToDOM(tempAssistantMsg, true);

  const assistantContentEl = document.getElementById(`content-${assistantMsgId}`);
  const assistantGroundingEl = document.getElementById(`grounding-box-${assistantMsgId}`);

  // Set generating state
  setGenerating(true);

  let accumulatedText = '';
  let groundingDataReceived = null;

  try {
    state.abortController = new AbortController();

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.currentSessionId,
        message: messageText,
        attachment: attachment,
        enableSearch: state.webSearchEnabled,
        model: state.settings.default_model,
        useBridge: state.antigravityMode
      }),
      signal: state.abortController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep partial line

      let currentEvent = null;

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ')) {
          const rawData = line.substring(6).trim();
          try {
            const data = JSON.parse(rawData);
            
            if (currentEvent === 'chunk' || !currentEvent) {
              if (data.text) {
                accumulatedText += data.text;
                assistantContentEl.innerHTML = renderDeepSeekMarkdown(accumulatedText, true);
                lucide.createIcons();
                scrollToBottom();
              }
            } else if (currentEvent === 'grounding') {
              groundingDataReceived = data;
              if (data.groundingChunks && data.groundingChunks.length > 0) {
                const chips = data.groundingChunks.map(c => `
                  <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 text-[11px] transition-colors truncate max-w-[200px]">
                    <i data-lucide="globe" class="w-3 h-3 flex-shrink-0"></i>
                    <span class="truncate">${escapeHtml(c.title)}</span>
                    <i data-lucide="arrow-up-right" class="w-2.5 h-2.5 flex-shrink-0"></i>
                  </a>
                `).join('');

                assistantGroundingEl.innerHTML = `
                  <div class="mb-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                    <div class="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                      <i data-lucide="search" class="w-3 h-3"></i>
                      <span>Google Search Sources:</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                      ${chips}
                    </div>
                  </div>
                `;
                lucide.createIcons();
              }
            } else if (currentEvent === 'title_updated') {
              if (data.title) {
                const current = state.sessions.find(s => s.id === state.currentSessionId);
                if (current) current.title = data.title;
                elements.currentChatTitle.textContent = data.title;
                renderSessionsList();
              }
            } else if (currentEvent === 'tool_call') {
              const toolLabel = `\n> ⚡ **[Antigravity]** \`${escapeHtml(data.tool)}\` ${data.info ? `— _${escapeHtml(data.info)}_` : ''}\n\n`;
              accumulatedText += toolLabel;
              assistantContentEl.innerHTML = renderDeepSeekMarkdown(accumulatedText, true);
            } else if (currentEvent === 'error') {
              accumulatedText = `⚠️ **Error:** ${data.error || 'Failed to generate response'}`;
              assistantContentEl.innerHTML = renderDeepSeekMarkdown(accumulatedText, false);
              return;
            }
          } catch (e) {
            // Ignore json parse error for malformed SSE chunks
          }
        }
      }
    }

    // Done streaming: remove cursor & render final clean markdown
    assistantContentEl.classList.remove('typing-cursor');
    assistantContentEl.innerHTML = renderDeepSeekMarkdown(accumulatedText, false);
    lucide.createIcons();

    // Auto-read voice response if enabled
    if (state.autoSpeechEnabled && accumulatedText) {
      speakText(accumulatedText, assistantMsgId);
    }

    // Refresh memory count badge (in case a memory was auto-saved)
    loadMemories();

  } catch (err) {
    if (err.name === 'AbortError') {
      assistantContentEl.innerHTML += '<p class="text-xs text-amber-400 mt-2 font-mono">Generation stopped by user.</p>';
    } else {
      assistantContentEl.innerHTML += `<p class="text-xs text-red-400 mt-2 font-mono">Error: ${escapeHtml(err.message)}</p>`;
    }
    assistantContentEl.classList.remove('typing-cursor');
  } finally {
    setGenerating(false);
  }
}

function setGenerating(isGenerating) {
  state.isGenerating = isGenerating;
  if (isGenerating) {
    elements.sendBtn.classList.add('hidden');
    elements.stopGenerationBtn.classList.remove('hidden');
  } else {
    elements.sendBtn.classList.remove('hidden');
    elements.stopGenerationBtn.classList.add('hidden');
  }
}

function stopGeneration() {
  if (state.abortController) {
    state.abortController.abort();
  }
  setGenerating(false);
}

// ==================== ATTACHMENTS (VISION & DOCS) ====================
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64String = event.target.result.split(',')[1];
    state.currentAttachment = {
      name: file.name,
      mimeType: file.type,
      data: base64String,
      size: formatFileSize(file.size)
    };

    // Show preview
    elements.attachmentPreviewName.textContent = file.name;
    elements.attachmentPreviewSize.textContent = formatFileSize(file.size);
    elements.attachmentPreviewContainer.classList.remove('hidden');

    if (file.type.startsWith('image/')) {
      elements.attachmentPreviewImg.src = event.target.result;
      elements.attachmentPreviewImg.classList.remove('hidden');
      elements.attachmentPreviewIcon.classList.add('hidden');
    } else {
      elements.attachmentPreviewImg.classList.add('hidden');
      elements.attachmentPreviewIcon.classList.remove('hidden');
    }

    lucide.createIcons();
  };
  reader.readAsDataURL(file);
}

function clearAttachment() {
  state.currentAttachment = null;
  elements.fileUploadInput.value = '';
  elements.attachmentPreviewContainer.classList.add('hidden');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ==================== TOGGLES (SEARCH & SPEECH) ====================
function toggleWebSearch() {
  state.webSearchEnabled = !state.webSearchEnabled;
  updateSearchUI();
}

function updateSearchUI() {
  if (state.webSearchEnabled) {
    elements.headerSearchChip.classList.add('border-sky-500/50', 'bg-sky-950/60', 'text-sky-300', 'shadow-sm', 'shadow-sky-500/20');
    elements.headerSearchChip.classList.remove('border-white/10', 'bg-slate-900', 'text-slate-400');
    elements.searchChipState.textContent = 'ON (DeepSeek)';
    elements.searchChipState.classList.add('text-sky-400');

    elements.toggleSearchBtn.classList.add('text-sky-400', 'bg-sky-950/40', 'border-sky-500/30');
    elements.toggleSearchBtn.classList.remove('text-slate-400', 'border-transparent');
  } else {
    elements.headerSearchChip.classList.remove('border-sky-500/50', 'bg-sky-950/60', 'text-sky-300', 'shadow-sm', 'shadow-sky-500/20');
    elements.headerSearchChip.classList.add('border-white/10', 'bg-slate-900', 'text-slate-400');
    elements.searchChipState.textContent = 'OFF';
    elements.searchChipState.classList.remove('text-sky-400');

    elements.toggleSearchBtn.classList.remove('text-sky-400', 'bg-sky-950/40', 'border-sky-500/30');
    elements.toggleSearchBtn.classList.add('text-slate-400', 'border-transparent');
  }
}

function toggleAutoSpeech() {
  state.autoSpeechEnabled = !state.autoSpeechEnabled;
  updateSpeechUI();
}

function updateSpeechUI() {
  if (state.autoSpeechEnabled) {
    elements.headerSpeechChip.classList.add('border-indigo-500/50', 'bg-indigo-950/40', 'text-indigo-300');
    elements.headerSpeechChip.classList.remove('border-white/10', 'bg-slate-900', 'text-slate-400');
    elements.speechChipState.textContent = 'ON';
    elements.speechChipState.classList.add('text-indigo-400');
  } else {
    elements.headerSpeechChip.classList.remove('border-indigo-500/50', 'bg-indigo-950/40', 'text-indigo-300');
    elements.headerSpeechChip.classList.add('border-white/10', 'bg-slate-900', 'text-slate-400');
    elements.speechChipState.textContent = 'OFF';
    elements.speechChipState.classList.remove('text-indigo-400');
  }
}

// ==================== MEMORY BANK MODAL ====================
async function loadMemories() {
  try {
    const res = await fetch('/api/memories');
    state.memories = await res.json();
    elements.memoryCountBadge.textContent = state.memories.length;
    renderMemoriesList();
  } catch (err) {
    console.error('Failed to load memories:', err);
  }
}

function renderMemoriesList() {
  elements.memoriesList.innerHTML = '';

  if (state.memories.length === 0) {
    elements.memoriesList.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500">
        <i data-lucide="brain" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <p>No long-term memories saved yet.</p>
        <p class="text-[11px] text-slate-600 mt-1">Add facts above or chat with the bot—it learns automatically!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  state.memories.forEach(mem => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-200 group';
    card.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 pr-2">
        <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
          mem.category === 'auto'
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
        }">${escapeHtml(mem.category)}</span>
        <span class="leading-relaxed">${escapeHtml(mem.content)}</span>
      </div>
      <button class="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 transition-opacity" onclick="deleteMemory(${mem.id})">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    `;
    elements.memoriesList.appendChild(card);
  });

  lucide.createIcons();
}

async function handleAddMemory(e) {
  e.preventDefault();
  const text = elements.newMemoryInput.value.trim();
  if (!text) return;

  try {
    await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, category: 'personal' })
    });
    elements.newMemoryInput.value = '';
    loadMemories();
  } catch (err) {
    console.error('Failed to add memory:', err);
  }
}

window.deleteMemory = async function (id) {
  try {
    await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    loadMemories();
  } catch (err) {
    console.error('Failed to delete memory:', err);
  }
};

// ==================== SETTINGS MODAL ====================
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    state.settings = { ...state.settings, ...data };

    if (data.gemini_api_key) {
      elements.settingApiKey.value = data.gemini_api_key;
    } else if (data.has_env_key) {
      elements.settingApiKey.placeholder = 'Configured via .env';
    }

    if (data.default_model) {
      elements.settingModel.value = data.default_model;
      updateActiveModelTag(data.default_model);
    }

    if (data.system_persona) {
      elements.settingPersona.value = data.system_persona;
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function updateActiveModelTag(model) {
  if (model.includes('3.8-flash')) elements.activeModelTag.textContent = 'Gemini 3.8 Flash';
  else if (model.includes('3.5-flash')) elements.activeModelTag.textContent = 'Gemini 3.5 Flash';
  else if (model.includes('3.1-flash')) elements.activeModelTag.textContent = 'Gemini 3.1 Flash';
  else if (model.includes('2.5-pro')) elements.activeModelTag.textContent = 'Gemini 2.5 Pro';
  else if (model.includes('2.5-flash')) elements.activeModelTag.textContent = 'Gemini 2.5 Flash';
  else elements.activeModelTag.textContent = model;
}

async function handleSaveSettings() {
  const newApiKey = elements.settingApiKey.value.trim();
  const newModel = elements.settingModel.value;
  const newPersona = elements.settingPersona.value.trim();
  const newVoice = elements.settingVoice.value;

  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gemini_api_key: newApiKey,
        default_model: newModel,
        system_persona: newPersona
      })
    });

    state.settings.default_model = newModel;
    state.settings.system_persona = newPersona;
    state.settings.selected_voice = newVoice;
    updateActiveModelTag(newModel);

    elements.settingsModal.classList.add('hidden');
    alert('Settings saved successfully!');
  } catch (err) {
    alert('Failed to save settings: ' + err.message);
  }
}

// ==================== UTILITIES ====================
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function closeMobileSidebar() {
  elements.sidebar.classList.add('-translate-x-full');
  elements.sidebarOverlay.classList.add('hidden');
}

function openMobileSidebar() {
  elements.sidebar.classList.remove('-translate-x-full');
  elements.sidebarOverlay.classList.remove('hidden');
}

// ==================== EVENT LISTENERS SETUP ====================
function setupEventListeners() {
  // Sidebar Toggles
  elements.openSidebarBtn.addEventListener('click', openMobileSidebar);
  elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // New Chat
  elements.newChatBtn.addEventListener('click', createNewSession);

  // Search Sessions Filter
  elements.searchSessionsInput.addEventListener('input', (e) => {
    renderSessionsList(e.target.value);
  });

  // Toggles
  elements.headerSearchChip.addEventListener('click', toggleWebSearch);
  elements.toggleSearchBtn.addEventListener('click', toggleWebSearch);
  elements.headerSpeechChip.addEventListener('click', toggleAutoSpeech);

  // Antigravity PC Bridge Toggle
  if (elements.toggleAntigravityBtn) {
    elements.toggleAntigravityBtn.addEventListener('click', () => {
      state.antigravityMode = !state.antigravityMode;
      if (state.antigravityMode) {
        elements.toggleAntigravityBtn.classList.add('text-emerald-400', 'bg-emerald-950/40', 'border-emerald-500/30');
        elements.toggleAntigravityBtn.classList.remove('text-slate-400', 'border-transparent');
        elements.antigravityStateBadge.textContent = 'ON';
        elements.antigravityStateBadge.className = 'text-[10px] uppercase font-bold text-emerald-400 ml-0.5';
        elements.chatInput.placeholder = '⚡ Antigravity Mode: Type a command (e.g. check git status, test build, edit files)...';
        elements.chatInput.focus();
        if (!state.bridgeOnline) {
          showToast('⚠️ PC Bridge is currently offline. Start run-bridge.bat on your PC to execute local tasks.');
        } else {
          showToast('⚡ Antigravity Mode active! Commands run directly on your PC.');
        }
      } else {
        elements.toggleAntigravityBtn.classList.remove('text-emerald-400', 'bg-emerald-950/40', 'border-emerald-500/30');
        elements.toggleAntigravityBtn.classList.add('text-slate-400', 'border-transparent');
        elements.antigravityStateBadge.textContent = 'OFF';
        elements.antigravityStateBadge.className = 'text-[10px] uppercase font-bold text-slate-500 ml-0.5';
        elements.chatInput.placeholder = 'Ask anything, speak with voice, or paste an image...';
      }
    });
  }

  // Antigravity Bridge Status Polling
  function updateBridgeUI(online) {
    state.bridgeOnline = online;
    if (!elements.bridgeDot || !elements.bridgeText) return;
    if (online) {
      elements.bridgeDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      elements.bridgeText.textContent = 'PC Online';
      elements.bridgeText.className = 'text-emerald-400 font-mono text-[11px]';
      if (elements.headerBridgeChip) {
        elements.headerBridgeChip.classList.add('border-emerald-500/30', 'bg-emerald-950/20');
      }
    } else {
      elements.bridgeDot.className = 'w-2 h-2 rounded-full bg-slate-500';
      elements.bridgeText.textContent = 'PC Offline';
      elements.bridgeText.className = 'text-slate-400 font-mono text-[11px]';
      if (elements.headerBridgeChip) {
        elements.headerBridgeChip.classList.remove('border-emerald-500/30', 'bg-emerald-950/20');
      }
    }
  }

  async function checkBridgeStatus() {
    try {
      const res = await fetch('/api/bridge/status');
      if (!res.ok) return;
      const data = await res.json();
      updateBridgeUI(Boolean(data.online));
    } catch (e) {}
  }

  setInterval(checkBridgeStatus, 8000);
  checkBridgeStatus();

  // AI Humanizer Quick Jump from Composer
  if (elements.composerHumanizeBtn) {
    elements.composerHumanizeBtn.addEventListener('click', () => {
      const chatText = elements.chatInput.value.trim();
      switchView('humanizer');
      if (elements.swTabBuiltin) {
        elements.swTabBuiltin.click();
      }
      if (chatText) {
        elements.humanizerInput.value = chatText;
        updateHumanizerCounts();
      }
    });
  }

  // Voice Dictation
  elements.micBtn.addEventListener('click', toggleVoiceRecording);
  elements.stopVoiceBtn.addEventListener('click', stopRecordingVoice);

  // File Upload
  elements.uploadBtn.addEventListener('click', () => elements.fileUploadInput.click());
  elements.fileUploadInput.addEventListener('change', handleFileUpload);
  elements.removeAttachmentBtn.addEventListener('click', clearAttachment);

  // Paste image directly into textarea
  elements.chatInput.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          state.currentAttachment = {
            name: 'Pasted Image',
            mimeType: file.type,
            data: event.target.result.split(',')[1],
            size: formatFileSize(file.size)
          };
          elements.attachmentPreviewName.textContent = 'Pasted Image';
          elements.attachmentPreviewSize.textContent = formatFileSize(file.size);
          elements.attachmentPreviewImg.src = event.target.result;
          elements.attachmentPreviewImg.classList.remove('hidden');
          elements.attachmentPreviewIcon.classList.add('hidden');
          elements.attachmentPreviewContainer.classList.remove('hidden');
          lucide.createIcons();
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  });

  // Textarea input & keyboard shortcuts
  elements.chatInput.addEventListener('input', autoResizeTextarea);
  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Send & Stop Buttons
  elements.sendBtn.addEventListener('click', handleSendMessage);
  elements.stopGenerationBtn.addEventListener('click', stopGeneration);

  // Prompt Suggestion Buttons
  document.querySelectorAll('.prompt-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.getAttribute('data-prompt');
      elements.chatInput.value = promptText;
      handleSendMessage();
    });
  });

  // Memory Modal
  elements.openMemoryBtn.addEventListener('click', () => {
    loadMemories();
    elements.memoryModal.classList.remove('hidden');
  });
  elements.closeMemoryModalBtn.addEventListener('click', () => {
    elements.memoryModal.classList.add('hidden');
  });
  elements.memoryModal.addEventListener('click', (e) => {
    if (e.target === elements.memoryModal) elements.memoryModal.classList.add('hidden');
  });
  elements.addMemoryForm.addEventListener('submit', handleAddMemory);

  // Settings Modal
  elements.openSettingsBtn.addEventListener('click', () => {
    loadSettings();
    elements.settingsModal.classList.remove('hidden');
  });
  elements.closeSettingsModalBtn.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) elements.settingsModal.classList.add('hidden');
  });
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K for new chat)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      createNewSession();
    }
  });
}

// ==================== STEALTHWRITER AI HUMANIZER LOGIC ====================
function switchView(viewName) {
  state.currentView = viewName;

  if (viewName === 'chat') {
    elements.viewChat.classList.remove('hidden');
    elements.viewHumanizer.classList.add('hidden');
    if (elements.headerChatToggles) elements.headerChatToggles.classList.remove('hidden');

    // Header Tabs
    elements.headerTabChat.classList.add('bg-indigo-600', 'text-white', 'shadow');
    elements.headerTabChat.classList.remove('text-slate-400');
    elements.headerTabHumanizer.classList.remove('bg-emerald-600', 'text-white', 'shadow');
    elements.headerTabHumanizer.classList.add('text-slate-400');

    // Sidebar Tabs
    elements.sidebarTabChat.classList.add('bg-indigo-600/20', 'text-white', 'border-indigo-500/30');
    elements.sidebarTabChat.classList.remove('border-transparent', 'text-slate-400');
    elements.sidebarTabHumanizer.classList.remove('bg-emerald-600/20', 'text-white', 'border-emerald-500/30');
    elements.sidebarTabHumanizer.classList.add('border-transparent', 'text-slate-400');

  } else if (viewName === 'humanizer') {
    elements.viewChat.classList.add('hidden');
    elements.viewHumanizer.classList.remove('hidden');
    if (elements.headerChatToggles) elements.headerChatToggles.classList.add('hidden');

    // Header Tabs
    elements.headerTabHumanizer.classList.add('bg-emerald-600', 'text-white', 'shadow');
    elements.headerTabHumanizer.classList.remove('text-slate-400');
    elements.headerTabChat.classList.remove('bg-indigo-600', 'text-white', 'shadow');
    elements.headerTabChat.classList.add('text-slate-400');

    // Sidebar Tabs
    elements.sidebarTabHumanizer.classList.add('bg-emerald-600/20', 'text-white', 'border-emerald-500/30');
    elements.sidebarTabHumanizer.classList.remove('border-transparent', 'text-slate-400');
    elements.sidebarTabChat.classList.remove('bg-indigo-600/20', 'text-white', 'border-indigo-500/30');
    elements.sidebarTabChat.classList.add('border-transparent', 'text-slate-400');

    // Ensure built-in Dual-Pane Humanizer is visible by default
    if (elements.stealthwriterLiveContainer && elements.stealthwriterBuiltinContainer) {
      if (!elements.swTabTool?.classList.contains('active') && !elements.swTabDashboard?.classList.contains('active')) {
        elements.stealthwriterLiveContainer.classList.add('hidden');
        elements.stealthwriterBuiltinContainer.classList.remove('hidden');
      }
    }

    closeMobileSidebar();
  }

  lucide.createIcons();
}

function updateHumanizerCounts() {
  const text = elements.humanizerInput.value.trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;

  elements.inputWordCount.textContent = `${words} words`;
  elements.inputCharCount.textContent = `${chars} chars`;
}

function renderDraftTabs() {
  if (!state.humanizerDrafts || state.humanizerDrafts.length <= 1) {
    elements.draftsTabBar.classList.add('hidden');
    return;
  }
  elements.draftsTabBar.classList.remove('hidden');
  elements.draftsTabBar.innerHTML = '';
  state.humanizerDrafts.forEach((draft, idx) => {
    const isActive = idx === state.activeDraftIndex;
    const btn = document.createElement('button');
    btn.className = `px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
      isActive
        ? 'bg-emerald-600 text-white shadow'
        : 'text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:border-white/10'
    }`;
    btn.innerHTML = `<span class="opacity-70 text-[10px]">#${idx + 1}</span> <span>${escapeHtml(draft.name)}</span>`;
    btn.onclick = () => selectDraft(idx);
    elements.draftsTabBar.appendChild(btn);
  });
}

function selectDraft(index) {
  state.activeDraftIndex = index;
  const draft = state.humanizerDrafts[index];
  if (!draft) return;
  elements.humanizerOutput.textContent = draft.text;
  const words = draft.text.split(/\s+/).filter(Boolean).length;
  elements.outputWordCount.textContent = `${words} words`;
  renderDraftTabs();

  // If in sentence scan view, refresh scan for the selected draft
  if (state.isScanView) {
    runOnDemandSentenceScan(draft.text);
  }
}

async function runOnDemandSentenceScan(textToScan) {
  try {
    const res = await fetch('/api/humanize/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToScan })
    });
    if (res.ok) {
      const data = await res.json();
      state.sentenceScanData = data.sentences || [];
      renderSentenceScan();
    }
  } catch (e) {}
}

function renderSentenceScan() {
  if (!elements.sentenceScanContainer) return;
  elements.sentenceScanContainer.innerHTML = '';

  if (!state.sentenceScanData || state.sentenceScanData.length === 0) {
    elements.sentenceScanContainer.innerHTML = `
      <div class="text-center p-6 text-slate-500 text-xs">
        No sentence analysis available. Run "Humanize Text" first.
      </div>
    `;
    return;
  }

  state.sentenceScanData.forEach((s, idx) => {
    const card = document.createElement('div');
    
    // Status styling
    let borderClass = 'border-l-4 border-l-emerald-500 bg-emerald-500/5';
    let pillClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let statusIcon = 'shield-check';
    let statusLabel = '100% Human';

    if (s.status === 'ai') {
      borderClass = 'border-l-4 border-l-rose-500 bg-rose-500/5';
      pillClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      statusIcon = 'alert-triangle';
      statusLabel = 'AI Risk Flagged';
    } else if (s.status === 'mixed') {
      borderClass = 'border-l-4 border-l-amber-500 bg-amber-500/5';
      pillClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      statusIcon = 'alert-circle';
      statusLabel = 'Moderate';
    }

    card.className = `p-3 rounded-xl border border-white/5 ${borderClass} space-y-2 transition-all hover:border-white/10`;
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono text-slate-500">#${idx + 1}</span>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${pillClass}">
            <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
            <span>${statusLabel} (${s.humanScore}%)</span>
          </span>
          <span class="text-[11px] text-slate-400 font-mono">${s.wordCount} words • ${s.functionWordRatio}% connectors</span>
        </div>
        <button onclick="rerollSentence(${idx})" class="reroll-btn-${idx} text-[11px] text-indigo-400 hover:text-white px-2.5 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/20 flex items-center gap-1 transition-all">
          <i data-lucide="refresh-cw" class="w-3 h-3"></i>
          <span>Re-roll Sentence</span>
        </button>
      </div>
      <p class="text-xs text-slate-200 leading-relaxed font-sans">${escapeHtml(s.sentence)}</p>
      ${s.feedback ? `<p class="text-[10px] text-slate-400 italic">${escapeHtml(s.feedback)}</p>` : ''}
    `;

    elements.sentenceScanContainer.appendChild(card);
  });

  lucide.createIcons();
}

function toggleSentenceScanView() {
  state.isScanView = !state.isScanView;
  
  if (state.isScanView) {
    elements.humanizerOutput.classList.add('hidden');
    elements.sentenceScanContainer.classList.remove('hidden');
    elements.toggleSentenceScanBtn.classList.add('bg-indigo-600', 'text-white');
    elements.toggleSentenceScanBtn.classList.remove('bg-indigo-500/10', 'text-indigo-300');
    elements.scanBtnLabel.textContent = 'Text View';

    const activeText = state.humanizerDrafts[state.activeDraftIndex]?.text || elements.humanizerOutput.textContent;
    if (activeText && (!state.sentenceScanData || state.sentenceScanData.length === 0)) {
      runOnDemandSentenceScan(activeText);
    } else {
      renderSentenceScan();
    }
  } else {
    elements.humanizerOutput.classList.remove('hidden');
    elements.sentenceScanContainer.classList.add('hidden');
    elements.toggleSentenceScanBtn.classList.remove('bg-indigo-600', 'text-white');
    elements.toggleSentenceScanBtn.classList.add('bg-indigo-500/10', 'text-indigo-300');
    elements.scanBtnLabel.textContent = 'Sentence Scan';
  }

  lucide.createIcons();
}

window.rerollSentence = async function(idx) {
  const sentenceObj = state.sentenceScanData[idx];
  if (!sentenceObj) return;

  const btn = document.querySelector(`.reroll-btn-${idx}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> <span>Re-rolling...</span>`;
    lucide.createIcons();
  }

  const activeDraft = state.humanizerDrafts[state.activeDraftIndex];
  const fullContext = activeDraft ? activeDraft.text : elements.humanizerOutput.textContent;

  try {
    const res = await fetch('/api/humanize/sentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullContext: fullContext,
        targetSentence: sentenceObj.sentence,
        tone: state.humanizerTone
      })
    });

    const data = await res.json();
    if (data.alternatives && data.alternatives.length > 0) {
      const chosenAlt = data.alternatives[0];
      
      // Replace the sentence in the draft
      const newText = fullContext.replace(sentenceObj.sentence, chosenAlt);
      if (activeDraft) activeDraft.text = newText;
      elements.humanizerOutput.textContent = newText;

      // Update words
      elements.outputWordCount.textContent = `${newText.split(/\s+/).filter(Boolean).length} words`;

      // Re-scan
      runOnDemandSentenceScan(newText);
    }
  } catch (e) {
    alert('Failed to reroll sentence: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="refresh-cw" class="w-3 h-3"></i> <span>Re-roll Sentence</span>`;
      lucide.createIcons();
    }
  }
};

async function handleHumanize() {
  const text = elements.humanizerInput.value.trim();
  if (!text) {
    alert('Please enter or paste some AI text to humanize.');
    return;
  }

  if (state.isHumanizing) return;
  state.isHumanizing = true;

  // Set loading state on button
  const originalBtnHtml = elements.runHumanizeBtn.innerHTML;
  elements.runHumanizeBtn.disabled = true;
  elements.runHumanizeBtn.innerHTML = `
    <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
    <span>Humanizing with StealthWriter...</span>
  `;
  lucide.createIcons();

  elements.humanizerOutput.innerHTML = `
    <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
      <div class="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
      <p class="text-xs font-semibold text-emerald-400">Deconstructing clauses with Ghost Pro Engine...</p>
      <p class="text-[11px] text-slate-500">Injecting function-word connectors & asymmetrical burstiness...</p>
    </div>
  `;

  if (elements.sentenceScanContainer) {
    elements.sentenceScanContainer.innerHTML = '';
  }

  const freezeWords = elements.humanizerFreezeInput.value
    ? elements.humanizerFreezeInput.value.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  try {
    const res = await fetch('/api/humanize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        mode: state.humanizerMode,
        level: state.humanizerLevel,
        tone: state.humanizerTone,
        freezeWords: freezeWords
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // Store drafts
    state.humanizerDrafts = data.drafts || [{ name: 'Humanized', text: data.humanizedText }];
    state.activeDraftIndex = data.activeDraftIndex || 0;
    state.sentenceScanData = data.sentenceScan || [];

    // Render drafts tab bar
    renderDraftTabs();

    // Render active humanized output
    const activeText = state.humanizerDrafts[state.activeDraftIndex]?.text || data.humanizedText;
    elements.humanizerOutput.textContent = activeText;

    // Update counts & scores
    elements.outputWordCount.textContent = `${activeText.split(/\s+/).filter(Boolean).length} words`;
    if (elements.outputFunctionWordsChip) {
      elements.outputFunctionWordsChip.textContent = `• ${data.humanizedStats.functionWordRatio}% connectors`;
      elements.outputFunctionWordsChip.classList.remove('hidden');
    }

    // Show output human score badge
    elements.outputScoreText.textContent = `Human Score: ${data.humanizedStats.humanScore}%`;
    elements.outputScoreBadge.classList.remove('hidden');

    // Show input AI likeness badge
    elements.inputDetectionText.textContent = `Original AI: ${data.originalStats.aiScore}%`;
    elements.inputDetectionBadge.classList.remove('hidden');

    // Show detector badges
    elements.detectorsBadgeRow.classList.remove('hidden');

    // If currently in sentence scan view, render cards
    if (state.isScanView) {
      renderSentenceScan();
    }

  } catch (err) {
    elements.humanizerOutput.innerHTML = `
      <div class="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
        <p class="font-bold mb-1">Humanization Failed</p>
        <p>${escapeHtml(err.message)}</p>
      </div>
    `;
  } finally {
    state.isHumanizing = false;
    elements.runHumanizeBtn.disabled = false;
    elements.runHumanizeBtn.innerHTML = originalBtnHtml;
    lucide.createIcons();
  }
}

// Global function triggered from chat message "✨ Humanize" button
window.humanizeFromChat = function(msgId) {
  const contentEl = document.getElementById(`content-${msgId}`);
  if (!contentEl) return;

  const rawText = contentEl.innerText.trim();
  
  // 1. Copy directly to user clipboard for instant pasting
  navigator.clipboard.writeText(rawText).catch(() => {});

  // 2. Switch to StealthWriter view & activate the built-in dual pane tool
  switchView('humanizer');
  if (elements.swTabBuiltin) {
    elements.swTabBuiltin.click();
  }

  // 3. Populate built-in input as well
  elements.humanizerInput.value = rawText;
  updateHumanizerCounts();

  // 4. Show clipboard notification banner inside StealthWriter
  if (elements.stealthwriterClipboardBanner) {
    elements.stealthwriterClipboardBanner.classList.remove('hidden');
    elements.stealthwriterClipboardText.textContent = 'AI note copied to clipboard! Paste directly into StealthWriter below (Ctrl + V).';
  }
};

function setupStealthWriterListeners() {
  // Tab Switchers (Chat vs StealthWriter)
  elements.headerTabChat.addEventListener('click', () => switchView('chat'));
  elements.headerTabHumanizer.addEventListener('click', () => {
    switchView('humanizer');
    if (elements.swTabBuiltin) elements.swTabBuiltin.click();
  });
  elements.sidebarTabChat.addEventListener('click', () => switchView('chat'));
  elements.sidebarTabHumanizer.addEventListener('click', () => {
    switchView('humanizer');
    if (elements.swTabBuiltin) elements.swTabBuiltin.click();
  });

  // Live StealthWriter Sub-Tab Switcher (Tool vs Dashboard vs Assistant Engine)
  function setActiveSwTab(activeBtn) {
    [elements.swTabTool, elements.swTabDashboard, elements.swTabBuiltin].forEach(btn => {
      if (!btn) return;
      btn.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow');
      btn.classList.add('text-slate-400', 'bg-slate-900');
    });
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow');
      activeBtn.classList.remove('text-slate-400', 'bg-slate-900');
    }
  }

  if (elements.swTabTool) {
    elements.swTabTool.addEventListener('click', () => {
      setActiveSwTab(elements.swTabTool);
      elements.stealthwriterLiveContainer.classList.remove('hidden');
      elements.stealthwriterBuiltinContainer.classList.add('hidden');
      if (elements.stealthwriterIframe && !elements.stealthwriterIframe.src.endsWith('stealthwriter.ai/')) {
        elements.stealthwriterIframe.src = 'https://stealthwriter.ai/';
      }
      if (elements.swExternalBtn) {
        elements.swExternalBtn.href = 'https://stealthwriter.ai/';
      }
    });
  }

  if (elements.swTabDashboard) {
    elements.swTabDashboard.addEventListener('click', () => {
      setActiveSwTab(elements.swTabDashboard);
      elements.stealthwriterLiveContainer.classList.remove('hidden');
      elements.stealthwriterBuiltinContainer.classList.add('hidden');
      if (elements.stealthwriterIframe) {
        elements.stealthwriterIframe.src = 'https://stealthwriter.ai/dashboard/humanizer';
      }
      if (elements.swExternalBtn) {
        elements.swExternalBtn.href = 'https://stealthwriter.ai/dashboard/humanizer';
      }
    });
  }

  if (elements.swTabBuiltin) {
    elements.swTabBuiltin.addEventListener('click', () => {
      setActiveSwTab(elements.swTabBuiltin);
      elements.stealthwriterLiveContainer.classList.add('hidden');
      elements.stealthwriterBuiltinContainer.classList.remove('hidden');
      lucide.createIcons();
    });
    // Set default active sub-tab to built-in tool
    setActiveSwTab(elements.swTabBuiltin);
  }

  // Launch StealthWriter App Window (Bypasses iframe cookie restrictions completely)
  if (elements.swPopoutBtn) {
    elements.swPopoutBtn.addEventListener('click', () => {
      window.open('https://stealthwriter.ai/dashboard/humanizer', 'StealthWriterApp', 'width=1280,height=850,menubar=no,toolbar=no,location=yes,status=no');
    });
  }

  // Reload iframe button
  if (elements.swReloadBtn && elements.stealthwriterIframe) {
    elements.swReloadBtn.addEventListener('click', () => {
      elements.swReloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-emerald-400"></i>';
      lucide.createIcons();
      elements.stealthwriterIframe.src = elements.stealthwriterIframe.src;
      setTimeout(() => {
        elements.swReloadBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>';
        lucide.createIcons();
      }, 1000);
    });
  }

  // Copy latest chat response button
  if (elements.swCopyChatBtn) {
    elements.swCopyChatBtn.addEventListener('click', () => {
      const modelMessages = document.querySelectorAll('.chat-bubble-model');
      if (modelMessages.length > 0) {
        const lastMsg = modelMessages[modelMessages.length - 1];
        const text = lastMsg.innerText.trim();
        navigator.clipboard.writeText(text).then(() => {
          if (elements.stealthwriterClipboardBanner) {
            elements.stealthwriterClipboardBanner.classList.remove('hidden');
            elements.stealthwriterClipboardText.textContent = 'Copied latest AI response to clipboard! Paste directly into StealthWriter below (Ctrl + V).';
          }
          elements.swCopyChatBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> <span class="text-emerald-400">Copied!</span>';
          lucide.createIcons();
          setTimeout(() => {
            elements.swCopyChatBtn.innerHTML = '<i data-lucide="clipboard" class="w-3.5 h-3.5 text-indigo-400"></i> <span class="hidden sm:inline">Copy Last Chat</span>';
            lucide.createIcons();
          }, 2000);
        });
      } else {
        alert('No AI chat response found yet. Ask a question in Chat first!');
      }
    });
  }

  // Close clipboard helper banner
  if (elements.closeClipboardBannerBtn && elements.stealthwriterClipboardBanner) {
    elements.closeClipboardBannerBtn.addEventListener('click', () => {
      elements.stealthwriterClipboardBanner.classList.add('hidden');
    });
  }

  // Mode Selection
  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.modeBtns.forEach(b => {
        b.classList.remove('active', 'bg-emerald-600/20', 'text-emerald-300', 'border-emerald-500/40');
        b.classList.add('text-slate-400', 'border-transparent');
      });
      btn.classList.add('active', 'bg-emerald-600/20', 'text-emerald-300', 'border-emerald-500/40');
      btn.classList.remove('text-slate-400', 'border-transparent');

      state.humanizerMode = btn.getAttribute('data-mode') || 'ghost';
    });
  });

  // Stealthwriter Level Selection (Level 1, 3, 5)
  if (elements.levelBtns) {
    elements.levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.levelBtns.forEach(b => {
          b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow');
          b.classList.add('text-slate-400');
        });
        btn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow');
        btn.classList.remove('text-slate-400');
        state.humanizerLevel = btn.getAttribute('data-level') || '5';
      });
    });
  }

  // Tone Selection
  if (elements.humanizerToneSelect) {
    elements.humanizerToneSelect.addEventListener('change', (e) => {
      state.humanizerTone = e.target.value || 'academic';
    });
  }

  // Toggle Sentence Scan Button
  if (elements.toggleSentenceScanBtn) {
    elements.toggleSentenceScanBtn.addEventListener('click', toggleSentenceScanView);
  }

  // Input textarea counter
  elements.humanizerInput.addEventListener('input', updateHumanizerCounts);

  // Run button
  elements.runHumanizeBtn.addEventListener('click', handleHumanize);

  // Paste button
  elements.pasteInputBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.humanizerInput.value = text;
      updateHumanizerCounts();
    } catch (e) {
      alert('Please use Ctrl + V to paste into the box.');
    }
  });

  // Try sample button
  elements.sampleInputBtn.addEventListener('click', () => {
    elements.humanizerInput.value = `In conclusion, artificial intelligence has fundamentally revolutionized modern college education. Furthermore, it is crucial to delve into the multifaceted tapestry of machine learning algorithms that foster interactive academic environments. This technological development underscores an unwavering testament to scholastic progress and digital transformation in universities worldwide.`;
    updateHumanizerCounts();
  });

  // Clear button
  elements.clearInputBtn.addEventListener('click', () => {
    elements.humanizerInput.value = '';
    elements.humanizerOutput.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <i data-lucide="shield-check" class="w-6 h-6"></i>
        </div>
        <p class="text-xs font-medium text-slate-300">Your humanized, Turnitin-ready text will appear here.</p>
        <p class="text-[11px] text-slate-500">Paste your text on the left and click "Humanize Text".</p>
      </div>
    `;
    updateHumanizerCounts();
    state.humanizerDrafts = [];
    if (elements.draftsTabBar) elements.draftsTabBar.classList.add('hidden');
    elements.inputDetectionBadge.classList.add('hidden');
    elements.outputScoreBadge.classList.add('hidden');
    elements.detectorsBadgeRow.classList.add('hidden');
    lucide.createIcons();
  });

  // Copy Humanized Output
  elements.copyHumanizedBtn.addEventListener('click', () => {
    const text = elements.humanizerOutput.innerText;
    if (!text || text.includes('Your humanized, Turnitin-ready text')) return;

    navigator.clipboard.writeText(text).then(() => {
      elements.copyHumanizedBtn.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i> <span>Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        elements.copyHumanizedBtn.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i> <span>Copy</span>';
        lucide.createIcons();
      }, 2000);
    });
  });

  // Speak Humanized Output
  elements.speakHumanizedBtn.addEventListener('click', () => {
    const text = elements.humanizerOutput.innerText;
    if (!text || text.includes('Your humanized, Turnitin-ready text')) return;
    speakText(text, 'humanized-output');
  });
}

// ==================== PWA SERVICE WORKER REGISTRATION ====================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupStealthWriterListeners();
  initSpeechSynthesis();
  initSpeechRecognition();
  updateSearchUI();
  updateSpeechUI();
  loadSettings();
  loadMemories();
  loadSessions();
  registerServiceWorker();
  lucide.createIcons();
});
