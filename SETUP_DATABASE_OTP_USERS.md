# OTP & User Registration Database Setup

## Summary of Changes

The OTP and user registration systems have been **migrated from in-memory storage to Supabase database** for persistence. This solves the issue where OTP was lost when the Next.js server restarted between requests.

### Key Changes:

✅ **OTP now persists in Supabase** (`otp_verifications` table)
✅ **User registrations persist in Supabase** (`registered_users` table)  
✅ **OTP validity reduced from 5 minutes to 2 minutes**
✅ **Automatic index creation for fast lookups**
✅ **Proper email normalization (case-insensitive, trimmed)**

---

## Step 1: Create Supabase Tables

1. Go to [Supabase Dashboard](https://app.supabase.com) → Select your project
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the entire SQL script from `SETUP_OTP_USERS_TABLES.sql`
4. Click **Run** (or Ctrl+Enter)

**Expected Output:**
```
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
ALTER TABLE
ALTER TABLE
CREATE POLICY
CREATE POLICY
```

---

## Step 2: Verify Tables Created

In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

You should see:
- `otp_verifications`
- `registered_users`

---

## Step 3: Test the Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser at** `http://localhost:3000`

3. **Test Signup:**
   - Click "Create Trainee Account" → "Sign Up"
   - Enter email: `test@example.com`
   - Click "Request OTP"
   - Check terminal/console logs for: `[OTP Generated DB]`
   - Check email (or spam folder) for OTP code
   - Enter the 4-digit OTP and click "Verify"
   - Fill remaining fields and complete signup

4. **Expected Success:**
   - OTP accepted ✅
   - User appears in Admin Panel ✅
   - Last Sign In timestamp updates on next login ✅

---

## Step 4: Monitor Logs

Watch your terminal for these logs during OTP flow:

**OTP Generation:**
```
[OTP Generated DB] Email: test@example.com | OTP: 1234 | Purpose: signup | Expires in: 2 min
[OTP Email] Successfully sent OTP to: test@example.com
```

**OTP Verification:**
```
[OTP Verify] Email: test@example.com, Purpose: signup, OTP: 1234
[OTP Compare DB] Email: test@example.com | Stored: "1234" | Submitted: "1234" | Match: true
[OTP Success DB] Email test@example.com verified (purpose: signup)
```

---

## Troubleshooting

### Error: "No OTP request found for this email"

**Causes & Fixes:**
1. ❌ Supabase tables not created → Run SQL script (Step 1)
2. ❌ Environment variables missing → Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ❌ OTP expired → Check server logs for `[OTP Store] OTP expired for`
4. ❌ Different email format → Emails are normalized (lowercase, trimmed)

### Error: "Failed to send verification email"

**Causes & Fixes:**
1. ✅ SMTP credentials incorrect → Check `.env.local` SMTP_* variables
2. ✅ Gmail app-specific password needed → Use `ftnv gpyd qrks nsir`
3. ✅ Email in spam folder → Check spam/promotional tabs
4. ✅ Check logs: `[Email Error] Failed to send to...`

---

## Database Schema

### otp_verifications
```sql
id (UUID) - Unique identifier
email (VARCHAR) - Normalized email (lowercase, unique per purpose)
otp_code (VARCHAR) - 4-digit OTP
purpose (VARCHAR) - 'signup' or 'login'
attempts (INT) - Number of verification attempts (max 5)
max_attempts (INT) - Maximum attempts allowed (5)
expires_at (TIMESTAMP) - OTP expiration time (2 minutes from creation)
created_at (TIMESTAMP) - When OTP was created

CONSTRAINTS:
- UNIQUE(email, purpose) - One active OTP per email+purpose combo
- Automatic cleanup: Delete expired OTPs before verification
```

### registered_users
```sql
id (VARCHAR) - Format: 'usr-{timestamp}'
email (VARCHAR) - Unique email address
full_name (VARCHAR) - User's full name
role (VARCHAR) - 'trainee' or 'hospital'
phone (VARCHAR) - Optional phone number
qualification (VARCHAR) - Optional qualification (trainees)
interests (TEXT[]) - Array of selected interests
address (TEXT) - Optional address
preferred_city (VARCHAR) - Optional city preference
created_at (TIMESTAMP) - Account creation time
last_login_at (TIMESTAMP) - Last successful login (NULL if never logged in)
```

---

## File Changes Summary

**New Files:**
- `src/lib/supabaseClient.ts` - Supabase client initialization
- `src/lib/otpStoreDb.ts` - Database-backed OTP functions
- `src/lib/userStoreDb.ts` - Database-backed user functions
- `SETUP_OTP_USERS_TABLES.sql` - Database schema

**Modified Files:**
- `app/api/auth/send-otp/route.ts` - Uses `generateOtpDb()`
- `app/api/auth/verify-otp/route.ts` - Uses `verifyOtpDb()`, now requires `purpose` parameter
- `app/api/auth/register-user/route.ts` - Uses `createUserDb()`
- `app/api/auth/record-login/route.ts` - Uses `recordLoginDb()`
- `app/api/auth/registered-users/route.ts` - Uses `listUsersDb()`
- `src/services/apiService.ts` - `verifyOtp()` now requires `purpose` parameter
- `src/components/auth/AuthModal.tsx` - Passes `purpose` to `verifyOtp()`

**Unchanged (still in-memory):**
- `src/lib/otpStore.ts` - Kept for reference
- `src/lib/userStore.ts` - Kept for reference

---

## Next Steps (Optional)

1. **Cleanup:** Remove old in-memory store files if desired
2. **Monitoring:** Set up Supabase alerts for failed OTP attempts
3. **Analytics:** Track OTP success/failure rates via Supabase analytics
4. **Persistence:** User data now survives server restarts ✅

---

## Support

If OTP verification still fails after setup:
1. Check `.env.local` has correct Supabase URL and keys
2. Verify SQL tables exist in Supabase dashboard
3. Check server logs for `[OTP Error]` or `[User DB Error]`
4. Confirm email was received (check spam folder)
5. Ensure 2-minute OTP validity window hasn't expired
