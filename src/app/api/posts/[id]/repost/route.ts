import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parentId = params.id;
    const body = await request.json();
    const { user_id, nickname } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get parent post to copy content/keyword
    const parentPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(parentId) as any;
    
    if (!parentPost) {
      return NextResponse.json({ error: 'Parent post not found' }, { status: 404 });
    }

    const newId = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO posts (id, content, keyword, nickname, user_id, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newId, 
      parentPost.content, 
      parentPost.keyword, 
      nickname || null, 
      user_id, 
      parentId
    );

    const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(newId);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error reposting:', error);
    return NextResponse.json({ error: 'Failed to repost' }, { status: 500 });
  }
}
