#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
envContent.split('\n').forEach((line) => {
  const i = line.indexOf('=');
  if (i === -1) return;
  const k = line.slice(0, i).trim();
  const v = line.slice(i + 1).trim();
  if (k && v && !k.startsWith('#')) process.env[k] = v;
});

export async function connect() {
  const url = new URL(process.env.DATABASE_URL);
  const password = decodeURIComponent(url.password);
  const username = decodeURIComponent(url.username);
  const ref =
    (username.includes('.') ? username.split('.').pop() : null) ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').split('.')[0];

  const candidates = [
    { user: username, host: url.hostname, port: parseInt(url.port || '5432'), database: url.pathname.slice(1) || 'postgres' },
    { user: 'postgres', host: `db.${ref}.supabase.co`, port: 5432, database: 'postgres' },
  ];

  for (const c of candidates) {
    const client = new Client({ ...c, password, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      return client;
    } catch {
      try { await client.end(); } catch {}
    }
  }
  throw new Error('Could not connect to the database.');
}
