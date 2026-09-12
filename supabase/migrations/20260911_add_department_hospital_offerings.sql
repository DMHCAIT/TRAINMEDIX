ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS hospital_offerings JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'departments_hospital_offerings_is_array'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT departments_hospital_offerings_is_array
      CHECK (jsonb_typeof(hospital_offerings) = 'array');
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON departments TO anon, authenticated, service_role;

-- Move the compatibility data into the department row that owns each offering.
WITH hospital_configs AS (
  SELECT
    id AS hospital_id,
    CASE
      WHEN description LIKE '{"__trainmedixAdminConfig":1%' THEN description::jsonb
      ELSE '{}'::jsonb
    END AS config
  FROM hospitals
), stored_offerings AS (
  SELECT
    config.hospital_id,
    offering.value || jsonb_build_object('hospital_id', config.hospital_id) AS offering
  FROM hospital_configs config
  CROSS JOIN LATERAL jsonb_array_elements(
    COALESCE(config.config->'departmentOfferings', '[]'::jsonb)
  ) AS offering(value)
  WHERE config.config->>'__trainmedixAdminConfig' = '1'
), offerings_by_department AS (
  SELECT
    (offering->>'department_id')::uuid AS department_id,
    jsonb_agg(offering ORDER BY offering->>'hospital_id', offering->>'city') AS offerings
  FROM stored_offerings
  WHERE offering->>'department_id' IS NOT NULL
  GROUP BY (offering->>'department_id')::uuid
)
UPDATE departments department
SET hospital_offerings = migrated.offerings
FROM offerings_by_department migrated
WHERE department.id = migrated.department_id
  AND department.hospital_offerings = '[]'::jsonb;

-- Restore the hospital's normal description after its configuration has moved.
UPDATE hospitals
SET description = parsed.config->>'profileDescription'
FROM (
  SELECT
    id,
    CASE
      WHEN description LIKE '{"__trainmedixAdminConfig":1%' THEN description::jsonb
      ELSE '{}'::jsonb
    END AS config
  FROM hospitals
) AS parsed
WHERE hospitals.id = parsed.id
  AND parsed.config->>'__trainmedixAdminConfig' = '1';

-- These tables belonged to the superseded design and are not used by the app.
DROP TABLE IF EXISTS admin_training_batches;
DROP TABLE IF EXISTS admin_hospital_department_offerings;

NOTIFY pgrst, 'reload schema';