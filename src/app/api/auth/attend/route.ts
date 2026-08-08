import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { user_id, client_date } = await request.json();

    if (!user_id || !client_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = db.prepare('SELECT id, total_points, last_attendance FROM users WHERE id = ?').get(user_id) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let points = user.total_points || 0;
    let didAttend = false;

    // Use client_date instead of server date so the "Midnight Reset" demo button works perfectly
    if (user.last_attendance !== client_date) {
      points += 1;
      didAttend = true;
      db.prepare('UPDATE users SET total_points = ?, last_attendance = ? WHERE id = ?').run(points, client_date, user.id);
    }

    return NextResponse.json({ success: true, didAttend, total_points: points }, { status: 200 });
  } catch (error) {
    console.error('Error in attend API:', error);
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 });
  }
}
