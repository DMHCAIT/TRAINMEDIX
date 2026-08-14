'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiService } from '../services/apiService';
import { 
  UserRole, 
  CityName, 
  Department, 
  Hospital, 
  TrainingSlot, 
  Booking, 
  Certificate, 
  LogbookEntry, 
  NotificationItem,
  DurationOption
} from '../types';
import { 
  DEPARTMENTS, 
  HOSPITALS, 
  INITIAL_SLOTS, 
  INITIAL_BOOKINGS, 
  INITIAL_CERTIFICATES, 
  INITIAL_LOGBOOK, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import confetti from 'canvas-confetti';
import { AuthModal } from '../components/auth/AuthModal';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedCity: CityName | 'All';
  setSelectedCity: (city: CityName | 'All') => void;
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;
  selectedSpecialization: string;
  setSelectedSpecialization: (spec: string) => void;
  selectedHospital: Hospital | null;
  setSelectedHospital: (hosp: Hospital | null) => void;
  selectedDuration: DurationOption;
  setSelectedDuration: (duration: DurationOption) => void;
  
  // Auth State
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  userProfile: { fullName: string; email: string; phone: string; interests: string[] } | null;
  setUserProfile: (profile: any) => void;

  // Navigation active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Booking Flow State
  bookingStep: number;
  setBookingStep: (step: number) => void;
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
  startBookingForDepartment: (dept: Department) => void;

  // Lists
  departments: Department[];
  hospitals: Hospital[];
  activeHospital: Hospital;
  setActiveHospital: (hosp: Hospital) => void;
  slots: TrainingSlot[];
  bookings: Booking[];
  certificates: Certificate[];
  logbook: LogbookEntry[];
  notifications: NotificationItem[];

  // Actions
  createBooking: (bookingData: Partial<Booking>) => Booking;
  addLogbookEntry: (entry: Omit<LogbookEntry, 'id' | 'supervisorSignature'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['bookingStatus']) => void;
  addSlot: (slot: Omit<TrainingSlot, 'id'>) => void;
  deleteSlot: (slotId: string) => void;
  updateSlotStatus: (slotId: string, status: TrainingSlot['status']) => void;
  updateSlotSeats: (slotId: string, totalSeats: number, availableSeats: number) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  deleteDepartment: (deptId: string) => void;
  addHospital: (hosp: Omit<Hospital, 'id'>) => void;
  updatePaymentStatus: (bookingId: string, status: Booking['paymentStatus']) => void;
  verifyCertificate: (codeOrId: string) => Certificate | null;
  triggerNotification: (type: 'WhatsApp' | 'Email', recipient: string, title: string, message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('trainee');
  const [selectedCity, setSelectedCity] = useState<CityName | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>('3 Months');
  const [activeTab, setActiveTabState] = useState<string>('home');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Restore HTTP-only session cookie on application mount
  useEffect(() => {
    async function initSession() {
      try {
        const auth = await apiService.getMe();
        if (auth.success && auth.isLoggedIn && auth.user) {
          setIsLoggedIn(true);
          setUserProfile(auth.user);
          setRole(auth.user.role);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
          setRole('trainee');
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUserProfile(null);
        setRole('trainee');
      }
    }
    initSession();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const currentTab = pathname === '/' ? 'home' : pathname.replace(/^\//, '');
    setActiveTabState(currentTab);
  }, [pathname]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const route = tab === 'home' ? '/' : `/${tab}`;
    if (pathname !== route) {
      router.push(route);
    }
  };

  const [bookingStep, setBookingStep] = useState<number>(1);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [hospitals, setHospitals] = useState<Hospital[]>(HOSPITALS);
  const [activeHospital, setActiveHospital] = useState<Hospital>(HOSPITALS[0]);
  const [slots, setSlots] = useState<TrainingSlot[]>(INITIAL_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now()}`
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const addHospital = (hospData: Omit<Hospital, 'id'>) => {
    const newHosp: Hospital = {
      ...hospData,
      id: `hosp-${Date.now()}`
    };
    setHospitals((prev) => [...prev, newHosp]);
  };

  const updatePaymentStatus = (bookingId: string, status: Booking['paymentStatus']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: status } : b))
    );
  };

  const deleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlotStatus = (id: string, status: TrainingSlot['status']) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const updateSlotSeats = (id: string, totalSeats: number, availableSeats: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              totalSeats,
              availableSeats,
              status: availableSeats === 0 ? 'Sold Out' : availableSeats <= 2 ? 'Filling Fast' : 'Open'
            }
          : s
      )
    );
  };

  const startBookingForDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setBookingStep(1);
    setIsBookingOpen(true);
    setActiveTab('booking');
  };

  const createBooking = (bookingData: Partial<Booking>): Booking => {
    const newRef = `TMX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingRef: newRef,
      traineeName: bookingData.traineeName || 'Dr. Medical Professional',
      traineeEmail: bookingData.traineeEmail || 'doctor@hospital.org',
      traineePhone: bookingData.traineePhone || '+91 98765 00000',
      medicalQualification: bookingData.medicalQualification || 'MBBS',
      councilRegistrationNumber: bookingData.councilRegistrationNumber || 'MCI-2026-99120',
      departmentId: bookingData.departmentId || selectedDepartment?.id || 'dept-em',
      departmentName: bookingData.departmentName || selectedDepartment?.name || 'Emergency Medicine',
      hospitalId: bookingData.hospitalId || selectedHospital?.id || 'hosp-1',
      hospitalName: bookingData.hospitalName || selectedHospital?.name || 'Apollo Super Speciality Hospital',
      city: bookingData.city || (selectedCity !== 'All' ? selectedCity : 'Delhi'),
      duration: bookingData.duration || selectedDuration,
      startDate: bookingData.startDate || '2026-09-01',
      amountPaid: bookingData.amountPaid || 45000,
      paymentMethod: bookingData.paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      bookingStatus: 'Approved',
      documents: {
        medicalLicense: 'medical_license_verified.pdf',
        idProof: 'government_id.pdf',
        degreeCertificate: 'degree_certificate.pdf'
      },
      createdAt: new Date().toISOString()
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Trigger WhatsApp & Email Notification
    triggerNotification(
      'WhatsApp',
      newBooking.traineePhone,
      'Booking Confirmed!',
      `Dear ${newBooking.traineeName}, your booking (${newBooking.bookingRef}) for ${newBooking.departmentName} at ${newBooking.hospitalName} is confirmed!`
    );

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback if canvas confetti unavailable
    }

    return newBooking;
  };

  const addLogbookEntry = (entry: Omit<LogbookEntry, 'id' | 'supervisorSignature'>) => {
    const newEntry: LogbookEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      supervisorSignature: true
    };
    setLogbook((prev) => [newEntry, ...prev]);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['bookingStatus']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: status } : b))
    );
  };

  const addSlot = (slotData: Omit<TrainingSlot, 'id'>) => {
    const newSlot: TrainingSlot = {
      ...slotData,
      id: `slot-${Date.now()}`
    };
    setSlots((prev) => [newSlot, ...prev]);
  };

  const verifyCertificate = (codeOrId: string): Certificate | null => {
    const term = codeOrId.trim().toUpperCase();
    const found = certificates.find(
      (c) =>
        c.certificateId.toUpperCase() === term ||
        c.verificationCode.toUpperCase() === term ||
        c.dmhcaRegNumber.toUpperCase() === term ||
        term.includes(c.verificationCode.toUpperCase())
    );
    if (found) return found;

    // Generate dynamic mock certificate if requested for demo
    if (term.startsWith('TMX') || term.startsWith('DMHCA')) {
      const dynamicCert: Certificate = {
        certificateId: `DMHCA-TMX-${term.replace(/[^A-Z0-9]/g, '')}`,
        traineeName: 'Dr. Clinical Practitioner',
        qualification: 'MBBS, MD',
        departmentName: 'Emergency Medicine',
        hospitalName: 'Apollo Super Speciality Hospital, Delhi',
        city: 'Delhi',
        duration: '3 Months',
        issueDate: '2026-07-01',
        completionDate: '2026-06-30',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${term}`,
        verificationCode: term,
        dmhcaRegNumber: `DMHCA/CERT/2026/${term}`
      };
      setCertificates((prev) => [...prev, dynamicCert]);
      return dynamicCert;
    }

    return null;
  };

  const triggerNotification = (
    type: 'WhatsApp' | 'Email',
    recipient: string,
    title: string,
    message: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type,
      recipient,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        isLoggedIn,
        setIsLoggedIn,
        userProfile,
        setUserProfile,
        role,
        setRole,
        selectedCity,
        setSelectedCity,
        selectedDepartment,
        setSelectedDepartment,
        selectedSpecialization,
        setSelectedSpecialization,
        selectedHospital,
        setSelectedHospital,
        selectedDuration,
        setSelectedDuration,
        activeTab,
        setActiveTab,
        bookingStep,
        setBookingStep,
        isBookingOpen,
        setIsBookingOpen,
        startBookingForDepartment,
        departments,
        hospitals,
        activeHospital,
        setActiveHospital,
        slots,
        bookings,
        certificates,
        logbook,
        notifications,
        createBooking,
        addLogbookEntry,
        updateBookingStatus,
        addSlot,
        deleteSlot,
        updateSlotStatus,
        updateSlotSeats,
        addDepartment,
        deleteDepartment,
        addHospital,
        updatePaymentStatus,
        verifyCertificate,
        triggerNotification
      }}
    >
      {children}
      <AuthModal />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
