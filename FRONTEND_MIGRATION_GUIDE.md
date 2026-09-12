# Frontend Migration Guide - Supabase Integration

## Overview
This guide explains how to update frontend components and context to use Supabase instead of mock data.

## Key Changes Required

### 1. AppContext.tsx Updates

Replace mock data imports and API calls with Supabase service functions:

```typescript
// OLD: Import from mockData
import { DEPARTMENTS, HOSPITALS, INITIAL_SLOTS } from '../data/mockData';

// NEW: Import Supabase services
import { 
  departmentService, 
  hospitalService, 
  bookingService,
  slotService,
  authService 
} from '../lib/supabase-db';
import { authService as auth } from '../lib/supabase-auth';
```

### 2. Authentication Flow

**Update login/signup methods:**

```typescript
// OLD: Direct backendStore call
const user = backendStore.findUserByEmailOrPhone(email);

// NEW: Use Supabase auth
const result = await auth.login({ email, password });
const currentUser = await auth.getCurrentUser();
```

### 3. Data Fetching Pattern

**Use this pattern for all data operations:**

```typescript
// OLD: Get data directly from store
const hospitals = backendStore.getHospitals(city);

// NEW: Fetch from Supabase
useEffect(() => {
  const fetchHospitals = async () => {
    const hospitals = await hospitalService.getAll();
    setHospitals(hospitals);
  };
  fetchHospitals();
}, []);
```

### 4. Booking Operations

```typescript
// Create booking
const booking = await bookingService.create({
  traineeId: user.id,
  slotId: slot.id,
  hospitalId: hospital.id,
  departmentId: dept.id,
  startDate: selectedDate,
  endDate: endDate,
});

// Update booking status
await bookingService.updateStatus(bookingId, 'approved');

// Get user's bookings
const bookings = await bookingService.getByTrainee(user.id);
```

### 5. Component Updates Needed

#### AuthModal.tsx
- Replace login/signup with `authService` functions
- Handle Supabase Auth errors
- Set cookies on successful auth

#### BookingWizard.tsx
- Use `bookingService.create()` instead of direct store operations
- Fetch real slots from `slotService.getAvailable()`
- Update slot availability after booking

#### UserDashboard.tsx
- Load user's bookings with `bookingService.getByTrainee(user.id)`
- Load logbook with `logbookService.getByTrainee(user.id)`
- Load certificates with `certificateService.getByTrainee(user.id)`

#### HospitalDashboard.tsx
- Load hospital's bookings with `bookingService.getByHospital(hospital.id)`
- Manage slots with `slotService` methods
- Approve/reject bookings with `bookingService.updateStatus()`

#### AdminPanel.tsx
- Get pending bookings with `bookingService.getPending()`
- Manage all users with `authService.adminListUsers()`
- Create departments with `departmentService.create()`

### 6. File Upload Integration

```typescript
import { storageService } from '../lib/supabase-storage';

// Upload certificate
const { url } = await storageService.uploadCertificate(userId, file);

// Upload profile image
const { url } = await storageService.uploadProfileImage(userId, file);

// Update user profile with image URL
await userService.update(userId, { 
  profile_image_url: url 
});
```

### 7. Real-time Updates (Optional - Advanced)

```typescript
import { supabase } from '../lib/supabase';

useEffect(() => {
  // Subscribe to booking changes
  const subscription = supabase
    .from('bookings')
    .on('*', payload => {
      // Update local state when bookings change
      setBookings(prev => updateBookings(prev, payload));
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## Migration Checklist

- [ ] Update AppContext to use Supabase services
- [ ] Update AuthModal with Supabase Auth
- [ ] Update BookingWizard with real slot data
- [ ] Update UserDashboard to load real bookings
- [ ] Update HospitalDashboard for hospital operations
- [ ] Update AdminPanel for admin operations
- [ ] Test authentication flow
- [ ] Test booking creation
- [ ] Test file uploads
- [ ] Test all admin operations

## API Endpoints Summary

```
Authentication:
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
GET    /api/auth/me              - Current user

Bookings:
GET    /api/bookings             - Get user's bookings
POST   /api/bookings             - Create booking
PATCH  /api/bookings/[id]        - Update booking status

Departments:
GET    /api/departments          - All departments
GET    /api/departments/[slug]   - Department details

Hospitals:
GET    /api/hospitals            - All hospitals
GET    /api/hospitals/[id]       - Hospital details

Slots:
GET    /api/slots                - Available slots

Logbook:
GET    /api/logbook              - Get logbook entries
POST   /api/logbook              - Add logbook entry
```

## Error Handling

```typescript
try {
  const result = await authService.login({ email, password });
  setUser(result.user);
} catch (error: any) {
  // Show user-friendly error message
  showNotification('Login failed: ' + error.message);
}
```

## Environment Setup

Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

1. Create a test account via signup
2. Book a training slot
3. Check logbook entries
4. Verify certificate creation
5. Test hospital approvals
6. Test admin functions

## Performance Tips

- Cache frequently accessed data (departments, hospitals)
- Use Supabase Realtime for live updates
- Implement pagination for large lists
- Optimize queries with proper indexes
