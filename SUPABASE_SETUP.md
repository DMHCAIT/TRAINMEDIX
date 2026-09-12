# 🗄️ Supabase Setup Guide for TrainMedix

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create a new project:
   - Organization: Create new or select existing
   - Database name: `trainmedix_db`
   - Region: Choose closest to India (Singapore/Mumbai)
   - Password: Save this securely!

## 2. Get Your Credentials

1. After project creation, go to **Settings → API**
2. Copy these values and paste into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Database Setup

### Run these SQL queries in Supabase SQL Editor:

Go to **SQL Editor** → **New Query** → Paste and run:

```sql
-- 1. USERS TABLE (Trainees, Hospitals, Admins)
CREATE TABLE users (
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
CREATE TABLE hospitals (
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
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. HOSPITAL_DEPARTMENTS (Many-to-many)
CREATE TABLE hospital_departments (
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
CREATE TABLE training_slots (
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
CREATE TABLE bookings (
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
CREATE TABLE logbook_entries (
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
CREATE TABLE certificates (
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
CREATE TABLE notifications (
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
CREATE TABLE audit_logs (
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_bookings_trainee ON bookings(trainee_id);
CREATE INDEX idx_bookings_hospital ON bookings(hospital_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_logbook_booking ON logbook_entries(booking_id);
CREATE INDEX idx_logbook_trainee ON logbook_entries(trainee_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
```

## 4. Enable Row Level Security (RLS)

In Supabase SQL Editor, run:

```sql
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
```

## 5. Create Storage Buckets

In **Storage** tab:
1. Create new bucket: `certificates` (Public)
2. Create new bucket: `hospital-documents` (Private)
3. Create new bucket: `profile-images` (Public)

## 6. Configure Authentication

1. Go to **Authentication → Providers**
2. Enable: Email/Password (default)
3. Go to **Authentication → Policies** and enable email confirmations if needed

## Next Steps

1. Update `.env.local` with your credentials
2. Run `npm run dev`
3. Backend API will auto-sync with Supabase
4. Frontend components will use new Supabase client

