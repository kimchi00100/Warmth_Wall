import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scope = searchParams.get('scope') || 'today';
  const user_id = searchParams.get('user_id');

  try {
    let query = 'SELECT * FROM posts';
    const params: any[] = [];
    const conditions: string[] = [];

    if (scope === 'today') {
      conditions.push("created_at >= date('now', 'start of day')");
      if (user_id) {
        conditions.push("user_id = ?");
        params.push(user_id);
      }
    } else if (scope === 'all') {
      if (user_id) {
        conditions.push("user_id = ?");
        params.push(user_id);
      }
    } else if (scope === 'public') {
      // public feed: all posts regardless of session, maybe today only? 
      // The guide step 4: "우리의 벽 접속 시 session_id와 무관하게 모든 데이터가 노출". 
      // So no filters.
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';

    const posts = db.prepare(query).all(...params);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, nickname, user_id, keyword, parent_id } = body;

    if (!content || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO posts (id, content, keyword, nickname, user_id, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, content, keyword || null, nickname || null, user_id, parent_id || null);

    const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
