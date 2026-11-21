# 🤖 Personal AI Assistant

A modern, full-featured personal AI chatbot built with **Google Gemini 2.5 Flash**, real-time **Google Search grounding**, bidirectional **voice notes**, persistent **long-term memory**, multimodal **vision/document analysis**, and **PWA** mobile installation.

Located in: `Desktop\AGY Stuffs\personal-ai-assistant`

---

## ✨ Features

- 🎙️ **Voice Notes (Speech-to-Text & Text-to-Speech):**
  - **Voice Input:** Click the microphone icon to speak naturally. Uses real-time speech recognition with live audio visualizer.
  - **Voice Output:** Listen to any response aloud or toggle *Auto-Voice* on to have the AI speak back like a voice assistant.
- 🌐 **Live Google Search Grounding:**
  - One-click toggle in the header or input toolbar.
  - When enabled, answers are verified against real-time web results with clickable source citations.
- 🧠 **Persistent Long-Term Memory:**
  - Embedded local **SQLite** database stores your preferences, project details, and facts.
  - Open the **Memory Bank** in the sidebar to review, add, or delete memories anytime.
  - The AI also auto-remembers new facts you mention during conversations!
- 👁️ **Multimodal Vision & Documents:**
  - Upload photos, screenshots, or documents using the paperclip or paste images directly with `Ctrl + V`.
- ⚡ **Real-time Streaming:**
  - Word-by-word ChatGPT-style streaming over Server-Sent Events (SSE).
  - Code syntax highlighting with instant one-click copy buttons.
- 📱 **Progressive Web App (PWA):**
  - Fully responsive on desktop and mobile.
  - Install it directly to your phone's home screen for a fullscreen native app experience without browser bars.

---

## 🚀 Quick Start

### 1. Launch the Server
Double-click `run.bat` or run:
```bash
npm start
```
Then open: **[http://localhost:3000](http://localhost:3000)**

### 2. Enter Your Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/) and grab a free API key.
2. In the assistant, click **Settings & Model** at the bottom of the sidebar.
3. Paste your key and click **Save Settings** (or add `GEMINI_API_KEY=your_key` to `.env`).

---

## 📱 How to Use on Your Phone (PWA)

1. Make sure your phone is connected to the same Wi-Fi network as your computer.
2. Find your computer's local IP address (e.g., `192.168.1.5`).
3. Open `http://<your-ip>:3000` in Safari (iOS) or Chrome (Android).
4. Tap **Share / Menu** $\rightarrow$ **"Add to Home Screen"**.
5. It will appear on your phone with its own app icon and launch fullscreen!
