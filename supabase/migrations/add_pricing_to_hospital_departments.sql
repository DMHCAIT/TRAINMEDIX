-- Per hospital + department + city pricing, keyed by duration in months.
ALTER TABLE hospital_departments
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE hospital_departments
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN hospital_departments.city IS 'City/location this hospital-department offering applies to';
COMMENT ON COLUMN hospital_departments.pricing IS 'Duration (months) to price map, e.g. {"1":35000,"3":90000,"6":120000,"12":200000}';

-- Backfill city from the hospital''s primary location so existing rows stay valid.
UPDATE hospital_departments hd
SET city = COALESCE(h.cities[1], h.city)
FROM hospitals h
WHERE hd.hospital_id = h.id
  AND hd.city IS NULL;

-- The same hospital can offer a department in several cities at different prices,
-- so uniqueness must include the city.
ALTER TABLE hospital_departments
DROP CONSTRAINT IF EXISTS hospital_departments_hospital_id_department_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS hospital_departments_hospital_dept_city_key
ON hospital_departments (hospital_id, department_id, city);
