import { Department, Hospital, TrainingSlot, Booking, Certificate, NotificationItem, CityName, LogbookEntry } from '../types';

export const CITIES: CityName[] = [
  'Delhi',
  'Noida',
  'Ambala',
  'Lucknow',
  'Ghaziabad',
  'Jaipur',
  'Bharatpur',
  'Pune',
  'Navi Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Patna',
  'Purnia',
  'Srinagar',
  'Mohali',
  'Dehradun',
  'Gurugram',
  'Mumbai',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Kochi',
  'Bhopal'
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-em',
    name: 'Emergency & Critical Care Training',
    code: 'EM-CC',
    description: 'Trauma care, acute resuscitation, ICU triage, ACLS/BLS protocols, and advanced ventilator management in level-1 emergency centers.',
    availableCities: ['Delhi', 'Noida', 'Lucknow', 'Hyderabad', 'Bengaluru', 'Pune'],
    subDepartments: ['Emergency Medicine', 'ICU / Critical Care', 'Trauma Care', 'ACLS / BLS', 'Ventilator Management'],
    hospitalsCount: 16,
    iconName: 'Activity',
    featured: true,
    baseFeePerMonth: 45000,
    clinicalHighlights: ['Trauma Resuscitation', 'Airway Management', 'ACLS / BLS Protocols', 'Mechanical Ventilation'],
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-cardio',
    name: 'Cardiac Sciences',
    code: 'CARD',
    description: 'Clinical cardiology, cath lab observations, 2D ECHO Doppler diagnostics, Cardiac ICU, and interventional cardiology basics.',
    availableCities: ['Delhi', 'Hyderabad', 'Navi Mumbai', 'Pune', 'Lucknow', 'Patna'],
    subDepartments: ['Cardiology', 'ECG / 2D Echo', 'Cardiac ICU', 'Interventional Basics'],
    hospitalsCount: 14,
    iconName: 'HeartPulse',
    featured: true,
    baseFeePerMonth: 55000,
    clinicalHighlights: ['Cath Lab Observation', 'Color Doppler ECHO', 'TMT & Holter Monitoring', 'Cardiac ICU Rounds'],
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-med',
    name: 'Medicine & Physician Specialties',
    code: 'MED',
    description: 'Comprehensive internal medicine, diabetology clinics, pulmonology ward rounds, infectious diseases, and rheumatology care.',
    availableCities: ['Delhi', 'Noida', 'Srinagar', 'Dehradun', 'Jaipur', 'Ghaziabad'],
    subDepartments: ['General Medicine', 'Diabetology', 'Pulmonology', 'Infectious Diseases', 'Rheumatology'],
    hospitalsCount: 18,
    iconName: 'ShieldPlus',
    featured: true,
    baseFeePerMonth: 38000,
    clinicalHighlights: ['Comprehensive Ward Rounds', 'Diabetic Care Protocols', 'Pulmonology Diagnostics', 'Infectious Disease Triage'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-radio',
    name: 'Diagnostic & Imaging Sciences',
    code: 'RAD-DIAG',
    description: 'Advanced radiology interpretation, USG sonography scanning, 128-slice CT/3T MRI cross-sectional imaging, and lab medicine.',
    availableCities: ['Delhi', 'Lucknow', 'Hyderabad', 'Pune', 'Mohali'],
    subDepartments: ['Radiology', 'Ultrasound / Sonography', 'CT / MRI', 'Lab Medicine'],
    hospitalsCount: 12,
    iconName: 'Scan',
    featured: true,
    baseFeePerMonth: 48000,
    clinicalHighlights: ['CT / MRI Protocoling', 'FAST Ultrasound', 'X-Ray Reading', 'Clinical Pathology & Lab Medicine'],
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-surg',
    name: 'Surgical & Procedural Specialties',
    code: 'SURG',
    description: 'Operation theater scrubbing, laparoscopic technique observation, trauma orthopaedics, and urological surgical procedures.',
    availableCities: ['Delhi', 'Jaipur', 'Ambala', 'Purnia', 'Srinagar', 'Mohali'],
    subDepartments: ['General Surgery', 'Laparoscopy', 'Orthopaedics', 'Urology'],
    hospitalsCount: 15,
    iconName: 'Crosshair',
    featured: true,
    baseFeePerMonth: 47000,
    clinicalHighlights: ['OT Scrubbing Protocols', 'Laparoscopic Observation', 'Fracture Casting & Ortho', 'Urological Assists'],
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-obg',
    name: 'Women’s Health & Fertility',
    code: 'OBG-IVF',
    description: 'High-risk obstetrics, labor room management, assisted reproductive technology (IVF/ART), and fetal medicine ultrasounds.',
    availableCities: ['Delhi', 'Noida', 'Jaipur', 'Hyderabad', 'Dehradun'],
    subDepartments: ['Obstetrics & Gynaecology', 'IVF / Reproductive Medicine', 'Fetal Medicine'],
    hospitalsCount: 11,
    iconName: 'Baby',
    featured: false,
    baseFeePerMonth: 42000,
    clinicalHighlights: ['Normal & Assisted Deliveries', 'IVF Lab Observation', 'Fetal Anomaly Scanning', 'High-Risk ANC'],
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-paed',
    name: 'Pediatrics & Neonatal Care',
    code: 'PAED-NICU',
    description: 'Pediatric ward rounds, neonatal ICU (NICU) resuscitation, preterm infant care, and pediatric intensive care (PICU).',
    availableCities: ['Delhi', 'Navi Mumbai', 'Purnia', 'Lucknow', 'Ghaziabad'],
    subDepartments: ['Paediatrics', 'Neonatology', 'NICU / PICU'],
    hospitalsCount: 10,
    iconName: 'Users',
    featured: false,
    baseFeePerMonth: 42000,
    clinicalHighlights: ['NICU / PICU Care', 'Neonatal Resuscitation', 'Paediatric Dosing', 'Growth & Milestones'],
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-derm',
    name: 'Skin, ENT & Aesthetic Medicine',
    code: 'DERM-ENT',
    description: 'Clinical dermatology OPD, cosmetology laser interventions, ENT endoscopic procedures, and hair transplant techniques.',
    availableCities: ['Delhi', 'Lucknow', 'Bharatpur', 'Jaipur', 'Hyderabad'],
    subDepartments: ['Dermatology', 'Cosmetology', 'ENT', 'Hair Transplant'],
    hospitalsCount: 9,
    iconName: 'Sparkles',
    featured: false,
    baseFeePerMonth: 40000,
    clinicalHighlights: ['Dermatosurgery', 'Cosmetic Lasers', 'ENT Endoscopy', 'FUE Hair Restoration Observation'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-dental',
    name: 'Dental Sciences',
    code: 'DENT',
    description: 'Clinical dentistry, maxillofacial trauma surgery, root canal endodontics, orthodontics, prosthodontics, and implantology.',
    availableCities: ['Bharatpur', 'Delhi', 'Jaipur', 'Lucknow', 'Dehradun'],
    subDepartments: ['General Dentistry', 'Oral & Maxillofacial Surgery', 'Orthodontics', 'Endodontics', 'Prosthodontics', 'Implantology', 'Cosmetic Dentistry'],
    hospitalsCount: 8,
    iconName: 'Stethoscope',
    featured: false,
    baseFeePerMonth: 35000,
    clinicalHighlights: ['Maxillofacial Surgery Assists', 'Dental Implantology', 'Rotary Endodontics', 'Cosmetic Veneers'],
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-mental',
    name: 'Mental Health & Rehabilitation',
    code: 'PSY-REHAB',
    description: 'Clinical psychiatric evaluation, psychotherapy sessions, cognitive behavioral therapy, and neuro-physiotherapy rehab.',
    availableCities: ['Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Ambala'],
    subDepartments: ['Psychiatry', 'Clinical Psychology', 'Physiotherapy'],
    hospitalsCount: 7,
    iconName: 'Brain',
    featured: false,
    baseFeePerMonth: 36000,
    clinicalHighlights: ['Psychiatric MSE Evaluation', 'CBT Protocols', 'Neuro-Physiotherapy', 'Post-Op Physical Rehab'],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dept-super',
    name: 'Superspeciality Programs',
    code: 'SUPER-SPEC',
    description: 'Advanced tertiary rotations in neurology, nephrology dialysis, medical oncology, gastroenterology, and transplant care.',
    availableCities: ['Hyderabad', 'Delhi', 'Navi Mumbai', 'Pune', 'Mohali'],
    subDepartments: ['Neurology', 'Nephrology', 'Oncology', 'Gastroenterology', 'Transplant Medicine'],
    hospitalsCount: 13,
    iconName: 'Zap',
    featured: true,
    baseFeePerMonth: 58000,
    clinicalHighlights: ['Stroke Unit Monitoring', 'Hemodialysis Protocols', 'Chemotherapy Administration', 'Organ Transplant Care'],
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  }
];

export const HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Beau Monde Clinic',
    city: 'Delhi',
    bedCapacity: 50,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-derm', 'dept-radio'],
    availableSlotsCount: 5,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    address: 'New Delhi',
    chiefMentor: 'Dr. Neha Taneja, MD (Dermatology)',
    description: 'Specialized aesthetic clinic in New Delhi offering cosmetic gynecology, radiology, and advanced hair restoration services.',
    clinicalHighlights: [
      'Specialized cosmetic gynecology and aesthetic procedures',
      'Advanced hair transplant and restoration services',
      'Expert radiology and diagnostic support',
      'Personalized treatment by experienced specialists'
    ],
    mostBookedSpecialization: 'Cosmetic Gynecology & Hair Restoration',
    offeredDepartments: {
      'Skin, ENT & Aesthetic Medicine': ['Cosmetic Gyne', 'Hair Transplant'],
      'Diagnostic & Imaging Sciences': ['Radiology']
    }
  },
  {
    id: 'hosp-2',
    name: 'Dharma Diabetic Centre',
    city: 'Delhi',
    bedCapacity: 60,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-med'],
    availableSlotsCount: 4,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    address: 'Delhi',
    chiefMentor: 'Dr. Ajay Kumar, MD (Endocrinology & Diabetology)',
    description: 'Dedicated diabetes and endocrinology center providing comprehensive care for diabetes, hypertension, and metabolic disorders.',
    clinicalHighlights: [
      'Comprehensive diabetes management and care',
      'Specialized endocrinology consultation services',
      'Advanced diabetic foot care treatments',
      'Hypertension and metabolic disorder management'
    ],
    mostBookedSpecialization: 'Endocrinology & Diabetic Care',
    offeredDepartments: {
      'Medicine & Physician Specialties': ['Diabetes', 'Endocrinology', 'Diabetes Educator', 'Diabetic Foot Care', 'Hypertension']
    }
  },
  {
    id: 'hosp-3',
    name: 'Sama Hospital',
    city: 'Delhi',
    bedCapacity: 120,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-derm', 'dept-med', 'dept-super', 'dept-surg', 'dept-radio'],
    availableSlotsCount: 6,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    address: 'New Delhi',
    chiefMentor: 'Dr. S. K. Sama, MD, FRCP',
    description: 'Established multispecialty hospital in South Delhi known for ethical, patient-first care across medical and surgical specialties.',
    clinicalHighlights: [
      'Comprehensive multispecialty healthcare under one roof',
      'Experienced team of specialist consultants',
      'Advanced diagnostics and surgical facilities',
      'Ethical, patient-centered medical care'
    ],
    mostBookedSpecialization: 'General Surgery & Internal Medicine',
    offeredDepartments: {
      'Skin, ENT & Aesthetic Medicine': ['ENT', 'Derma'],
      'Medicine & Physician Specialties': ['Internal Medicine', 'Diabetes', 'Pulmology'],
      'Superspeciality Programs': ['Gastroenterology', 'Urology'],
      'Surgical & Procedural Specialties': ['Spine Surgery'],
      'Diagnostic & Imaging Sciences': ['Optholomology']
    }
  },
  {
    id: 'hosp-4',
    name: 'Satyabhama Hospital',
    city: 'Delhi',
    bedCapacity: 100,
    accreditation: 'NABH Accredited',
    rating: 4.6,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-derm', 'dept-super', 'dept-paed', 'dept-mental'],
    availableSlotsCount: 5,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    address: 'New Delhi',
    chiefMentor: 'Dr. R. P. Sharma, MS (General Surgery)',
    description: 'Multispecialty hospital delivering comprehensive healthcare with expertise in medicine, surgery, critical care, and advanced diagnostics.',
    clinicalHighlights: [
      'Wide range of medical specialties available',
      'Advanced critical and emergency care services',
      'Expert neurology and neurosurgery support',
      'Comprehensive surgical treatment facilities'
    ],
    mostBookedSpecialization: 'Emergency & Critical Care',
    offeredDepartments: {
      'Emergency & Critical Care Training': ['Emergency Medicine', 'Critical Care', 'Anesthesia'],
      'Cardiac Sciences': ['Clinical Cardiology', 'Echocardiography'],
      'Medicine & Physician Specialties': ['Internal Medicine', 'Diabetology', 'Endocrinology', 'Rheumatology', 'Sleep Medicine'],
      'Diagnostic & Imaging Sciences': ['Clinical Pathology', 'Radiology'],
      'Surgical & Procedural Specialties': ['General Surgery', 'Laparoscopic Surgery', 'Orthopedic', 'Urology'],
      'Skin, ENT & Aesthetic Medicine': ['ENT', 'Cosmetology', 'Dermatology'],
      'Superspeciality Programs': ['Neurosurgery', 'Neurology', 'Oncology'],
      'Pediatrics & Neonatal Care': ['Pediatric Surgery'],
      'Mental Health & Rehabilitation': ['Psychiatric Medicine'],
      'Other': ['Hospital Administrative']
    }
  },
  {
    id: 'hosp-5',
    name: 'SJM Hospital',
    city: 'Noida',
    bedCapacity: 150,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-obg', 'dept-med', 'dept-em'],
    availableSlotsCount: 7,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    address: 'Noida',
    chiefMentor: 'Dr. Pushpendra Nath Renjen, DM (Neurology)',
    description: 'Multispecialty healthcare center providing medical and surgical services across a wide range of specialties.',
    clinicalHighlights: [
      'Comprehensive multispecialty healthcare services',
      'Modern diagnostic and treatment facilities',
      'Experienced doctors across multiple specialties',
      'Quality inpatient and outpatient medical care'
    ],
    mostBookedSpecialization: 'ICU & Cardiac Sciences',
    offeredDepartments: {
      "Women's Health & Fertility": ['Reproductive Medicine', 'Infertility Management', 'Obstetrics and Gynaecology'],
      'Medicine & Physician Specialties': ['Internal Medicine'],
      'Emergency & Critical Care Training': ['Critical Care']
    }
  },
  {
    id: 'hosp-6',
    name: 'Mehndritta Hospital (Indus Network Hospital)',
    city: 'Ambala',
    bedCapacity: 100,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-dental', 'dept-mental', 'dept-super'],
    availableSlotsCount: 6,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    address: 'Haryana',
    chiefMentor: 'Dr. Vikas Mehndritta, MS (Orthopaedics)',
    description: 'Indus Network affiliated hospital offering multidisciplinary healthcare with a focus on quality patient care.',
    clinicalHighlights: [
      'Part of trusted Indus Network Hospitals',
      'Comprehensive multidisciplinary healthcare services',
      'Patient-focused treatment and medical support',
      'Modern healthcare with experienced professionals'
    ],
    mostBookedSpecialization: 'Orthopaedics & Joint Replacement',
    offeredDepartments: {
      'All Departments': ['All Department']
    }
  },
  {
    id: 'hosp-7',
    name: 'The Velvet Skin Centre',
    city: 'Lucknow',
    bedCapacity: 30,
    accreditation: 'NABH Accredited',
    rating: 4.9,
    departments: ['dept-derm'],
    availableSlotsCount: 4,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    address: 'Lucknow',
    chiefMentor: 'Dr. Abir Saraswat, MD, DNB (Dermatology)',
    description: 'Premium dermatology clinic specializing in skin, hair, cosmetic, and trichology treatments.',
    clinicalHighlights: [
      'Advanced skin and hair treatments',
      'Specialized cosmetic dermatology procedures',
      'Expert trichology consultation and care',
      'Personalized aesthetic treatment solutions'
    ],
    mostBookedSpecialization: 'Cosmetic Dermatology & Laser',
    offeredDepartments: {
      'Skin, ENT & Aesthetic Medicine': ['Dermatology', 'Cosmetology', 'Trichology']
    }
  },
  {
    id: 'hosp-8',
    name: 'Criticalcare Hospital',
    city: 'Lucknow',
    bedCapacity: 120,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-em'],
    availableSlotsCount: 6,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    address: 'Lucknow',
    chiefMentor: 'Dr. Sharad Chand, MD (Anaesthesia & Critical Care)',
    description: 'Specialized center focused on anesthesia, intensive care, and emergency critical care services.',
    clinicalHighlights: [
      'Specialized intensive and critical care services',
      'Experienced anesthesia and emergency specialists',
      'Advanced life support and monitoring',
      'Quality patient-centered critical care management'
    ],
    mostBookedSpecialization: 'Anaesthesia & ICU Management',
    offeredDepartments: {
      'Emergency & Critical Care Training': ['Anesthesia', 'Critical Care']
    }
  },
  {
    id: 'hosp-9',
    name: 'TITHI Hospital Training Institute Private Limited',
    city: 'Ghaziabad',
    bedCapacity: 150,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-obg', 'dept-radio'],
    availableSlotsCount: 8,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    address: 'Ghaziabad',
    chiefMentor: 'Dr. Anuj Tyagi, MD (Internal Medicine)',
    description: 'Center of excellence for reproductive medicine, IVF, high-risk pregnancy, and minimally invasive gynecological procedures.',
    clinicalHighlights: [
      'Advanced IVF and fertility treatments',
      'Specialized reproductive medicine services',
      'Expert high-risk pregnancy management',
      'Minimally invasive gynecological procedures'
    ],
    mostBookedSpecialization: 'Reproductive Medicine & IVF',
    offeredDepartments: {
      "Women's Health & Fertility": ['Reproductive Medicine', 'High Risk Pregnancy', 'Obs & Gynae', 'Laparascopic And Hysteroscopy', 'IVF'],
      'Diagnostic & Imaging Sciences': ['Embryology']
    }
  },
  {
    id: 'hosp-10',
    name: 'Jaipur Doorbeen Hospital',
    city: 'Jaipur',
    bedCapacity: 80,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-obg', 'dept-surg'],
    availableSlotsCount: 5,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    address: 'Jaipur',
    chiefMentor: 'Dr. Sushil Kumar, MS (Laparoscopic Surgery)',
    description: "Women's healthcare hospital specializing in obstetrics, gynecology, and advanced maternal care.",
    clinicalHighlights: [
      'Dedicated women\'s healthcare services',
      'Comprehensive obstetrics and gynecology care',
      'High-quality maternal healthcare support',
      'Experienced gynecology specialist team'
    ],
    mostBookedSpecialization: 'Advanced Laparoscopic Gynecology',
    offeredDepartments: {
      "Women's Health & Fertility": ['Obstetrics and Gynaecology', 'Hysterectomy', 'Laparoscopy Tubal Surgery'],
      'Surgical & Procedural Specialties': ['Laparoscopic Surgery']
    }
  },
  {
    id: 'hosp-11',
    name: 'Meda Daulati Dental Hospital',
    city: 'Bharatpur',
    bedCapacity: 40,
    accreditation: 'NABH Accredited',
    rating: 4.6,
    departments: ['dept-dental'],
    availableSlotsCount: 3,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    address: 'Bharatpur',
    chiefMentor: 'Dr. D. C. Meda, MDS (Maxillofacial Surgery)',
    description: 'Advanced dental hospital offering implantology, maxillofacial surgery, facial aesthetics, and specialized dental care.',
    clinicalHighlights: [
      'Advanced dental implant procedures available',
      'Specialized maxillofacial surgery expertise',
      'Comprehensive facial aesthetic treatments',
      'Modern dental oncology care services'
    ],
    mostBookedSpecialization: 'Maxillofacial Surgery & Implantology',
    offeredDepartments: {
      'Dental Sciences': ['Maxillofacial Surgery', 'Implantology', 'Facial Plastic Surgery', 'Advance Dentistry', 'Endocontics', 'Oncology Dentistry', 'Head & Neck Oncology']
    }
  },
  {
    id: 'hosp-12',
    name: 'Medicover Hospitals – Shreeramnagar',
    city: 'Pune',
    bedCapacity: 300,
    accreditation: 'NABH & NABL Accredited',
    rating: 4.8,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-dental', 'dept-mental', 'dept-super'],
    availableSlotsCount: 9,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    address: 'Pune',
    chiefMentor: 'Dr. Sanjay Patil, MD (General Medicine)',
    description: 'Leading multispecialty hospital providing comprehensive tertiary care across medical and surgical specialties.',
    clinicalHighlights: [
      'Comprehensive tertiary healthcare services',
      'Advanced diagnostics and imaging facilities',
      'Experienced multidisciplinary medical specialists',
      'Modern emergency and critical care'
    ],
    mostBookedSpecialization: 'Emergency Medicine Rotation',
    offeredDepartments: {
      'All Departments': ['All Department']
    }
  },
  {
    id: 'hosp-13',
    name: 'Medicover Hospitals – Kharghar',
    city: 'Navi Mumbai',
    bedCapacity: 350,
    accreditation: 'NABH Accredited',
    rating: 4.9,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-dental', 'dept-mental', 'dept-super'],
    availableSlotsCount: 10,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    address: 'Navi Mumbai',
    chiefMentor: 'Dr. Nilesh Gautam, DM (Cardiology)',
    description: 'Modern multispecialty hospital delivering advanced diagnostics, emergency care, and specialty treatments.',
    clinicalHighlights: [
      'Leading multispecialty healthcare destination',
      'Advanced medical and surgical services',
      'Modern infrastructure and patient care',
      'Expert specialist consultation available'
    ],
    mostBookedSpecialization: 'Interventional Cardiology',
    offeredDepartments: {
      'All Departments': ['All Department']
    }
  },
  {
    id: 'hosp-14',
    name: 'VASA (Simulator Centre)',
    city: 'Bengaluru',
    bedCapacity: 50,
    accreditation: 'Clinical Simulation Accredited',
    rating: 4.9,
    departments: ['dept-med', 'dept-cardio', 'dept-radio', 'dept-surg', 'dept-em', 'dept-derm', 'dept-super', 'dept-paed', 'dept-mental'],
    availableSlotsCount: 6,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    address: 'Bengaluru',
    chiefMentor: 'Dr. B. S. Vasudev, MD, DA (Anaesthesiology)',
    description: 'Advanced medical simulation center providing hands-on clinical training through high-fidelity simulation technology.',
    clinicalHighlights: [
      'Advanced simulation-based medical training',
      'Hands-on clinical skill development programs',
      'Modern healthcare education facilities',
      'Practical learning through medical simulators'
    ],
    mostBookedSpecialization: 'Clinical Simulation & Airway Skills',
    offeredDepartments: {
      'Medicine & Physician Specialties': ['Sleep Medicine', 'Diabetology', 'Internal Medicine', 'Endocrinology', 'Rheumatology'],
      'Cardiac Sciences': ['Echocardiography', 'Clinical Cardiology'],
      'Diagnostic & Imaging Sciences': ['Clinical Pathology', 'Radiology'],
      'Surgical & Procedural Specialties': ['Urology', 'Orthopedic', 'General Surgery', 'Laparoscopic Surgery', 'Neurosurgery'],
      'Emergency & Critical Care Training': ['Anesthesia', 'Critical Care', 'Emergency Medicine'],
      'Skin, ENT & Aesthetic Medicine': ['ENT', 'Cosmetology', 'Dermatology'],
      'Superspeciality Programs': ['Neurology', 'Oncology'],
      'Pediatrics & Neonatal Care': ['Pediatric Surgery'],
      'Mental Health & Rehabilitation': ['Psychiatric Medicine']
    }
  },
  {
    id: 'hosp-15',
    name: 'Virinchi Hospitals',
    city: 'Hyderabad',
    bedCapacity: 600,
    accreditation: 'NABH & NABL Accredited',
    rating: 4.8,
    departments: ['dept-med', 'dept-cardio', 'dept-surg', 'dept-em', 'dept-radio', 'dept-obg'],
    availableSlotsCount: 11,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    address: 'Hyderabad',
    chiefMentor: 'Dr. Srinivas Reddy, MCh (Cardiothoracic Surgery)',
    description: 'NABH-accredited tertiary care hospital in Hyderabad recognized for advanced critical care and multidisciplinary treatment.',
    clinicalHighlights: [
      'Advanced cardiology and pulmonary services',
      'Comprehensive emergency medical care',
      'Expert ophthalmology and specialty treatments',
      'Multidisciplinary patient-focused healthcare'
    ],
    mostBookedSpecialization: 'Cardiothoracic & Critical Care',
    offeredDepartments: {
      'Medicine & Physician Specialties': ['Diabetology', 'Pulmonary Medicine'],
      'Cardiac Sciences': ['Clinical Cardiology'],
      'Surgical & Procedural Specialties': ['General Surgery'],
      'Emergency & Critical Care Training': ['Emergency Medicine'],
      'Diagnostic & Imaging Sciences': ['Opthalmology'],
      "Women's Health & Fertility": ['Obs & Gyne']
    }
  },
  {
    id: 'hosp-16',
    name: 'Medicover Hospitals – Hitech City',
    city: 'Hyderabad',
    bedCapacity: 400,
    accreditation: 'NABH Accredited',
    rating: 4.9,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-dental', 'dept-mental', 'dept-super'],
    availableSlotsCount: 8,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    address: 'Hyderabad',
    chiefMentor: 'Dr. A. Sharath, MD (Critical Care)',
    description: 'Comprehensive multispecialty hospital offering advanced healthcare with modern infrastructure and specialist care.',
    clinicalHighlights: [
      'Advanced tertiary healthcare services available',
      'Comprehensive specialty medical departments',
      'Modern diagnostics and emergency facilities',
      'Experienced multidisciplinary healthcare professionals'
    ],
    mostBookedSpecialization: 'Critical Care & Emergency Rotation',
    offeredDepartments: {
      'All Departments': ['All Department']
    }
  },
  {
    id: 'hosp-17',
    name: 'KIIMS Hospital',
    city: 'Hyderabad',
    bedCapacity: 1000,
    accreditation: 'JCI & NABH Accredited',
    rating: 4.9,
    departments: ['dept-obg', 'dept-radio', 'dept-surg', 'dept-med', 'dept-derm', 'dept-em', 'dept-paed', 'dept-super', 'dept-mental'],
    availableSlotsCount: 14,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    address: 'Hyderabad',
    chiefMentor: 'Dr. B. Bhaskar Rao, MCh (CTVS)',
    description: "Advanced tertiary care hospital specializing in women's health, neurology, oncology, surgery, and minimally invasive procedures.",
    clinicalHighlights: [
      'Advanced women\'s healthcare and fertility',
      'Comprehensive neurology and neurosurgery services',
      'Specialized oncology and cancer treatment',
      'Minimally invasive surgical expertise available'
    ],
    mostBookedSpecialization: 'Minimally Invasive Surgery & OBG',
    offeredDepartments: {
      "Women's Health & Fertility": ['Fetal Medicine', 'Reproductive Medicine', 'Obs & Gynae', 'Cosmetic Gynae', 'High Risk Pregnancy', 'Gynae Oncology', 'IVF', 'Embryology'],
      'Diagnostic & Imaging Sciences': ['Interventional Radiology', 'Neuroradiology', 'MSK USG', 'Vascular USG', 'Fetal Echo', 'USG'],
      'Surgical & Procedural Specialties': ['General Surgery', 'Urology', 'Vascular Surgery', 'Minimal Invasive Surgery', 'Laparoscopy', 'Arthroscopy-Arthroplasty', 'Neurosurgery'],
      'Medicine & Physician Specialties': ['Spine Medicine', 'Internal Medicine', 'Sports Medicine', 'Epidemiology'],
      'Skin, ENT & Aesthetic Medicine': ['Dermatology', 'Trichology', 'Opthamology'],
      'Emergency & Critical Care Training': ['Emergency Medicine', 'Anesthesia'],
      'Pediatrics & Neonatal Care': ['Pediatric Neurology', 'Pediatric Surgery'],
      'Superspeciality Programs': ['GI Endoscopy', 'Neurology', 'Oral Oncology', 'Surgical Onco', 'Endourology'],
      'Mental Health & Rehabilitation': ['Psychiatric']
    }
  },
  {
    id: 'hosp-18',
    name: 'Ford Hospital',
    city: 'Patna',
    bedCapacity: 150,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-med', 'dept-cardio', 'dept-radio', 'dept-surg', 'dept-em', 'dept-derm', 'dept-super', 'dept-paed', 'dept-mental'],
    availableSlotsCount: 7,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    address: 'Patna',
    chiefMentor: 'Dr. B. B. Bharti, MD, DM (Cardiology)',
    description: 'Multispecialty hospital providing quality healthcare supported by experienced clinicians and modern medical facilities.',
    clinicalHighlights: [
      'Comprehensive multispecialty medical services',
      'Modern diagnostic and treatment facilities',
      'Experienced healthcare professionals available',
      'Patient-centered quality medical care'
    ],
    mostBookedSpecialization: 'Cardiology & General Medicine',
    offeredDepartments: {
      'Medicine & Physician Specialties': ['Sleep Medicine', 'Diabetology', 'Internal Medicine', 'Endocrinology', 'Rheumatology'],
      'Cardiac Sciences': ['Echocardiography', 'Clinical Cardiology'],
      'Diagnostic & Imaging Sciences': ['Clinical Pathology', 'Radiology'],
      'Surgical & Procedural Specialties': ['Urology', 'Orthopedic', 'General Surgery', 'Laparoscopic Surgery', 'Neurosurgery'],
      'Emergency & Critical Care Training': ['Anesthesia', 'Critical Care', 'Emergency Medicine'],
      'Skin, ENT & Aesthetic Medicine': ['ENT', 'Cosmetology', 'Dermatology'],
      'Superspeciality Programs': ['Neurology', 'Oncology'],
      'Pediatrics & Neonatal Care': ['Pediatric Surgery'],
      'Mental Health & Rehabilitation': ['Psychiatric Medicine']
    }
  },
  {
    id: 'hosp-19',
    name: 'Fatima Hospital',
    city: 'Purnia',
    bedCapacity: 120,
    accreditation: 'NABH Accredited',
    rating: 4.6,
    departments: ['dept-surg', 'dept-obg', 'dept-paed', 'dept-em', 'dept-super', 'dept-med'],
    availableSlotsCount: 5,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    address: 'Purnia',
    chiefMentor: 'Dr. Sister Mary, MS (General Surgery)',
    description: 'Multispecialty hospital delivering surgical, maternity, pediatric, nephrology, and emergency healthcare services.',
    clinicalHighlights: [
      'Comprehensive maternity and pediatric services',
      'Advanced laparoscopic surgical procedures',
      'Specialized nephrology and urology care',
      'Emergency and critical care support'
    ],
    mostBookedSpecialization: 'Maternity & Laparoscopic Surgery',
    offeredDepartments: {
      'Surgical & Procedural Specialties': ['General & Laparoscopic Surgery', 'Urology'],
      "Women's Health & Fertility": ['Gynecology & Obstetrics'],
      'Pediatrics & Neonatal Care': ['Pediatrics', 'Neonatology'],
      'Emergency & Critical Care Training': ['Emergency Medicine', 'Critical Care Medicine', 'Anesthesiology'],
      'Superspeciality Programs': ['Nephrology'],
      'Medicine & Physician Specialties': ['Pain Management']
    }
  },
  {
    id: 'hosp-20',
    name: 'Noora Hospital',
    city: 'Srinagar',
    bedCapacity: 200,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-em', 'dept-cardio', 'dept-med', 'dept-radio', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-dental', 'dept-mental', 'dept-super'],
    availableSlotsCount: 8,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    address: 'Srinagar',
    chiefMentor: 'Dr. Manzoor Ahmad, MD (General Medicine)',
    description: 'Multispecialty hospital offering comprehensive medical, surgical, and emergency healthcare services in Srinagar.',
    clinicalHighlights: [
      'Comprehensive multispecialty healthcare services',
      'Experienced medical and surgical specialists',
      'Quality emergency healthcare support',
      'Modern patient-focused treatment facilities'
    ],
    mostBookedSpecialization: 'General Medicine & Emergency Care',
    offeredDepartments: {
      'All Departments': ['All Department']
    }
  },
  {
    id: 'hosp-21',
    name: 'Ujala Cygnus',
    city: 'Srinagar',
    bedCapacity: 150,
    accreditation: 'NABH Accredited',
    rating: 4.7,
    departments: ['dept-cardio', 'dept-med', 'dept-surg', 'dept-obg', 'dept-paed', 'dept-derm', 'dept-super', 'dept-em', 'dept-radio'],
    availableSlotsCount: 6,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    address: 'Srinagar',
    chiefMentor: 'Dr. Shuchin Bajaj, MD (Internal Medicine)',
    description: 'Advanced multispecialty hospital providing cardiac, neuro, orthopedic, oncology, and critical care services.',
    clinicalHighlights: [
      'Advanced cardiac and neurological treatments',
      'Expert orthopedic and trauma care',
      'Comprehensive oncology and surgical services',
      'Modern critical care and diagnostics'
    ],
    mostBookedSpecialization: 'Trauma & Critical Care',
    offeredDepartments: {
      'Cardiac Sciences': ['Interventional Cardiology'],
      'Medicine & Physician Specialties': ['Internal Medicine', 'Rheumatology', 'Pulmonology'],
      'Surgical & Procedural Specialties': ['Neurosurgery', 'Orthopaedic & Joint Replacement Surgery', 'Laparoscopic Surgery', 'Urology', 'OncoSurgery', 'Plastic & Vascular Surgery'],
      "Women's Health & Fertility": ['Gynaecology'],
      'Pediatrics & Neonatal Care': ['Paediatrics & Neonatology'],
      'Skin, ENT & Aesthetic Medicine': ['Ophthalmology', 'ENT'],
      'Superspeciality Programs': ['Gastroenterology', 'Nephrology', 'Neurology'],
      'Emergency & Critical Care Training': ['Trauma & Critical Care'],
      'Diagnostic & Imaging Sciences': ['Radiology']
    }
  },
  {
    id: 'hosp-22',
    name: 'Indus International Hospital (5 Locations)',
    city: 'Mohali',
    bedCapacity: 250,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-cardio', 'dept-med', 'dept-super', 'dept-surg', 'dept-paed', 'dept-obg', 'dept-em', 'dept-radio'],
    availableSlotsCount: 9,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    address: 'Mohali',
    chiefMentor: 'Dr. SPS Bedi, MS (General Surgery)',
    description: 'Multispecialty healthcare network delivering advanced tertiary care, surgery, oncology, cardiac, and transplant services.',
    clinicalHighlights: [
      'Comprehensive tertiary healthcare services',
      'Advanced cardiac and cancer treatments',
      'Expert multidisciplinary specialist consultations',
      'High-risk pregnancy and fetal medicine'
    ],
    mostBookedSpecialization: 'Tertiary Care & Organ Transplant',
    offeredDepartments: {
      'Cardiac Sciences': ['Cardiology and Cardiac Surgery'],
      'Medicine & Physician Specialties': ['Pulmonology', 'Psychiatry', 'Dietetics'],
      'Superspeciality Programs': ['Neurology and Neurosurgery', 'Oncology (Medical/Surgical/Radiation)', 'Nephrology And Urology', 'Gastrointestinal Surgery', 'Transplant Medicine'],
      'Surgical & Procedural Specialties': ['Orthopedics and Joint Replacement', 'Laparoscopic and General Surgery', 'Vascular Surgery', 'ENT', 'Head and Neck Surgery'],
      'Pediatrics & Neonatal Care': ['Paediatrics and Neonatology'],
      "Women's Health & Fertility": ['High Risk Pregnancy Fetal Medicine', 'Gynecology and Obstetrics'],
      'Emergency & Critical Care Training': ['Emergency Medicine'],
      'Diagnostic & Imaging Sciences': ['Dialysis']
    }
  },
  {
    id: 'hosp-23',
    name: 'Velmed Hospital (Indus Network Hospital)',
    city: 'Dehradun',
    bedCapacity: 200,
    accreditation: 'NABH Accredited',
    rating: 4.8,
    departments: ['dept-cardio', 'dept-med', 'dept-super', 'dept-surg', 'dept-paed', 'dept-obg', 'dept-em', 'dept-radio'],
    availableSlotsCount: 7,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    address: 'Dehradun',
    chiefMentor: 'Dr. Sanjay Velmed, MS (Orthopaedics)',
    description: 'Indus Network hospital providing multidisciplinary healthcare with advanced surgical and specialty medical services.',
    clinicalHighlights: [
      'Comprehensive multispecialty medical services',
      'Advanced cardiac and neurological care',
      'Specialized oncology and surgical expertise',
      'High-quality patient-centered healthcare services'
    ],
    mostBookedSpecialization: 'Neurology & Surgical Care',
    offeredDepartments: {
      'Cardiac Sciences': ['Cardiology and Cardiac Surgery'],
      'Medicine & Physician Specialties': ['Pulmonology', 'Psychiatry', 'Dietetics'],
      'Superspeciality Programs': ['Neurology and Neurosurgery', 'Oncology (Medical/Surgical/Radiation)', 'Nephrology And Urology', 'Gastrointestinal Surgery', 'Transplant Medicine'],
      'Surgical & Procedural Specialties': ['Orthopedics and Joint Replacement', 'Laparoscopic and General Surgery', 'Vascular Surgery', 'ENT', 'Head and Neck Surgery'],
      'Pediatrics & Neonatal Care': ['Paediatrics and Neonatology'],
      "Women's Health & Fertility": ['High Risk Pregnancy Fetal Medicine', 'Gynecology and Obstetrics'],
      'Emergency & Critical Care Training': ['Emergency Medicine'],
      'Diagnostic & Imaging Sciences': ['Dialysis']
    }
  }
];

