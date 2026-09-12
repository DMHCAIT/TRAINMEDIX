#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   TrainMedix Database Setup Instructions                   ║
║                         Create Tables in Supabase                          ║
╚════════════════════════════════════════════════════════════════════════════╝

⚠️  IMPORTANT: Tables do not exist yet in your Supabase database.

The SQL file is ready, but it must be executed in the Supabase SQL Editor.
REST API cannot execute table creation (DDL) statements.

═════════════════════════════════════════════════════════════════════════════

🔧 STEP-BY-STEP INSTRUCTIONS:

1️⃣  OPEN SUPABASE DASHBOARD
   ├─ Go to: https://app.supabase.com/
   └─ Login to your account

2️⃣  SELECT YOUR PROJECT
   ├─ Look for: "gxtpzrhlvycvsjqrvuvv" (TrainMedix project)
   └─ Click to open

3️⃣  OPEN SQL EDITOR
   ├─ In left sidebar, click: "SQL Editor"
   └─ Or visit: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql

4️⃣  CREATE NEW QUERY
   ├─ Click button: "+ New Query" (top left)
   └─ An empty SQL editor will open

5️⃣  COPY SQL FILE CONTENT
   ├─ Open file: SUPABASE_SETUP_SQL.sql
   ├─ Select all text: Ctrl+A
   └─ Copy: Ctrl+C

   OR use this one-liner:
   ├─ Copy ALL text below:
   └─ (Starting from "-- 1. USERS TABLE..." until the end)

6️⃣  PASTE INTO SUPABASE SQL EDITOR
   ├─ Click in the SQL editor text area
   ├─ Paste: Ctrl+V
   └─ The entire SQL script will appear

7️⃣  EXECUTE THE SQL
   ├─ Look for green "Run" button (top right corner)
   ├─ Click it
   └─ Wait 5-10 seconds for execution

8️⃣  VERIFY SUCCESS
   ├─ You should see: "Queries executed successfully" message
   ├─ Or at bottom: Green checkmark with row count
   └─ If errors appear, copy them and show me

9️⃣  CHECK TABLES WERE CREATED
   ├─ Go to: Table Editor (left sidebar)
   ├─ Refresh browser: F5
   └─ You should see 10 tables listed:
      • users
      • hospitals
      • departments
      • hospital_departments
      • training_slots
      • bookings
      • logbook_entries
      • certificates
      • notifications
      • audit_logs

═════════════════════════════════════════════════════════════════════════════

📋 WHAT WILL BE CREATED:

✅ Database Tables (10):
   • users            - User accounts (trainees, hospitals, admins)
   • hospitals        - Hospital information
   • departments      - Medical departments/specialties
   • hospital_departments - Hospital-Department mappings
   • training_slots   - Available training slots
   • bookings         - Trainee bookings
   • logbook_entries  - Daily training records
   • certificates     - Issued certificates
   • notifications    - System notifications
   • audit_logs       - Activity audit trail

✅ Indexes (11):
   For fast queries on email, phone, city, status, etc.

✅ Row-Level Security (RLS):
   Enabled on all tables for data protection

═════════════════════════════════════════════════════════════════════════════

📂 SQL FILE LOCATION:

File: SUPABASE_SETUP_SQL.sql
Path: PROJECT_ROOT/SUPABASE_SETUP_SQL.sql

═════════════════════════════════════════════════════════════════════════════

✅ AFTER TABLES ARE CREATED:

1. Run development server:
   npm run dev

2. Visit application:
   http://localhost:3000

3. Test the features:
   ✓ Sign up
   ✓ Login
   ✓ Browse hospitals
   ✓ Make a booking
   ✓ Upload certificate

═════════════════════════════════════════════════════════════════════════════

❓ TROUBLESHOOTING:

Q: I see "table already exists" error
A: This is OK! It means tables are created. Continue with "Run".

Q: I see "syntax error" in SQL
A: Make sure you copied the ENTIRE file content, not just part of it.

Q: Tables still don't appear in Table Editor
A: Refresh browser (F5) or log out and log back in.

Q: Nothing seems to work
A: Try using this direct link with SQL query:
   https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new
   
   Then paste the SQL and click Run.

═════════════════════════════════════════════════════════════════════════════

📞 NEED HELP?

1. Check browser console (F12) for errors
2. Verify you're logged in to Supabase
3. Verify you have the correct project selected
4. Try copy-pasting again with fresh copy
5. Try using incognito/private browser window

═════════════════════════════════════════════════════════════════════════════

🔗 QUICK LINKS:

Supabase Dashboard:
https://app.supabase.com/

Your Project:
https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv

SQL Editor:
https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new

Table Editor:
https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/editor

═════════════════════════════════════════════════════════════════════════════
`);

const sqlFilePath = path.join(__dirname, '..', 'SUPABASE_SETUP_SQL.sql');

if (fs.existsSync(sqlFilePath)) {
  console.log(`
📂 SQL FILE STATUS: ✅ READY

Location: ${sqlFilePath}
Size: ${(fs.statSync(sqlFilePath).size / 1024).toFixed(2)} KB

`);
} else {
  console.log(`
❌ SQL FILE NOT FOUND!

Expected at: ${sqlFilePath}
Please run: npm run generate-sql

`);
}

console.log(`
═════════════════════════════════════════════════════════════════════════════

⏭️  NEXT ACTION:

Open Supabase Dashboard and paste the SQL:
https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new

═════════════════════════════════════════════════════════════════════════════
`);
