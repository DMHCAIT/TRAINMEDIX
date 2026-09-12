const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is missing from .env.local');
  process.exit(1);
}

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'cities';"
    );
    console.log(JSON.stringify({ rows: res.rows }, null, 2));
  } catch (error) {
    console.error('DB_ERROR:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
