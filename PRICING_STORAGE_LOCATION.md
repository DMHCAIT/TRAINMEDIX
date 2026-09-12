# Where Partner Hospitals & Pricing Data is Stored

## 📍 Database Location

### Primary Table: `hospitals`

The partner hospitals and their pricing is stored in the **`hospitals`** table, specifically in the **`description`** column.

```
Database: Supabase PostgreSQL (gxtpzrhlvycvsjqrvuvv)
Table: hospitals
Column: description (TEXT type)
Storage Format: JSON
```

### Table Structure

```sql
CREATE TABLE hospitals (
  id UUID PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,           -- Hospital name (e.g., "Mehndritta Hospital")
  address TEXT NOT NULL,
  city TEXT NOT NULL,           -- City (e.g., "Ambala")
  state TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,             -- ⭐ THIS CONTAINS PRICING DATA (JSON)
  accreditation TEXT,
  total_slots INT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🏥 What's Inside the `description` Column

The `description` column contains JSON with this structure:

```json
{
  "__trainmedixAdminConfig": {
    "profileDescription": "Hospital profile description text",
    "departmentOfferings": [
      {
        "id": "offering-uuid",
        "hospital_id": "hospital-uuid",
        "department_id": "department-uuid",
        "city": "Ambala",
        "pricing": {
          "1_month": 30000,
          "3_months": 70000,
          "6_months": 140000,
          "12_months": 320000
        },
        "max_slots": 4,
        "batches": [
          {
            "id": "batch-uuid",
            "duration_months": 1,
            "start_date": "2026-10-01",
            "end_date": "2026-11-01",
            "available_seats": 3,
            "booked_seats": 1,
            "status": "available",
            "created_at": "2026-09-11T10:00:00Z"
          }
        ],
        "created_at": "2026-09-11T10:00:00Z"
      }
    ]
  }
}
```

## 📊 Example for Mehndritta Hospital (from screenshot)

Based on your screenshot, this data would be stored as:

```json
{
  "__trainmedixAdminConfig": {
    "profileDescription": "...",
    "departmentOfferings": [
      {
        "hospital_id": "mehndritta-uuid",
        "department_id": "surgical-uuid",
        "city": "Ambala",
        "pricing": {
          "1_month": 30000,
          "3_months": 70000,
          "6_months": 140000,
          "12_months": 320000
        },
        "max_slots": 4,
        "batches": [
          {
            "start_date": "2026-10-01",
            "end_date": "2026-11-01",
            "available_seats": 3,
            "duration_months": 1
          }
        ]
      }
    ]
  }
}
```

## 🔧 How to Query This Data

### To view all hospitals with their pricing:

```sql
SELECT 
  id,
  name,
  city,
  description::json->'__trainmedixAdminConfig'->'departmentOfferings' as offerings
FROM hospitals
WHERE description IS NOT NULL
  AND description LIKE '%__trainmedixAdminConfig%';
```

### To get pricing for a specific hospital:

```sql
SELECT 
  id,
  name,
  city,
  description::json->'__trainmedixAdminConfig'->'departmentOfferings' as pricing
FROM hospitals
WHERE name = 'Mehndritta Hospital';
```

### To extract just the pricing object:

```sql
SELECT 
  name,
  city,
  jsonb_array_elements(
    (description::jsonb->'__trainmedixAdminConfig'->'departmentOfferings')
  )->>'pricing' as pricing
FROM hospitals;
```

## 🚀 Future Optimization

When the `hospital_offerings` JSONB column is created in the `departments` table, the data will move there:

```sql
ALTER TABLE departments ADD COLUMN hospital_offerings JSONB;
```

At that point, the system will use:
- **Primary**: `departments.hospital_offerings` (faster, dedicated column)
- **Fallback**: `hospitals.description` (for backward compatibility)

## 📝 Summary

| Aspect | Current Storage |
|--------|-----------------|
| **Table** | `hospitals` |
| **Column** | `description` |
| **Type** | TEXT (JSON format) |
| **Structure** | `{ __trainmedixAdminConfig: { departmentOfferings: [...] } }` |
| **Pricing Location** | Each offering's `pricing` object |
| **Status** | ✅ Working and persisting |
| **Why Here?** | Column-based storage attempted but not persisted yet |
