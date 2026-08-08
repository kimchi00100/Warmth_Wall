const Database = require('better-sqlite3');
const db = new Database('./data/warmth_wall.db');

try {
  db.exec('ALTER TABLE users ADD COLUMN has_received_event_bonus INTEGER DEFAULT 0;');
  console.log("Column has_received_event_bonus added successfully!");
} catch (err) {
  console.log("Column already exists or error: ", err.message);
}
