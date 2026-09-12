# 📋 TrainMedix Supabase - Data & API Reference

## Complete Data Specification

Your TrainMedix platform now stores the following data in Supabase:

---

## 👥 User Data

### Table: `users`
```typescript
{
  id: UUID,
  email: string (unique),
  phone?: string,
  full_name: string,
  role: 'trainee' | 'hospital' | 'admin',
  password_hash?: string,
  profile_image_url?: string,
  bio?: string,
  is_verified: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

**What's stored:**
- All trainee doctor profiles
- Hospital admin accounts
- System admin accounts
- User verification status
- Profile images (linked to Storage)

---

## 🏥 Hospital Data

### Table: `hospitals`
```typescript
{
  id: UUID,
  user_id: UUID (FK to users),
  name: string,
  address: string,
  city: string,
  state: string,
  postal_code?: string,
  phone: string,
  email: string,
  website?: string,
  logo_url?: string,
  description?: string,
  accreditation?: string,
  total_slots: integer,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

**What's stored:**
- Hospital contact information
- Location (city, state, address)
- Accreditation details
- Hospital logo (linked to Storage)
- Active/inactive status

---

## 🔬 Department Data

### Table: `departments`
```typescript
{
  id: UUID,
  code: string (unique),
  name: string,
  description?: string,
  duration_days?: integer,
  icon_url?: string,
  is_active: boolean,
  created_at: timestamp
}
```

**Departments Stored:**
- Cardiology (30 days)
- Emergency Medicine (28 days)
- Neurology (35 days)
- Orthopedics (40 days)
- Oncology (45 days)
- Pediatrics
- Psychiatry
- General Surgery
- Radiology
- Pathology
- Gastroenterology
- And 11+ more specialties

---

## 🏥➕🔬 Hospital-Department Mapping

### Table: `hospital_departments`
```typescript
{
  id: UUID,
  hospital_id: UUID (FK),
  department_id: UUID (FK),
  mentor_name?: string,
  mentor_qualification?: string,
  max_slots: integer,
  created_at: timestamp
}
```

**What's stored:**
- Which departments each hospital offers
- Assigned mentor information
- Maximum slots per department
- Department availability

---

## 📅 Training Slots

### Table: `training_slots`
```typescript
{
  id: UUID,
  hospital_department_id: UUID (FK),
  start_date: date,
  end_date: date,
  available_seats: integer,
  booked_seats: integer,
  status: 'available' | 'full' | 'completed' | 'cancelled',
  created_at: timestamp
}
```

**What's stored:**
- Training rotation schedules
- Slot availability
- Seat capacity and bookings
- Slot status

---

## 📌 Bookings (Trainee Applications)

### Table: `bookings`
```typescript
{
  id: UUID,
  trainee_id: UUID (FK),
  slot_id: UUID (FK),
  hospital_id: UUID (FK),
  department_id: UUID (FK),
  start_date: date,
  end_date: date,
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled',
  approval_date?: timestamp,
  rejection_reason?: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

**What's stored:**
- Trainee booking history
- Booking status (pending → approved → completed)
- Rejection reasons
- Approval dates

---

## 📖 Logbook Entries

### Table: `logbook_entries`
```typescript
{
  id: UUID,
  booking_id: UUID (FK),
  trainee_id: UUID (FK),
  department_id?: UUID (FK),
  procedure_name: string,
  date: timestamp,
  role: 'observed' | 'assisted' | 'performed',
  notes?: string,
  mentor_feedback?: string,
  created_at: timestamp
}
```

**What's stored:**
- Procedures observed/assisted/performed
- Procedure dates
- Mentor feedback
- Trainee notes

---

## 🏆 Certificates

### Table: `certificates`
```typescript
{
  id: UUID,
  booking_id: UUID (FK),
  trainee_id: UUID (FK),
  hospital_id?: UUID (FK),
  department_id?: UUID (FK),
  certificate_number: string (unique),
  issue_date: date,
  expiry_date?: date,
  certificate_url?: string,
  qr_code_url?: string,
  is_verified: boolean,
  created_at: timestamp
}
```

**What's stored:**
- DMHCA certificates
- Certificate numbers
- Verification status
- Certificate files (linked to Storage)
- QR code for verification

---

## 🔔 Notifications

### Table: `notifications`
```typescript
{
  id: UUID,
  user_id: UUID (FK),
  type: string,
  title: string,
  message: string,
  related_id?: UUID,
  is_read: boolean,
  created_at: timestamp
}
```

**Notification Types:**
- `booking_approved` - Booking approved by hospital
- `booking_rejected` - Booking rejected
- `booking_created` - New booking submitted
- `certificate_ready` - Certificate issued
- `logbook_entry` - New logbook entry added
- `admin_action` - Admin actions
- `system_notification` - Platform notifications

---

## 📊 Audit Logs

### Table: `audit_logs`
```typescript
{
  id: UUID,
  user_id?: UUID (FK),
  action: string,
  entity_type: string,
  entity_id?: UUID,
  old_values?: JSONB,
  new_values?: JSONB,
  ip_address?: string,
  created_at: timestamp
}
```

**Logged Actions:**
- SIGNUP, LOGIN, LOGOUT
- CREATE_BOOKING, APPROVE_BOOKING, REJECT_BOOKING
- CREATE_LOGBOOK_ENTRY, UPDATE_LOGBOOK_ENTRY
- ISSUE_CERTIFICATE, VERIFY_CERTIFICATE
- CREATE_DEPARTMENT, UPDATE_DEPARTMENT, DELETE_DEPARTMENT
- And all other admin actions

---

## 🔄 Complete Data Relationships

```
users
├── hospitals (1 admin user → many hospitals)
├── bookings (1 trainee → many bookings)
├── logbook_entries (1 trainee → many entries)
├── certificates (1 trainee → many certificates)
└── notifications (1 user → many notifications)

hospitals
├── hospital_departments (1 hospital → many departments)
└── bookings (1 hospital → many bookings)

departments
├── hospital_departments (1 dept → many hospital offerings)
├── training_slots (via hospital_departments)
├── bookings (1 dept → many bookings)
├── logbook_entries (1 dept → many entries)
└── certificates (1 dept → many certificates)

training_slots
└── bookings (1 slot → many bookings)

bookings
├── logbook_entries (1 booking → many entries)
└── certificates (1 booking → 1 certificate)
```

---

## 📂 File Storage Buckets

### Bucket: `certificates` (Public)
```
certificates/
├── {userId}/
│   ├── cert_1234567890.pdf
│   ├── qr_1234567890.png
│   └── cert_0987654321.pdf
```

### Bucket: `hospital-documents` (Private)
```
hospital-documents/
├── {hospitalId}/
│   ├── accreditation_2024.pdf
│   ├── license_document.pdf
│   └── insurance_certificate.pdf
```

### Bucket: `profile-images` (Public)
```
profile-images/
├── {userId}/
│   ├── profile_1234567890.jpg
│   └── profile_0987654321.jpg
```

---

## 🔐 Data Security

### Row Level Security (RLS) Policies

| Table | Rule |
|-------|------|
| **users** | Users see only their own data + admins see all |
| **hospitals** | Hospital admins see their hospital's data |
| **bookings** | Trainees see own bookings, hospitals see their bookings |
| **logbook_entries** | Trainees see own entries, mentors see their trainee's entries |
| **certificates** | Trainees see own certificates, verifiable by public |
| **notifications** | Users see only their notifications |
| **audit_logs** | Admins only, comprehensive trail |

---

## 🔑 Database Indexes

For optimal performance, indexes are created on:
- `users(email)` - Fast email lookups
- `users(phone)` - Fast phone lookups
- `users(role)` - Filter by role
- `hospitals(city)` - Filter by city
- `bookings(trainee_id)` - Get trainee's bookings
- `bookings(hospital_id)` - Get hospital's bookings
- `bookings(status)` - Filter by status
- `logbook_entries(booking_id)` - Get booking's logbook
- `logbook_entries(trainee_id)` - Get trainee's logbook
- `notifications(user_id)` - Get user's notifications
- `audit_logs(user_id)` - Get user's audit logs

---

## 📊 Data Volume Estimates

| Entity | Typical Volume | Storage |
|--------|-----------------|---------|
| Trainees | 10,000+ | 2-3 MB |
| Hospitals | 20-30 | <1 MB |
| Departments | 11+ | <100 KB |
| Monthly Bookings | 1,000+ | 1-2 MB |
| Logbook Entries | 50,000+ | 5-10 MB |
| Certificates | 10,000+ | 1-2 MB |
| Notifications | 100,000+ | 10-20 MB |
| Audit Logs | 1,000,000+ | 50-100 MB |
| Storage Files | | Variable |

---

## 🚀 API Endpoints Summary

### Authentication API

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Booking API

```
GET    /api/bookings          - List user's bookings
POST   /api/bookings          - Create new booking
PATCH  /api/bookings/[id]     - Approve/reject booking
```

### Departments API

```
GET    /api/departments           - List all departments
GET    /api/departments/[slug]    - Department details + hospitals
```

### Hospitals API

```
GET    /api/hospitals         - List all hospitals
GET    /api/hospitals/[id]    - Hospital details + departments
```

### Slots API

```
GET    /api/slots             - List available training slots
```

### Logbook API

```
GET    /api/logbook           - Get user's logbook entries
POST   /api/logbook           - Add new logbook entry
```

---

## 💾 Data Import/Export

### Export Data as CSV

```sql
-- Export users
COPY users TO STDOUT WITH CSV HEADER;

-- Export bookings
COPY bookings TO STDOUT WITH CSV HEADER;

-- Export certificates
COPY certificates TO STDOUT WITH CSV HEADER;
```

### Backup & Recovery

- Automatic daily backups (Supabase)
- 7-day backup retention
- Point-in-time recovery available
- Manual backups downloadable

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

```sql
-- Total registrations by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Booking status distribution
SELECT status, COUNT(*) FROM bookings GROUP BY status;

-- Certificates issued
SELECT COUNT(*) FROM certificates WHERE is_verified = true;

-- Logbook entries
SELECT COUNT(*) FROM logbook_entries;

-- Active hospitals by city
SELECT city, COUNT(*) FROM hospitals WHERE is_active = true GROUP BY city;
```

---

## ✅ Data Validation Rules

### User Registration
- ✅ Email must be unique
- ✅ Phone can be duplicate but unique per role
- ✅ Full name required (min 2 characters)
- ✅ Role must be: trainee, hospital, or admin

### Bookings
- ✅ Trainee must exist
- ✅ Slot must exist and have available seats
- ✅ Start date < End date
- ✅ Cannot book past slots

### Logbook Entries
- ✅ Booking must exist and be approved
- ✅ Date must be within booking period
- ✅ Role must be: observed, assisted, performed

### Certificates
- ✅ Certificate number must be unique
- ✅ Booking must be completed
- ✅ Issue date must be after booking end date

---

## 🔄 Data Sync Strategy

**Real-time Updates:**
- Use Supabase Realtime subscriptions in components
- Update UI instantly when data changes

**Periodic Sync:**
- Refresh booking status every 5 minutes
- Sync notifications on demand
- Cache department/hospital data (rarely changes)

**Offline Support:**
- Store critical data in localStorage
- Queue actions when offline
- Sync when connection restored

---

This is your complete TrainMedix data model! 🎯
