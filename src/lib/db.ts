import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data', 'warmth_wall.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
try {
  db.exec('ALTER TABLE posts ADD COLUMN photo TEXT;');
} catch (err) {}
try {
  db.exec('ALTER TABLE posts ADD COLUMN color TEXT;');
} catch (err) {}
try {
  db.exec('ALTER TABLE posts ADD COLUMN category TEXT;');
} catch (err) {}
try {
  db.exec('ALTER TABLE users ADD COLUMN total_points INTEGER DEFAULT 0;');
} catch (err) {}
try {
  db.exec('ALTER TABLE users ADD COLUMN last_attendance TEXT;');
} catch (err) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN has_received_event_bonus INTEGER DEFAULT 0;');
} catch (err) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    last_attendance TEXT,
    has_received_event_bonus INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    keyword TEXT,
    nickname TEXT,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    photo TEXT,
    is_mock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(parent_id) REFERENCES posts(id) ON DELETE SET NULL
  );
`);

export default db;
