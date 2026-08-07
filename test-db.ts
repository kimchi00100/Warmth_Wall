import db from './src/lib/db';
import { seedMockData } from './src/lib/mockData';

// 1. Verify DB is working and schema exists
console.log('DB Connection Test:', db.prepare('SELECT 1').get());

// 2. Seed Mock Data
seedMockData();

// 3. Verify Posts Table count
console.log('Total posts in DB:', db.prepare('SELECT COUNT(*) as c FROM posts').get());
