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
  }
};
