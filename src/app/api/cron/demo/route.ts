import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST() {
  try {
    const mockUserId = 'mock_user_id';
    
    // Ensure mock user exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get(mockUserId) as { count: number };
    if (userCount.count === 0) {
      db.prepare(`
        INSERT INTO users (id, email, password_hash)
        VALUES (?, ?, ?)
      `).run(mockUserId, 'mock@warmth.wall', 'mock_hash');
    }

    // Insert 7 posts with heavily skewed keyword "도움" to force AI briefing change
    const demoPosts = Array.from({ length: 7 }).map((_, i) => ({
      id: crypto.randomUUID(),
      content: `무거운 짐을 들고 가시는 어르신께 도움을 드렸어요! 뿌듯한 하루네요. (자정 시뮬레이션 ${i+1})`,
      keyword: '도움',
      nickname: `시연용천사${i+1}`,
      user_id: mockUserId,
    }));

    const insert = db.prepare(`
      INSERT INTO posts (id, content, keyword, nickname, user_id, is_mock)
      VALUES (@id, @content, @keyword, @nickname, @user_id, 1)
    `);

    const insertMany = db.transaction((posts: any[]) => {
      for (const post of posts) {
        insert.run(post);
      }
    });

    insertMany(demoPosts);

    return NextResponse.json({ message: '자정 시뮬레이션 데이터 주입 완료' }, { status: 201 });
  } catch (error) {
    console.error('Error in demo simulation:', error);
    return NextResponse.json({ error: 'Failed to simulate demo' }, { status: 500 });
  }
}
