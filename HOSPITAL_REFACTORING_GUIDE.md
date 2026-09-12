# Hospital Portal Refactoring - Implementation Guide

## Overview
This guide outlines the comprehensive changes needed to remove default data and implement hospital-specific department/slot/trainee management.

## Key Requirements Met

### 1. ✅ Database Setup
- **File**: `SETUP_HOSPITAL_DEPARTMENTS_TRAINEES.sql`
- **Tables Created**:
  - `hospital_departments` - Hospital-specific departments
  - `hospital_department_slots` - Hospital-specific slots
  - `hospital_trainees` - Trainee assignments for approval

### 2. ✅ Database Access Layer
- **File**: `src/lib/hospitalDepartmentsDb.ts`
- **Functions Provided**:
  - `addHospitalDepartmentDb()` - Add department
  - `getHospitalDepartmentsDb()` - Get all hospital departments
  - `addHospitalSlotDb()` - Add slot
  - `getHospitalSlotsDb()` - Get all hospital slots
  - `getHospitalDepartmentSlotsDb()` - Get slots for specific department
  - `addHospitalTraineeDb()` - Add trainee assignment
  - `getHospitalTraineesDb()` - Get all trainees
  - `approveHospitalTraineeDb()` - Approve trainee
  - `rejectHospitalTraineeDb()` - Reject trainee

### 3. ✅ API Routes Created
- `POST /api/hospitals/departments` - Add department
- `GET /api/hospitals/[hospitalId]/departments` - Get hospital departments
- `POST /api/hospitals/slots` - Add slot
- `GET /api/hospitals/[hospitalId]/slots` - Get hospital slots
- `DELETE /api/hospitals/slots/[slotId]` - Delete slot
- `POST /api/hospitals/trainees` - Add trainee
- `GET /api/hospitals/[hospitalId]/trainees` - Get hospital trainees
- `POST /api/hospitals/trainees/[traineeId]/approve` - Approve trainee
- `POST /api/hospitals/trainees/[traineeId]/reject` - Reject trainee

### 4. ✅ API Service Updated
- **File**: `src/services/apiService.ts`
- **New Methods Added**:
  - `addHospitalDepartment()`
  - `getHospitalDepartments()`
  - `addHospitalSlot()`
  - `getHospitalSlots()`
  - `deleteHospitalSlot()`
  - `addHospitalTrainee()`
  - `getHospitalTrainees()`
  - `approveHospitalTrainee()`
  - `rejectHospitalTrainee()`

## Next Steps - Component Updates Required

### Step 1: Execute SQL Migration
**In Supabase SQL Editor:**
```sql
-- Copy entire content from: SETUP_HOSPITAL_DEPARTMENTS_TRAINEES.sql
-- Execute in Supabase SQL Editor
```

### Step 2: Update DepartmentManagement Component
**Changes Needed in**: `src/components/hospital-portal/DepartmentManagement.tsx`

**What to Do**:
- Remove all references to mock `departments` from AppContext
- Load hospital-specific departments from API: `apiService.getHospitalDepartments(userProfile.id)`
- Remove `deleteDepartment` functionality (hide trash button)
- When adding department, call: `apiService.addHospitalDepartment(userProfile.id, formData)`
- Display **only** departments added by THIS hospital (no system defaults)

**Key Changes**:
```typescript
// Before (shows all departments)
const { departments, deleteDepartment } = useApp();

// After (shows only hospital departments)
const [hospitalDepts, setHospitalDepts] = useState([]);
useEffect(() => {
  if (userProfile?.id) {
    apiService.getHospitalDepartments(userProfile.id).then(res => {
      if (res.success) setHospitalDepts(res.departments);
    });
  }
}, [userProfile?.id]);

// Remove delete button - hospital partners cannot delete
// Replace with: <span className="text-slate-400">Cannot delete</span>
```

### Step 3: Update SlotManagement Component
**Changes Needed in**: `src/components/hospital-portal/SlotManagement.tsx`

