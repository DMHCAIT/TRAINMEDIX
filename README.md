# 🏥 TrainMedix — Hospital Training & Clinical Rotation Booking Platform

**India's First Department-Wise Hospital Training Booking Platform by DMHCA**

TrainMedix connects healthcare professionals, MBBS doctors, postgraduates, and medical trainees with verified partner hospitals across India (Delhi NCR, Mumbai, Bangalore, Hyderabad, etc.) for clinical exposure, real patient interaction, mentor-guided procedure logbooks, and official DMHCA certification.

---

## ✨ Key Features

### 🩺 1. Department & Specialization Catalog
- Browse **11+ clinical departments** including Emergency Medicine, Cardiology, General Medicine, Radiology, Surgery, Obstetrics & Gynaecology, Paediatrics, Cosmetology & ENT, Dental, Psychiatry & Rehab, and Super Speciality.
- Explore **40+ specialized clinical programs** with procedural skills lists, learning goals, and logbook evaluation details.

### 🏥 2. Partner Hospital Directory
- Filter **23+ top training hospitals and clinical centers** by city, department availability, and rating.
- View official hospital descriptions, full addresses, 4-column key institutional strengths, available rotation slots, and mentor details.

### 📅 3. Interactive Slot Booking Wizard
- Multi-step clinical rotation booking with customizable duration (1 to 12 months) and start date selection.
- Qualification dropdown with **MBBS / PG Degree Certificate** file upload functionality.
- Real-time slot availability indicators and instant rotation booking summary.

### 🔐 4. Multi-Role Authentication & Access Control
- Support for **Trainees**, **Hospital Admins**, and **System Administrators**.
- Contact method toggles (Email / Mobile OTP), focus auto-advance OTP inputs, and streamlined verification.

### 📊 5. Portals & Dashboards
- **Trainee Dashboard**: Manage active rotations, view rotation status, track clinical logbooks, and access certificates.
- **Hospital Portal**: Manage open rotation slots, review incoming trainee applications, verify degree certificates, and update seat capacity.
- **Admin Control Panel**: Configure clinical departments, manage hospital partners, oversee rotation slots, and view platform metrics.
- **QR Certificate Verification**: Instant verification portal for DMHCA accredited clinical rotation certificates.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Visuals**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/)
- **State Management & Backend**: React Context API, Next.js Server Side Routes (`/api/auth`, `/api/bookings`, `/api/departments`, `/api/slots`), Client-side Session Persistence

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18.x or higher) installed on your system.

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd trainmedix
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the platform.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
trainmedix/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/                    # REST API endpoints (auth, bookings, slots, departments)
│   ├── departments/            # Department & Specialization pages
│   ├── hospitals/              # Hospital detail pages
│   ├── sub-category/          # Specialization detail pages
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Homepage hero & main application view
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin Panel components
│   │   ├── auth/               # Auth Modal & OTP verification
│   │   ├── booking/            # Booking Wizard steps
│   │   ├── certification/      # QR Certificate Verification
│   │   ├── dashboard/          # Trainee Dashboard
│   │   ├── departments/        # Department Catalog & Modals
│   │   ├── hospital-portal/    # Hospital Admin Dashboard & Slot Management
│   │   ├── hospitals/          # Hospital Explorer
│   │   ├── layout/             # Top Navbar, Mobile Navigation & Footer
│   │   └── support/            # WhatsApp Widget & Helpdesk
│   ├── context/                # AppContext state manager
│   ├── data/                   # Mock dataset (Hospitals, Departments, Slots)
│   ├── lib/                    # Auth session helpers & mock backend store
│   ├── types/                  # TypeScript interfaces & definitions
│   └── utils/                  # Slug generators & URL helpers
├── public/                     # Static media & assets
├── package.json
└── README.md
```

---

## 📄 License & Credits

Developed for **DMHCA** — India's premier hospital clinical training booking platform. All rights reserved.