export const INITIAL_SLOTS: TrainingSlot[] = [
  {
    id: 'slot-101',
    hospitalId: 'hosp-1',
    departmentId: 'dept-derm',
    city: 'Delhi',
    duration: '1 Month',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    totalSeats: 5,
    availableSeats: 2,
    monthlyFee: 45000,
    status: 'Filling Fast'
  },
  {
    id: 'slot-102',
    hospitalId: 'hosp-2',
    departmentId: 'dept-cardio',
    city: 'Delhi',
    duration: '3 Months',
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    totalSeats: 4,
    availableSeats: 1,
    monthlyFee: 55000,
    status: 'Filling Fast'
  },
  {
    id: 'slot-103',
    hospitalId: 'hosp-5',
    departmentId: 'dept-icu',
    city: 'Noida',
    duration: '6 Months',
    startDate: '2026-08-10',
    endDate: '2027-02-10',
    totalSeats: 6,
    availableSeats: 4,
    monthlyFee: 50000,
    status: 'Open'
  },
  {
    id: 'slot-104',
    hospitalId: 'hosp-14',
    departmentId: 'dept-em',
    city: 'Bengaluru',
    duration: '3 Months',
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    totalSeats: 5,
    availableSeats: 3,
    monthlyFee: 55000,
    status: 'Open'
  },
  {
    id: 'slot-105',
    hospitalId: 'hosp-17',
    departmentId: 'dept-em',
    city: 'Hyderabad',
    duration: '1 Month',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    totalSeats: 8,
    availableSeats: 5,
    monthlyFee: 45000,
    status: 'Open'
  },
  {
    id: 'slot-106',
    hospitalId: 'hosp-8',
    departmentId: 'dept-icu',
    city: 'Lucknow',
    duration: '3 Months',
    startDate: '2026-08-20',
    endDate: '2026-11-20',
    totalSeats: 6,
    availableSeats: 3,
    monthlyFee: 48000,
    status: 'Filling Fast'
  },
  {
    id: 'slot-107',
    hospitalId: 'hosp-10',
    departmentId: 'dept-surg',
    city: 'Jaipur',
    duration: '1 Month',
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    totalSeats: 4,
    availableSeats: 2,
    monthlyFee: 46000,
    status: 'Open'
  },
  {
    id: 'slot-108',
    hospitalId: 'hosp-12',
    departmentId: 'dept-cardio',
    city: 'Pune',
    duration: '3 Months',
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    totalSeats: 5,
    availableSeats: 3,
    monthlyFee: 52000,
    status: 'Open'
  },
  {
    id: 'slot-109',
    hospitalId: 'hosp-20',
    departmentId: 'dept-em',
    city: 'Srinagar',
    duration: '1 Month',
    startDate: '2026-09-05',
    endDate: '2026-10-05',
    totalSeats: 6,
    availableSeats: 4,
    monthlyFee: 42000,
    status: 'Open'
  },
  {
    id: 'slot-110',
    hospitalId: 'hosp-22',
    departmentId: 'dept-ortho',
    city: 'Mohali',
    duration: '6 Months',
    startDate: '2026-08-10',
    endDate: '2027-02-10',
    totalSeats: 5,
    availableSeats: 2,
    monthlyFee: 49000,
    status: 'Filling Fast'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-9901',
    bookingRef: 'TMX-2026-8812',
    traineeName: 'Dr. Ananya Roy',
    traineeEmail: 'ananya.roy@healthmed.org',
    traineePhone: '+91 98765 43210',
    medicalQualification: 'MBBS (Gold Medalist)',
    councilRegistrationNumber: 'MCI-2022-77142',
    departmentId: 'dept-em',
    departmentName: 'Emergency & Critical Care Training',
    subDepartment: 'Emergency Medicine',
    hospitalId: 'hosp-3',
    hospitalName: 'Sama Hospital',
    city: 'Delhi',
    duration: '3 Months',
    startDate: '2026-08-01',
    amountPaid: 135000,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Approved',
    documents: {
      medicalLicense: 'license_ananya_roy.pdf',
      idProof: 'aadhar_ananya.pdf',
      degreeCertificate: 'mbbs_degree.pdf'
    },
    createdAt: '2026-07-20T10:30:00Z'
  },
  {
    id: 'bk-9902',
    bookingRef: 'TMX-2026-9140',
    traineeName: 'Dr. Siddharth Verma',
    traineeEmail: 'siddharth.v@medcorp.in',
    traineePhone: '+91 91234 56789',
    medicalQualification: 'MBBS, DNB Trainee',
    councilRegistrationNumber: 'KMC-2021-44910',
    departmentId: 'dept-em',
    departmentName: 'Emergency & Critical Care Training',
    subDepartment: 'ICU / Critical Care',
    hospitalId: 'hosp-14',
    hospitalName: 'VASA (Simulator Centre)',
    city: 'Bengaluru',
    duration: '1 Month',
    startDate: '2026-08-15',
    amountPaid: 50000,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    bookingStatus: 'In Rotation',
    documents: {
      medicalLicense: 'lic_siddharth.pdf',
      degreeCertificate: 'degree_siddharth.pdf'
    },
    createdAt: '2026-07-22T14:15:00Z'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    certificateId: 'DMHCA-TMX-2026-0041',
    traineeName: 'Dr. Ananya Roy',
    qualification: 'MBBS',
    departmentName: 'Emergency Medicine',
    hospitalName: 'Apollo Super Speciality Hospital, Delhi',
    city: 'Delhi',
    duration: '3 Months',
    issueDate: '2026-07-15',
    completionDate: '2026-07-10',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DMHCA-VERIFIED-TMX-2026-0041',
    verificationCode: 'DMHCA-8891-VERIFIED',
    dmhcaRegNumber: 'DMHCA/CERT/2026/EM-8812'
  }
];

