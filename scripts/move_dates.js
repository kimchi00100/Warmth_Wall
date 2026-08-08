const Database = require('better-sqlite3');
const db = new Database('./data/warmth_wall.db');
const info = db.prepare("UPDATE posts SET created_at = replace(created_at, '2026-08-08', '2026-08-07') WHERE created_at LIKE '2026-08-08%'").run();
console.log('Moved', info.changes, 'posts to 08-07');
