import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/api/posts/[id]/repost/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """    // Check if user already reposted this parent
    const existingRepost = db.prepare('SELECT id FROM posts WHERE parent_id = ? AND user_id = ?').get(parentId, user_id) as any;

    if (existingRepost) {
      // Toggle OFF (Cancel repost)
      db.prepare('DELETE FROM posts WHERE id = ?').run(existingRepost.id);
      db.prepare('UPDATE users SET total_points = total_points - 1 WHERE id = ?').run(user_id);
      return NextResponse.json({ status: 'removed', pointDelta: -1 }, { status: 200 });
    } else {
      // Toggle ON (Create repost)
      const newId = crypto.randomUUID();
      const stmt = db.prepare(`
        INSERT INTO posts (id, content, keyword, nickname, user_id, parent_id, color, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        newId, 
        parentPost.content, 
        parentPost.keyword, 
        nickname || null, 
        user_id, 
        parentId,
        parentPost.color || null,
        parentPost.category || null
      );

      db.prepare('UPDATE users SET total_points = total_points + 1 WHERE id = ?').run(user_id);
      const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(newId);
      return NextResponse.json({ status: 'added', pointDelta: 1, post: newPost }, { status: 201 });
    }"""

repl = """    // Fetch current event and user bonus status
    const configRow = db.prepare("SELECT value FROM config WHERE key = 'current_event'").get() as any;
    const currentEvent = configRow?.value || '인사';
    const userRow = db.prepare("SELECT has_received_event_bonus FROM users WHERE id = ?").get(user_id) as any;
    const hasReceivedBonus = userRow?.has_received_event_bonus === 1;

    // Check if user already reposted this parent
    const existingRepost = db.prepare('SELECT id FROM posts WHERE parent_id = ? AND user_id = ?').get(parentId, user_id) as any;

    if (existingRepost) {
      // Toggle OFF (Cancel repost)
      db.prepare('DELETE FROM posts WHERE id = ?').run(existingRepost.id);
      
      // If it was an event post and they had the bonus, we revoke the bonus for the hackathon demo
      let deductPoints = 1;
      if (parentPost.category === currentEvent && hasReceivedBonus) {
        deductPoints = 3;
        db.prepare('UPDATE users SET total_points = total_points - ?, has_received_event_bonus = 0 WHERE id = ?').run(deductPoints, user_id);
      } else {
        db.prepare('UPDATE users SET total_points = total_points - ? WHERE id = ?').run(deductPoints, user_id);
      }
      
      return NextResponse.json({ status: 'removed', pointDelta: -deductPoints }, { status: 200 });
    } else {
      // Toggle ON (Create repost)
      const newId = crypto.randomUUID();
      const stmt = db.prepare(`
        INSERT INTO posts (id, content, keyword, nickname, user_id, parent_id, color, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        newId, 
        parentPost.content, 
        parentPost.keyword, 
        nickname || null, 
        user_id, 
        parentId,
        parentPost.color || null,
        parentPost.category || null
      );

      let addPoints = 1;
      if (parentPost.category === currentEvent && !hasReceivedBonus) {
        addPoints = 3;
        db.prepare('UPDATE users SET total_points = total_points + ?, has_received_event_bonus = 1 WHERE id = ?').run(addPoints, user_id);
      } else {
        db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(addPoints, user_id);
      }

      const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(newId);
      return NextResponse.json({ status: 'added', pointDelta: addPoints, post: newPost }, { status: 201 });
    }"""

content = content.replace(target, repl)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch repost successful!")