**What to Do**:
- Load hospital-specific departments first
- When showing "Select Department" dropdown, only show departments from step 2 (hospital's own departments)
- Load hospital-specific slots: `apiService.getHospitalSlots(userProfile.id)`
- Remove delete functionality or hide delete buttons
- When adding slot, call: `apiService.addHospitalSlot(userProfile.id, slotData)`

**Key Changes**:
```typescript
// Department dropdown should show ONLY hospital-specific departments
const departmentOptions = hospitalDepts.map(d => ({
  label: d.department_name,
  value: d.id
}));

// NOT all system departments
```

### Step 4: Update HospitalDashboard to Show Trainees
**Changes Needed in**: `src/components/hospital-portal/HospitalDashboard.tsx`

**What to Do**:
- In TraineeApprovals tab, load trainees: `apiService.getHospitalTrainees(userProfile.id)`
- Show pending trainees for approval
- Add buttons to approve/reject
- Call: `apiService.approveHospitalTrainee()` or `rejectHospitalTrainee()`

**New Tab Content**:
- Pending Requests (status: 'Pending')
- Active Trainees (status: 'Approved' or 'Active')
- Completed (status: 'Completed')

### Step 5: Update Admin Panel
**Changes Needed in**: `src/components/admin/AdminPanel.tsx` or `AdminUsersManager.tsx`

**What to Do**:
- Add new admin section: "Hospital Departments & Trainees"
- Show all hospital departments with their slots
- Add form to assign trainee to hospital department:
  - Select Hospital Partner
  - Select Department (from hospital's departments)
  - Enter Trainee Email
  - Enter Trainee Name
  - Select Start Date
  - Confirm button
- Call: `apiService.addHospitalTrainee(hospitalId, traineeData)`
- Show status of all trainees for approval

**Admin Dashboard Sections**:
- Hospital Partners List (existing)
- Hospital Departments (new) - Shows each hospital's departments and slot counts
- Trainee Assignments (new) - Shows pending/approved trainees per hospital
- Add Trainee Form (new) - Assign trainees to hospital departments

## Data Flow

```
Admin Panel
  ↓
Add Trainee → API → hospital_trainees table (status: 'Pending')
  ↓
Hospital Portal
  ↓
View Pending Trainee → Approve/Reject
  ↓
Update Status in database → status: 'Approved' or 'Rejected'
```

## Important Notes

1. **Hospital Partners Cannot Delete Departments** - Hide/disable delete buttons
2. **No Default Data** - Remove all mock data, show only hospital-specific data
3. **Slot Filtering** - Slots dropdown shows only departments added by hospital
4. **Trainee Approval** - Hospital partners approve trainees assigned by admin
5. **Admin Visibility** - Admin can see all hospitals, departments, and trainees

## Files Summary

### Created Files:
- ✅ `SETUP_HOSPITAL_DEPARTMENTS_TRAINEES.sql`
- ✅ `src/lib/hospitalDepartmentsDb.ts`
- ✅ `app/api/hospitals/departments/route.ts`
- ✅ `app/api/hospitals/[hospitalId]/departments/route.ts`
- ✅ `app/api/hospitals/slots/route.ts`
- ✅ `app/api/hospitals/[hospitalId]/slots/route.ts`
- ✅ `app/api/hospitals/slots/[slotId]/route.ts`
- ✅ `app/api/hospitals/trainees/route.ts`
- ✅ `app/api/hospitals/[hospitalId]/trainees/route.ts`
- ✅ `app/api/hospitals/trainees/[traineeId]/approve/route.ts`
- ✅ `app/api/hospitals/trainees/[traineeId]/reject/route.ts`

### Files to Update:
- 🔄 `src/components/hospital-portal/DepartmentManagement.tsx`
- 🔄 `src/components/hospital-portal/SlotManagement.tsx`
- 🔄 `src/components/hospital-portal/TraineeApprovals.tsx`
- 🔄 `src/components/admin/AdminUsersManager.tsx`
- 🔄 `src/services/apiService.ts` (✅ Already updated)

## Testing Checklist

- [ ] Execute SQL migration in Supabase
- [ ] Hospital partner can add departments (no defaults shown)
- [ ] Hospital partner cannot delete departments
- [ ] Slot management shows only hospital's departments
- [ ] Admin can assign trainees to hospital departments
- [ ] Hospital partner sees pending trainees for approval
- [ ] Hospital partner can approve/reject trainees
- [ ] No "Mehndritta Hospital" or other mock data appears
- [ ] Each hospital sees only their own data
