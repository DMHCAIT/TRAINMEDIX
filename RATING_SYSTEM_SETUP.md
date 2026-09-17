# Hospital Rating Management System - Setup Guide

## Overview
This implementation allows hospital administrators to:
- Set custom ratings (0-5.0) for each hospital through the admin panel
- View ratings on the website for all hospitals
- Update ratings at any time
- Ratings persist in the Supabase database

## Setup Instructions

### Step 1: Add the Rating Column to Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL from `ADD_RATING_COLUMN.sql`:
   ```sql
   ALTER TABLE hospitals
   ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.5;
   
   UPDATE hospitals SET rating = 4.5 WHERE rating IS NULL;
   
   ALTER TABLE hospitals
   ADD CONSTRAINT rating_check CHECK (rating >= 0 AND rating <= 5);
   ```
5. Click **Run**

### Step 2: Features Implemented

#### Admin Panel Updates (`src/components/admin/AdminHospitalsManager.tsx`)
- Added **Hospital Rating** input field in the hospital form
- Rating input accepts values 0-5.0 with 0.1 precision
- Default value: 4.5
- Rating displays in the hospital list with ⭐ icon
- Rating can be edited when updating an existing hospital

#### Database Service Updates (`src/lib/supabase-db.ts`)
- Updated `hospitalService.create()` to accept and save rating
- Updated `hospitalService.getAll()` to fetch rating from database
- Updated `hospitalService.getById()` to fetch rating from database
- Added rating to all SELECT queries with fallback support

#### Type Definitions (`src/types/index.ts`)
- Hospital interface already includes `rating: number;` property

### Step 3: Testing the Implementation

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access Admin Panel:**
   - Navigate to the admin panel
   - Go to Hospital Management section

3. **Test Create/Update Hospitals:**
   - Create a new hospital and set its rating (e.g., 4.8)
   - Edit an existing hospital and update its rating
   - Verify the rating displays in the hospital list with ⭐

4. **Check Website Display:**
   - Visit pages where hospital ratings are displayed:
     - `/hospitals` - Hospital Explorer page
     - `/departments/[id]/[slug]` - Department detail pages
     - `/sub-category/[slug]` - Sub-category pages
     - Booking Wizard (if available)
   - Verify ratings show correctly

### Step 4: Where Ratings Display on Website

Ratings are automatically displayed in these locations:
- **Hospital Explorer** (`src/components/hospitals/HospitalExplorer.tsx`) - Shows hospital card with rating
- **Department Pages** (`app/departments/[id]/[slug]/page.tsx`) - Shows rating in hospital cards
- **Hospital Details** (`app/hospitals/[hospitalId]/page.tsx`) - Shows rating in hospital header
- **Sub-category Pages** (`app/sub-category/[slug]/page.tsx`) - Shows rating in hospital listings
- **Booking Wizard** (`src/components/booking/BookingWizard.tsx`) - Shows rating when selecting hospital

### Step 5: Default Ratings

- All new hospitals default to **4.5** rating
- Existing hospitals without a rating will default to **4.5**
- You can update any hospital's rating anytime through the admin panel

## Rating Format

- **Format:** Decimal number (0.0 to 5.0)
- **Examples:** 4.5, 4.8, 5.0, 4.2
- **Validation:** Enforced at UI and database level
- **Display:** Shows as "⭐ 4.5 / 5.0" format

## API Changes

### Database Schema
```sql
ALTER TABLE hospitals ADD COLUMN rating NUMERIC(3,1) DEFAULT 4.5;
```

### Service Methods Updated
```typescript
// Create with rating
hospitalService.create({
  name: "Hospital Name",
  email: "email@hospital.com",
  rating: 4.8,  // Now supported
  // ... other fields
})

// Update with rating
hospitalService.update(hospitalId, {
  rating: 4.5,  // Can update rating
  // ... other fields
})
```

## Troubleshooting

**Issue:** Rating field not appearing in admin form
- Clear browser cache and reload
- Verify the AdminHospitalsManager.tsx file was updated correctly

**Issue:** Ratings not saving to database
- Confirm the ADD_RATING_COLUMN.sql migration was run successfully
- Check Supabase logs for any database errors

**Issue:** Ratings not displaying on website
- Verify hospitals were fetched with the updated service methods
- Check browser console for any fetch errors

## Next Steps

After confirming the system works:
1. Each hospital can manage their own rating through the admin panel
2. Consider adding a separate hospital portal for hospitals to self-manage ratings
3. Future enhancement: Add reviews/feedback system to complement ratings

## Files Modified
- ✅ `src/components/admin/AdminHospitalsManager.tsx` - Added rating input and display
- ✅ `src/lib/supabase-db.ts` - Updated service methods to handle rating
- ✅ `ADD_RATING_COLUMN.sql` - Database migration script
