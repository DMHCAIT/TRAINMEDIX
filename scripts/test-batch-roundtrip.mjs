#!/usr/bin/env node

// Reproduces the admin save/reload flow using the same anon key the browser uses.
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
envContent.split('\n').forEach((line) => {
  const i = line.indexOf('=');
  if (i === -1) return;
  const k = line.slice(0, i).trim();
  const v = line.slice(i + 1).trim();
  if (k && v && !k.startsWith('#')) process.env[k] = v;
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: dept } = await supabase
  .from('departments')
  .select('id, name')
  .eq('name', 'Medicine & Physician Specialties')
  .single();
console.log('Department:', dept?.name, dept?.id);

const { data: partners, error: pErr } = await supabase
  .from('hospital_departments')
  .select('*, hospitals(*)')
  .eq('department_id', dept.id);
console.log('getByDepartment error:', pErr?.message || 'none');
console.log('Offerings returned to the form:');
(partners || []).forEach((p) =>
  console.log(`  id=${p.id} hospital=${p.hospitals?.name} city=${JSON.stringify(p.city)} pricing=${JSON.stringify(p.pricing)}`)
);

const target = (partners || []).find((p) => p.hospitals?.name?.includes('Mehndritta'));
if (!target) {
  console.log('\nNo Mehndritta offering for this department.');
  process.exit(0);
}

console.log('\nInserting a test batch for offering', target.id);
const { data: inserted, error: insErr } = await supabase
  .from('training_slots')
  .insert([
    {
      hospital_department_id: target.id,
      start_date: '2026-11-01',
      end_date: '2026-12-01',
      available_seats: 2,
      duration_months: 1,
      booked_seats: 0,
    },
  ])
  .select()
  .single();
console.log('insert error:', insErr?.message || 'none');
console.log('inserted id:', inserted?.id);

const { data: readBack, error: rErr } = await supabase
  .from('training_slots')
  .select('*')
  .eq('hospital_department_id', target.id);
console.log('read-back error:', rErr?.message || 'none');
console.log('rows visible to anon key:', readBack?.length);

if (inserted?.id) {
  await supabase.from('training_slots').delete().eq('id', inserted.id);
  console.log('cleaned up test row');
}
