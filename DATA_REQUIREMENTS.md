# 📊 TrainMedix Data Requirements & Specifications

## Executive Summary

Your TrainMedix platform stores **8 primary data entities** with **10+ supporting tables**. Here's exactly what data is required for each feature:

---

## 📋 User Roles & Data Access

### 1️⃣ Trainee Doctor (Medical Student)

**Data They Provide:**
- Email, password
- Full name
- Phone number
- Qualifications (optional)
- Interests/specialties (optional)
- Profile image (optional)
- Address/location (optional)

**Data They Access:**
- Browse all departments
- Browse all hospitals
- Browse available training slots
- View their own bookings
- View their own logbook
- Download their own certificates

**Data Stored About Them:**
- Profile information
- Booking history
- Logbook entries (procedures)
- Certificates earned
- Notifications received
- Login/activity logs

---

### 2️⃣ Hospital Administrator

**Data They Provide:**
- Hospital email
- Hospital name
- Physical address, city, state, postal code
- Phone number
- Website (optional)
- Logo image (optional)
- Accreditation details (optional)
- Department offerings
- Mentor names & qualifications
- Maximum slots per department
- Training dates/schedules

**Data They Access:**
- View all pending booking requests
- See trainee profiles
- Approve/reject bookings
- Manage training slots & dates
- View logbook entries (their trainees)
- Issue certificates
- Hospital dashboard with stats

**Data Stored About Them:**
- Hospital profile
- Hospital-department mappings
- Slots created
- Bookings received & actions taken
- Audit trail of all actions

---

### 3️⃣ System Administrator

**Data They Manage:**
- All user accounts (create, edit, delete)
- All departments (CRUD)
- All hospitals (CRUD)
- All bookings (view, cancel, override)
- Platform settings
- Audit logs
- Reports & analytics

**Data Access:**
- Complete database access
- All user information
- All financial data
- All audit logs
- Platform analytics

---

## 🗄️ Data Entities in Detail

### Entity 1: USERS (User Profiles)

**Trainee Profile Data:**
```json
{
  "id": "UUID",
  "email": "dr.trainee@example.com",
  "full_name": "Dr. Rajesh Kumar",
  "phone": "+91 98765 43210",
  "role": "trainee",
  "password_hash": "bcrypt_hash",
  "profile_image_url": "https://storage.../profile.jpg",
  "bio": "MBBS graduate, interested in Cardiology",
  "qualifications": ["MBBS", "PG Entrance Cleared"],
  "interests": ["Cardiology", "Emergency Medicine"],
  "is_verified": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Hospital Profile Data:**
```json
{
  "id": "UUID",
  "email": "admin@apollohospitals.com",
  "full_name": "Apollo Admin",
  "phone": "+91 11 2651 5050",
  "role": "hospital",
  "hospital_id": "UUID",
  "is_verified": true
}
```

---

### Entity 2: HOSPITALS (Hospital Details)

**Data Required:**
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "name": "Apollo Hospitals Delhi",
  "address": "Sarita Vihar, Mathura Road",
  "city": "New Delhi",
  "state": "Delhi",
  "postal_code": "110076",
  "phone": "+91 11 2651 5050",
  "email": "contact@apollodelhi.com",
  "website": "https://www.apollohospitals.com",
  "logo_url": "https://storage.../logo.png",
  "description": "Leading multi-specialty hospital",
  "accreditation": "JCI Accredited, NABH Certified",
  "total_slots": 45,
  "is_active": true
}
```

**Stored Cities (23+ Hospitals across):**
- New Delhi
- Mumbai
- Bangalore
- Chennai
- Hyderabad
- Pune
- Ahmedabad
- And more...

---

### Entity 3: DEPARTMENTS (Medical Specialties)

**11+ Departments Required:**
```json
{
  "id": "UUID",
  "code": "CARDIO",
  "name": "Cardiology",
  "description": "Diagnosis and treatment of heart and blood vessel diseases",
  "duration_days": 30,
  "icon_url": "https://storage.../cardio.png"
}
```

**Complete Department List:**
1. Cardiology (30 days)
2. Emergency Medicine (28 days)
3. Neurology (35 days)
4. Orthopedic Surgery (40 days)
5. Oncology (45 days)
6. Pediatrics (32 days)
7. Psychiatry (28 days)
8. General Surgery (42 days)
9. Radiology (21 days)
10. Pathology (14 days)
11. Gastroenterology (30 days)
12. Nephrology (28 days)

---

