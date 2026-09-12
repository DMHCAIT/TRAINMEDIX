# Database Setup Guide for Hospital Departments & Slots

## Issue Found
The API endpoints were expecting different field names than what the frontend was sending. **This has been fixed.**

## Changes Made

### 1. **Fixed API Endpoints** ✅
- `POST /api/hospitals/departments` - Now accepts `name`, `code`, `basePrice`, `availabilityCities`
- `POST /api/hospitals/slots` - Now accepts `departmentId`, `startDate`, `endDate`, `capacity`, `feePerMonth`, `initialStatus`

### 2. **Database Tables Required**
You need to ensure these 3 tables exist in Supabase:
- `hospital_departments` - Stores hospital departments
- `hospital_department_slots` - Stores training slots
- `hospital_trainees` - Stores trainee assignments (optional for now)

---

## Setup Instructions

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL from [SETUP_HOSPITAL_DEPARTMENTS_TRAINEES.sql](./SETUP_HOSPITAL_DEPARTMENTS_TRAINEES.sql)
5. Click **Run** to execute

### Option 2: Use Setup Script

```bash
cd C:\Users\john\Downloads\TRAINMEDIX-main
node scripts/setup-hospital-tables.mjs
```

---

## Verify Tables Were Created

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if tables exist
SELECT tablename 
FROM pg_tables 
WHERE tablename IN ('hospital_departments', 'hospital_department_slots', 'hospital_trainees')
ORDER BY tablename;
```

Should return 3 rows if successful.

---

## Testing the Flow

### 1. Add a Department
1. Open http://localhost:3000/hospital-portal
2. Click **"Department Management"** tab
3. Click **"+ Add Department"** button
4. Fill in the form:
   - Department Name: `Cardiology`
   - Code: `CARD`
   - Description: `Heart and cardiovascular training`
   - Base Monthly Fee: `50000`
   - Check at least 2 cities
5. Click **"Create Department"**
6. The department should appear in the grid below

### 2. Add a Slot
1. Click **"Slot Management"** tab
2. Click **"+ Add Slot"** button
3. Fill in the form:
   - Select Department: (choose the Cardiology department you just created)
   - Start Date: (pick a date)
   - End Date: (pick a future date)
   - Available seats: `5`
   - Fee / Month (₹): `45000`
   - Initial Status: `Open`
4. Click **"Add Slot"**
5. The slot should appear below

### 3. Verify in Supabase
Run these queries to confirm data was saved:

```sql
-- View all departments
SELECT * FROM hospital_departments;

-- View all slots
SELECT * FROM hospital_department_slots;
```

---

## Troubleshooting

### Problem: "Departments.map is not a function"
- **Fix**: The API returns `{ success: true, departments: [...] }`
- **Status**: ✅ Already fixed in the code

### Problem: Departments/Slots not saving
- **Check 1**: Verify tables exist (see "Verify Tables" section above)
- **Check 2**: Check browser Console (F12) for API errors
- **Check 3**: Check Supabase dashboard Activity/Logs tab
- **Check 4**: Run: `SELECT * FROM hospital_departments;` in Supabase

### Problem: API returning empty departments array
- **Check**: Hospital ID might not be set correctly
- **Fix**: Verify `userProfile?.id` is populated in AppContext

---

## Quick SQL to Reset (if needed)

```sql
-- Delete all slots first (foreign key dependency)
DELETE FROM hospital_department_slots;

-- Then delete departments
DELETE FROM hospital_departments;

-- Then delete trainees
DELETE FROM hospital_trainees;
```

---

## Next Steps

After tables are created and data is saving:
1. ✅ Departments will display immediately after creation
2. ✅ Slots will display immediately after creation
3. → Implement Trainee Approvals tab
4. → Add delete functionality to departments/slots
5. → Add edit functionality

---

## API Field Mapping Reference

### Department Form → API → Database

```
Frontend sends:        API extracts:           Database stores:
{                      {                       {
  name: "..."          department_name        department_name
  code: "..."          department_code        department_code
  description: "..."   description            description
  basePrice: 50000     base_fee_per_month     base_fee_per_month
  availabilityCities   available_cities       available_cities
}                      }                       }
```

### Slot Form → API → Database

```
Frontend sends:        API extracts:           Database stores:
{                      {                       {
  departmentId         hospital_department_id  hospital_department_id
  startDate            start_date              start_date
  endDate              end_date                end_date
  capacity             total_seats/available   total_seats
  feePerMonth          fee_per_month           fee_per_month
  initialStatus        status                  status
}                      }                       }
```
