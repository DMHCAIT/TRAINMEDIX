# 🚀 Quick Start Checklist - TrainMedix Supabase Setup

Complete these steps in order to get your platform live with Supabase!

---

## ✅ Phase 1: Supabase Project Setup (10 minutes)

- [ ] Go to [supabase.com](https://supabase.com) and sign up
- [ ] Create a new project
  - Project name: `trainmedix_db`
  - Region: Select Singapore or closest to India
  - Password: Save securely!
- [ ] Wait 2-3 minutes for database initialization
- [ ] Go to **Settings → API**
- [ ] Copy and save:
  - [ ] Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Phase 2: Environment Configuration (3 minutes)

- [ ] Open `.env.local` in your project root
- [ ] Paste your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
- [ ] Save the file
- [ ] Restart development server: `npm run dev`

---

## ✅ Phase 3: Database Schema Setup (5 minutes)

- [ ] In Supabase, go to **SQL Editor**
- [ ] Click **New Query**
- [ ] Open [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [ ] Copy the entire SQL code (all CREATE TABLE statements)
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Wait for "Queries executed successfully"
- [ ] Verify tables are created in **Tables** section:
  - users ✓
  - hospitals ✓
  - departments ✓
  - hospital_departments ✓
  - training_slots ✓
  - bookings ✓
  - logbook_entries ✓
  - certificates ✓
  - notifications ✓
  - audit_logs ✓

---

## ✅ Phase 4: Storage Buckets Setup (2 minutes)

- [ ] In Supabase, go to **Storage**
- [ ] Create new bucket: `certificates`
  - [ ] Set to **Public**
- [ ] Create new bucket: `hospital-documents`
  - [ ] Set to **Private**
- [ ] Create new bucket: `profile-images`
  - [ ] Set to **Public**

---

## ✅ Phase 5: Seed Initial Data (Optional - 5 minutes)

Add sample data for testing:

```sql
-- Insert sample admin user
INSERT INTO users (id, email, full_name, phone, role, password_hash, is_verified)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@trainmedix.com',
  'System Administrator',
  '+91 99999 00000',
  'admin',
  'hashed_password_here',
  true
);

-- Insert sample departments
INSERT INTO departments (code, name, description, duration_days)
VALUES 
  ('CARDIO', 'Cardiology', 'Heart and cardiovascular diseases', 30),
  ('EMERGEN', 'Emergency Medicine', 'Emergency and trauma care', 28),
  ('ONCOLOGY', 'Oncology', 'Cancer treatment and research', 45),
  ('NEURO', 'Neurology', 'Nervous system disorders', 35),
  ('ORTHO', 'Orthopedics', 'Bone and joint surgery', 40);
```

---

## ✅ Phase 6: Frontend Component Updates (30 minutes)

Read [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md) and update components:

### Priority 1 (Must Do)
- [ ] **AuthModal.tsx**
  - Replace login/signup with `authService` functions
  - Update error handling
  - Set session cookies

- [ ] **AppContext.tsx** 
  - Replace mock data with Supabase service functions
  - Add `useEffect` to fetch real data on mount
  - Update auth state management

### Priority 2 (Important)
- [ ] **BookingWizard.tsx**
  - Fetch real slots with `slotService.getAvailable()`
  - Create bookings with `bookingService.create()`
  - Update availability after booking

- [ ] **UserDashboard.tsx**
  - Load bookings with `bookingService.getByTrainee()`
  - Load logbook with `logbookService.getByTrainee()`
  - Load certificates with `certificateService.getByTrainee()`

### Priority 3 (Important)
- [ ] **HospitalDashboard.tsx**
  - Load hospital bookings with `bookingService.getByHospital()`
  - Manage slots with `slotService` methods
  - Update booking status with `bookingService.updateStatus()`

- [ ] **AdminPanel.tsx**
  - Get pending bookings with `bookingService.getPending()`
  - List users with `authService.adminListUsers()`
  - Manage departments with `departmentService`

---

## ✅ Phase 7: Testing (15 minutes)

### Test User Registration
- [ ] Visit http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Create account with:
  - Email: `testtrainee@example.com`
  - Password: `TestPass123!`
  - Full Name: `Dr. Test Trainee`
  - Role: `Trainee`
- [ ] Check Supabase Database: user should appear in `users` table
- [ ] Should redirect to dashboard

### Test Login
- [ ] Logout
- [ ] Click "Log In"
- [ ] Enter credentials
- [ ] Should login successfully
- [ ] Session cookie should be set

### Test Browse Features
- [ ] Browse Departments
- [ ] Browse Hospitals
- [ ] Filter by city
- [ ] View department details

### Test Booking
- [ ] Select a department
- [ ] Select a hospital
- [ ] Create booking
- [ ] Check `bookings` table in Supabase
- [ ] Booking should have status: `pending`

### Test Hospital Approval (if have hospital account)
- [ ] Login as hospital
- [ ] Go to Hospital Portal
- [ ] See pending bookings
- [ ] Approve a booking
- [ ] Status should change to `approved`
- [ ] Trainee should receive notification

### Test Logbook
- [ ] Add logbook entry for a booking
- [ ] Entry should appear in `logbook_entries` table
- [ ] Check trainee dashboard
- [ ] Entry should show on dashboard

### Test Certificate
- [ ] Generate certificate for completed booking
- [ ] File should upload to Supabase Storage
- [ ] Certificate should appear in `certificates` table
- [ ] QR code should be generated

---

## ✅ Phase 8: Go Live! 🎉

- [ ] All components tested
- [ ] Database populated with real data
- [ ] Storage buckets working
- [ ] API routes responding correctly
- [ ] Audit logs recording events
- [ ] Notifications sending

**Run in production mode:**
```bash
npm run build
npm start
```

---

## 🆘 Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL not defined"
- [ ] Check `.env.local` has correct keys
- [ ] Restart dev server: `npm run dev`
- [ ] Verify no typos in key names

### "User not found" after login
- [ ] Check user was created in Supabase `users` table
- [ ] Verify email matches exactly
- [ ] Check if user is marked as verified

### "File upload failed"
- [ ] Verify storage buckets exist
- [ ] Check bucket permissions (Public vs Private)
- [ ] Ensure file size is reasonable (<10MB)

### Database queries failing
- [ ] Verify all tables are created
- [ ] Check database region is selected
- [ ] Verify RLS policies (should be created automatically)

### CORS errors
- [ ] Add your domain to Supabase CORS settings
- [ ] If developing locally, should work automatically

---

## 📞 Support

Need help? Check these resources:

1. **SUPABASE_SETUP.md** - Detailed setup guide
2. **FRONTEND_MIGRATION_GUIDE.md** - Component update guide
3. **IMPLEMENTATION_COMPLETE.md** - Feature reference
4. **Supabase Docs** - https://supabase.com/docs
5. **Next.js Docs** - https://nextjs.org/docs

---

## 🎯 Success Metrics

You'll know it's working when:
- ✅ Users can signup/login
- ✅ Bookings appear in database
- ✅ Hospitals can approve bookings
- ✅ Logbook entries are saved
- ✅ Certificates are generated
- ✅ Audit logs record all actions
- ✅ Notifications are sent

---

## 📊 Next Features (Future)

After basic setup, consider adding:
- Real-time notifications (Supabase Realtime)
- Payment integration (Razorpay)
- Email notifications (SendGrid/Supabase Email)
- SMS notifications (Twilio)
- Analytics dashboard
- Advanced reporting

---

**Let's get TrainMedix live! 🚀**