### Entity 4: TRAINING SLOTS (Available Rotations)

**Data Required:**
```json
{
  "id": "UUID",
  "hospital_department_id": "UUID",
  "start_date": "2024-03-01",
  "end_date": "2024-03-30",
  "available_seats": 5,
  "booked_seats": 2,
  "status": "available"
}
```

**Example Slots:**
- Apollo Delhi - Cardiology: Mar 1-30 (5 seats, 2 booked)
- Max Healthcare - Emergency: Mar 15-Apr 15 (8 seats, 5 booked)
- Fortis Mumbai - Neuro: Apr 1-30 (3 seats, 0 booked)

---

### Entity 5: BOOKINGS (Rotation Requests)

**Data Collected:**
```json
{
  "id": "UUID",
  "trainee_id": "UUID",
  "slot_id": "UUID",
  "hospital_id": "UUID",
  "department_id": "UUID",
  "start_date": "2024-03-01",
  "end_date": "2024-03-30",
  "status": "pending",
  "booking_date": "2024-02-15",
  "approval_date": null,
  "rejection_reason": null
}
```

**Booking Workflow:**
```
1. Trainee views slots
2. Selects hospital + department + dates
3. Submits booking (status: "pending")
4. Hospital sees request in their portal
5. Hospital approves/rejects (status: "approved"/"rejected")
6. Trainee sees result in their dashboard
7. After completion: status becomes "completed"
```

---

### Entity 6: LOGBOOK ENTRIES (Procedure Tracking)

**Data Trainee Enters:**
```json
{
  "id": "UUID",
  "booking_id": "UUID",
  "trainee_id": "UUID",
  "procedure_name": "Angiography",
  "date": "2024-03-05T09:30:00Z",
  "role": "assisted",
  "notes": "Assisted cardiologist in 2 angiography procedures",
  "mentor_feedback": "Good sterile technique, needs to improve contrast visualization"
}
```

**Procedure Roles:**
- `observed` - Only watched the procedure
- `assisted` - Helped with the procedure
- `performed` - Performed the procedure under supervision

**Sample Logbook:**
- Day 1: Observed ward rounds with 15 patients
- Day 2: Assisted in 2 ECG procedures
- Day 3: Performed patient consultation under mentor guidance
- Day 4: Assisted in 1 cardiac catheterization
- Total: 30 days, 120+ procedures

---

### Entity 7: CERTIFICATES (Completion & Verification)

**Data Generated:**
```json
{
  "id": "UUID",
  "booking_id": "UUID",
  "trainee_id": "UUID",
  "hospital_id": "UUID",
  "department_id": "UUID",
  "certificate_number": "DMHCA-2024-0001",
  "issue_date": "2024-03-31",
  "expiry_date": "2025-03-31",
  "certificate_url": "https://storage.../certs/cert_001.pdf",
  "qr_code_url": "https://storage.../qr/qr_001.png",
  "is_verified": true
}
```

**Certificate Details Include:**
- Trainee name
- Hospital name
- Department
- Duration (e.g., 30 days)
- Procedures count
- Mentor name
- Accreditation: DMHCA
- Digital signature
- QR code for verification

---

### Entity 8: NOTIFICATIONS (User Alerts)

**Types & Data:**
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "type": "booking_approved",
  "title": "Booking Approved!",
  "message": "Your Cardiology rotation at Apollo Delhi has been approved for March 1-30",
  "related_id": "booking_uuid",
  "is_read": false,
  "created_at": "2024-02-20T10:15:00Z"
}
```

**Notification Types:**
- `booking_created` - New booking submitted
- `booking_approved` - Hospital approved booking
- `booking_rejected` - Hospital rejected booking
- `logbook_updated` - Mentor added feedback
- `certificate_ready` - Certificate issued
- `admin_action` - Admin notices
- `system_notice` - Platform updates

---

### Entity 9: AUDIT LOGS (Compliance Trail)

**Data Logged:**
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "action": "APPROVE_BOOKING",
  "entity_type": "booking",
  "entity_id": "booking_uuid",
  "old_values": {"status": "pending"},
  "new_values": {"status": "approved", "approval_date": "2024-02-20"},
  "ip_address": "203.0.113.42",
  "created_at": "2024-02-20T10:30:00Z"
}
```

**Logged Actions:**
- User signups
- Logins/logouts
- Booking creations/approvals
- Logbook entries
- Certificate issuance
- Admin changes
- All state changes

---

## 📊 Complete Data Flow

