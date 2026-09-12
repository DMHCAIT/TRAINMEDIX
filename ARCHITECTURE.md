# 🏗️ TrainMedix Supabase Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│              (React Components + Next.js Pages)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   AuthModal  │  │ BookingWizard│  │UserDashboard │  ...      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                 ↓                                                │
│         ┌─────────────────┐                                      │
│         │  AppContext     │                                      │
│         │  (useApp hook)  │                                      │
│         └────────┬────────┘                                      │
└────────────────┼────────────────────────────────────────────────┘
                 │
                 ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│              (Next.js App Router - /api/*)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Authentication Routes (Signup, Login, Logout, Me)       │   │
│  │  Booking Routes (Create, List, Update Status)            │   │
│  │  Department Routes (List, Get by Slug)                   │   │
│  │  Hospital Routes (List, Get Details)                     │   │
│  │  Slot Routes (List Available)                            │   │
│  │  Logbook Routes (Create, List)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Request Validation & Error Handling                     │   │
│  │  Audit Logging                                           │   │
│  │  Authentication Checks (Session/JWT)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬───────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│              (TypeScript Service Functions)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  authService     │  │  userService     │  │  slotService │  │
│  │  (Auth ops)      │  │  (User CRUD)     │  │  (Slots)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ bookingService   │  │ logbookService   │  │ certService  │  │
│  │ (Bookings)       │  │ (Logbook)        │  │ (Certs)      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │hospitalService   │  │deptService       │  │storageService│  │
│  │(Hospital)        │  │(Departments)     │  │(Files)       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │notificationSvc   │  │ auditLogService  │                    │
│  │(Notifications)   │  │(Audit Logs)      │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│         All services use @supabase/supabase-js client            │
│                                                                  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE CLOUD                                   │
│              (PostgreSQL + Auth + Storage)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (10 Tables)                         │   │
│  │  ├── users                                              │   │
│  │  ├── hospitals                                          │   │
│  │  ├── departments                                        │   │
│  │  ├── hospital_departments                               │   │
│  │  ├── training_slots                                     │   │
│  │  ├── bookings                                           │   │
│  │  ├── logbook_entries                                    │   │
│  │  ├── certificates                                       │   │
│  │  ├── notifications                                      │   │
│  │  └── audit_logs                                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Supabase Auth (Email/Password + OTP)                   │   │
│  │  ├── User registration                                 │   │
│  │  ├── Password hashing                                  │   │
│  │  ├── Session management                                │   │
│  │  └── Password reset                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Supabase Storage (3 Buckets)                           │   │
│  │  ├── certificates (Public)                             │   │
│  │  ├── hospital-documents (Private)                       │   │
│  │  └── profile-images (Public)                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS) Policies                      │   │
│  │  ├── Users see only their data                         │   │
│  │  ├── Admins see all data                               │   │
│  │  ├── Hospitals see their bookings                      │   │
│  │  └── All tables protected                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Booking Flow
```
Trainee (Client)
     ↓
     ├─→ Browse Departments (departmentService.getAll())
     ├─→ Browse Hospitals (hospitalService.getAll())
     ├─→ View Slots (slotService.getAvailable())
     │
     └─→ Create Booking (bookingService.create())
            ├─→ API: POST /api/bookings
            ├─→ Validate: trainee exists, slot available
            ├─→ Insert: bookings table
            ├─→ Update: training_slots available_seats
            ├─→ Log: audit_logs table
            └─→ Return: booking confirmation

Hospital (Client)
     ↓
     ├─→ View Pending Bookings (bookingService.getPending())
     │
     └─→ Approve/Reject (bookingService.updateStatus())
            ├─→ API: PATCH /api/bookings/[id]
            ├─→ Update: bookings.status
            ├─→ Send: Notification to trainee
            ├─→ Log: audit_logs table
            └─→ Return: confirmation
```

### Logbook Flow
```
Trainee (Client)
     ↓
     └─→ Add Logbook Entry (logbookService.create())
            ├─→ API: POST /api/logbook
            ├─→ Validate: booking approved
            ├─→ Insert: logbook_entries table
            ├─→ Log: audit_logs table
            └─→ Return: entry confirmation

Hospital (Mentor)
     ↓
     └─→ Add Feedback (logbookService.updateFeedback())
            ├─→ Update: logbook_entries.mentor_feedback
            ├─→ Send: Notification to trainee
            ├─→ Log: audit_logs table
            └─→ Return: confirmation
```

### Certificate Flow
```
System (Admin/Automated)
     ↓
     └─→ Generate Certificate (certificateService.create())
            ├─→ Check: booking completed, logbook entries OK
            ├─→ Generate: Certificate PDF
            ├─→ Upload: storageService.uploadCertificate()
            ├─→ Generate: QR code
            ├─→ Upload: storageService.uploadQRCode()
            ├─→ Insert: certificates table with URLs
            ├─→ Send: Notification to trainee
            ├─→ Log: audit_logs table
            └─→ Return: certificate link

Public
     ↓
     └─→ Verify Certificate
            ├─→ API: GET /api/certificates/verify?code=...
            ├─→ Query: certificates table
            ├─→ Return: Certificate details
            └─→ Display: Trainee info, hospital, department
```

---

## Component Integration Map

```
┌─────────────────────────────────────┐
│    App Root (app/layout.tsx)        │
│    └─ AppProvider                   │
└────────────┬────────────────────────┘
             │
             ├─→ Navbar
             │    └─ Auth Modal
             │         └─ authService
             │
             ├─→ Home Page
             │    ├─ HeroSection
             │    ├─ HowItWorks
             │    ├─ ValueSection
             │    └─ Footer
             │
             ├─→ Dashboard
             │    ├─ UserDashboard (Trainee)
             │    │    ├─ Bookings (bookingService)
             │    │    ├─ Logbook (logbookService)
             │    │    └─ Certificates (certificateService)
             │    │
             │    ├─ HospitalDashboard (Hospital)
             │    │    ├─ Pending Bookings
             │    │    ├─ Slot Management
             │    │    └─ Trainee Approvals
             │    │
             │    └─ AdminPanel (Admin)
             │         ├─ User Management
             │         ├─ Department Management
             │         ├─ Hospital Management
             │         ├─ Reports
             │         └─ Audit Logs
             │
             ├─→ Booking Page
             │    └─ BookingWizard
             │         └─ bookingService.create()
             │
             ├─→ Departments
             │    └─ DepartmentCatalog
             │         └─ departmentService
             │
             └─→ Hospitals
                  └─ HospitalExplorer
                       └─ hospitalService
```

---

## Authentication Flow

```
User Signup
     ↓
     ├─→ AuthModal (Client)
     │    └─ Email, Password, Full Name, Role
     │
     ├─→ API: POST /api/auth/signup
     │    ├─ supabase.auth.signUp() → Supabase Auth
     │    ├─ userService.create() → users table
     │    ├─ auditLogService.create() → audit_logs
     │    └─ Set session cookie
     │
     └─→ Success → Redirect to Dashboard

User Login
     ↓
     ├─→ AuthModal (Client)
     │    └─ Email, Password
     │
     ├─→ API: POST /api/auth/login
     │    ├─ supabase.auth.signInWithPassword()
     │    ├─ userService.getByEmail() → Get profile
     │    ├─ auditLogService.create() → audit_logs
     │    └─ Set session cookie
     │
     └─→ Success → Redirect to Dashboard

User Logout
     ↓
     ├─→ API: POST /api/auth/logout
     │    ├─ supabase.auth.signOut()
     │    ├─ Clear session cookie
     │    ├─ auditLogService.create()
     │    └─ Return to Home
     │
     └─→ Success
```

---

## Database Connection Flow

```
TypeScript Code
     ↓
     ├─→ import { supabase } from '@/lib/supabase'
     │
     ├─→ supabase
     │    .from('table_name')
     │    .select() / .insert() / .update() / .delete()
     │
     ↓
     HTTPS REST API (Supabase)
     ↓
     PostgreSQL Database
     ↓
     Row Level Security (RLS) Check
     ↓
     Execute Query
     ↓
     Return Data
     ↓
     TypeScript Code
```

---

## File Upload Flow

```
User (Client)
     ↓
     ├─→ Select File (File Input)
     │
     ├─→ Upload
     │    └─ storageService.uploadCertificate(userId, file)
     │
     ├─→ Supabase Storage
     │    ├─ Save file to bucket
     │    ├─ Check permissions
     │    └─ Generate public URL
     │
     ├─→ Update Database
     │    └─ certificateService.updateUrls(certId, url, qrUrl)
     │
     └─→ Return URL to Client
            └─ Display in UI
```

---

## Performance Optimization

```
Caching Strategy
     ├─→ Client-side: LocalStorage for departments/hospitals
     ├─→ React Context: Cache active selections
     └─→ Supabase: Automatic query optimization

Query Optimization
     ├─→ Indexes on: email, phone, city, status, user_id
     ├─→ Foreign keys for referential integrity
     └─→ Efficient joins with select()

File Optimization
     ├─→ Compress images before upload
     ├─→ PDFs generated on-demand
     └─→ Public URLs cached in certificates table
```

---

## Security Architecture

```
Network Layer
     ├─→ HTTPS/TLS encryption in transit
     └─→ CORS headers configured

Application Layer
     ├─→ Input validation (TypeScript)
     ├─→ Error handling (no sensitive info exposed)
     └─→ Authentication checks on API routes

Database Layer
     ├─→ Row Level Security (RLS)
     ├─→ Encrypted passwords (bcrypt)
     ├─→ Audit logs for all actions
     └─→ Foreign key constraints

Storage Layer
     ├─→ Public/Private bucket separation
     ├─→ File access control
     └─→ Signed URLs for private files
```

---

This architecture is:
✅ **Scalable** - Supabase handles millions of rows
✅ **Secure** - RLS, encryption, audit logs
✅ **Maintainable** - Clean service layer
✅ **Type-safe** - Full TypeScript support
✅ **Production-ready** - Enterprise features included

🚀 **Ready to build!**
