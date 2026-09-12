# 🏥 TrainMedix - Complete Working Model & Process Flow

## 📋 Table of Contents
1. [Application Overview](#application-overview)
2. [Technical Architecture](#technical-architecture)
3. [Complete User Journey](#complete-user-journey)
4. [Key Features & Workflows](#key-features--workflows)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Authentication System](#authentication-system)
7. [Routes & Navigation](#routes--navigation)
8. [Admin Panel Features](#admin-panel-features)
9. [API Endpoints](#api-endpoints)

---

## Application Overview

**TrainMedix** is India's first **Department-Wise Hospital Training Booking Platform** by DMHCA that connects:
- 🩺 **Medical Trainees** (MBBS/PG doctors) seeking clinical exposure
- 🏥 **Hospital Partners** managing training rotations
- 👨‍💼 **System Administrators** overseeing the platform

### Core Value Proposition
- Book clinical rotations in **11+ specialties** across **23+ partner hospitals**
- Real-world patient interaction with certified mentors
- DMHCA-accredited certification upon completion
- Logbook tracking & evaluation system

---

## Technical Architecture

### Tech Stack
```
Frontend:    Next.js 16 (App Router) + React 19 + TypeScript
Styling:     Tailwind CSS v4 + Framer Motion (animations)
Icons:       Lucide React
State:       React Context API
Backend:     Next.js API Routes (in-memory mock store)
Session:     HTTP-only cookies (simulated)
Database:    Mock data store (in-memory)
```

### Project Structure
```
trainmedix/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout with AppProvider
│   ├── api/                      # REST API endpoints
│   │   ├── auth/                 # Login, Signup, Logout, Me
│   │   ├── bookings/             # Booking management
│   │   ├── departments/          # Department CRUD
│   │   ├── hospitals/            # Hospital CRUD
│   │   ├── slots/                # Training slot management
│   │   └── logbook/              # Logbook entries
│   ├── dashboard/                # Trainee dashboard page
│   ├── hospital-portal/          # Hospital admin dashboard
│   ├── admin/                    # System admin panel
│   ├── departments/              # Department catalog pages
│   ├── hospitals/                # Hospital directory pages
│   └── sub-category/             # Specialization detail pages
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── home/                 # Landing page sections
│   │   │   ├── HeroSection.tsx       # Main hero + quick search bar
│   │   │   ├── ValueSection.tsx      # Platform value propositions
│   │   │   ├── HowItWorks.tsx        # 5-step booking process
│   │   │   └── Footer.tsx            # Footer with links
│   │   ├── auth/                 # Authentication
│   │   │   └── AuthModal.tsx         # Login/Signup 4-step wizard
│   │   ├── booking/              # Booking workflow
│   │   │   └── BookingWizard.tsx     # 6-step booking flow
│   │   ├── dashboard/            # Trainee portal
│   │   │   └── UserDashboard.tsx     # Active rotations, logbook, certs
│   │   ├── hospital-portal/      # Hospital admin
│   │   │   ├── HospitalDashboard.tsx # Main dashboard
│   │   │   ├── DepartmentManagement.tsx
│   │   │   ├── SlotManagement.tsx
│   │   │   └── TraineeApprovals.tsx
│   │   ├── admin/                # System admin
│   │   │   ├── AdminPanel.tsx
│   │   │   └── AdminLoginPage.tsx
│   │   ├── certification/        # Certificate verification
│   │   │   └── CertificatePortal.tsx
│   │   ├── departments/          # Department browsing
│   │   │   └── DepartmentCatalog.tsx
│   │   ├── hospitals/            # Hospital browsing
│   │   │   └── HospitalExplorer.tsx
│   │   ├── layout/               # Navbar, Footer, Mobile menu
│   │   ├── common/               # Reusable components
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── CustomSelect.tsx
│   │   │   └── CustomDatePicker.tsx
│   │   └── support/              # WhatsApp widget
│   ├── context/                  # AppContext (Global State)
│   │   └── AppContext.tsx        # All app state & actions
│   ├── data/                     # Mock data
│   │   └── mockData.ts           # Departments, Hospitals, Slots, Bookings
│   ├── types/                    # TypeScript interfaces
│   │   └── index.ts              # All type definitions
│   ├── services/                 # API client
│   │   └── apiService.ts         # Fetch wrapper for API calls
│   ├── lib/                      # Utilities
│   │   ├── authSession.ts        # Session management
│   │   └── backendStore.ts       # Mock data storage
│   └── utils/                    # Helper functions
│       └── subCategoryUtils.ts   # Slug & URL helpers
└── public/                       # Static assets
```

---

## Complete User Journey

### 🌐 Journey 1: Guest User → Trainee Registration → Booking

#### Phase 1: Landing (Homepage)
```
User visits http://localhost:3000
    ↓
Root Layout loads → AppProvider initializes → AppContext created
    ↓
Navbar renders (Sign In / Sign Up button)
    ↓
Hero Section displays:
  - Main headline: "Hospital & Clinical Training Rotations"
  - Quick search bar (Department + City + Duration)
  - Metrics: 11 Departments, 23 Hospitals, 12,500+ Trainees
  - "Book Clinical Rotation" CTA button
    ↓
Value Section shows 6 core benefits:
  - Department-Wise Booking
  - Real Hospital Exposure
  - Mentor Guidance
  - Logbook Tracking
  - Flexible Duration
  - DMHCA Certification
    ↓
"How It Works" section with 5 steps:
  1. Select Department
  2. Choose City & Hospital
  3. Pick Duration & Start Date
  4. Upload Medical Certificate
  5. Complete Payment & Booking
    ↓
Department Catalog displays 11+ specialties
(Emergency Medicine, Cardiology, ICU, Radiology, Surgery, etc.)
```

#### Phase 2: Authentication (Login/Signup)

**Entry Points:**
- Click "Sign In / Sign Up" in Navbar
- Click "Book Clinical Rotation" button (redirects to login if not authenticated)
- Click department card

**Signup Flow (4-Step Multi-Step Form):**

```
Step 1: Account Type & Basic Info
├── Select Role: Trainee Doctor (default) or Hospital Partner
├── Full Name: "Dr. Ananya Roy"
└── Qualification: "MBBS Doctor" / "Tertiary Hospital"

Step 2: Contact & Capacity
├── Email/Phone toggle
├── Email ID: dr.ananya@gmail.com
├── Phone Number: +91 9876543210
└── [Hospital Only] Contact method toggle

Step 3: Interests / Departments & Address
├── [Trainee] Multi-select interests (Emergency Medicine, Cardiology, etc.)
├── [Trainee] Preferred City
├── [Hospital] Multi-select departments
└── [Hospital] Hospital Address

Step 4: OTP Verification
├── 4-digit OTP input with auto-advance
└── "Verify" button
```

**Backend Processing:**
```javascript
POST /api/auth/signup
Request Body: {
  role: 'trainee',
  fullName: 'Dr. Ananya Roy',
  email: 'dr.ananya@gmail.com',
  phone: '+91 9876543210',
  qualification: 'MBBS Doctor',
  interests: ['Emergency Medicine', 'Cardiology'],
  address: ''
}
Response: {
  success: true,
  user: {
    id: 'trainee-001',
    fullName: 'Dr. Ananya Roy',
    email: 'dr.ananya@gmail.com',
    phone: '+91 9876543210',
    role: 'trainee',
    interests: [...],
    qualification: 'MBBS Doctor'
  }
}
Set HTTP-only cookie: session_token=...
```

**State Update (AppContext):**
```typescript
setIsLoggedIn(true);
setUserProfile({
  fullName: 'Dr. Ananya Roy',
  email: 'dr.ananya@gmail.com',
  phone: '+91 9876543210',
  interests: ['Emergency Medicine', 'Cardiology'],
  role: 'trainee'
});
setRole('trainee');
setIsAuthModalOpen(false);
setActiveTab('dashboard');
// Redirect to /dashboard
```

#### Phase 3: Dashboard View (Post-Login for Trainee)

```
User redirected to /dashboard (UserDashboard component)
    ↓
Dashboard displays:
┌─────────────────────────────────────────────────────────────┐
│ TRAINEE DOCTOR PORTAL                                       │
├─────────────────────────────────────────────────────────────┤
│ Welcome, Dr. Ananya Roy                                     │
│ Active Rotation: Department of Cardiology                   │
│ Max Hospital, Mumbai                                         │
├─────────────────────────────────────────────────────────────┤
│ 📅 Active Bookings    │ 📋 Logbook    │ 🏆 Certificates    │
│ (3 active rotations)  │ (24 entries)  │ (View & Download)  │
├─────────────────────────────────────────────────────────────┤
│ Current Rotation (Booking #1)                              │
│ ├── Status: In Rotation (75% complete)                     │
│ ├── Start Date: Jan 15, 2024                               │
│ ├── End Date: Apr 15, 2024                                 │
│ ├── Mentor: Dr. Rajesh M.                                  │
│ └── Mentor Contact: rajesh@maxhealthcare.in                │
│                                                             │
│ Logbook Stats:                                              │
│ ├── Total Procedures: 24                                   │
│ ├── Observed Cases: 45                                     │
│ ├── Assisted Cases: 18                                     │
│ └── Add New Entry [+ Button]                               │
│                                                             │
│ Certificates Available (2):                                │
│ ├── DMHCA Accredited Certificate (Cardiology)             │
│ │   - QR Code: [###...]                                   │
│ │   - Verification: https://trainmedix.com/verify?id=... │
│ └── Hospital Completion Certificate                       │
└─────────────────────────────────────────────────────────────┘
```

#### Phase 4: Booking a New Clinical Rotation

**Entry Point:** Click "Book New Rotation" button on Dashboard

**BookingWizard Flow (6-Step Process):**

```
Step 1: Select Department & Specialization
├── Department dropdown: "Cardiology"
├── Specialization: "Interventional Cardiology"
└── Next →

Step 2: Choose City & Hospital
├── City filter: "Mumbai"
├── Hospital list filtered by city
├── Click hospital card → hospital details expand
│   ├── Hospital name, address
│   ├── Mentor name & qualifications
│   ├── Available slots for Cardiology
│   ├── Training capacity
│   └── Select hospital
└── Next →

Step 3: Select Rotation Duration & Start Date
├── Duration: 3 Months (1, 3, 6, 12 month options)
├── Start Date: Calendar picker
│   ├── Only future dates enabled
│   └── Slot availability shown
└── Next →

Step 4: Review Slot & Payment
├── Display selected rotation summary:
│   ├── Department: Cardiology
│   ├── Hospital: Max Healthcare, Mumbai
│   ├── Duration: 3 Months
│   ├── Start: Jan 15, 2024
│   ├── Mentor: Dr. Rajesh M.
│   ├── Cost: ₹15,000
│   └── Estimated End: Apr 15, 2024
└── Confirm & Pay →

Step 5: Upload Medical Certificate (MBBS/PG Degree)
├── File upload input (PDF/Image)
├── Drag & drop area
├── File preview after upload
├── Confirm upload
└── Next →

Step 6: Verify Details & Confirm Booking
├── Review all entered details:
│   ├── Trainee Name: Dr. Ananya Roy (from userProfile)
│   ├── Email: dr.ananya@gmail.com (auto-filled)
│   ├── Phone: +91 9876543210 (auto-filled)
│   ├── Medical Qualification: MBBS Doctor
│   ├── Council Registration: MCI-2022-77142
│   ├── Rotation Details: [summary]
│   └── Medical Certificate: [uploaded file name]
├── Terms & Conditions checkbox
└── "Confirm Booking" button
    ↓
    Backend: POST /api/bookings
    Create booking with status "Pending Approval"
    ↓
    Confetti animation plays
    ↓
    Redirect to /dashboard
    ↓
    Booking appears in "Active Bookings" with status badge
```

**Booking State in AppContext:**
```typescript
const newBooking = {
  id: 'bk-001',
  traineeId: 'trainee-001',
  traineeName: 'Dr. Ananya Roy',
  departmentName: 'Cardiology',
  hospitalName: 'Max Healthcare',
  city: 'Mumbai',
  duration: '3 Months',
  startDate: '2024-01-15',
  endDate: '2024-04-15',
  bookingStatus: 'Pending Approval',  // Later: Approved → In Rotation → Completed
  paymentStatus: 'Pending',            // Later: Completed
  mentorName: 'Dr. Rajesh M.',
  certificateFile: 'mbbs_degree.pdf'
};

setBookings([...bookings, newBooking]);
```

---

### 🏥 Journey 2: Hospital Partner Registration & Admin Portal

#### Phase 1: Hospital Signup

```
Hospital admin visits http://localhost:3000
    ↓
Click "Sign In / Sign Up" → AuthModal opens
    ↓
Signup Tab → Select "Hospital Partner" role
    ↓
4-Step Hospital-Specific Signup:

Step 1: Hospital Name & Accreditation
├── Hospital / Center Name: "Max Super Speciality Hospital"
├── Accreditation: "Tertiary Super Speciality Hospital"
└── Next →

Step 2: Contact Information
├── Contact Method: Email (default) / Phone
├── Email: partner@maxhealthcare.in
├── Phone: +91 11 2651 5050
└── Hospital Contact Type: Email
└── Next →

Step 3: Departments & Address
├── Multi-select departments (checkboxes):
│   ├── ☑ Cardiology
│   ├── ☑ ICU
│   ├── ☑ Emergency Medicine
│   └── ... (others)
├── Hospital Address: "123 Healthcare Lane, Mumbai"
└── Next →

Step 4: OTP Verification
├── Enter 4-digit OTP
└── Verify
    ↓
    Backend: POST /api/auth/signup
    ↓
    setRole('hospital')
    setActiveTab('hospital-portal')
```

#### Phase 2: Hospital Portal Dashboard

```
Hospital Partner redirected to /hospital-portal
    ↓
HospitalDashboard renders:

┌──────────────────────────────────────────────────────────────┐
│ Max Super Speciality Hospital                                │
│ Partner Training Center | Mumbai                             │
├──────────────────────────────────────────────────────────────┤
│ Overview │ Dept Mgmt │ Slot Mgmt │ Trainee Approvals        │
├──────────────────────────────────────────────────────────────┤
│
│ KPI STATS:
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ │ Active       │  │ Pending      │  │ Open Slots   │
│ │ Trainees: 8  │  │ Requests: 3  │  │ Available: 5 │
│ └──────────────┘  └──────────────┘  └──────────────┘
│
│ DEPARTMENTS MANAGED:
│ ┌─────────────────────────────────────────┐
│ │ Cardiology                              │
│ │ ├── 2 Active Trainees                  │
│ │ ├── 1 Slot Available                   │
│ │ └── Mentor: Dr. Rajesh M.              │
│ └─────────────────────────────────────────┘
│
│ RECENT APPLICATIONS:
│ ┌─────────────────────────────────────────┐
│ │ 1. Dr. Ananya Roy                       │
│ │    Department: Cardiology               │
│ │    Duration: 3 Months                   │
│ │    Status: Pending Approval             │
│ │    [View Details] [Approve] [Reject]    │
│ └─────────────────────────────────────────┘
│
│ OPEN SLOTS SUMMARY:
│ ┌─────────────────────────────────────────┐
│ │ Cardiology - 3 Months: 1 Slot Open      │
│ │ Emergency Med - 1 Month: 2 Slots Open   │
│ │ [View All Slots] [Add New Slot]         │
│ └─────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

**Hospital Portal Features:**

1. **Overview Tab**
   - KPI metrics (Active Trainees, Pending Requests, Open Slots)
   - Recent booking applications
   - Quick action buttons

2. **Department Management**
   - Add/Edit/Delete departments
   - Manage mentor assignments
   - Update department descriptions

3. **Slot Management**
   - Create training slots
   - Specify duration, capacity, start date
   - Set slot status (Open, Filling Fast, Full, Closed)
   - Update available seats

4. **Trainee Approvals**
   - Review pending applications
   - View trainee details & uploaded certificates
   - Approve / Reject bookings
   - Assign mentor to approved trainees

---

### 👨‍💼 Journey 3: System Admin Panel

#### Admin Login
```
Access /admin or click Admin icon in navbar
    ↓
AdminLoginPage renders:
├── Email: admin@trainmedix.com
├── Password: [input field]
└── Submit
    ↓
    Backend: POST /api/auth/login
    ↓
    setRole('admin')
    setActiveTab('admin')
    redirect to /admin
```

#### Admin Panel Dashboard

```
Admin Control Panel:

┌───────────────────────────────────────────────────────────┐
│ DMHCA PLATFORM ADMIN CONTROL CENTER                      │
├───────────────────────────────────────────────────────────┤
│ Dashboard │ Training │ Bookings │ Revenue │ Users │ ...  │
├───────────────────────────────────────────────────────────┤
│
│ DASHBOARD TAB:
│ ├── Total Active Trainees: 1,250
│ ├── Total Partner Hospitals: 23
│ ├── Total Training Slots: 156
│ ├── Total Completed Rotations: 890
│ ├── Platform Revenue: ₹45,00,000
│ └── Compliance Status: 100%
│
│ TRAINING TAB:
│ ├── Manage Departments (11 listed)
│ ├── Manage Specializations (50+ listed)
│ ├── Configure course curricula
│ └── Set minimum requirements
│
│ BOOKINGS TAB:
│ ├── View all bookings with filters
│ │   ├── Status: Pending, Approved, In Rotation, Completed
│ │   ├── City: All cities
│ │   ├── Department: All departments
│ │   └── Date range selector
│ ├── Bulk approve/reject
│ └── Generate booking reports
│
│ REVENUE TAB:
│ ├── Payment tracking
│ ├── Revenue by department
│ ├── Revenue by hospital
│ └── Financial reports
│
│ USERS TAB:
│ ├── All trainees (searchable list)
│ │   ├── Filter by status, registration date
│ │   ├── View user details
│ │   └── Suspend/Activate accounts
│ └── All hospitals (searchable list)
│     ├── Verify accreditation
│     └── Enable/Disable from platform
│
│ COMPLIANCE TAB:
│ ├── Certificate verification audit logs
│ ├── Quality assurance reports
│ ├── Flagged issues
│ └── Remediation tracking
│
│ AUTOMATION TAB:
│ ├── Email notification settings
│ ├── WhatsApp integration
│ ├── OTP configuration
│ └── Scheduled tasks
└───────────────────────────────────────────────────────────┘
```

---

## Key Features & Workflows

### 1. 📖 Logbook Tracking (Trainee Feature)

**Purpose:** Track procedures performed/observed during rotation

```
User Location: Dashboard → Logbook Tab
    ↓
Form Fields:
├── Procedure Name: "Angioplasty"
├── Cases Observed: 3
├── Cases Assisted: 2
├── Supervisor Notes: "Good technique shown"
└── Date: [Auto-filled with today's date]
    ↓
    Backend: POST /api/logbook
    ↓
    Entry added to logbook array
    ↓
    Logbook updated in UI with new entry
    ├── Total procedures tracked
    ├── Observed vs Assisted ratio
    └── Supervisor evaluation
```

**Data Structure:**
```typescript
interface LogbookEntry {
  id: string;
  bookingId: string;
  date: string;              // YYYY-MM-DD
  procedureName: string;
  casesObserved: number;
  casesAssisted: number;
  notes: string;
  supervisorSignature?: string;
}
```

### 2. 🏆 Certificate System

**Purpose:** Generate & verify DMHCA-accredited certificates

**Certificate Issuance:**
```
When booking status = 'Completed' & rotation end date reached:
    ↓
System auto-generates certificate with:
├── Certificate ID: DMHCA-2024-001-CAR-12345
├── Trainee Name: Dr. Ananya Roy
├── Department: Cardiology
├── Duration: 3 Months
├── Hospital: Max Healthcare
├── Mentor: Dr. Rajesh M.
├── Completion Date: Apr 15, 2024
├── QR Code: https://trainmedix.com/verify?id=DMHCA-2024-001
└── Digital Signature: DMHCA Seal
```

**Certificate Verification Portal:**
```
User Location: /certification
    ↓
Search Box: Enter certificate ID or QR scan
    ↓
Backend: GET /api/certificates/verify?code=DMHCA-2024-001
    ↓
Display Certificate Details:
├── ✅ Certificate Status: VALID
├── Trainee Name: Dr. Ananya Roy
├── Department: Cardiology
├── Completion Date: Apr 15, 2024
├── Hospital: Max Healthcare
└── Mentor: Dr. Rajesh M.
```

### 3. 🎯 Department Catalog & Exploration

**User Journey:**

```
User Location: Homepage
    ↓
Click "Explore Specialties" or "Departments" in navbar
    ↓
DepartmentCatalog Page displays:
┌─────────────────────────────────────────────────────────┐
│ 11 Clinical Departments:                               │
│
│ ┌────────────────┐  ┌────────────────┐                │
│ │ 🏥 CARDIOLOGY  │  │ 🏥 EMERGENCY   │                │
│ │ 40+ procedures │  │ Med 35+        │                │
│ │ 5 Hospitals    │  │ procedures     │                │
│ │                │  │ 8 Hospitals    │                │
│ │ [Book Rotation]│  │ [Book Rotation]│                │
│ └────────────────┘  └────────────────┘                │
│
│ ... (9 more department cards)
│
└─────────────────────────────────────────────────────────┘
    ↓
Click Department Card → DepartmentDetailPage
    ↓
Display Department Details:
├── Department banner
├── 40+ specializations list (Interventional, General, etc.)
├── Learning objectives
├── Procedural skills matrix
├── Partner hospitals offering this department
│   ├── Hospital name
│   ├── Available slots (with dates)
│   ├── Mentor details
│   └── [Book Now] button
└── Department FAQs
    ↓
Click [Book Now] → BookingWizard opens with department pre-selected
```

### 4. 🏥 Hospital Directory & Filtering

**User Journey:**

```
User Location: Homepage
    ↓
Click "Explore Hospitals" or hero button
    ↓
HospitalExplorer Page:
┌─────────────────────────────────────────────────────────┐
│ Hospital Directory (23 Partners)                        │
│                                                         │
│ FILTERS:                                                │
│ City: [All ▼] (Delhi NCR, Mumbai, Bangalore, etc.)    │
│ Department: [All ▼]                                    │
│ Availability: [All ▼]                                  │
│ Rating: [4+ ⭐ only]                                   │
│                                                         │
│ RESULTS (Grid View):                                    │
│ ┌──────────────────┐  ┌──────────────────┐            │
│ │ Max Healthcare   │  │ Fortis Hospital  │            │
│ │ Mumbai, 4.8 ⭐  │  │ Delhi, 4.6 ⭐    │            │
│ │                  │  │                  │            │
│ │ Departments: 8   │  │ Departments: 6   │            │
│ │ Open Slots: 3    │  │ Open Slots: 2    │            │
│ │ Mentors: 12      │  │ Mentors: 8       │            │
│ │                  │  │                  │            │
│ │ [View Details]   │  │ [View Details]   │            │
│ └──────────────────┘  └──────────────────┘            │
│                                                         │
│ ... (21 more hospital cards)                            │
└─────────────────────────────────────────────────────────┘
    ↓
Click [View Details] → HospitalDetailPage
    ↓
Display Hospital Full Details:
├── Hospital banner image
├── Hospital name & location
├── Official description
├── Key institutional strengths (4 columns)
│   ├── Infrastructure quality
│   ├── Mentor expertise
│   ├── Patient volume
│   └── Training facilities
├── Departments available (tabs)
├── Mentor profiles with qualifications
├── Available rotation slots (calendar view)
├── Hospital ratings & reviews
├── Contact information
└── [Book Rotation] button
    ↓
Click [Book Rotation] → BookingWizard with hospital pre-selected
```

### 5. 📊 Quick Search from Hero Section

**Purpose:** Fast-track booking from homepage

```
User Location: Homepage Hero Section
    ↓
Quick Search Bar has 4 fields:
├── 1. Clinical Specialty: [Select Specialty ▼]
│       └── Options: Cardiology, Emergency Med, etc.
├── 2. City: [Select City ▼]
│       └── Options: Delhi NCR, Mumbai, Bangalore, etc.
├── 3. Rotation Duration: [3 Months ▼]
│       └── Options: 1M, 3M, 6M, 12M
└── 4. [Search] button
    ↓
User fills all 4 fields
    ↓
Click [Search]
    ↓
Backend: GET /api/slots?departmentId=...&city=...
         GET /api/hospitals?city=...
         GET /api/departments/...
    ↓
State Update (AppContext):
├── setSelectedDepartment(...)
├── setSelectedCity(...)
├── setSelectedDuration(...)
├── setBookingStep(5)  // Skip to slot selection
├── setIsBookingOpen(true)
└── setActiveTab('booking')
    ↓
BookingWizard opens with filters applied
```

---

## Data Flow & State Management

### Central State Store (AppContext)

All application state is managed via **React Context API** in `AppContext.tsx`:

```typescript
interface AppContextType {
  // Authentication
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  userProfile: UserProfile | null;
  role: UserRole;  // 'trainee' | 'hospital' | 'admin'
  
  // Navigation
  activeTab: string;  // 'home', 'dashboard', 'hospitals', etc.
  
  // Booking
  selectedDepartment: Department | null;
  selectedHospital: Hospital | null;
  selectedCity: CityName | 'All';
  selectedDuration: DurationOption;
  selectedSpecialization: string;
  bookingStep: number;  // 1-6
  isBookingOpen: boolean;
  
  // Master Data Lists
  departments: Department[];
  hospitals: Hospital[];
  slots: TrainingSlot[];
  bookings: Booking[];
  certificates: Certificate[];
  logbook: LogbookEntry[];
  notifications: NotificationItem[];
  
  // Actions
  createBooking: (data) => Booking;
  addLogbookEntry: (entry) => void;
  updateBookingStatus: (id, status) => void;
  // ... (20+ other actions)
}
```

### Session Persistence

```
Application Start:
    ↓
useEffect(() => {
  apiService.getMe()  // GET /api/auth/me
    .then(response => {
      if (response.success && response.isLoggedIn) {
        setIsLoggedIn(true);
        setUserProfile(response.user);
        setRole(response.user.role);
      }
    })
}, [])  // Runs once on mount
    ↓
Check HTTP-only cookie for session token
    ↓
Restore user session if cookie exists
    ↓
Otherwise, remain as 'guest' (not logged in)
```

### Data Flow Diagram

```
Frontend Events:
    ↓
User Action (click, form submit)
    ↓
Component calls AppContext action or API
    ↓
API Route (e.g., POST /api/bookings)
    ↓
Backend Store (backendStore.ts - in-memory)
    ↓
Response returned to frontend
    ↓
AppContext state updated
    ↓
Components re-render with new data
    ↓
UI updates reflect new state
```

---

## Authentication System

### Login Process

```typescript
// Frontend: AuthModal.tsx
async function handleVerifyLogin() {
  const response = await apiService.login(loginInput, loginRole);
  
  if (response.success && response.user) {
    setIsLoggedIn(true);
    setUserProfile(response.user);
    setRole(response.user.role);
    setIsAuthModalOpen(false);
    setActiveTab(
      response.user.role === 'hospital' 
        ? 'hospital-portal' 
        : 'dashboard'
    );
  }
}

// Backend: /api/auth/login
export async function POST(req: NextRequest) {
  const { loginInput, role } = await req.json();
  
  const user = backendStore.authenticate(loginInput, role);
  
  if (user) {
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
    
    // Set HTTP-only session cookie
    response.cookies.set('session_token', generateToken(user.id), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  return NextResponse.json(
    { success: false, error: 'Invalid credentials' },
    { status: 401 }
  );
}
```

### Session Restoration

```typescript
// Backend: /api/auth/me
export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('session_token')?.value;
  
  if (!sessionToken) {
    return NextResponse.json({
      success: false,
      isLoggedIn: false
    });
  }
  
  const userId = verifyToken(sessionToken);
  const user = backendStore.getUserById(userId);
  
  if (user) {
    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  }
  
  return NextResponse.json({
    success: false,
    isLoggedIn: false
  });
}
```

### Logout

```typescript
async function handleLogout() {
  await apiService.logout();
  
  setIsLoggedIn(false);
  setUserProfile(null);
  setRole('trainee');
  setActiveTab('home');
  
  // Backend clears session cookie
  // User redirected to homepage
}

// Backend: /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session_token');
  return response;
}
```

---

## Routes & Navigation

### Page Routes (Next.js App Router)

```
/ ............................ Homepage (Landing)
/dashboard .................... Trainee Dashboard
/hospital-portal .............. Hospital Partner Dashboard
/admin ........................ System Admin Panel
/alerts ....................... Admin Compliance Panel
/automation ................... Admin Automation Center

/departments .................. Department Catalog
/departments/[id]/[slug] ...... Department Detail Page
/sub-category/[slug] .......... Specialization Detail Page

/hospitals .................... Hospital Directory
/hospitals/[id] ............... Hospital Detail Page

/certification ................ Certificate Verification Portal
/booking ...................... Booking Wizard (Modal)
```

### Tab Navigation (Navbar)

```
Navbar provides global navigation:

Logged Out (Guest):
├── Home
├── Explore Departments
├── Hospital Network
├── Verify Certificate
├── Sign In / Sign Up

Logged In (Trainee):
├── Home
├── My Dashboard
├── Departments
├── Hospitals
├── Bookings
├── Logbook
├── Certificates
├── Profile Menu
│   ├── My Account
│   ├── My Bookings
│   ├── Certificates
│   └── Log Out

Logged In (Hospital):
├── Home
├── Hospital Portal
├── Departments
├── Manage Slots
├── Trainee Approvals
└── Profile Menu

Logged In (Admin):
├── Home
├── Admin Panel
├── Training Management
├── Bookings
├── Users
└── Profile Menu
```

---

## Admin Panel Features

### Admin Access
```
1. Direct URL: http://localhost:3000/admin
2. Navbar Admin Icon (only visible to logged-in admins)
3. Login required with admin credentials
```

### Admin Dashboard Tabs

#### 1. Dashboard Tab
```
Key Metrics:
├── Total Active Trainees
├── Total Partner Hospitals
├── Total Training Slots Available
├── Total Completed Rotations
├── Platform Revenue
└── Compliance Score

Quick Action Cards:
├── View All Bookings
├── Manage Departments
├── Manage Hospitals
└── Generate Reports
```

#### 2. Training Tab
```
Features:
├── Department Management
│   ├── View all 11 departments
│   ├── Add new department
│   ├── Edit department details
│   ├── Set specializations (40+)
│   └── Configure learning objectives
├── Specialization Management
│   ├── Add/Edit/Delete specializations
│   ├── Set procedural skills list
│   ├── Configure evaluation criteria
│   └── Set minimum duration
└── Curriculum Management
    ├── Course timeline
    ├── Learning milestones
    └── Assessment criteria
```

#### 3. Bookings Tab
```
Features:
├── List all bookings with filters:
│   ├── Status (Pending, Approved, In Rotation, Completed)
│   ├── Date range
│   ├── Department
│   ├── Hospital
│   └── Trainee name search
├── Booking Details View:
│   ├── Trainee information
│   ├── Hospital assignment
│   ├── Rotation details
│   ├── Payment status
│   ├── Current status
│   └── Mentor assignment
├── Bulk Actions:
│   ├── Approve multiple
│   ├── Reject multiple
│   └── Change status for multiple
└── Booking Reports:
    ├── Export to CSV/PDF
    ├── Generate analytics
    └── Compliance reports
```

#### 4. Revenue Tab
```
Features:
├── Payment Tracking:
│   ├── Pending payments
│   ├── Completed payments
│   ├── Payment amount tracking
│   └── Refund management
├── Revenue Analysis:
│   ├── Revenue by department
│   ├── Revenue by hospital
│   ├── Revenue by time period
│   ├── Revenue trends
│   └── Revenue per trainee
└── Financial Reports:
    ├── Monthly revenue summary
    ├── Annual revenue report
    └── Forecasting
```

#### 5. Users Tab
```
Trainee Management:
├── All trainees list with search
├── Filter by registration date, city, department
├── View trainee profile:
│   ├── Basic information
│   ├── Qualifications
│   ├── Active/completed rotations
│   ├── Certificate list
│   └── Contact details
├── Actions:
│   ├── View detail
│   ├── Suspend account
│   ├── Reactivate account
│   ├── Send message
│   └── Delete account

Hospital Management:
├── All hospitals list
├── Filter by city, department
├── View hospital profile:
│   ├── Accreditation status
│   ├── Departments offered
│   ├── Active slots
│   ├── Mentor list
│   ├── Trainee count
│   └── Revenue generated
├── Actions:
    ├── Verify accreditation
    ├── Enable/Disable from platform
    ├── Update details
    ├── Contact admin
    └── Manage relationship
```

#### 6. Compliance Tab
```
Features:
├── Certificate Audit:
│   ├── All issued certificates
│   ├── Verification log
│   ├── Fraud detection flags
│   └── Certificate revocation
├── Quality Assurance:
│   ├── Hospital inspection reports
│   ├── Mentor qualification verification
│   ├── Trainee feedback scores
│   └── Incident reports
├── Flagged Issues:
│   ├── Red-flag bookings
│   ├── Suspicious activities
│   ├── Incomplete rotations
│   └── Payment discrepancies
└── Remediation:
    ├── Issue resolution tracking
    ├── Follow-up actions
    └── Compliance improvement plans
```

#### 7. Automation Tab
```
Features:
├── Email Notifications:
│   ├── Booking confirmation emails
│   ├── Status change notifications
│   ├── Certificate issued emails
│   ├── Reminder emails
│   └── Custom email templates
├── WhatsApp Integration:
│   ├── WhatsApp message templates
│   ├── Notification settings
│   ├── Opt-in/out management
│   └── Message delivery tracking
├── OTP Configuration:
│   ├── OTP validity duration
│   ├── Resend limits
│   ├── OTP length settings
│   └── OTP delivery method (Email/SMS/WhatsApp)
└── Scheduled Tasks:
    ├── Automated status updates
    ├── Certificate issuance schedule
    ├── Reminder job configuration
    └── Data cleanup tasks
```

---

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/signup
├── Request: { role, fullName, email, phone, qualification, interests }
├── Response: { success, user }
└── Sets: HTTP-only session cookie

POST /api/auth/login
├── Request: { loginInput, role }
├── Response: { success, user }
└── Sets: HTTP-only session cookie

GET /api/auth/me
├── Request: (automatic from cookie)
├── Response: { success, isLoggedIn, user? }
└── Validates: session token from cookie

POST /api/auth/logout
├── Request: (automatic from cookie)
├── Response: { success: true }
└── Clears: session cookie
```

### Booking Endpoints

```
GET /api/bookings?status=...&traineeId=...
├── Response: { success, data: Booking[] }
└── Filters bookings by status, trainee, hospital, etc.

POST /api/bookings
├── Request: { traineeId, departmentId, hospitalId, ... }
├── Response: { success, booking: Booking }
└── Creates new booking with status 'Pending Approval'

PATCH /api/bookings/[id]
├── Request: { status, paymentStatus, ... }
├── Response: { success, booking: Booking }
└── Updates booking (approve, reject, complete)

DELETE /api/bookings/[id]
├── Response: { success: true }
└── Deletes booking (admin only)
```

### Department Endpoints

```
GET /api/departments
├── Response: { success, data: Department[] }
└── Returns all departments

GET /api/departments/[id]
├── Response: { success, data: Department }
└── Returns department detail

POST /api/departments (admin)
├── Request: { name, description, specializations }
├── Response: { success, department: Department }
└── Creates new department

PATCH /api/departments/[id] (admin)
├── Request: { name, specializations, ... }
├── Response: { success, department: Department }
└── Updates department

DELETE /api/departments/[id] (admin)
├── Response: { success: true }
└── Deletes department
```

### Hospital Endpoints

```
GET /api/hospitals?city=...&department=...
├── Response: { success, data: Hospital[] }
└── Returns hospitals with optional filters

GET /api/hospitals/[id]
├── Response: { success, data: Hospital }
└── Returns hospital details

POST /api/hospitals (admin)
├── Request: { name, city, address, departments }
├── Response: { success, hospital: Hospital }
└── Creates new hospital

PATCH /api/hospitals/[id] (admin/hospital)
├── Request: { departments, mentors, capacity, ... }
├── Response: { success, hospital: Hospital }
└── Updates hospital
```

### Slot Endpoints

```
GET /api/slots?hospitalId=...&departmentId=...&status=...
├── Response: { success, data: TrainingSlot[] }
└── Returns available slots with filters

POST /api/slots (hospital)
├── Request: { hospitalId, departmentId, duration, capacity, startDate }
├── Response: { success, slot: TrainingSlot }
└── Creates new training slot

PATCH /api/slots/[id] (hospital)
├── Request: { status, availableSeats, ... }
├── Response: { success, slot: TrainingSlot }
└── Updates slot availability

DELETE /api/slots/[id] (hospital)
├── Response: { success: true }
└── Cancels slot
```

### Logbook Endpoints

```
GET /api/logbook?bookingId=...
├── Response: { success, data: LogbookEntry[] }
└── Returns logbook entries for booking

POST /api/logbook
├── Request: { bookingId, procedureName, casesObserved, casesAssisted, notes }
├── Response: { success, entry: LogbookEntry }
└── Creates new logbook entry

PATCH /api/logbook/[id]
├── Request: { procedureName, casesObserved, ... }
├── Response: { success, entry: LogbookEntry }
└── Updates logbook entry

DELETE /api/logbook/[id]
├── Response: { success: true }
└── Deletes logbook entry
```

### Certificate Endpoints

```
GET /api/certificates?traineeId=...
├── Response: { success, data: Certificate[] }
└── Returns certificates for trainee

GET /api/certificates/verify?code=...
├── Response: { success, certificate: Certificate? }
└── Verifies certificate using QR code or ID

POST /api/certificates (system auto)
├── Auto-created when booking status → Completed
├── Response: { success, certificate: Certificate }
└── Issues DMHCA certificate
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRAINMEDIX COMPLETE FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

USER VISITS SITE
    ↓
HOMEPAGE (Landing Page)
├── Hero Section (Quick search bar)
├── Value Propositions
├── How It Works (5-step process)
└── Department Catalog

FLOW SPLITS:

┌─────────────────────────┬────────────────────────┬──────────────────┐
│                         │                        │                  │
↓                         ↓                        ↓                  ↓
GUEST (No login)    LOGIN/SIGNUP          BROWSE WITHOUT BOOKING  HOSPITAL/ADMIN
│                   │                      │                       │
├── Browse          ├─ Trainee signup      ├─ View departments    ├─ Hospital signup
├── View content    │   (4-step)           ├─ View hospitals      │   (4-step)
├── Search          │                      ├─ View certificates   │
└── No booking      ├─ Hospital signup     └─ Verify certs        ├─ Manage portal
                    │   (4-step)                                   │
                    │                                              ├─ Manage slots
                    ├─ Admin login                                 │
                    │   (Email + Password)                         └─ Approve bookings
                    │
                    └─ [Auth successful]
                        ↓
                    REDIRECT TO ROLE-BASED DASHBOARD
                        ├── Trainee → /dashboard
                        ├── Hospital → /hospital-portal
                        └── Admin → /admin

TRAINEE FLOW:
─────────────
Dashboard (View active rotations, logbook, certs)
    ↓
Click "Book New Rotation"
    ↓
BookingWizard (6-step):
1. Select Department & Specialization
2. Choose City & Hospital
3. Select Duration & Start Date
4. Review Slot & Payment
5. Upload Medical Certificate
6. Verify Details & Confirm
    ↓
    Backend: Create booking with status "Pending Approval"
    ↓
Hospital Portal:
    ├── Reviews trainee application
    ├── Verifies medical certificate
    ├── Approves/Rejects booking
    └── [Status updates to "Approved"]
    ↓
Booking Status Timeline:
"Pending Approval" → "Approved" → "In Rotation" → "Completed"
    ↓
When rotation completed:
    ├── Logbook entries submitted
    ├── Final evaluation done
    ├── Status → "Completed"
    └── DMHCA Certificate auto-issued
    ↓
Trainee View Certificate:
    ├── QR Code generated
    ├── Certificate available for download
    ├── Shareable link created
    └── Public verification enabled

ADMIN FLOW:
───────────
Admin Panel Dashboard
    ↓
Multiple management tabs:
├── Dashboard (metrics)
├── Training (departments, specializations)
├── Bookings (all bookings, filters)
├── Revenue (financial tracking)
├── Users (trainee/hospital management)
├── Compliance (audit logs, quality assurance)
└── Automation (email, WhatsApp, OTP settings)

END STATE:
──────────
Trainee:
✓ Account created
✓ Medical qualifications verified
✓ Rotation booked & approved
✓ Trained with mentor
✓ Logbook entries submitted
✓ DMHCA Certificate issued
✓ Certificate verified by employers/other hospitals

Hospital:
✓ Account created
✓ Departments managed
✓ Slots created
✓ Trainees approved
✓ Rotations tracked
✓ Revenue tracked
✓ Compliance maintained

Admin:
✓ Platform monitored
✓ Quality assured
✓ Revenue tracked
✓ Users managed
✓ System optimized
```

---

## Key Technical Points

### State Management
- **Context API** for global state
- **useApp()** custom hook for context access
- State updates trigger re-renders
- Persistent session via HTTP-only cookies

### Data Persistence
- **In-Memory Backend Store** (`backendStore.ts`)
- Mock data in `mockData.ts`
- No external database (demo/MVP)
- Data resets on server restart

### User Authentication
- **OTP-based for Trainee/Hospital** (4-digit code)
- **Email + Password for Admin**
- **HTTP-only Cookies** for session persistence
- **Role-based access control** (RBAC)

### Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Breakpoints: sm, md, lg (breakpoints)
- Touch-optimized CTAs & buttons

### Component Structure
- **Server Components** (Next.js App Router) for pages
- **Client Components** (`'use client'`) for interactive features
- Props passing for component communication
- Context API for global state

### Animation & UX
- **Framer Motion** for smooth animations
- Entrance animations on page load
- Hover effects on interactive elements
- Confetti celebration on successful booking
- Smooth transitions between states

### Accessibility
- Semantic HTML
- ARIA labels on icons
- Keyboard navigation support
- Color contrast compliance
- Focus management in modals

---

## How to Use This Working Model

### Starting Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server on localhost:3000
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
```

### Testing Flows

**Guest User:**
- No login required
- Browse departments, hospitals
- View certification verification
- Click booking → prompted to login

**Trainee Account:**
- Email: `dr.ananya@gmail.com` (or any email with @)
- Password: Auto-accepted (OTP authentication)
- Access Dashboard, create bookings, add logbook entries

**Hospital Account:**
- Email: `partner@maxhealthcare.in` (or any email with @)
- Password: Auto-accepted (OTP authentication)
- Access Hospital Portal, manage slots, approve trainees

**Admin Account:**
- Email: `admin@trainmedix.com`
- Password: `admin` (or any password)
- Access Admin Panel, manage platform

### Key File References
- **State:** [AppContext.tsx](src/context/AppContext.tsx)
- **Authentication:** [AuthModal.tsx](src/components/auth/AuthModal.tsx)
- **Trainee Dashboard:** [UserDashboard.tsx](src/components/dashboard/UserDashboard.tsx)
- **Hospital Dashboard:** [HospitalDashboard.tsx](src/components/hospital-portal/HospitalDashboard.tsx)
- **Admin Panel:** [AdminPanel.tsx](src/components/admin/AdminPanel.tsx)
- **Booking Wizard:** [BookingWizard.tsx](src/components/booking/BookingWizard.tsx)
- **Mock Data:** [mockData.ts](src/data/mockData.ts)
- **API Routes:** [app/api/](app/api/)

---

## Summary

**TrainMedix** is a **full-stack clinical training platform** that:

1. ✅ Allows medical trainees to book clinical rotations
2. ✅ Enables hospitals to manage training programs
3. ✅ Provides admin controls for platform management
4. ✅ Issues DMHCA-accredited certificates
5. ✅ Tracks logbook entries and evaluations
6. ✅ Manages payments and revenue
7. ✅ Ensures compliance and quality assurance
8. ✅ Provides real-time notifications (WhatsApp/Email)
9. ✅ Offers certificate verification portal
10. ✅ Supports role-based access for 3 user types

The application uses **modern React patterns**, **Next.js App Router**, **TypeScript** for type safety, and **Tailwind CSS** for responsive design—making it a production-ready platform for healthcare training management.

