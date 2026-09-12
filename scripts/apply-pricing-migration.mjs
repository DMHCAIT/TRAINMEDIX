#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (key && value && !key.startsWith('#')) process.env[key] = value;
});

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is missing from .env.local');
  process.exit(1);
}

const statements = [
  `ALTER TABLE hospital_departments ADD COLUMN IF NOT EXISTS city TEXT`,
  `ALTER TABLE hospital_departments ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}'::jsonb`,
  `UPDATE hospital_departments hd
     SET city = COALESCE(h.cities[1], h.city)
     FROM hospitals h
    WHERE hd.hospital_id = h.id AND hd.city IS NULL`,
  `ALTER TABLE hospital_departments
     DROP CONSTRAINT IF EXISTS hospital_departments_hospital_id_department_id_key`,
  `CREATE UNIQUE INDEX IF NOT EXISTS hospital_departments_hospital_dept_city_key
     ON hospital_departments (hospital_id, department_id, city)`,
];

async function connect() {
  const url = new URL(DATABASE_URL);
  const password = decodeURIComponent(url.password);
  const username = decodeURIComponent(url.username);

  // Project ref is embedded either in the pooler username or the Supabase URL
  const refFromUser = username.includes('.') ? username.split('.').pop() : null;
  const refFromUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace('https://', '')
    .split('.')[0];
  const ref = refFromUser || refFromUrl;

  const candidates = [
    {
      label: 'DATABASE_URL host',
      user: username,
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1) || 'postgres',
    },
  ];

  if (ref) {
    candidates.push({
      label: 'direct db host',
      user: 'postgres',
      host: `db.${ref}.supabase.co`,
      port: 5432,
      database: 'postgres',
    });
    candidates.push({
      label: 'pooler (aws-1 us-east-2)',
      user: `postgres.${ref}`,
      host: 'aws-1-us-east-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
    });
  }

  for (const c of candidates) {
    const client = new Client({
      user: c.user,
      password,
      host: c.host,
      port: c.port,
      database: c.database,
      ssl: { rejectUnauthorized: false },
    });
    try {
      console.log(`Trying ${c.label}: ${c.host}:${c.port} ...`);
      await client.connect();
      console.log(`Connected via ${c.label}.`);
      return client;
    } catch (err) {
      console.log(`  failed: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
  throw new Error('Could not connect to the database with any known host.');
}

async function run() {
  const client = await connect();

  for (const sql of statements) {
    const label = sql.split('\n')[0].trim().slice(0, 70);
    try {
      await client.query(sql);
      console.log(`OK   ${label}`);
    } catch (err) {
      console.error(`FAIL ${label}\n     ${err.message}`);
    }
  }

  const { rows } = await client.query(
    `SELECT column_name, data_type
       FROM information_schema.columns
      WHERE table_name = 'hospital_departments'
      ORDER BY ordinal_position`
  );
  console.log('\nhospital_departments columns:');
  rows.forEach((r) => console.log(`  - ${r.column_name} (${r.data_type})`));

  const dupes = await client.query(
    `SELECT name, COUNT(*) AS count
       FROM hospitals
      GROUP BY name
     HAVING COUNT(*) > 1`
  );
  if (dupes.rows.length > 0) {
    console.log('\nDuplicate hospital names:');
    dupes.rows.forEach((r) => console.log(`  - ${r.name} x${r.count}`));
  } else {
    console.log('\nNo duplicate hospital names.');
  }

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
