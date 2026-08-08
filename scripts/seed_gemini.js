const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./data/warmth_wall.db');

console.log("Clearing fake posts for a clean test...");
db.exec("DELETE FROM posts WHERE user_id IN ('@friendly_neighbor', '@smile_angel', '@warm_coffee', '@baking_noob')");

console.log("Creating dummy users...");
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash)
  VALUES (?, ?, ?)
`);
insertUser.run('@friendly_neighbor', 'friendly@test.com', '1234');
insertUser.run('@smile_angel', 'smile@test.com', '1234');
insertUser.run('@warm_coffee', 'coffee@test.com', '1234');
insertUser.run('@baking_noob', 'baking@test.com', '1234');

const insertStmt = db.prepare(`
  INSERT INTO posts (id, content, keyword, nickname, user_id, category, color, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

// Insert 3 인사
insertStmt.run(
  crypto.randomUUID(), 
  '오늘 아침 출근길에 아파트 경비 아저씨께 먼저 밝게 인사드렸더니 너무 좋아하셨어요!', 
  '경비아저씨', 
  '친절한이웃', 
  '@friendly_neighbor', 
  '인사', 
  '#FFE234'
);

insertStmt.run(
  crypto.randomUUID(), 
  '엘리베이터에서 자주 마주치는 이웃분께 용기내서 목례를 했습니다. 하루 시작이 상쾌하네요.', 
  '이웃인사', 
  '미소천사', 
  '@smile_angel', 
  '인사', 
  '#FFE234'
);

insertStmt.run(
  crypto.randomUUID(), 
  '늘 사무실 청소해주시는 여사님께 따뜻한 캔커피 하나 드리며 감사 인사를 전했습니다.', 
  '감사인사', 
  '따뜻한커피', 
  '@warm_coffee', 
  '인사', 
  '#FFE234'
);


// Insert 1 나눔
insertStmt.run(
  crypto.randomUUID(), 
  '팀원들이 요새 야근하느라 힘들어해서, 집에서 직접 구운 쿠키를 조금씩 포장해와서 나눠먹었습니다.', 
  '수제쿠키', 
  '베이킹초보', 
  '@baking_noob', 
  '나눔', 
  '#FF9DBB'
);

console.log("Successfully seeded 3 '인사' posts and 1 '나눔' post with proper IDs!");
