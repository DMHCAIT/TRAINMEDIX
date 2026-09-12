# Hospital Partner Approval Workflow

## Overview

Hospital partners must be approved by the DMHCA organization admin before they can access the hospital portal and manage departments/slots. Trainee doctors can login and book immediately without approval (unchanged).

---

## Workflow Steps

### 1️⃣ Hospital Partner Signs Up
- Hospital partner fills signup form with email and details
- OTP verification sent to email
- Account created in database with **is_approved = FALSE**

### 2️⃣ Hospital Partner Tries to Access Portal
- Hospital partner logs in successfully ✅
- Navigates to `/hospital-portal`
- **SEES APPROVAL MODAL** instead of dashboard:
  - Status: "Approval Pending"
  - Message: Account awaiting review from DMHCA
  - Timeline: 24-48 hours
  - Option: Refresh page button

### 3️⃣ Admin Approves Hospital (in Admin Panel)
- Admin logs in with admin credentials
- Navigates to Admin Panel
- **NEW "Approval" Column** shows:
  - ✅ Approved hospitals: Green "Approved" badge
  - ⏳ Pending hospitals: Yellow "Pending" badge + Approve/Reject buttons
  - 🚫 Trainee doctors: "N/A" (no approval needed)

- Admin clicks ✅ Approve button on hospital partner
- **Sends POST /api/admin/approve-hospital**
- Hospital partner's is_approved flag set to TRUE in database

### 4️⃣ Hospital Partner Can Now Access Portal
- Hospital partner refreshes page or logs in again
- **NO MORE APPROVAL MODAL** ✅
- **Hospital portal displays** with:
  - ✅ Green "Verified Hospital Account" badge (replaces "Logged In Hospital Account")
  - Checkmark icon instead of pulsing icon
  - Full access to tabs: Departments, Slots, Trainee Approvals

### 5️⃣ Admin Can Reject Hospital
- Instead of Approve, admin clicks ❌ Reject button
- **Sends POST /api/admin/reject-hospital**
- Hospital partner account is deleted
- Email sent (optional future enhancement)

---

## Database Changes

### New Field
```sql
ALTER TABLE registered_users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
```

- Trainee doctors: `is_approved` is NULL/ignored
- Hospital partners: `is_approved` must be TRUE to access portal

### New Index
```sql
CREATE INDEX idx_users_role_approved ON registered_users(role, is_approved);
```

---

## API Routes

### Approve Hospital Partner
**POST /api/admin/approve-hospital**
```json
{
  "userId": "usr-1234567890"
}
```

Response:
```json
{
  "success": true,
  "message": "Hospital partner approved successfully."
}
```

### Reject Hospital Partner
**POST /api/admin/reject-hospital**
```json
{
  "userId": "usr-1234567890"
}
```

Response:
```json
{
  "success": true,
  "message": "Hospital partner rejected successfully."
}
```

---

## User Interface Changes

### Admin Panel - New "Approval" Column
- **For Hospital Partners (Pending):**
  - Yellow "Pending" badge
  - ✅ Approve button (green)
  - ❌ Reject button (red)
  
- **For Hospital Partners (Approved):**
  - Green "Approved" badge
  - No action buttons
  
- **For Trainee Doctors:**
  - Gray "N/A" text
  - No action buttons

### Hospital Portal - Approval Modal
- **When is_approved = FALSE:**
  - Large amber alert box
  - AlertCircle icon
  - Text: "Approval Pending"
  - Explanation of next steps
  - "Refresh Page" button

- **When is_approved = TRUE:**
  - Full dashboard displays
  - Header shows "Verified Hospital Account" instead of "Logged In Hospital Account"
  - CheckCircle icon (green) instead of Building2 icon (pulsing)

---

## Implementation Details

### Files Created
- `SETUP_ADD_APPROVAL_STATUS.sql` - Database migration
- `app/api/admin/approve-hospital/route.ts` - Approve endpoint
- `app/api/admin/reject-hospital/route.ts` - Reject endpoint

### Files Modified
- `src/lib/userStoreDb.ts` - Added isApproved to RegisteredUser interface, approveHospitalPartnerDb(), rejectHospitalPartnerDb()
- `src/services/apiService.ts` - Added approveHospitalPartner(), rejectHospitalPartner()
- `src/components/admin/AdminUsersManager.tsx` - Added approval column with approve/reject buttons for hospitals only
- `src/components/hospital-portal/HospitalDashboard.tsx` - Added approval check and modal for pending hospitals

---

## Setup Required

### Step 1: Add Column to Supabase
Run SQL from `SETUP_ADD_APPROVAL_STATUS.sql` in Supabase SQL Editor:

```sql
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_role_approved ON registered_users(role, is_approved);
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

---

## Testing Checklist

- [ ] Trainee doctor signup → No approval required ✅
- [ ] Hospital partner signup → Account created with is_approved = FALSE
- [ ] Hospital partner login → Approval modal shows
- [ ] Hospital partner refresh page → Still shows approval modal
- [ ] Admin panel shows hospital in "Pending" status with Approve/Reject buttons
- [ ] Admin clicks Approve → Status changes to "Approved"
- [ ] Hospital partner refreshes → Portal now displays
- [ ] Verified badge shows on hospital name
- [ ] Admin click Reject → Hospital account deleted
- [ ] Trainee approvals tab has no Approval column

---

## Future Enhancements

1. **Email Notifications**: Send email when hospital is approved/rejected
2. **Approval Notes**: Admin can add notes when approving/rejecting
3. **Expiry**: Auto-reject hospitals after 30 days if not approved
4. **Bulk Actions**: Admin can approve multiple hospitals at once
5. **Audit Log**: Track who approved/rejected and when
6. **Appeal Process**: Hospital can request review if rejected