```
TRAINEE                    HOSPITAL                   SYSTEM
  │                          │                          │
  ├─ Signs up ───────────────────────────────────────────► users table
  │                          │                          │
  ├─ Browses ─── departments ──────────────────────────► departments table
  │            ─── hospitals ──────────────────────────► hospitals table
  │                          │                          │
  ├─ Views ───── training_slots ─────────────────────── training_slots table
  │            ─── hospital_departments ─────────────── hospital_departments
  │                          │                          │
  ├─ Creates booking ────────► bookings table           │
  │                          │                          │
  │                  ├─ Views pending bookings          │
  │                  ├─ Approves booking ──────────────► bookings status update
  │                  │                                  │
  ├─ Adds logbook entry ────────────────────────────────► logbook_entries table
  │                  ├─ Reviews logbook               │
  │                  ├─ Adds mentor feedback ──────────► logbook_entries update
  │                  │                                  │
  ├─ Gets certificate ──────────────────────────────────► certificates table
  │             │                                       │
  │             └─ Files uploaded ────────────────────► Storage buckets
  │                          │                          │
  │ ◄─── Notifications ──────────────────────────────── notifications table
  │                          │                          │
  └─ Activities logged ──────────────────────────────────► audit_logs table
```

---

## 🎯 Data by Feature

### Feature: Booking System
**Data Required from:**
- Trainee ID, Hospital ID, Department ID, Slot ID
- Start date, End date, Trainee name, Trainee email

**Data Generated:**
- Booking ID, Status, Booking timestamp
- Approval date (if approved), Rejection reason (if rejected)

### Feature: Logbook
**Data Required from:**
- Booking ID, Procedure name, Date, Role (observed/assisted/performed)
- Notes, Mentor feedback

**Data Generated:**
- Logbook entry ID, Timestamps
- Procedure count per role

### Feature: Certificates
**Data Required from:**
- Booking ID (must be completed), Issue date
- Mentor name, Hospital accreditation

**Data Generated:**
- Certificate number (unique), QR code
- PDF file, Public URL for verification

### Feature: Admin Dashboard
**Data Required:**
- All users, all bookings, all departments
- All hospitals, audit logs

**Analytics Shown:**
- Total trainees, bookings, hospitals
- Bookings by status, departments by popularity
- Revenue if payment integrated

---

## ✅ Minimum Data Required to Start

### Day 1: Basic Setup
- [ ] 3 departments
- [ ] 2 hospitals (with departments)
- [ ] 5 training slots
- [ ] 3 test user accounts

### Week 1: MVP Launch
- [ ] 11 departments (all)
- [ ] 5-10 hospitals
- [ ] 50+ training slots
- [ ] 100+ test bookings

### Month 1: Production
- [ ] All 11 departments
- [ ] 23+ hospitals
- [ ] 300+ training slots
- [ ] 1000+ real bookings
- [ ] 5000+ logbook entries

---

## 🔄 Data Dependencies

```
Before creating BOOKINGS, you need:
  ✓ Trainee user created
  ✓ Hospital created
  ✓ Department created
  ✓ Hospital-Department mapping
  ✓ Training slot created

Before creating LOGBOOK, you need:
  ✓ Booking created
  ✓ Booking approved

Before creating CERTIFICATE, you need:
  ✓ Booking completed
  ✓ Logbook entries added
  ✓ Minimum procedures logged
```

---

## 💾 Storage Requirements

| Data Type | Typical Size | Total Storage |
|-----------|--------------|----------------|
| User profiles | 5 KB each | 50 MB (10K users) |
| Hospital profiles | 20 KB each | 500 KB (23 hospitals) |
| Departments | 2 KB each | 20 KB (11 depts) |
| Booking records | 1 KB each | 100 MB (100K bookings) |
| Logbook entries | 2 KB each | 200 MB (100K entries) |
| Certificates | 5 KB each | 50 MB (10K certs) |
| Certificate PDFs | 500 KB each | 5 GB (10K files) |
| Profile images | 300 KB each | 3 GB (10K users) |
| **Total** | | **~10-15 GB** |

---

## 🔐 Sensitive Data Protection

**PII (Personally Identifiable Information):**
- Email addresses ✓ Encrypted
- Phone numbers ✓ Encrypted
- Passwords ✓ Hashed (bcrypt)
- Profile images ✓ Access controlled

**Sensitive Operations Logged:**
- All user authentication
- All booking approvals
- All certificate issues
- All data access by admins

---

This is your complete data blueprint! Ready to start? Follow **QUICK_START.md** 🚀
