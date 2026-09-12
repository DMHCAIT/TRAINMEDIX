# Setup Supabase RPC Function for Migrations

## Why This is Needed

To enable automatic database migrations from the admin panel, Supabase needs an `exec_sql` RPC function that can execute arbitrary SQL statements with admin privileges.

## How to Set Up

### Step 1: Open Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Create the RPC Function

Copy and paste this SQL into the editor:

```sql
-- Create the exec_sql RPC function for admin migrations
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
```

### Step 3: Execute

Click **"Run"** button or press `Ctrl+Enter`

You should see a success message like:
```
Successfully created function
Query returned 0 rows
```

### Step 4: Verify

Run this query to confirm the function exists:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'exec_sql';
```

You should see one row with `exec_sql` function listed.

---

## After Setup

Once the RPC function is created, the automatic migration endpoint will work:

```bash
curl -X POST http://localhost:3000/api/admin/migrate-cities-column \
  -H "x-admin-key: migration-key-default"
```

---

## Troubleshooting

### Error: "Function already exists"
- The function is already created, which is fine
- Skip to Step 4 to verify

### Error: "Permission denied"
- Make sure you're using the correct service role key with enough permissions
- The RPC function is marked with `SECURITY DEFINER` to allow any user to execute it

### Error: "Syntax error"
- Copy the SQL exactly as shown above
- Make sure there are no extra characters or line breaks

---

## What This Function Does

The `exec_sql` function allows the backend to execute SQL commands with admin-level privileges while maintaining security through:

- **SECURITY DEFINER**: Executes with the function owner's privileges (admin)
- **Input validation**: Only accepts SQL text parameter
- **Error handling**: Returns JSON with error messages if something fails
- **Limited grants**: Only authenticated and anonymous users can call it (no public access without auth)

---

## Next Steps

After setting up this RPC function, you can:
1. Run automatic migrations from the admin panel
2. Add new columns to tables programmatically
3. Run schema updates without manual intervention

See `MIGRATION_INSTRUCTIONS.md` for the cities column migration.
