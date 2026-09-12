import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gxtpzrhlvycvsjqrvuvv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhseXZjdnNqcXJ2dXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2Nzk3MjAsImV4cCI6MjA0MTI1NTcyMH0.8c45kG6uCWj65F5xaFFEm9BzuI9D4oEPQRZjN2VEbRs'
);

console.log('🔍 Fetching hospital pricing data...\n');

const { data: hospitals, error } = await supabase
  .from('hospitals')
  .select('id, name, city, description')
  .limit(3);

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

hospitals.forEach(hospital => {
  console.log(`\n🏥 Hospital: ${hospital.name} (${hospital.city})`);
  console.log('─'.repeat(60));
  
  if (!hospital.description) {
    console.log('  (No description data)');
    return;
  }
  
  try {
    const parsed = JSON.parse(hospital.description);
    
    if (parsed.__trainmedixAdminConfig?.departmentOfferings) {
      const offerings = parsed.__trainmedixAdminConfig.departmentOfferings;
      console.log(`  📋 Department Offerings: ${offerings.length}`);
      
      offerings.slice(0, 2).forEach(offering => {
        console.log(`\n     Department ID: ${offering.department_id}`);
        console.log(`     City: ${offering.city}`);
        console.log(`     Pricing:`);
        Object.entries(offering.pricing || {}).forEach(([duration, price]) => {
          console.log(`       - ${duration}: ₹${price.toLocaleString()}`);
        });
        if (offering.batches?.length) {
          console.log(`     Batches: ${offering.batches.length}`);
          offering.batches[0] && console.log(`       - Start: ${offering.batches[0].start_date}`);
        }
      });
    } else {
      console.log('  (No offering configuration found)');
    }
  } catch (e) {
    console.log(`  (Plain text description: "${hospital.description.substring(0, 50)}...")`);
  }
});

console.log('\n\n📊 DATABASE STRUCTURE:\n');
console.log('Table: hospitals');
console.log('  - id (UUID)');
console.log('  - name (TEXT) - Hospital name');
console.log('  - city (TEXT) - City location');
console.log('  - description (TEXT) - JSON with __trainmedixAdminConfig');
console.log('    └─ __trainmedixAdminConfig.departmentOfferings[]:');
console.log('       ├─ hospital_id (UUID)');
console.log('       ├─ department_id (UUID)');
console.log('       ├─ city (TEXT)');
console.log('       ├─ pricing (Object: {duration -> price})');
console.log('       ├─ max_slots (NUMBER)');
console.log('       ├─ batches (Array of batch objects)');
console.log('       │  ├─ id, start_date, end_date, duration_months');
console.log('       │  ├─ available_seats, booked_seats, status');
console.log('       │  └─ created_at');
console.log('       └─ created_at');

console.log('\n✅ Data is stored in hospitals.description as JSON');
console.log('   This is the ACTIVE storage location (since hospital_offerings column not yet created)');
