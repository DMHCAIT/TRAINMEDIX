# Setting Up Duration Options for Departments

## What Needs to Be Done
The admin panel now supports managing available training durations (1, 3, 6, or 12 months) for each department. To enable this feature, you need to add a `duration_options` column to your Supabase database.

## Step-by-Step Instructions

### 1. Go to Supabase Console
- Visit: https://app.supabase.com/
- Sign in with your account
- Select your project: **TrainMedix** (gxtpzrhlvycvsjqrvuvv)

### 2. Open SQL Editor
- In the left sidebar, click on **SQL Editor**
- Click on **New Query** button

### 3. Run the Migration SQL
Copy and paste this SQL command into the editor:

```sql
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS duration_options TEXT DEFAULT '1,3,6,12';

COMMENT ON COLUMN departments.duration_options IS 'Comma-separated list of available training durations in months (e.g., "1,3,6,12")';
```

### 4. Execute the Query
- Click the **▶ Run** button (or press Ctrl+Enter)
- You should see a success message

### 5. Verify the Column Was Added
Run this query to confirm:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'departments' AND column_name = 'duration_options';
```

You should see one row returned with:
- column_name: `duration_options`
- data_type: `text`

## What This Enables

After running the SQL migration:
1. When editing a department in the admin panel, you can check/uncheck duration options (1 Month, 3 Months, 6 Months, 12 Months)
2. Your selections are saved to the database and displayed on the website
3. Trainees can only book training for the durations you've enabled for each department

## Testing the Feature

1. Log into the admin panel
2. Go to **Departments**
3. Click **Edit** on any department
4. Look for "Duration Options (Months)" section
5. Uncheck the 12 Months option
6. Click **Save**
7. You should see the changes reflected immediately
8. On the website, that department should no longer offer 12-month training

## Troubleshooting

If you see an error message when saving:
```
Database column error: The 'duration_options' column needs to be added to Supabase.
```

This means the SQL hasn't been run yet. Follow steps 1-4 above and try again.

## Need Help?

The duration options are stored as a comma-separated string in the database:
- `1,3,6,12` - all options available
- `1,3,6` - 12 months removed
- `3,6` - only 3 and 6 months available

If you need to manually fix a department's duration options, you can run:
```sql
UPDATE departments 
SET duration_options = '1,3,6' 
WHERE code = 'CARD';  -- Replace CARD with the department code
```
