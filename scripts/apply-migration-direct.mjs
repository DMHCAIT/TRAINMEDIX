#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=');
  if (idx === -1 || line.trim().startsWith('#')) return;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (key && value) envVars[key] = value;
});

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911_add_department_hospital_offerings.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

// Split statements
const statements = migrationSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'))
  .map(stmt => stmt + ';');

async function connectAndExecute() {
  // Parse DATABASE_URL - handle postgresql:// format
  // Format: postgresql://user:password@host:port/database
  const afterProto = DATABASE_URL.split('://')[1];
  const [credentials, hostDb] = afterProto.split('@');
  const [username, password] = credentials.split(':');
  const [hostPort, database] = hostDb.split('/');
  const [host, port] = hostPort.split(':');
  
  if (!username || !password || !host || !port || !database) {
    console.error('❌ Cannot parse DATABASE_URL format');
    console.error('   Expected: postgresql://user:password@host:port/database');
    console.error('   Got:', DATABASE_URL.substring(0, 80) + '...');
    process.exit(1);
  }
  
  console.log('🔌 Connecting to Supabase PostgreSQL...');
  console.log(`   User: ${username}`);
  console.log(`   Host: ${host}:${port}`);
  console.log(`   Database: ${database}\n`);

  const client = new Client({
    user: username,
    password,
    host,
    port: parseInt(port),
    database,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected\n');

    console.log('🚀 Applying migration: add_department_hospital_offerings\n');
    console.log(`📊 Total statements: ${statements.length}\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt
        .replace(/\n/g, ' ')
        .substring(0, 80)
        .trim() + (stmt.length > 80 ? '...' : '');

      try {
        console.log(`[${i + 1}/${statements.length}] ⏳ ${preview}`);
        await client.query(stmt);
        console.log(`       ✅\n`);
        successCount++;
      } catch (err) {
        // Check for idempotent errors
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`       ⏭️  Already exists\n`);
          successCount++;
        } else {
          console.log(`       ❌ ${err.message}\n`);
          errorCount++;
          errors.push({ statement: preview, error: err.message });
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    console.log(`📊 Results Summary:`);
    console.log(`   ✅ Succeeded: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}\n`);

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      errors.forEach((e, idx) => {
        console.log(`\n${idx + 1}. ${e.statement}`);
        console.log(`   ${e.error}`);
      });
    }

    // Verify the column
    console.log('\n🔍 Verifying column creation...\n');

    try {
      const result = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'departments'
        AND column_name = 'hospital_offerings'
      `);

      if (result.rows.length > 0) {
        console.log('✅ Column hospital_offerings created successfully');
        console.log(`   Type: ${result.rows[0].data_type}\n`);
      } else {
        console.log('❌ Column hospital_offerings not found\n');
      }
    } catch (err) {
      console.log(`❌ Verification error: ${err.message}\n`);
    }

    // Check departments with offerings
    console.log('📋 Sample departments with offerings:\n');
    try {
      const result = await client.query(`
        SELECT id, name, array_length(hospital_offerings, 1) as offering_count
        FROM departments
        LIMIT 5
      `);

      result.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.name}`);
        console.log(`   Offerings stored: ${row.offering_count || 0}\n`);
      });
    } catch (err) {
      console.log(`Could not query offerings: ${err.message}\n`);
    }

    if (errorCount === 0) {
      console.log('✨ Migration applied successfully!\n');
      console.log('📌 Next steps:');
      console.log('1. Reload the admin panel in browser');
      console.log('2. Edit a department and add hospital/pricing/batch details');
      console.log('3. Click Save to persist to departments.hospital_offerings');
      console.log('4. Verify data is preserved on reload\n');
    }
  } catch (err) {
    console.error('\n❌ Connection error:', err.message);
  } finally {
    await client.end();
  }
}

connectAndExecute();
