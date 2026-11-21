const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure data directory exists
const dbPath = path.join(__dirname, 'data.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_name TEXT,
    attachment_type TEXT,
    attachment_data TEXT,
    grounding_data TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Session queries
const sessionOps = {
  list: () => {
    return db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all();
  },
  get: (id) => {
    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  },
  create: (id, title) => {
    const now = Date.now();
    db.prepare('INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)').run(id, title, now, now);
    return { id, title, created_at: now, updated_at: now };
  },
  updateTitle: (id, title) => {
    const now = Date.now();
    db.prepare('UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?').run(title, now, id);
  },
  touch: (id) => {
    const now = Date.now();
    db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(now, id);
  },
  delete: (id) => {
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }
};

// Message queries
const messageOps = {
  listBySession: (sessionId) => {
    return db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
  },
  create: ({ id, sessionId, role, content, attachmentName = null, attachmentType = null, attachmentData = null, groundingData = null }) => {
    const now = Date.now();
    db.prepare(`
      INSERT INTO messages (id, session_id, role, content, attachment_name, attachment_type, attachment_data, grounding_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sessionId, role, content, attachmentName, attachmentType, attachmentData, groundingData, now);
    sessionOps.touch(sessionId);
    return { id, sessionId, role, content, attachmentName, attachmentType, attachmentData, groundingData, created_at: now };
  }
};

// Memory queries
const memoryOps = {
  list: () => {
    return db.prepare('SELECT * FROM memories ORDER BY updated_at DESC').all();
  },
  add: (content, category = 'general') => {
    const now = Date.now();
    const result = db.prepare('INSERT INTO memories (content, category, created_at, updated_at) VALUES (?, ?, ?, ?)').run(content, category, now, now);
    return { id: result.lastInsertRowid, content, category, created_at: now, updated_at: now };
  },
  delete: (id) => {
    db.prepare('DELETE FROM memories WHERE id = ?').run(id);
  },
  update: (id, content, category = 'general') => {
    const now = Date.now();
    db.prepare('UPDATE memories SET content = ?, category = ?, updated_at = ? WHERE id = ?').run(content, category, now, id);
  }
};

// Settings queries
const settingsOps = {
  get: (key) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  },
  set: (key, value) => {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
  },
  getAll: () => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }
};

module.exports = {
  db,
  sessionOps,
  messageOps,
  memoryOps,
  settingsOps
};