export const INITIAL_LOGBOOK: LogbookEntry[] = [
  {
    id: 'log-1',
    bookingId: 'bk-9901',
    date: '2026-07-26',
    procedureName: 'Endotracheal Intubation under supervision',
    casesObserved: 3,
    casesAssisted: 2,
    supervisorSignature: true,
    notes: 'Successfully assisted in emergency trauma bay intubation. Correct tube placement confirmed via ETCO2.'
  },
  {
    id: 'log-2',
    bookingId: 'bk-9901',
    date: '2026-07-25',
    procedureName: 'Central Line Insertion (Internal Jugular)',
    casesObserved: 2,
    casesAssisted: 1,
    supervisorSignature: true,
    notes: 'Ultrasound-guided IJV cannulation under Dr. Sharma guidance. Sterile protocol maintained.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'WhatsApp',
    recipient: '+91 98765 43210',
    title: 'Booking Confirmed!',
    message: 'Your 3-Month Emergency Medicine clinical training at Apollo Hospital Delhi is confirmed! Booking Ref: TMX-2026-8812.',
    timestamp: '2026-07-20 10:31 AM',
    status: 'Delivered'
  },
  {
    id: 'notif-2',
    type: 'Email',
    recipient: 'ananya.roy@healthmed.org',
    title: 'DMHCA Clinical Rotation Onboarding Guide',
    message: 'Welcome to TrainMedix! Please review your hospital orientation schedule and logbook requirements.',
    timestamp: '2026-07-20 10:32 AM',
    status: 'Read'
  }
];
