import { Department, Hospital, TrainingSlot, Booking, LogbookEntry } from '../types';
import { DEPARTMENTS, HOSPITALS, INITIAL_SLOTS } from '../data/mockData';
import { SessionUser } from './authSession';

export interface UserRecord extends SessionUser {
  passwordHash?: string;
  createdAt: string;
}

// In-Memory Global Storage (survives requests during server runtime)
class BackendStore {
  private users: UserRecord[] = [
    {
      id: 'usr-admin-01',
      fullName: 'System Administrator',
      email: 'admin@trainmedix.com',
      phone: '+91 99999 00000',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-hosp-01',
      fullName: 'Apollo Hospitals Admin',
      email: 'apollo@trainmedix.com',
      phone: '+91 11 2651 5050',
      role: 'hospital',
      address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
      createdAt: new Date().toISOString()
    }
  ];

  private departments: Department[] = [...DEPARTMENTS];
  private hospitals: Hospital[] = [...HOSPITALS];
  private slots: TrainingSlot[] = [...INITIAL_SLOTS];
  private bookings: Booking[] = [];
  private logbook: LogbookEntry[] = [];

  // --- USER AUTHENTICATION ---
  findUserByEmailOrPhone(identifier: string): UserRecord | undefined {
    const cleanId = identifier.trim().toLowerCase();
    return this.users.find(
      (u) => u.email.toLowerCase() === cleanId || u.phone === identifier.trim()
    );
  }

  createUser(userData: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord {
    const newUser: UserRecord = {
      ...userData,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  getUsers(): UserRecord[] {
    return this.users;
  }

  // --- DEPARTMENTS ---
  getDepartments(): Department[] {
    return this.departments;
  }

  getDepartmentByCode(code: string): Department | undefined {
    return this.departments.find(
      (d) => d.code.toLowerCase() === code.toLowerCase() || d.id.toLowerCase() === code.toLowerCase()
    );
  }

  addDepartment(dept: Omit<Department, 'id'>): Department {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`
    };
    this.departments.push(newDept);
    return newDept;
  }

  deleteDepartment(id: string): boolean {
    const initialLen = this.departments.length;
    this.departments = this.departments.filter((d) => d.id !== id);
    return this.departments.length < initialLen;
  }

  // --- HOSPITALS ---
  getHospitals(city?: string, deptCode?: string): Hospital[] {
    return this.hospitals.filter((h) => {
      const cityMatch = h.city || h.cities?.[0] || h.address || 'Unknown';
      const matchesCity = !city || city === 'All' || cityMatch.toLowerCase() === city.toLowerCase();
      const matchesDept = !deptCode || h.departments.some(d => d.toLowerCase() === deptCode.toLowerCase());
      return matchesCity && matchesDept;
    });
  }

  getHospitalById(id: string): Hospital | undefined {
    return this.hospitals.find((h) => h.id === id || h.name.toLowerCase().includes(id.toLowerCase()));
  }

  // --- SLOTS ---
  getSlots(hospitalId?: string, deptId?: string): TrainingSlot[] {
    return this.slots.filter((s) => {
      const matchesHosp = !hospitalId || s.hospitalId === hospitalId;
      const matchesDept = !deptId || s.departmentId === deptId;
      return matchesHosp && matchesDept;
    });
  }

  createSlot(slotData: Omit<TrainingSlot, 'id'>): TrainingSlot {
    const newSlot: TrainingSlot = {
      ...slotData,
      id: `slot-${Date.now()}`
    };
    this.slots.push(newSlot);
    return newSlot;
  }

  updateSlotStatus(id: string, status: TrainingSlot['status']): TrainingSlot | null {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return null;
    slot.status = status;
    return slot;
  }

  // --- BOOKINGS ---
  getBookings(traineeId?: string, hospitalId?: string): Booking[] {
    return this.bookings.filter((b) => {
      const matchesTrainee = !traineeId || (b as any).traineeId === traineeId || b.traineeName.toLowerCase().includes(traineeId.toLowerCase());
      const matchesHospital = !hospitalId || b.hospitalId === hospitalId;
      return matchesTrainee && matchesHospital;
    });
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'bookingRef'>): Booking {
    const id = `bk-${Date.now()}`;
    const bookingRef = `TMX-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id,
      bookingRef
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  updateBookingStatus(id: string, status: Booking['bookingStatus']): Booking | null {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.bookingStatus = status;
    return booking;
  }

  // --- LOGBOOK ---
  getLogbook(bookingId?: string): LogbookEntry[] {
    if (!bookingId) return this.logbook;
    return this.logbook.filter((l) => l.bookingId === bookingId);
  }

  createLogbookEntry(entryData: Omit<LogbookEntry, 'id'>): LogbookEntry {
    const newEntry: LogbookEntry = {
      ...entryData,
      id: `log-${Date.now()}`
    };
    this.logbook.push(newEntry);
    return newEntry;
  }
}

// Global Singleton Instance across Node server requests
const globalForStore = global as unknown as { backendStore?: BackendStore };
export const backendStore = globalForStore.backendStore || new BackendStore();
if (process.env.NODE_ENV !== 'production') globalForStore.backendStore = backendStore;
