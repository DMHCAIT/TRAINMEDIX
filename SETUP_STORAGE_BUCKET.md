# Setting Up Storage Bucket for Department Images

## Problem
When uploading department images in the admin panel, you see:
```
Failed to upload image: Bucket not found
```

## Solution
You need to create a `departments` storage bucket in Supabase. Follow these steps:

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Open Supabase Console
- Go to https://app.supabase.com/
- Log in with your account
- Select your project: **TrainMedix** (gxtpzrhlvycvsjqrvuvv)

### Step 2: Navigate to Storage
- In the left sidebar, click on **Storage**
- You should see existing buckets (if any)

### Step 3: Create New Bucket
- Click **+ New bucket** button
- Enter bucket name: `departments`
- **IMPORTANT**: Check the "Public bucket" checkbox ✓
- Click **Create bucket**

### Step 4: Verify Bucket Settings
1. Click on the `departments` bucket
2. Click **Settings** (or gear icon)
3. Ensure "Public" is enabled
4. You should see:
   - File size limit: Check it's sufficient (suggest 5MB)
   - Allowed MIME types: Include `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## Method 2: Using SQL in Supabase Console

If you prefer SQL (or if Method 1 doesn't work), run this:

1. Go to Supabase Console
2. Click **SQL Editor** → **New Query**
3. Paste this code:

```sql
-- Create departments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'departments',
  'departments',
  true,
  5242880,
  '{"image/jpeg", "image/png", "image/webp", "image/gif"}'::text[]
)
ON CONFLICT DO NOTHING;

-- Create RLS policy for public access
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'departments');

CREATE POLICY "Public Write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'departments' AND auth.role() = 'authenticated');
```

4. Click **Run** ▶

## Testing the Setup

After creating the bucket:

1. Reload the admin panel
2. Go to **Departments**
3. Click **Edit** on any department
4. Scroll down to **Department Image**
5. Click the upload area and select an image
6. Click **Upload Image**
7. ✅ Image should upload successfully!

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket with the exact name: `departments` (lowercase)
- Reload the admin panel page
- Clear browser cache (Ctrl+Shift+Delete)

### Error: "Unauthorized" or "Access Denied"
- Make sure the bucket is set to **Public**
- Go back to bucket Settings and verify the "Public" toggle is ON

### Error: "File too large"
- The bucket has a 5MB file size limit
- Try uploading a smaller image or JPG instead of PNG

### Can't see upload button
- Make sure the **Department Image** section is expanded
- The upload area should show "Click to upload or drag and drop"

## Verifying the Bucket Exists

Run this SQL query to verify:

```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'departments';
```

You should see:
- id: `departments`
- name: `departments`  
- public: `true`

## What Happens After Upload

1. Image is uploaded to `https://[your-supabase-url]/storage/v1/object/public/departments/[filename]`
2. Public URL is automatically generated
3. URL is saved to the database in the `icon_url` field
4. Image appears in the admin panel and on the website

## Need Help?

If you're still having issues:
1. Check that your Supabase project is correctly configured
2. Verify your database credentials in `.env.local`
3. Make sure you're logged into Supabase with a role that can create buckets (usually admin)
4. Try Method 1 (Dashboard) first - it's usually more reliable
