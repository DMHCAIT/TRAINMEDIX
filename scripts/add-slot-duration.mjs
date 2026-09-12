#!/usr/bin/env node

import { connect } from './db-connect.mjs';

const client = await connect();

const statements = [
  `ALTER TABLE training_slots ADD COLUMN IF NOT EXISTS duration_months INT`,
  `COMMENT ON COLUMN training_slots.duration_months IS 'Rotation length in months for this batch'`,
  // Derive a sensible duration for rows created before this column existed.
  `UPDATE training_slots
      SET duration_months = GREATEST(1, ROUND((end_date - start_date) / 30.0)::int)
    WHERE duration_months IS NULL`,
];

for (const sql of statements) {
  try {
    await client.query(sql);
    console.log(`OK   ${sql.split('\n')[0].trim().slice(0, 70)}`);
  } catch (err) {
    console.error(`FAIL ${sql.split('\n')[0].trim().slice(0, 70)}\n     ${err.message}`);
  }
}

const { rows } = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'training_slots' ORDER BY ordinal_position`
);
console.log('\ntraining_slots columns:');
rows.forEach((r) => console.log(`  - ${r.column_name} (${r.data_type})`));

await client.end();
