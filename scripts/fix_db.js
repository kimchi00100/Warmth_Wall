const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./data/warmth_wall.db');

const insertStmt = db.prepare(`
  INSERT INTO posts (id, content, keyword, nickname, user_id, category, color, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

insertStmt.run(crypto.randomUUID(), '오늘 하루도 힘차게!', '응원', '@dasom_ai', '@dasom_ai', '기타', '#FFE234');
insertStmt.run(crypto.randomUUID(), '모두 화이팅입니다!', '응원', '@dasom_ai', '@dasom_ai', '기타', '#FF9DBB');

db.prepare('UPDATE users SET total_points = 3, has_received_event_bonus = 0 WHERE id = ?').run('@dasom_ai');
console.log('Restored 2 posts and set points to 3 for @dasom_ai');
