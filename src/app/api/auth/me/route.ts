import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user_id = searchParams.get('user_id');

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  try {
    const user = db.prepare('SELECT id, email, total_points, last_attendance FROM users WHERE id = ?').get(user_id) as any;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Also fetch current event category from config
    const configRow = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get() as any;
    const currentEvent = configRow?.value || '인사';

    return NextResponse.json({ user, currentEvent }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
