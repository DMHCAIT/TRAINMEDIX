#!/usr/bin/env node

import { connect } from './db-connect.mjs';

const client = await connect();

const rows = await client.query(`
  SELECT ts.id, ts.start_date, ts.end_date, ts.available_seats, ts.duration_months,
         ts.created_at, h.name AS hospital, hd.city, d.name AS department
    FROM training_slots ts
    LEFT JOIN hospital_departments hd ON hd.id = ts.hospital_department_id
    LEFT JOIN hospitals h ON h.id = hd.hospital_id
    LEFT JOIN departments d ON d.id = hd.department_id
   ORDER BY ts.created_at
`);

console.log('training_slots rows:');
rows.rows.forEach((r) =>
  console.log(
    `  ${r.hospital} (${r.city}) | ${r.department} | ${r.start_date?.toISOString?.().slice(0,10)} -> ${r.end_date?.toISOString?.().slice(0,10)} | ${r.duration_months}mo | seats=${r.available_seats} | created=${r.created_at?.toISOString?.()}`
  )
);

const perDept = await client.query(`
  SELECT d.name AS department, h.name AS hospital, hd.city, hd.id,
         hd.pricing, hd.max_slots,
         (SELECT COUNT(*) FROM training_slots ts WHERE ts.hospital_department_id = hd.id) AS batches
    FROM hospital_departments hd
    JOIN hospitals h ON h.id = hd.hospital_id
    JOIN departments d ON d.id = hd.department_id
   ORDER BY d.name, h.name
`);
console.log('\nOfferings by department:');
perDept.rows.forEach((r) =>
  console.log(`  ${r.department} | ${r.hospital} (${r.city}) | batches=${r.batches} | slots=${r.max_slots} | pricing=${JSON.stringify(r.pricing)}`)
);

await client.end();
