const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'C:\\Users\\xjwoz\\OneDrive\\Desktop\\_Dasom_Hackathon\\warmth_wall.db';
const db = new Database(dbPath);

// Wipe existing posts
db.exec('DELETE FROM posts;');

const TODAY = '2026-08-07'; // Ensure this matches page.tsx
const YESTERDAY = '2026-08-06';
const TWO_AGO = '2026-08-05';
const THREE_AGO = '2026-08-04';

const SEED_POSTS = [
  { id: 'h1', content: '지하철에서 길 잃은 분 안내했어요', color: '#C4B5FD', author: '@guide_k', nadoroCount: 7, category: '도움', date: TODAY },
  { id: 'h2', content: '할머니 장바구니 들어드렸어요', color: '#FDE047', author: '@kind_neighbor', nadoroCount: 18, category: '도움', date: TODAY },
  { id: 'h3', content: '동네 고양이한테 간식 챙겨줬어요', color: '#86EFAC', author: '@street_cat', nadoroCount: 11, category: '환경', date: TODAY },
  { id: 'h4', content: '카페 테이블 닦고 나왔어요', color: '#FDE047', author: '@dasom_ai', nadoroCount: 0, category: '배려', date: TODAY },
  { id: 'h5', content: '비 오는 날 우산 함께 써드렸어요', color: '#F9A8D4', author: '@spring_sun', nadoroCount: 6, category: '나눔', date: TODAY },
  { id: 'h6', content: '엘리베이터 문 잡아드렸어요', color: '#FDE047', author: '@dasom_ai', nadoroCount: 3, category: '배려', date: TODAY },
  { id: 'h7', content: '길에서 지갑 떨어진 분 찾아드렸어요', color: '#F9A8D4', author: '@mindle99', nadoroCount: 22, category: '도움', date: TODAY },
  { id: 'h8', content: '주문 잘못 나온 분께 먼저 양보했어요', color: '#67E8F9', author: '@yooyoo_c', nadoroCount: 5, category: '배려', date: TODAY },
  { id: 'h9', content: '편의점 앞 쓰레기 주워 버렸어요', color: '#67E8F9', author: '@greenstep', nadoroCount: 9, category: '환경', date: TODAY },
  { id: 'h10', content: '무거운 짐 들고 가시는 분 도와드렸어요', color: '#C4B5FD', author: '@hero_99', nadoroCount: 15, category: '도움', date: TODAY },
  { id: 'd1', content: '버려진 박스 정리해서 내놓았어요', color: '#86EFAC', author: '@dasom_ai', nadoroCount: 0, category: '환경', date: YESTERDAY },
  { id: 'd2', content: '아침에 이웃분께 먼저 인사했어요', color: '#FDE047', author: '@dasom_ai', nadoroCount: 2, category: '인사', date: YESTERDAY },
  { id: 'd3', content: '퇴근길에 폐지 줍는 어르신 도와드렸어요', color: '#C4B5FD', author: '@dasom_ai', nadoroCount: 14, category: '도움', date: TWO_AGO },
  { id: 'd4', content: '분리수거장에 잘못 버려진 캔 제대로 넣었어요', color: '#86EFAC', author: '@dasom_ai', nadoroCount: 1, category: '환경', date: THREE_AGO },
  { id: 'd5', content: '친구에게 따뜻한 위로의 말 건넸어요', color: '#F9A8D4', author: '@dasom_ai', nadoroCount: 5, category: '배려', date: THREE_AGO },
];

const insertUserStmt = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash)
  VALUES (?, ?, '12345678')
`);

const insertPostStmt = db.prepare(`
  INSERT INTO posts (id, content, nickname, user_id, color, category, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

SEED_POSTS.forEach(p => {
  // Create user
  insertUserStmt.run(p.author, p.author + '@test.com');
  
  // Insert post
  const createdAt = p.date + ' 12:00:00'; 
  insertPostStmt.run(p.id, p.content, p.author, p.author, p.color, p.category, createdAt);
});

console.log('DB Seeded properly with real authors for ' + SEED_POSTS.length + ' posts!');
