#!/usr/bin/env node

/**
 * TrainMedix Database Setup
 * 
 * This script generates SQL for creating all tables in Supabase
 * You need to run this SQL in your Supabase SQL Editor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SQL_SCRIPT = `
-- ============================================================================
-- TrainMedix Database Schema Setup
-- Generated: ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Go to https://app.supabase.com/
-- 2. Select your project (gxtpzrhlvycvsjqrvuvv)
-- 3. Go to SQL Editor → New Query
-- 4. Copy & paste this entire script
-- 5. Click "Run"
-- ============================================================================

-- 1. USERS TABLE (Trainees, Hospitals, Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('trainee', 'hospital', 'admin')),
  password_hash TEXT,
  profile_image_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  accreditation TEXT,
  total_slots INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. HOSPITAL_DEPARTMENTS (Many-to-many mapping)
CREATE TABLE IF NOT EXISTS hospital_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  mentor_name TEXT,
  mentor_qualification TEXT,
  max_slots INT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(hospital_id, department_id)
);

-- 5. TRAINING SLOTS TABLE
CREATE TABLE IF NOT EXISTS training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_department_id UUID REFERENCES hospital_departments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  available_seats INT NOT NULL,
  booked_seats INT DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT now()
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES training_slots(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 7. LOGBOOK ENTRIES TABLE
CREATE TABLE IF NOT EXISTS logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  procedure_name TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('observed', 'assisted', 'performed')),
  notes TEXT,
  mentor_feedback TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id),
  department_id UUID REFERENCES departments(id),
  certificate_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  qr_code_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_bookings_trainee ON bookings(trainee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON bookings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_logbook_booking ON logbook_entries(booking_id);
CREATE INDEX IF NOT EXISTS idx_logbook_trainee ON logbook_entries(trainee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify tables exist)
-- ============================================================================

-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE 'pg_%'
ORDER BY table_name;

-- Count indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
`;

async function generateSQL() {
  try {
    console.log('📝 Generating SQL setup script...\n');

    // Save to file in project root
    const outputPath = path.join(__dirname, '..', 'SUPABASE_SETUP_SQL.sql');
    fs.writeFileSync(outputPath, SQL_SCRIPT);

    console.log('✅ SQL script generated successfully!\n');
    console.log('📋 File saved: SUPABASE_SETUP_SQL.sql\n');

    console.log('🚀 SETUP INSTRUCTIONS:');
    console.log('═══════════════════════════════════════════\n');
    console.log('1. Open browser: https://app.supabase.com/');
    console.log('2. Login to your account');
    console.log('3. Select project: gxtpzrhlvycvsjqrvuvv');
    console.log('4. Navigate to: SQL Editor → New Query');
    console.log('5. Copy entire content from SUPABASE_SETUP_SQL.sql');
    console.log('6. Paste into the SQL Editor');
    console.log('7. Click "Run" button (top right)');
    console.log('8. Wait for "Queries executed successfully" message\n');

    console.log('📊 WHAT WILL BE CREATED:');
    console.log('═══════════════════════════════════════════');
    console.log('✅ 10 Database Tables:');
    console.log('   • users');
    console.log('   • hospitals');
    console.log('   • departments');
    console.log('   • hospital_departments');
    console.log('   • training_slots');
    console.log('   • bookings');
    console.log('   • logbook_entries');
    console.log('   • certificates');
    console.log('   • notifications');
    console.log('   • audit_logs\n');

    console.log('✅ 11 Performance Indexes\n');
    console.log('✅ Row Level Security (RLS) Policies\n');

    console.log('✨ NEXT STEPS:');
    console.log('═══════════════════════════════════════════');
    console.log('After running SQL:');
    console.log('1. Create Storage Buckets:');
    console.log('   • Go to Storage section');
    console.log('   • Create: certificates (Public)');
    console.log('   • Create: hospital-documents (Private)');
    console.log('   • Create: profile-images (Public)\n');

    console.log('2. Update Frontend:');
    console.log('   • Run: npm run dev');
    console.log('   • Follow: FRONTEND_MIGRATION_GUIDE.md\n');

    console.log('3. Test Application:');
    console.log('   • Visit: http://localhost:3000');
    console.log('   • Test signup/login');
    console.log('   • Test booking flow\n');

  } catch (error) {
    console.error('❌ Error generating SQL:', error.message);
    process.exit(1);
  }
}

generateSQL();
