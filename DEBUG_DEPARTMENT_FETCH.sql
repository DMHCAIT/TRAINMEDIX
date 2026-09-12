-- Check what's actually in the database
SELECT 
  id, 
  hospital_id, 
  department_name,
  created_at
FROM hospital_departments
ORDER BY created_at DESC
LIMIT 10;

-- Check hospitals
SELECT 
  id, 
  hospital_name, 
  role,
  isApproved
FROM registered_users
WHERE role = 'hospital'
LIMIT 10;

-- Check if there are RLS policies blocking access
SELECT * FROM hospital_departments WHERE hospital_id = 'usr-1789026093174';
