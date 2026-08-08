import db from './db';
import crypto from 'crypto';

export const MOCK_KEYWORDS = ['친절', '배려', '나눔', '칭찬', '미소', '도움', '격려', '위로', '응원', '봉사'];

export function seedMockData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  
  if (count.count === 0) {
    const mockUserId = 'mock_user_id';
    
    // Seed mock user if not exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get(mockUserId) as { count: number };
    if (userCount.count === 0) {
      db.prepare(`
        INSERT INTO users (id, email, password_hash)
        VALUES (?, ?, ?)
      `).run(mockUserId, 'mock@warmth.wall', 'mock_hash');
    }

    const insert = db.prepare(`
      INSERT INTO posts (id, content, keyword, nickname, user_id, is_mock)
      VALUES (@id, @content, @keyword, @nickname, @user_id, 1)
    `);

    const insertMany = db.transaction((posts: any[]) => {
      for (const post of posts) {
        insert.run(post);
      }
    });

    const mockPosts = Array.from({ length: 20 }).map((_, i) => {
      const keyword = MOCK_KEYWORDS[i % MOCK_KEYWORDS.length];
      return {
        id: crypto.randomUUID(),
        content: `오늘 누군가에게 작은 ${keyword}을(를) 베풀었습니다. 마음이 따뜻해지네요. (Mock Data ${i+1})`,
        keyword: keyword,
        nickname: `익명천사${i+1}`,
        user_id: mockUserId,
      };
    });

    insertMany(mockPosts);
    console.log('Successfully seeded 20 mock posts.');
  }
}
