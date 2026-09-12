# Department Specializations Setup Guide

## Overview
This guide explains how to enable and use the **Specializations** (also called Sub-Departments) feature in the Admin Panel for managing clinical training specializations.

## Problem
Previously, specializations were hard-coded in mock data only. Now you can manage them directly in the Admin Panel and store them in the Supabase database.

## Solution: 3-Step Setup

### Step 1: Add Database Column (One-time)

Open your **Supabase Console** and run this SQL in the **SQL Editor**:

```sql
ALTER TABLE departments ADD COLUMN IF NOT EXISTS sub_departments TEXT[] DEFAULT '{}';
```

**What this does:**
- Adds a new column `sub_departments` to the departments table
- Stores specializations as a text array (PostgreSQL array type)
- Default value is an empty array

### Step 2: Use Admin Panel to Enter Specializations

1. Go to **Admin Panel** → **Department Management**
2. Click **Add Department** or edit an existing department
3. Fill in the form:
   - Department Code (e.g., `SURG`)
   - Department Name (e.g., `Surgical & Procedural Specialties`)
   - Description (e.g., `Advanced surgical training with expert guidance`)
   - **Specializations** ← NEW FIELD
4. In the **Specializations** field, enter specializations separated by commas:
   ```
   General Surgery, Laparoscopy, Orthopaedics, Urology
   ```
5. Click **Save**

**The specializations will automatically:**
- Be saved to the Supabase database
- Display on the website instantly
- Show in the modal when users click "View Specializations"

### Step 3: Verify on Website

1. Go to **Departments** page on the website
2. Click a department card
3. Click **View Specializations**
4. You should see your entered specializations in the modal

## Data Flow

```
Admin Panel Form
    ↓
AdminDepartmentsManager.tsx (collects comma-separated specializations)
    ↓
departmentService.update() / .create()
    ↓
Supabase (departments.sub_departments column)
    ↓
AppContext.refreshDataFromSupabase()
    ↓
Website displays specializations
```

## Example: Complete Department Entry

**Form Fields:**
```
Code: CARD
Name: Cardiology
Description: Comprehensive cardiac training program with advanced intervention techniques
Specializations: General Cardiology, Interventional Cardiology, Cardiac Surgery, Echocardiography
```

**Result on Website:**
- User sees "Cardiology" department card
- Clicks "View Specializations(4)"
- Modal shows:
  - General Cardiology
  - Interventional Cardiology
  - Cardiac Surgery
  - Echocardiography

## Important Notes

1. **Comma-Separated Input**: Always use commas to separate specializations
   - ✅ Correct: `General Surgery, Laparoscopy, Orthopaedics`
   - ❌ Wrong: `General Surgery; Laparoscopy; Orthopaedics`

2. **Whitespace Handling**: Spaces around commas are automatically trimmed
   - ✅ Works: `Surgery ,  Laparoscopy , Orthopaedics`
   - ✅ Also works: `Surgery,Laparoscopy,Orthopaedics`

3. **Empty Specializations**: If left blank, the department will have no specializations
   - The field is optional

4. **Database Priority**: Specializations from Supabase (admin-entered) take priority
   - Mock data is only used as a fallback if database is empty

5. **Real-time Updates**: Changes made in Admin Panel are reflected on website immediately after save

## Troubleshooting

### Issue: "View Specializations(0)" on website
**Cause**: No specializations have been entered for this department
**Solution**: 
1. Go to Admin Panel
2. Edit the department
3. Add specializations in the new field
4. Save

### Issue: Specializations not showing on website
**Cause**: Database column hasn't been created yet
**Solution**:
1. Run the SQL migration from Step 1
2. Reload the page

### Issue: Form shows "[object Object]" in specializations field
**Cause**: Data was stored incorrectly (shouldn't happen with current code)
**Solution**:
1. Clear the field
2. Re-enter specializations
3. Save again

## API Reference

### Adding Specializations (Backend)
```typescript
await departmentService.update(departmentId, {
  code: 'SURG',
  name: 'Surgery',
  description: 'Surgical training',
  sub_departments: ['General Surgery', 'Laparoscopy', 'Orthopaedics']
});
```

### Retrieving Specializations (Frontend)
```typescript
const departments = await departmentService.getAll();
// Each department now has: department.sub_departments = ['General Surgery', '...']
```

## Future Enhancements

Possible improvements:
- Drag-and-drop reordering of specializations
- Specialization descriptions
- Specialization prerequisites/co-requisites
- Specialization availability per hospital
