const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigrations() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration(s).`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${file}`);
    try {
      // Split by semicolons to run multiple statements if needed
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await db.query(statement);
      }
      console.log(`  ✓ ${file} completed successfully.`);
    } catch (err) {
      console.error(`  ✗ ${file} failed:`, err.message);
      throw err;
    }
  }

  console.log('All migrations completed.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

