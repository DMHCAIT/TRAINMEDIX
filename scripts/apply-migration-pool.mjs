#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
const DATABASE_URL = dbUrlLine?.split('=')[1];

console.log('🔌 Connecting to Supabase PostgreSQL via direct pool connection...\n');

// Use the DATABASE_URL directly with Pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Disable automatic reaping of idle clients
  idleTimeoutMillis: 30000,
  max: 20,
});

async function applyMigration() {
  const client = await pool.connect();

  try {
    console.log('✅ Connected\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911_add_department_hospital_offerings.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    // Split statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
      .map(stmt => stmt + ';');

    console.log(`🚀 Applying migration: add_department_hospital_offerings\n📊 Total statements: ${statements.length}\n`);

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
        process.stdout.write(`[${i + 1}/${statements.length}] ⏳ ${preview}`);
        await client.query(stmt);
        console.log(` ✅\n`);
        successCount++;
      } catch (err) {
        const msg = err.message?.toLowerCase() || '';
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          console.log(` ⏭️\n`);
          successCount++;
        } else {
          console.log(` ❌\n       Error: ${err.message}\n`);
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

    // Verify column was created
    console.log('\n🔍 Verifying column creation...\n');
    try {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'departments'
        AND column_name = 'hospital_offerings'
      `);

      if (result.rows.length > 0) {
        const col = result.rows[0];
        console.log('✅ Column hospital_offerings successfully created!');
        console.log(`   Type: ${col.data_type}`);
        console.log(`   Nullable: ${col.is_nullable}\n`);
      } else {
        console.log('❌ Column hospital_offerings not found in schema\n');
      }
    } catch (err) {
      console.log(`❌ Verification error: ${err.message}\n`);
    }

    // Try to query departments with the new column
    console.log('📋 Testing query with new column...\n');
    try {
      const result = await client.query(`
        SELECT id, name, hospital_offerings
        FROM departments
        LIMIT 3
      `);

      console.log('✅ Successfully queried departments with hospital_offerings column!\n');
      result.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.name}`);
        console.log(`   hospital_offerings: ${typeof row.hospital_offerings === 'object' ? JSON.stringify(row.hospital_offerings).substring(0, 60) : row.hospital_offerings}\n`);
      });
    } catch (err) {
      console.log(`❌ Query error: ${err.message}\n`);
    }

    if (errorCount === 0) {
      console.log('✨ Migration applied successfully!\n');
      console.log('📌 Next steps:');
      console.log('1. Refresh the browser or restart the dev server');
      console.log('2. Admin can now save department data to departments.hospital_offerings');
      console.log('3. Website booking will read from the same column\n');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await client.release();
    await pool.end();
  }
}

applyMigration();
