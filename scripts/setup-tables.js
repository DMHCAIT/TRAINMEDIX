import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SQL statements
const sqlFilePath = path.join(__dirname, '..', 'SUPABASE_SETUP_SQL.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Filter and prepare SQL statements
const statements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 5);

async function createTablesWithPostgres() {
  let client;
  try {
    console.log('🚀 Connecting to Supabase PostgreSQL...\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Connect using PostgreSQL client
    client = new Client({
      host: 'db.gxtpzrhlvycvsjqrvuvv.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Trainmedix123',
      ssl: {
        rejectUnauthorized: false
      },
      statement_timeout: 30000,
      connectionTimeoutMillis: 10000,
    });

    await client.connect();
    console.log('✅ Connected to database!\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt
        .replace(/\n/g, ' ')
        .substring(0, 70)
        .trim() + (stmt.length > 70 ? '...' : '');

      try {
        process.stdout.write(`[${i + 1}/${statements.length}] ⏳ ${preview}`);
        await client.query(stmt);
        console.log(` ✅\n`);
        successCount++;
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(` ⏭️ (exists)\n`);
          successCount++;
        } else {
          console.log(` ⚠️ (${err.message.substring(0, 40)})\n`);
          errorCount++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    console.log('📊 Results:');
    console.log(`   ✅ Executed: ${successCount}`);
    console.log(`   ⚠️  Errors/Warnings: ${errorCount}\n`);

    // Verify tables
    console.log('🔍 Verifying tables...\n');

    const verifyQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE 'pg_%'
      ORDER BY table_name;
    `;

    const result = await client.query(verifyQuery);
    const tables = result.rows.map(r => r.table_name);

    console.log(`✅ Tables in Database: ${tables.length}\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    if (tables.length >= 10) {
      console.log('\n🎉 SUCCESS! All tables created in Supabase!\n');
      console.log('📌 Next steps:');
      console.log('1. ✅ Database tables created');
      console.log('2. 📁 Create Storage Buckets:');
      console.log('   Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/storage');
      console.log('   Create buckets:');
      console.log('   - certificates (Public)');
      console.log('   - hospital-documents (Private)');
      console.log('   - profile-images (Public)');
      console.log('3. 🚀 Run: npm run dev');
      console.log('4. 🧪 Test application at http://localhost:3000\n');
    } else {
      console.log('\n⚠️  Warning: Expected 10 tables but found ' + tables.length + '\n');
    }

    await client.end();

  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify .env.local credentials are correct');
    console.log('2. Check PostgreSQL connection settings');
    console.log('3. Ensure Supabase project is active');
    console.log('4. Try manual setup: Copy SUPABASE_SETUP_SQL.sql to Supabase SQL Editor\n');
    
    if (client) {
      try {
        await client.end();
      } catch (err) {
        // Ignore
      }
    }
    process.exit(1);
  }
}

createTablesWithPostgres();
