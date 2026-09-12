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
  DurationOption,
  OfferingPricingMap
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
import { departmentService, hospitalDepartmentService, hospitalService, slotService, bookingService } from '../lib/supabase-db';
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
  offeringPricing: OfferingPricingMap;
  offeringSlots: Record<string, number>;
  activeHospital: Hospital | null;
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
  refreshDataFromSupabase: () => Promise<void>;
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

  // Restore session from localStorage or HTTP-only session cookie on app mount
  useEffect(() => {
    function initSession() {
      try {
        // Check localStorage first for persistent session
        const storedUser = localStorage.getItem('user_session');
        const storedRole = localStorage.getItem('user_role');
        const storedAdminAuth = localStorage.getItem('admin_auth');
        
        if (storedUser && storedRole) {
          // Restore from localStorage
          try {
            const user = JSON.parse(storedUser);
            setIsLoggedIn(true);
            setUserProfile(user);
            setRole(storedRole as UserRole);
            console.log('[Persistent Login] Session restored from localStorage');
            return;
          } catch (parseErr) {
            // Clear corrupted data
            localStorage.removeItem('user_session');
            localStorage.removeItem('user_role');
          }
        }
        
        // Check for admin auth persistence
        if (storedAdminAuth) {
          try {
            const adminData = JSON.parse(storedAdminAuth);
            if (adminData.isAuthenticated && adminData.timestamp && Date.now() - adminData.timestamp < 24 * 60 * 60 * 1000) {
              // Admin session valid for 24 hours
              localStorage.setItem('admin_authenticated', 'true');
              console.log('[Admin Session] Admin session restored from localStorage');
              return;
            } else {
              // Session expired
              localStorage.removeItem('admin_auth');
              localStorage.removeItem('admin_authenticated');
            }
          } catch (parseErr) {
            localStorage.removeItem('admin_auth');
            localStorage.removeItem('admin_authenticated');
          }
        }
        
        // No localStorage session, reset to logged out state
        setIsLoggedIn(false);
        setUserProfile(null);
        setRole('trainee');
      } catch (err) {
        // Fallback to logged out state
        setIsLoggedIn(false);
        setUserProfile(null);
        setRole('trainee');
      }
    }
    initSession();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    
    // If hospital partner is trying to access non-hospital pages, redirect them
    if (role === 'hospital' && isLoggedIn && !pathname.includes('hospital-portal') && !pathname.includes('admin')) {
      router.push('/hospital-portal');
      return;
    }
    
    const currentTab = pathname === '/' ? 'home' : pathname.replace(/^\//, '');
    setActiveTabState(currentTab);
    // Persist active tab to localStorage for page restoration on refresh
    localStorage.setItem('activeTab', currentTab);
  }, [pathname, role, isLoggedIn, router]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    // Always persist to localStorage
    localStorage.setItem('activeTab', tab);
    const route = tab === 'home' ? '/' : `/${tab}`;
    if (pathname !== route) {
      router.push(route);
    }
  };

  const [bookingStep, setBookingStep] = useState<number>(1);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [offeringPricing, setOfferingPricing] = useState<OfferingPricingMap>({});
  const [offeringSlots, setOfferingSlots] = useState<Record<string, number>>({});
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const [slots, setSlots] = useState<TrainingSlot[]>(INITIAL_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Function to load departments and hospitals from Supabase
  const refreshDataFromSupabase = async () => {
    try {
      // Load departments, hospitals, offerings, slots and bookings in parallel
      const [depts, hosps, offerings, allSlots] = await Promise.all([
        departmentService.getAll(),
        hospitalService.getAll(),
        hospitalDepartmentService.getAll(),
        slotService.getAll()
      ]);
      
      console.log('[AppContext] Initial data loaded:', {
        depts: depts?.length || 0,
        hospitals: hosps?.length || 0,
        offerings: offerings?.length || 0,
        slots: allSlots?.length || 0
      });
      
      // Try to load bookings (may fail if user doesn't have access)
      let allBookings: any[] = [];
      try {
        // For hospital portal, this will be loaded per-hospital
        // For now, we'll try to get all and filter later
        console.log('[AppContext] Loading bookings...');
        allBookings = await bookingService.getAll?.() || [];
        console.log('[AppContext] Bookings loaded:', allBookings?.length || 0);
        if (allBookings && allBookings.length > 0) {
          console.log('[AppContext] Sample booking:', allBookings[0]);
        }
      } catch (err) {
        console.error('[AppContext] Could not load all bookings:', err);
      }
      
      // Maps hospital id -> department ids offered there, built from hospital_departments
      const hospitalDeptMap: Record<string, string[]> = {};
      // Key: `${hospitalId}|${departmentId}|${city}` -> duration pricing
      const pricingMap: OfferingPricingMap = {};
      // Same key -> available slots configured in the admin panel
      const slotsMap: Record<string, number> = {};

      (hosps || []).forEach((hospital: any) => {
        hospitalDeptMap[hospital.id] = [];
      });

      (offerings || []).forEach((offering: any) => {
        if (!hospitalDeptMap[offering.hospital_id]) hospitalDeptMap[offering.hospital_id] = [];
        if (!hospitalDeptMap[offering.hospital_id].includes(offering.department_id)) {
          hospitalDeptMap[offering.hospital_id].push(offering.department_id);
        }
        const key = `${offering.hospital_id}|${offering.department_id}|${offering.city}`;
        pricingMap[key] = offering.pricing || {};
        slotsMap[key] = offering.max_slots ?? 0;
      });

      // Map Supabase departments to frontend Department type
      // The key issue: Supabase returns icon_url, but frontend expects image
      if (depts && depts.length > 0) {
        // Fetch partner hospitals count for each department
        const enrichedDepts = depts.map((dept: any) => {
            let partnerHospitalsCount = dept.hospitalsCount || 10;
            let deptCities: string[] = [];
            let durationOptions: any[] = ['1 Month', '3 Months', '6 Months']; // Default
            let hospitalOfferings: Array<{ hospitalName: string; cities: CityName[] }> = [];

            const departmentOfferings = (offerings || []).filter((offering: any) => offering.department_id === dept.id);
            const offeringHospitalIds = new Set(departmentOfferings.map((offering: any) => offering.hospital_id));
            const hospitalsForDept = (hosps || []).filter((hospital: any) => offeringHospitalIds.has(hospital.id));
            
            if (hospitalsForDept.length > 0) {
              partnerHospitalsCount = hospitalsForDept.length;
              const citySet = new Set<string>();
              departmentOfferings.forEach((offering: any) => citySet.add(offering.city));
              deptCities = Array.from(citySet);

              // Build hospital offerings with cities for each hospital
              const hospitalCitiesMap: Record<string, Set<string>> = {};
              departmentOfferings.forEach((offering: any) => {
                const hospital = hospitalsForDept.find(h => h.id === offering.hospital_id);
                if (hospital) {
                  if (!hospitalCitiesMap[hospital.name]) {
                    hospitalCitiesMap[hospital.name] = new Set();
                  }
                  hospitalCitiesMap[hospital.name].add(offering.city);
                }
              });

              // Convert to array format
              hospitalOfferings = Object.entries(hospitalCitiesMap).map(([hospitalName, cities]) => ({
                hospitalName,
                cities: Array.from(cities) as CityName[]
              }));
            }

            // Parse duration_options from Supabase (stored as comma-separated string like "1,3,6,12")
            if (dept.duration_options && typeof dept.duration_options === 'string') {
              durationOptions = dept.duration_options
                .split(',')
                .map((num: string) => {
                  const months = parseInt(num.trim(), 10);
                  if (months === 1) return '1 Month';
                  if (months === 3) return '3 Months';
                  if (months === 6) return '6 Months';
                  if (months === 12) return '12 Months';
                  return null;
                })
                .filter((opt: any) => opt !== null);
            }
            
            // Get subDepartments from Supabase database (stored as sub_departments column)
            // Falls back to mock data if not defined in database
            const mockDept = DEPARTMENTS.find(md => 
              md.code.toLowerCase() === dept.code?.toLowerCase() || 
              md.name.toLowerCase() === dept.name?.toLowerCase()
            );
            
            return {
              ...dept,
              // Map Supabase icon_url to image property for frontend
              image: dept.icon_url || dept.image,
              // Actual partner hospitals count from database
              partner_hospitals_count: partnerHospitalsCount,
              // Ensure all required fields exist, with sensible defaults
              availableCities: deptCities.length > 0 ? deptCities : (dept.availableCities || []),
              subDepartments: dept.sub_departments || dept.subDepartments || mockDept?.subDepartments || [],
              hospitalsCount: partnerHospitalsCount, // Use actual count
              iconName: dept.iconName || mockDept?.iconName || 'Activity',
              featured: dept.featured !== undefined ? dept.featured : true,
              baseFeePerMonth: dept.baseFeePerMonth || 40000,
              clinicalHighlights: dept.clinicalHighlights || [],
              durationOptions: durationOptions,
              hospitalOfferings: hospitalOfferings,
            };
          });
        
        console.log('✅ Loaded', enrichedDepts.length, 'departments from Supabase with partner hospital counts');
        setDepartments(enrichedDepts);
      } else {
        console.log('⚠️ No departments from Supabase, using mock data');
        setDepartments(DEPARTMENTS);
      }
      
      if (hosps && hosps.length > 0) {
        // Map Supabase hospitals to frontend Hospital type
        const enrichedHosps = hosps.map((hosp: any) => ({
          ...hosp,
          // Map available_slots from database to availableSlotsCount for frontend
          availableSlotsCount: hosp.available_slots || 0,
          // Map image_url to image
          image: hosp.image_url || hosp.image || '/default-hospital.jpg',
          // Ensure required fields have defaults
          rating: hosp.rating || 4.5,
          // Department ids offered at this trainee-facing hospital
          departments: hospitalDeptMap[hosp.id] || [],
          // Construct address from cities array
          address: (hosp.cities && hosp.cities.length > 0) 
            ? hosp.cities.join(', ') 
            : (hosp.city || 'Unknown Location'),
        }));
        console.log('✅ Loaded', enrichedHosps.length, 'hospitals from Supabase');
        setHospitals(enrichedHosps);
        setActiveHospital(enrichedHosps[0]);
      } else {
        setHospitals(HOSPITALS);
        setActiveHospital(HOSPITALS[0]);
      }

      setOfferingPricing(pricingMap);
      setOfferingSlots(slotsMap);

      // Batches configured in the admin panel drive the slot picker
      try {
        const slotRows = await slotService.getAllDetailed();
        const hospitalsById = new Map((hosps || []).map((h: any) => [h.id, h]));

        const mapped: TrainingSlot[] = (slotRows || [])
          .filter((row: any) => row.hospital_departments)
          .map((row: any) => {
            const offering = row.hospital_departments;
            const hospital = hospitalsById.get(offering.hospital_id);
            const city = offering.city || hospital?.cities?.[0] || hospital?.city || '';
            const months = row.duration_months || 1;
            const seatsLeft = (row.available_seats ?? 0) - (row.booked_seats ?? 0);
            const total = row.available_seats ?? 0;

            return {
              id: row.id,
              hospitalId: offering.hospital_id,
              departmentId: offering.department_id,
              city,
              duration: `${months} ${months === 1 ? 'Month' : 'Months'}` as DurationOption,
              startDate: row.start_date,
              endDate: row.end_date,
              totalSeats: total,
              availableSeats: Math.max(0, seatsLeft),
              monthlyFee: offering.pricing?.[String(months)]
                ? Math.round(Number(offering.pricing[String(months)]) / months)
                : 0,
              status: seatsLeft <= 0 ? 'Sold Out' : seatsLeft <= 2 ? 'Filling Fast' : 'Open'
            } as TrainingSlot;
          });

        setSlots(mapped);
      } catch (err) {
        console.warn('⚠️ Could not load training slots:', err);
      }

      // Load bookings from Supabase
      try {
        if (allBookings && allBookings.length > 0) {
          console.log('✅ Loaded', allBookings.length, 'bookings from Supabase');
          setBookings(allBookings);
        } else {
          console.log('⚠️ No bookings found, using empty array');
          setBookings([]);
        }
      } catch (err) {
        console.warn('⚠️ Could not load bookings:', err);
        setBookings([]);
      }
    } catch (err) {
      console.error('❌ Error loading data from Supabase:', err);
      setDepartments(DEPARTMENTS);
      setHospitals(HOSPITALS);
      setActiveHospital(HOSPITALS[0]);
    }
  };

  // Load departments and hospitals from Supabase on mount
  // Also set up periodic refresh to show updates from admin panel
  useEffect(() => {
    // Load data immediately
    refreshDataFromSupabase();

    // Set up periodic refresh every 10 seconds for faster real-time updates
    const refreshInterval = setInterval(() => {
      refreshDataFromSupabase();
    }, 10000); // 10 seconds for faster real-time updates from admin panel

    // Also refresh when page becomes visible (user switches back from another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing data immediately...');
        refreshDataFromSupabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto-open auth modal after 5 seconds on initial page load (only for non-logged-in users, not on admin page)
  useEffect(() => {
    // Don't show modal if user is already logged in or on admin page
    if (isLoggedIn || pathname.includes('admin')) {
      return;
    }

    const autoOpenTimer = setTimeout(() => {
      setIsAuthModalOpen(true);
      console.log('[Auto-Open] Auth modal opened automatically after 5 seconds');
    }, 5000);

    return () => clearTimeout(autoOpenTimer);
  }, [isLoggedIn, pathname]);

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
    setActiveTab('departments');
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
        offeringPricing,
        offeringSlots,
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
        triggerNotification,
        refreshDataFromSupabase
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
