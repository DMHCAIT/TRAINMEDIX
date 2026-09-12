#!/usr/bin/env node

import { connect } from './db-connect.mjs';

const client = await connect();

const rls = await client.query(`
  SELECT relname, relrowsecurity
    FROM pg_class
   WHERE relname IN ('training_slots','hospital_departments','hospitals','departments')
`);
console.log('RLS enabled:');
rls.rows.forEach((r) => console.log(`  - ${r.relname}: ${r.relrowsecurity}`));

const pol = await client.query(`
  SELECT tablename, policyname, cmd
    FROM pg_policies
   WHERE tablename IN ('training_slots','hospital_departments')
`);
console.log('\nPolicies:');
if (pol.rows.length === 0) console.log('  (none)');
pol.rows.forEach((r) => console.log(`  - ${r.tablename}: ${r.policyname} [${r.cmd}]`));

const cols = await client.query(`
  SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
   WHERE table_name = 'training_slots'
   ORDER BY ordinal_position
`);
console.log('\ntraining_slots columns:');
cols.rows.forEach((r) =>
  console.log(`  - ${r.column_name} | nullable=${r.is_nullable} | default=${r.column_default}`)
);

const slots = await client.query('SELECT COUNT(*) FROM training_slots');
console.log(`\ntraining_slots rows: ${slots.rows[0].count}`);

const offerings = await client.query(
  `SELECT hd.id, h.name, hd.city, hd.max_slots, hd.pricing
     FROM hospital_departments hd
     JOIN hospitals h ON h.id = hd.hospital_id`
);
console.log('\nOfferings:');
offerings.rows.forEach((r) =>
  console.log(`  - ${r.name} (${r.city}) | max_slots=${r.max_slots} | pricing=${JSON.stringify(r.pricing)}`)
);

await client.end();
