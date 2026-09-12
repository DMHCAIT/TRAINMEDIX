-- Check if departments exist in the database
SELECT 
  id,
  hospital_id,
  department_name,
  department_code,
  description,
  available_cities,
  base_fee_per_month,
  created_at
FROM hospital_departments
ORDER BY created_at DESC;

-- If you see results above, the data exists in the database
-- The issue is with fetching/displaying it

-- Run this to see how many are stored:
SELECT COUNT(*) as total_departments FROM hospital_departments;
