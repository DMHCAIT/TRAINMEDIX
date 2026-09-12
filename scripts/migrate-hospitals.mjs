#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    process.env[key.trim()] = value.trim();
  }
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  try {
    // Parse the connection string
    const url = new URL(DATABASE_URL);
    const config = {
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    };

    console.log(`Connecting to ${config.host}:${config.port}...`);
    const client = new Client(config);
    
    await client.connect();
    console.log('Connected to database');

    // Run the migration - split into separate statements
    const statements = [
      'ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0',
      'ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS image_url TEXT',
      'ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS website TEXT',
      "COMMENT ON COLUMN hospitals.available_slots IS 'Number of training slots available at this hospital'",
      "COMMENT ON COLUMN hospitals.image_url IS 'URL to the hospital image in storage'",
      "COMMENT ON COLUMN hospitals.website IS 'Hospital website URL'"
    ];

    for (const sql of statements) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql.substring(0, 50)}...`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error(`❌ Failed: ${sql}`);
          throw err;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    await client.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
