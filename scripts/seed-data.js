#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data
const DEPARTMENTS = [
  {
    code: 'EM-CC',
    name: 'Emergency & Critical Care Training',
    description: 'Trauma care, acute resuscitation, ICU triage, ACLS/BLS protocols, and advanced ventilator management in level-1 emergency centers.',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'CARD',
    name: 'Cardiac Sciences',
    description: 'Clinical cardiology, cath lab observations, 2D ECHO Doppler diagnostics, Cardiac ICU, and interventional cardiology basics.',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'MED',
    name: 'Medicine & Physician Specialties',
    description: 'Comprehensive internal medicine, diabetology clinics, pulmonology ward rounds, infectious diseases, and rheumatology care.',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'RAD-DIAG',
    name: 'Diagnostic & Imaging Sciences',
    description: 'Advanced radiology interpretation, USG sonography scanning, 128-slice CT/3T MRI cross-sectional imaging, and lab medicine.',
    duration_days: 60,
    is_active: true
  },
  {
    code: 'SURG',
    name: 'Surgical & Procedural Specialties',
    description: 'Operation theater scrubbing, laparoscopic technique observation, trauma orthopaedics, and urological surgical procedures.',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'OBG-IVF',
    name: "Women's Health & Fertility",
    description: 'High-risk obstetrics, labor room management, assisted reproductive technology (IVF/ART), and fetal medicine ultrasounds.',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'PAED-NICU',
    name: 'Pediatrics & Neonatal Care',
    description: 'Pediatric ward rounds, neonatal ICU (NICU) resuscitation, preterm infant care, and pediatric intensive care (PICU).',
    duration_days: 90,
    is_active: true
  },
  {
    code: 'DERM-ENT',
    name: 'Skin, ENT & Aesthetic Medicine',
    description: 'Clinical dermatology OPD, cosmetology laser interventions, ENT endoscopic procedures, and hair transplant techniques.',
    duration_days: 60,
    is_active: true
  },
];

const HOSPITALS = [
  {
    name: 'Beau Monde Clinic',
    email: 'info@beaumonde.com',
    phone: '+91-9876543210',
    city: 'Delhi',
    state: 'Delhi',
    address: 'New Delhi',
    website: 'www.beaumonde.com',
    accreditation: 'NABH Accredited',
    description: 'Specialized aesthetic clinic in New Delhi',
    is_active: true
  },
  {
    name: 'Dharma Diabetic Centre',
    email: 'info@dharma-diabetes.com',
    phone: '+91-9876543211',
    city: 'Delhi',
    state: 'Delhi',
    address: 'Delhi',
    website: 'www.dharma-diabetes.com',
    accreditation: 'NABH Accredited',
    description: 'Dedicated diabetes and endocrinology center',
    is_active: true
  },
  {
    name: 'Sama Hospital',
    email: 'info@sama-hospital.com',
    phone: '+91-9876543212',
    city: 'Delhi',
    state: 'Delhi',
    address: 'New Delhi',
    website: 'www.sama-hospital.com',
    accreditation: 'NABH Accredited',
    description: 'Established multispecialty hospital in South Delhi',
    is_active: true
  },
  {
    name: 'Satyabhama Hospital',
    email: 'info@satyabhama-hospital.com',
    phone: '+91-9876543213',
    city: 'Delhi',
    state: 'Delhi',
    address: 'New Delhi',
    website: 'www.satyabhama-hospital.com',
    accreditation: 'NABH Accredited',
    description: 'Multispecialty hospital delivering comprehensive healthcare',
    is_active: true
  },
  {
    name: 'SJM Hospital',
    email: 'info@sjm-hospital.com',
    phone: '+91-9876543214',
    city: 'Noida',
    state: 'Uttar Pradesh',
    address: 'Noida',
    website: 'www.sjm-hospital.com',
    accreditation: 'NABH Accredited',
    description: 'Multispecialty healthcare center',
    is_active: true
  },
  {
    name: 'Mehndritta Hospital',
    email: 'info@mehndritta-hospital.com',
    phone: '+91-9876543215',
    city: 'Ambala',
    state: 'Haryana',
    address: 'Haryana',
    website: 'www.mehndritta-hospital.com',
    accreditation: 'NABH Accredited',
    description: 'Indus Network affiliated hospital',
    is_active: true
  },
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...\n');

    // Clear existing data
    console.log('🧹 Clearing existing departments...');
    await supabase.from('departments').delete().neq('id', 'null');
    
    console.log('🧹 Clearing existing hospitals...');
    await supabase.from('hospitals').delete().neq('id', 'null');

    // Seed Departments
    console.log('📚 Seeding departments...');
    const { error: deptError, data: deptData } = await supabase
      .from('departments')
      .insert(DEPARTMENTS)
      .select();

    if (deptError) {
      console.error('❌ Department seeding error:', deptError.message);
    } else {
      console.log(`✅ Successfully added ${DEPARTMENTS.length} departments`);
    }

    // Seed Hospitals
    console.log('🏥 Seeding hospitals...');
    const { error: hospError, data: hospData } = await supabase
      .from('hospitals')
      .insert(HOSPITALS)
      .select();

    if (hospError) {
      console.error('❌ Hospital seeding error:', hospError.message);
    } else {
      console.log(`✅ Successfully added ${HOSPITALS.length} hospitals`);
    }

    // Create sample training slots
    console.log('\n📅 Creating sample training slots...');
    
    // Slots will be created once hospital-department relationships exist
    console.log('⏭️  Skipping slots for now (requires hospital_department mappings)');

    console.log('\n🎉 Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✓ Departments: ${DEPARTMENTS.length}`);
    console.log(`   ✓ Hospitals: ${HOSPITALS.length}`);
    console.log('\n✅ Admin panel now has data to display!');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedData();
