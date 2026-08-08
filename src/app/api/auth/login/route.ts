import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, client_date } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Attendance Point Logic (+1 point for first login of the day)
    const todayStr = client_date || new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    let points = user.total_points || 0;
    
    if (user.last_attendance !== todayStr) {
      points += 1;
      db.prepare('UPDATE users SET total_points = ?, last_attendance = ? WHERE id = ?').run(points, todayStr, user.id);
    }

    return NextResponse.json({ user_id: user.id, email: user.email, total_points: points }, { status: 200 });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
