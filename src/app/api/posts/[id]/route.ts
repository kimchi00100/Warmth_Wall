import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parentId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const keyword = searchParams.get('keyword');
    const action = searchParams.get('action');

    if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });

    if (action === 'delete_post') {
      const targetPost = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(parentId, userId) as any;
      if (targetPost) {
        // Points deduction logic for deleting own post
        const configRow = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get() as any;
        const currentEvent = configRow?.value || '인사';
        
        let deductPoints = 1;
        // If it was an event category, just deduct 1 point for simplicity to avoid breaking their bonus flag unless we do complex checks
        
        db.prepare('UPDATE users SET total_points = total_points - ? WHERE id = ?').run(deductPoints, userId);
        
        // Delete any child nadoro posts to prevent orphans
        db.prepare('DELETE FROM posts WHERE parent_id = ?').run(targetPost.id);
        
        // Delete the post itself
        db.prepare('DELETE FROM posts WHERE id = ?').run(targetPost.id);
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    let targetPost;
    if (keyword) {
      targetPost = db.prepare('SELECT * FROM posts WHERE user_id = ? AND keyword = ?').get(userId, keyword) as any;
    } else {
      targetPost = db.prepare('SELECT * FROM posts WHERE user_id = ? AND parent_id = ?').get(userId, parentId) as any;
    }

    if (targetPost) {
      const configRow = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get() as any;
      const currentEvent = configRow?.value || '인사';
      const userRow = db.prepare("SELECT has_received_event_bonus FROM users WHERE id = ?").get(userId) as any;
      const hasReceivedBonus = userRow?.has_received_event_bonus === 1;

      let deductPoints = 1;
      if (targetPost.category === currentEvent && hasReceivedBonus) {
        deductPoints = 3;
        db.prepare('UPDATE users SET total_points = total_points - ?, has_received_event_bonus = 0 WHERE id = ?').run(deductPoints, userId);
      } else {
        db.prepare('UPDATE users SET total_points = total_points - ? WHERE id = ?').run(deductPoints, userId);
      }
      
      db.prepare('DELETE FROM posts WHERE id = ?').run(targetPost.id);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
