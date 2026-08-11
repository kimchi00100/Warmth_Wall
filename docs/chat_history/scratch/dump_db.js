const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'C:\\Users\\xjwoz\\OneDrive\\Desktop\\_Dasom_Hackathon\\warmth_wall.db';
const db = new Database(dbPath);

console.log("=== USERS TABLE ===");
const users = db.prepare('SELECT id, email, created_at FROM users').all();
console.table(users);

console.log("\n=== POSTS TABLE ===");
const posts = db.prepare('SELECT id, content, nickname, user_id, color, category, created_at FROM posts').all();
console.table(posts);
