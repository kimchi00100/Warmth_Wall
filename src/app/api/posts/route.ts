import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { campaignData } from '@/lib/campaignData';

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
    let { content, nickname, user_id, keyword, parent_id, photo, color, category } = body;

    if (!content || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current event category from config
    const configRow = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get() as any;
    const currentEvent = configRow?.value || '인사'; // Default to 인사 if not set

    const userRow = db.prepare("SELECT has_received_event_bonus FROM users WHERE id = ?").get(user_id) as any;
    const hasReceivedBonus = userRow?.has_received_event_bonus === 1;

    let isCampaignMatched = false;
    let earnedPoints = 1; // Base point for posting
    let shouldGiveBonus = false;

    // Check if category matches current event
    if (category === currentEvent && !hasReceivedBonus) {
      isCampaignMatched = true;
      shouldGiveBonus = true;
      earnedPoints += 2; // +2 bonus
      content = content + " (✨이벤트 참여로 온기 보너스!)";
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO posts (id, content, keyword, nickname, user_id, parent_id, photo, color, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, content, keyword || null, nickname || null, user_id, parent_id || null, photo || null, color || null, category || null);

    // Update user points
    if (shouldGiveBonus) {
      db.prepare('UPDATE users SET total_points = total_points + ?, has_received_event_bonus = 1 WHERE id = ?').run(earnedPoints, user_id);
    } else {
      db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(earnedPoints, user_id);
    }

    const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
    return NextResponse.json({ ...newPost, isCampaignMatched, earnedPoints }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
