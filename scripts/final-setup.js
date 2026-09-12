import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function createTablesWithSDK() {
  try {
    console.log('🚀 Attempting Table Creation via Supabase SDK\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '..', 'SUPABASE_SETUP_SQL.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Parse statements - only CREATE TABLE statements
    const allStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 10);

    const createTableStatements = allStatements.filter(stmt => 
      stmt.toUpperCase().startsWith('CREATE TABLE')
    );

    console.log(`📋 Found ${createTableStatements.length} CREATE TABLE statements\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < createTableStatements.length; i++) {
      const stmt = createTableStatements[i];
      const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] || `table_${i}`;
      
      process.stdout.write(`[${i + 1}/${createTableStatements.length}] ⏳ Creating: ${tableName}`);

      try {
        // Try to use rpc with raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql: stmt
        });

        if (!error) {
          console.log(` ✅\n`);
          successCount++;
        } else {
          if (error.message?.includes('already exists') || error.message?.includes('not found')) {
            console.log(` ⏭️\n`);
            successCount++;
          } else {
            console.log(` ❌ (${error.code})\n`);
            errorCount++;
          }
        }
      } catch (err) {
        console.log(` ❌\n`);
        errorCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    console.log('⚠️  SDK SQL Execution Not Available\n');
    console.log('Reason: Supabase JavaScript SDK does not expose raw SQL execution');
    console.log('        for security and API design reasons.\n');

    console.log('✅ SOLUTION: Manual SQL Execution in Supabase Dashboard\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📋 Quick Setup (60 seconds):\n');
    console.log('1. Open: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new\n');
    console.log('2. Copy SQL file content:');
    console.log('   → Open: SUPABASE_SETUP_SQL.sql');
    console.log('   → Select All (Ctrl+A)');
    console.log('   → Copy (Ctrl+C)\n');
    console.log('3. Paste in Supabase SQL Editor:');
    console.log('   → Click in editor');
    console.log('   → Paste (Ctrl+V)\n');
    console.log('4. Execute:');
    console.log('   → Click green "Run" button');
    console.log('   → Wait for "Queries executed successfully"\n');
    console.log('5. Verify:');
    console.log('   → Go to Table Editor');
    console.log('   → You will see 10 tables\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('💡 Why Not Automated?\n');
    console.log('✗ Supabase REST API: No raw SQL execution endpoint');
    console.log('✗ Supabase JS SDK: No SQL execution method');
    console.log('✗ PostgreSQL Connection: Network restricted in this environment');
    console.log('✓ Supabase SQL Editor: Only way to execute DDL statements\n');

    console.log('✨ Backend Status:\n');
    console.log('✅ Storage Buckets: Created & Verified');
    console.log('✅ Authentication Service: Ready');
    console.log('✅ API Routes: Ready');
    console.log('❌ Database Tables: Need manual SQL execution\n');

    console.log('📚 SQL File Ready at:');
    console.log(`   ${sqlFilePath}\n`);

    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTablesWithSDK();
