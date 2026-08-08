const Database = require('better-sqlite3');
const db = new Database('./data/warmth_wall.db');
db.prepare("INSERT INTO config (key, value) VALUES ('current_event', '도움') ON CONFLICT(key) DO UPDATE SET value = '도움'").run();
console.log('Event changed to 도움');
