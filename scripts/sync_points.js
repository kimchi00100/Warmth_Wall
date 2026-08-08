const Database = require('better-sqlite3');
const db = new Database('./data/warmth_wall.db');

console.log('--- Starting Points Synchronization ---');

// Reset all points to 0 but PRESERVE last_attendance
db.prepare('UPDATE users SET total_points = 0').run();

// 1. Calculate points from posts (+1 base, +2 bonus if category matches event)
const eventCategory = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get()?.value || '인사';

const posts = db.prepare('SELECT user_id, category FROM posts WHERE parent_id IS NULL').all();
for (const post of posts) {
  let earned = 1;
  if (post.category === eventCategory) {
    earned += 2;
  }
  db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(earned, post.user_id);
}

// 2. Calculate points from reposts (나도요) (+1 base)
const reposts = db.prepare('SELECT user_id FROM posts WHERE parent_id IS NOT NULL').all();
for (const repost of reposts) {
  db.prepare('UPDATE users SET total_points = total_points + 1 WHERE id = ?').run(repost.user_id);
}

// 3. Re-add attendance point if last_attendance is not null
db.prepare('UPDATE users SET total_points = total_points + 1 WHERE last_attendance IS NOT NULL').run();

console.log('--- Points Synchronization Complete ---');
