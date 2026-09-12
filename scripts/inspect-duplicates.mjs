#!/usr/bin/env node

import { connect } from './db-connect.mjs';

const client = await connect();

const fks = await client.query(`
  SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
     AND ccu.table_name = 'hospitals'
`);
console.log('Tables referencing hospitals(id):');
fks.rows.forEach((r) => console.log(`  - ${r.table_name}.${r.column_name}`));

const dupes = await client.query(`
  SELECT id, name, city, cities, created_at
    FROM hospitals
   WHERE lower(trim(name)) IN (
     SELECT lower(trim(name)) FROM hospitals GROUP BY 1 HAVING COUNT(*) > 1
   )
   ORDER BY lower(trim(name)), created_at
`);
console.log('\nDuplicate hospital rows:');
dupes.rows.forEach((r) =>
  console.log(`  ${r.name} | id=${r.id} | city=${r.city} | cities=${JSON.stringify(r.cities)} | created=${r.created_at}`)
);

const counts = await client.query(`
  SELECT h.id, h.name, COUNT(hd.id) AS offerings
    FROM hospitals h
    LEFT JOIN hospital_departments hd ON hd.hospital_id = h.id
   WHERE lower(trim(h.name)) IN (
     SELECT lower(trim(name)) FROM hospitals GROUP BY 1 HAVING COUNT(*) > 1
   )
   GROUP BY h.id, h.name
   ORDER BY h.name
`);
console.log('\nOfferings per duplicate row:');
counts.rows.forEach((r) => console.log(`  ${r.name} | id=${r.id} | offerings=${r.offerings}`));

await client.end();
