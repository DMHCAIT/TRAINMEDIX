export const apiService = {
  // --- AUTHENTICATION & COOKIE SESSION ---
  async getMe() {
    try {
      const res = await fetch('/api/auth/me', { method: 'GET', cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, isLoggedIn: false, error: err.message };
    }
  },

  async createAdminSession(email: string, password: string, fullName?: string) {
    const res = await fetch('/api/auth/admin-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    return await res.json();
  },

  async sendOtp(email: string, purpose: 'login' | 'signup', role?: 'trainee' | 'hospital') {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose, role })
    });
    return await res.json();
  },

  async verifyOtp(email: string, otp: string, purpose: 'login' | 'signup') {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose })
    });
    return await res.json();
  },

  async registerUser(payload: any) {
    const res = await fetch('/api/auth/register-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async recordLogin(email: string) {
    const res = await fetch('/api/auth/record-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  },

  async getRegisteredUsers() {
    const res = await fetch('/api/auth/registered-users', { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async login(loginInput: string, role: string = 'trainee') {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginInput, role })
    });
    return await res.json();
  },

  async signup(signupData: any) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    return await res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return await res.json();
  },

  // --- DYNAMIC DATA LOADING ---
  async getDepartments() {
    const res = await fetch('/api/departments', { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async getDepartmentBySlug(slug: string) {
    const res = await fetch(`/api/departments/${slug}`, { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async getHospitals(city?: string, dept?: string) {
    const params = new URLSearchParams();
    if (city && city !== 'All') params.append('city', city);
    if (dept) params.append('dept', dept);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`/api/hospitals${query}`, { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async getHospitalById(id: string) {
    const res = await fetch(`/api/hospitals/${id}`, { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  // --- BOOKINGS & LOGBOOK ---
  async getBookings() {
    const res = await fetch('/api/bookings', { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async createBooking(bookingData: any) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return await res.json();
  },

  async getLogbook() {
    const res = await fetch('/api/logbook', { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  async addLogbookEntry(entryData: any) {
    const res = await fetch('/api/logbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    return await res.json();
  },

  async getSlots(hospitalId?: string, departmentId?: string) {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospitalId', hospitalId);
    if (departmentId) params.append('departmentId', departmentId);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/slots${query}`, { method: 'GET', cache: 'no-store' });
    return await res.json();
  },

  // --- ADMIN OPERATIONS ---
  async approveHospitalPartner(userId: string) {
    const res = await fetch('/api/admin/approve-hospital', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  async rejectHospitalPartner(userId: string) {
    const res = await fetch('/api/admin/reject-hospital', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  // --- HOSPITAL DEPARTMENTS & TRAINEES ---
  async addHospitalDepartment(hospitalId: string, data: any) {
    const res = await fetch('/api/hospitals/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, ...data })
    });
    return await res.json();
  },

  async getHospitalDepartments(hospitalId: string) {
    const res = await fetch(`/api/hospitals/${hospitalId}/departments`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  },

  async addHospitalSlot(hospitalId: string, data: any) {
    const res = await fetch('/api/hospitals/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, ...data })
    });
    return await res.json();
  },

  async getHospitalSlots(hospitalId: string) {
    const res = await fetch(`/api/hospitals/${hospitalId}/slots`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  },

  async deleteHospitalSlot(slotId: string) {
    const res = await fetch(`/api/hospitals/slots/${slotId}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async addHospitalTrainee(hospitalId: string, data: any) {
    const res = await fetch('/api/hospitals/trainees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, ...data })
    });
    return await res.json();
  },

  async uploadTraineeCertificate(hospitalId: string, file: File) {
    const formData = new FormData();
    formData.append('hospitalId', hospitalId);
    formData.append('file', file);
    const res = await fetch('/api/admin/upload-trainee-certificate', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async getHospitalTrainees(hospitalId: string) {
    const res = await fetch(`/api/hospitals/${hospitalId}/trainees`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  },

  async approveHospitalTrainee(traineeId: string, approvedBy: string, notes?: string) {
    const res = await fetch(`/api/hospitals/trainees/${traineeId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy, notes })
    });
    return await res.json();
  },

  async rejectHospitalTrainee(traineeId: string, notes?: string) {
    const res = await fetch(`/api/hospitals/trainees/${traineeId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    return await res.json();
  }
};
