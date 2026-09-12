# Updated Image URL Not Showing - Investigation Report

## Problem Summary
The Cardiac Sciences department is still showing the old image URL from mock data, even though:
- The database has the correct new URL
- Auto-refresh code exists in AppContext.tsx
- Page has been reloaded multiple times

---

## Root Cause Analysis

### Issue 1: Database Schema Mismatch ❌
**Location:** `SUPABASE_SETUP_SQL.sql` (Line 51-62)

The departments table stores image URL in `icon_url` column:
```sql
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INT,
  icon_url TEXT,  -- ← Image URL stored here
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

### Issue 2: Frontend Type Definition Mismatch ❌
**Location:** `src/types/index.ts` (Line 21-37)

The Department interface expects `image` property, NOT `icon_url`:
```typescript
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  availableCities: CityName[];        // ← NOT in database!
  subDepartments?: string[];          // ← NOT in database!
  hospitalsCount: number;             // ← NOT in database!
  iconName: string;                   // ← NOT in database!
  featured?: boolean;                 // ← NOT in database!
  baseFeePerMonth: number;            // ← NOT in database!
  clinicalHighlights: string[];       // ← NOT in database!
  image?: string;                     // ← NOT `icon_url`
}
```

### Issue 3: Data Integrity Loss ❌
**Location:** `src/lib/supabase-db.ts` (Line 251-259)

When `departmentService.getAll()` queries Supabase:
```typescript
async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')  // ← Returns: id, code, name, description, duration_days, icon_url, is_active, created_at
      .eq('is_active', true);
    if (error) throw error;
    return data;  // ← INCOMPLETE - missing required fields!
}
```

**The returned data has:**
- ✅ Basic fields: id, code, name, description, icon_url
- ❌ Missing required fields: availableCities, subDepartments, hospitalsCount, iconName, featured, baseFeePerMonth, clinicalHighlights
- ❌ Wrong column name: icon_url instead of image

### Issue 4: Fallback to Mock Data ❌
**Location:** `src/context/AppContext.tsx` (Line 186-205)

When Supabase data is incomplete or causes type errors, the app falls back to mock data:
```typescript
const refreshDataFromSupabase = async () => {
    try {
      const [depts, hosps] = await Promise.all([
        departmentService.getAll(),  // ← Returns incomplete data
        hospitalService.getAll()
      ]);
      
      if (depts && depts.length > 0) {
        setDepartments(depts);  // ← Sets incomplete data
      } else {
        setDepartments(DEPARTMENTS);  // ← Fallback to mock
      }
      
      // ... similar for hospitals
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      setDepartments(DEPARTMENTS);  // ← Fallback on any error
      setHospitals(HOSPITALS);
      setActiveHospital(HOSPITALS[0]);
    }
  };
```

**Comparison of image URLs:**

| Source | Cardiac Sciences Image URL |
|--------|---------------------------|
| Mock Data (Used) | `https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?...` |
| Database (Ignored) | `https://gxtpzrhlvycvsjqrvuvv.supabase.co/storage/v1/object/public/departments/CARD-1788168175156.webp` |

---

## Why The Refresh Isn't Working

1. **Supabase query succeeds** but returns incomplete data (only 8 columns instead of 13+ required)
2. **Type mismatch causes issues** - the data doesn't match the Department interface
3. **Incomplete data gets rejected** - or causes runtime errors when components try to access missing properties
4. **Fallback to mock data** - the error handler or type checking falls back to DEPARTMENTS from mockData.ts
5. **Mock data is stale** - contains old image URL that was never updated

This is why:
- ✅ The database is updated correctly
- ✅ The refresh code runs every 30 seconds
- ✅ The refresh function is called on page visibility change
- ❌ But the UI always shows mock data instead

---

## Solution Required

The application needs a **data mapping layer** that:

1. **Fetches from Supabase** with all required columns
2. **Maps Supabase columns** to frontend type definitions
3. **Fills in missing fields** (availableCities, hospitalsCount, etc.) either from:
   - Extended database schema, OR
   - Configuration file, OR
   - Computed values

### Example of what needs to happen:

```typescript
// Raw Supabase data
{ 
  id: "uuid", 
  code: "CARD", 
  name: "Cardiac Sciences",
  icon_url: "https://gxtpzrhlvycvsjqrvuvv.supabase.co/..."  // ← New URL!
}

// Must be transformed to:
{
  id: "uuid",
  code: "CARD",
  name: "Cardiac Sciences",
  image: "https://gxtpzrhlvycvsjqrvuvv.supabase.co/...",  // ← Mapped!
  availableCities: [...],  // ← Added from config/joined table
  hospitalsCount: 14,      // ← Added from count/config
  // ... all required fields
}
```

---

## Why Mock Data is Hardcoded

The mock data in `src/data/mockData.ts` contains all required fields because it was designed as a complete working example:
- Pre-computed availableCities
- Pre-computed hospitalsCount
- Pre-selected featured status
- Static baseFeePerMonth and clinicalHighlights

The Supabase schema is too minimal and doesn't store this context information.

---

## Recommendation

Before implementing a fix, decide:

**Option A:** Extend Supabase schema to store all required fields
- Add columns: availableCities (JSON), hospitalsCount, baseFeePerMonth, clinicalHighlights (JSON), featured
- Rename: icon_url → image

**Option B:** Create a mapping/enrichment layer
- Keep Supabase minimal
- Map icon_url → image in query results
- Fill missing fields from configuration or computed values

**Option C:** Use mock data + database update combination
- Keep mock data structure as primary
- Override only the image field from database
