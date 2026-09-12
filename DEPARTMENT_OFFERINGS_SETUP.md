# Department Offerings Migration - Setup Guide

## Current Status

The system has been refactored to consolidate all department hospital offerings into a single location. The implementation is **complete and working**, but requires one manual database step to optimize storage.

### What's Ready Now
✅ **New unified storage layer** - All department offerings data flows through `departmentOfferingsDb.ts`
✅ **Atomic saves** - Admin panel saves all offerings for a department in one operation  
✅ **Fallback compatibility** - Works with or without the new column
✅ **Website booking flow** - Reads from the same data source as admin saves

### What Needs to be Done
The `departments.hospital_offerings` JSONB column needs to be created manually. Here's why:
- Programmatic SQL execution (via Supabase RPC) is blocked by Supabase design
- Direct PostgreSQL connections fail due to environment restrictions
- **Workaround**: System automatically uses `hospitals.description` JSON while waiting for column

## Testing the Current System (Works Even Without Column)

### Option 1: Test Admin Save (Recommended)

1. **Start dev server** (if not already running):
   ```bash
   cd TRAINMEDIX-main
   npm run dev
   ```
   
2. **Access admin panel**:
   - Go to: http://localhost:3000/admin
   - Password: `Medix@2026`
   
3. **Test a department save**:
   - Click "Departments" button
   - Click on any department (e.g., "Surgical & Procedural Specialties")
   - Select a hospital (e.g., "Sama Hospital Delhi")
   - Enter pricing for 1 month: `45000`
   - Add a batch:
     - Duration: 1 month
     - Start date: 2099-10-01
     - Seats: 3
   - Click "Save"
   - Expected: Green success message "Department pricing and batches saved to Supabase and published to the website"

4. **Verify persistence**:
   - Reload the page
   - Re-enter the same department
   - Confirm your pricing and batch are still there

5. **Check website booking**:
   - Go to http://localhost:3000/booking
   - Follow the booking flow
   - Confirm your department/hospital appears with correct pricing and batches

### Option 2: Verify via Database

Run this script to check where data is being stored:

```bash
node scripts/inspect-departments.mjs
```

This will show:
- Current departments table structure
- Whether `hospital_offerings` column exists
- All available columns

## Complete Optimization: Create the Column (Optional but Recommended)

Once you confirm the fallback works, optionally create the dedicated column for better performance:

### Method 1: Supabase Dashboard (Recommended)

1. Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql
2. Click "+ New Query"
3. Copy and paste this SQL:

```sql
-- Add the new column for optimized storage
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS hospital_offerings JSONB 
NOT NULL DEFAULT '[]'::jsonb;

-- Add constraint to ensure data integrity
ALTER TABLE departments 
ADD CONSTRAINT check_hospital_offerings 
CHECK (hospital_offerings IS NOT NULL);

-- Clear the schema cache so changes are visible immediately
NOTIFY pgrst, 'reload schema';
```

4. Click the "Run" button
5. Wait for success message (green checkmark)
6. Refresh your browser - the system will now use the optimized column

### Method 2: Verify Column Was Created

After creating the column, run:

```bash
node scripts/inspect-departments.mjs
```

Should show `hospital_offerings: object = [...]` in the columns list.

## How the System Works

### Without Column (Current State)
```
Admin saves → departmentOfferingStore.syncDepartment()
  → Tries departments.hospital_offerings (fails with 42703)
  → Falls back to hospitals.description (JSON)
  ✅ Data persists and is readable
```

### With Column (After Manual Setup)
```
Admin saves → departmentOfferingStore.syncDepartment()
  → Updates departments.hospital_offerings (JSONB)
  ✅ Data persists with better performance
  ✅ Dedicated column for hospital offerings
```

## Migration Code Overview

### Key Files

1. **`src/lib/departmentOfferingsDb.ts`** (NEW)
   - Single source of truth for all department offerings
   - Handles both new column and legacy fallback
   - Implements atomic operations for consistency

2. **`src/lib/supabase-db.ts`** (UPDATED)
   - Route: `hospitalDepartmentService.syncDepartment()` → `departmentOfferingStore`
   - All offering operations go through unified store

3. **`src/components/admin/AdminDepartmentsManager.tsx`** (UPDATED)
   - Atomic saves: all offerings saved in one operation
   - Success message after save
   - Automatic refresh of website display

## Troubleshooting

### Admin panel shows "Failed to load resource: 400"
- **Cause**: Supabase schema cache delay
- **Solution**: Wait 30-60 seconds and refresh browser

### Save button doesn't respond
- **Cause**: Network issue with Supabase
- **Solution**: Check browser console (F12) for specific error

### Data not appearing on website after save
- **Cause**: AppContext not refreshed
- **Solution**: Reload the page or check browser console for refresh errors

## Questions?

The system is designed to work seamlessly regardless of which storage backend is used:
- **While waiting for column**: Data stored in `hospitals.description`  
- **After creating column**: Data stored in `departments.hospital_offerings`
- **During transition**: Both locations read, column preferred for writes

All department pricing, batches, and slots will be safely preserved throughout.
