'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Clock,
  BarChart3,
  Layers,
  CalendarRange,
  AlertCircle,
  CheckCircle,
  X,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  UserCheck
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '../../services/apiService';

export type HospitalTab = 'overview' | 'departments' | 'slots' | 'approvals';

export const HospitalDashboard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    userProfile,
    role,
    isLoggedIn,
    setActiveTab: setGlobalTab,
    hospitals,
    setActiveHospital
  } = useApp();

  // Check if hospital partner is approved
  const isHospitalApproved = (userProfile as any)?.isApproved === true;
  const isHospitalPartner = role === 'hospital';
  const hospitalId = (userProfile as any)?.id || '';

  React.useEffect(() => {
    if (!isLoggedIn) {
      setGlobalTab('home');
      router.push('/');
    } else if (isHospitalPartner && hospitalId && hospitals && hospitals.length > 0) {
      // Set the active hospital based on the logged-in hospital user's ID
      const currentHospital = hospitals.find(h => h.id === hospitalId);
      if (currentHospital) {
        setActiveHospital(currentHospital);
        console.log('[HospitalDashboard] Set active hospital:', currentHospital.name);
      }
    }
  }, [isLoggedIn, setGlobalTab, router, isHospitalPartner, hospitalId, hospitals, setActiveHospital]);

  // Get initial tab from query parameter
  const queryTab = searchParams?.get('tab') as HospitalTab | null;
  const initialTab: HospitalTab = (queryTab && ['overview', 'departments', 'slots', 'approvals'].includes(queryTab)) 
    ? queryTab 
    : 'overview';

  const [activeTab, setActiveTab] = useState<HospitalTab>(initialTab);

  // Update activeTab when query parameter changes
  React.useEffect(() => {
    if (queryTab && ['overview', 'departments', 'slots', 'approvals'].includes(queryTab)) {
      setActiveTab(queryTab as HospitalTab);
      console.log('[HospitalDashboard] Updated tab from query param:', queryTab);
    }
  }, [queryTab]);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [traineeDecisionNotes, setTraineeDecisionNotes] = useState<Record<string, string>>({});
  const [decidingTraineeId, setDecidingTraineeId] = useState<string | null>(null);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', description: '', basePrice: '', availabilityCities: [] as string[] });
  const [slotFormData, setSlotFormData] = useState({ 
    departmentId: '', 
    startDate: '', 
    endDate: '', 
    capacity: '', 
    feePerMonth: '', 
    initialStatus: 'Open' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dbCheckInfo, setDbCheckInfo] = useState<any>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const citiesAvailable = ['Delhi', 'Noida', 'Gurugram', 'Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai'];

  // Log hospital ID for debugging
  React.useEffect(() => {
    console.log('[HospitalDashboard] Hospital ID:', hospitalId);
    console.log('[HospitalDashboard] User Profile:', userProfile);
  }, [hospitalId, userProfile]);

  // Fetch departments from API - SIMPLIFIED DIRECT FETCH
  const fetchDepartments = async () => {
    if (!hospitalId) {
      console.log('[fetchDepartments] Hospital ID is empty, skipping fetch');
      return;
    }
    setLoadingDepts(true);
    console.log('[fetchDepartments] Fetching for hospital:', hospitalId);
    try {
      // Use DIRECT FETCH endpoint (simpler, more reliable)
      const response = await fetch(`/api/hospitals/direct-fetch?hospitalId=${hospitalId}`, {
        method: 'GET',
        cache: 'no-store'
      });
      
      const data = await response.json();
      console.log('[fetchDepartments] Direct fetch response:', data);
      
      if (data.success && data.departments) {
        console.log('[fetchDepartments] Setting', data.departments.length, 'departments');
        setDepartments(data.departments);
      } else {
        console.error('[fetchDepartments] Failed:', data.error);
        setDepartments([]);
      }
    } catch (err) {
      console.error('[fetchDepartments] Fetch error:', err);
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  };

  // Fetch slots from API
  const fetchSlots = async () => {
    if (!hospitalId) {
      console.log('[fetchSlots] Hospital ID is empty, skipping fetch');
      return;
    }
    setLoadingSlots(true);
    console.log('[fetchSlots] Fetching slots for hospital:', hospitalId);
    try {
      // Fetch slots directly from database
      const response = await fetch(`/api/hospitals/direct-fetch-slots?hospitalId=${hospitalId}`, {
        method: 'GET',
        cache: 'no-store'
      });
      
      const data = await response.json();
      console.log('[fetchSlots] Direct fetch response:', data);
      
      if (data.success && data.slots) {
        console.log('[fetchSlots] Setting', data.slots.length, 'slots');
        setSlots(data.slots);
      } else {
        console.error('[fetchSlots] Failed:', data.error);
        setSlots([]);
      }
    } catch (err) {
      console.error('[fetchSlots] Fetch error:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchTrainees = async () => {
    if (!hospitalId) return;
    setLoadingTrainees(true);
    try {
      const data = await apiService.getHospitalTrainees(hospitalId);
      setTrainees(data.success ? data.trainees || [] : []);
    } catch (err) {
      console.error('[fetchTrainees] Fetch error:', err);
      setTrainees([]);
    } finally {
      setLoadingTrainees(false);
    }
  };

  const handleTraineeDecision = async (traineeId: string, decision: 'Approved' | 'Rejected') => {
    const notes = traineeDecisionNotes[traineeId]?.trim() || undefined;
    setDecidingTraineeId(traineeId);
    setError('');
    try {
      const result = decision === 'Approved'
        ? await apiService.approveHospitalTrainee(traineeId, hospitalId, notes)
        : await apiService.rejectHospitalTrainee(traineeId, notes);
      if (!result.success) throw new Error(result.error || `Failed to mark trainee as ${decision.toLowerCase()}`);
      setTraineeDecisionNotes(current => {
        const next = { ...current };
        delete next[traineeId];
        return next;
      });
      await fetchTrainees();
    } catch (err: any) {
      setError(err.message || 'Failed to update trainee status');
    } finally {
      setDecidingTraineeId(null);
    }
  };

  // Check database for debugging
  const checkDatabase = async () => {
    if (!hospitalId) {
      console.log('[checkDatabase] Hospital ID is empty');
      return;
    }
    setCheckingDb(true);
    console.log('[checkDatabase] Checking database for hospital:', hospitalId);
    try {
      const response = await fetch(`/api/debug/database-check?hospitalId=${hospitalId}`);
      const data = await response.json();
      console.log('[checkDatabase] Database check result:', data);
      setDbCheckInfo(data);
      alert(`Database Check Results:\n\nAll Departments: ${data.allDepartmentsCount}\nYour Hospital Departments: ${data.hospitalDepartmentsCount}\n\nCheck console (F12) for details`);
    } catch (err) {
      console.error('[checkDatabase] Error:', err);
      alert('Database check failed. Check console for errors.');
    } finally {
      setCheckingDb(false);
    }
  };

  // Check all hospitals in system
  const checkAllHospitals = async () => {
    console.log('[checkAllHospitals] Fetching all hospitals...');
    try {
      const response = await fetch(`/api/debug/hospitals-list`);
      const data = await response.json();
      console.log('[checkAllHospitals] Result:', data);
      
      if (data.hospitals && data.hospitals.length > 0) {
        const hospitalIds = data.hospitals.map((h: any) => h.id).join('\n');
        alert(`Found ${data.hospitalsCount} Hospitals in System:\n\n${hospitalIds}\n\nYour ID: ${hospitalId}\n\nCheck console for full details.`);
      } else {
        alert(`No hospitals found in system!\n\nYour ID: ${hospitalId}\n\nThis might be the issue!`);
      }
    } catch (err) {
      console.error('[checkAllHospitals] Error:', err);
      alert('Failed to check hospitals. See console.');
    }
  };

  // Test fetch endpoint directly
  const testFetchDepartments = async () => {
    console.log('[testFetchDepartments] Testing direct fetch for hospital:', hospitalId);
    try {
      const response = await fetch(`/api/hospitals/direct-fetch?hospitalId=${hospitalId}`, {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await response.json();
      console.log('[testFetchDepartments] Result:', data);
      setTestResult(data);
      
      if (data.success && data.count > 0) {
        alert(`✅ TEST PASSED!\n\nFetch works! Found ${data.count} departments.\n\nThey should now display below.`);
        // Set the departments
        setDepartments(data.departments || []);
      } else if (data.success && data.count === 0) {
        alert(`⚠️ No departments found\n\nHospital ID: ${hospitalId}\n\nTry adding a department first.`);
      } else {
        alert(`❌ TEST FAILED!\n\nError: ${data.error}\n\nCheck console for details.`);
      }
    } catch (err) {
      console.error('[testFetchDepartments] Error:', err);
      alert('Test failed. Check console.');
    }
  };

  // Fetch departments when tab changes to departments - SIMPLIFIED
  React.useEffect(() => {
    if (activeTab === 'departments' && hospitalId) {
      console.log('[useEffect] Departments tab active, fetching...');
      // Sync hospital first
      fetch('/api/hospitals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospitalId,
          hospitalName: (userProfile as any)?.hospital_name || (userProfile as any)?.fullName || 'Hospital',
          email: (userProfile as any)?.email || '',
          phone: (userProfile as any)?.phone || ''
        })
      })
        .then(res => res.json())
        .then(() => {
          console.log('[useEffect] Hospital synced, now fetching departments');
          // Then fetch departments
          fetchDepartments();
        })
        .catch(err => {
          console.error('[useEffect] Sync error:', err);
          // Still fetch even if sync fails
          fetchDepartments();
        });
    }
  }, [activeTab, hospitalId]);

  // Fetch slots when tab changes to slots
  React.useEffect(() => {
    if (activeTab === 'slots' && hospitalId) {
      console.log('[useEffect] Slots tab active, fetching slots...');
      fetchSlots();
    }
  }, [activeTab, hospitalId]);

  React.useEffect(() => {
    if (activeTab === 'approvals' && hospitalId) {
      fetchTrainees();
    }
  }, [activeTab, hospitalId]);

  // Initial fetch on component mount
  React.useEffect(() => {
    if (hospitalId) {
      console.log('[useEffect] Component mounted, fetching initial data for hospital:', hospitalId);
      // Sync hospital first
      fetch('/api/hospitals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospitalId,
          hospitalName: (userProfile as any)?.hospital_name || (userProfile as any)?.fullName || 'Hospital',
          email: (userProfile as any)?.email || '',
          phone: (userProfile as any)?.phone || ''
        })
      })
        .then(res => res.json())
        .then(() => {
          console.log('[useEffect] Hospital synced, fetching all data');
          // Fetch both departments and slots to populate counts
          fetchDepartments();
          fetchSlots();
          fetchTrainees();
        })
        .catch(err => {
          console.error('[useEffect] Sync error:', err);
          fetchDepartments();
          fetchSlots();
          fetchTrainees();
        });
    }
  }, [hospitalId]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!deptFormData.name.trim() || !deptFormData.code.trim() || !deptFormData.basePrice) {
        setError('Department name, code, and base price are required');
        setIsSubmitting(false);
        return;
      }

      console.log('[handleAddDepartment] Hospital ID:', hospitalId);
      console.log('[handleAddDepartment] User Profile:', userProfile);

      // CRITICAL: Sync hospital to database first
      console.log('[handleAddDepartment] Syncing hospital to database...');
      const syncResponse = await fetch('/api/hospitals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospitalId,
          hospitalName: (userProfile as any)?.hospital_name || (userProfile as any)?.fullName || 'Hospital',
          email: (userProfile as any)?.email || '',
          phone: (userProfile as any)?.phone || ''
        })
      });

      const syncResult = await syncResponse.json();
      console.log('[handleAddDepartment] Sync result:', syncResult);

      if (!syncResult.success) {
        console.error('[handleAddDepartment] Sync failed:', syncResult.error);
        // Continue anyway - the department might still be added
      }

      // Now add the department
      console.log('[handleAddDepartment] Form Data:', {
        name: deptFormData.name,
        code: deptFormData.code,
        description: deptFormData.description,
        basePrice: deptFormData.basePrice,
        availabilityCities: deptFormData.availabilityCities
      });

      const result = await apiService.addHospitalDepartment(hospitalId, {
        name: deptFormData.name,
        code: deptFormData.code.toUpperCase(),
        description: deptFormData.description,
        basePrice: parseFloat(deptFormData.basePrice),
        availabilityCities: deptFormData.availabilityCities
      });

      console.log('[handleAddDepartment] API Response:', result);

      if (!result?.success) {
        setError(result?.error || 'Failed to add department');
        return;
      }

      setSuccess('Department added successfully!');
      setDeptFormData({ name: '', code: '', description: '', basePrice: '', availabilityCities: [] as string[] });
      
      console.log('[handleAddDepartment] Refetching departments...');
      // Fetch updated departments list
      await fetchDepartments();
      console.log('[handleAddDepartment] Departments refetched');
      
      setTimeout(() => {
        setShowAddDepartmentModal(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!slotFormData.departmentId || !slotFormData.startDate || !slotFormData.endDate || !slotFormData.capacity || !slotFormData.feePerMonth) {
        setError('All required fields must be filled');
        setIsSubmitting(false);
        return;
      }

      console.log('[handleAddSlot] Hospital ID:', hospitalId);
      console.log('[handleAddSlot] Form Data:', slotFormData);

      // CRITICAL: Sync hospital to database first
      console.log('[handleAddSlot] Syncing hospital to database...');
      const syncResponse = await fetch('/api/hospitals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospitalId,
          hospitalName: (userProfile as any)?.hospital_name || (userProfile as any)?.fullName || 'Hospital',
          email: (userProfile as any)?.email || '',
          phone: (userProfile as any)?.phone || ''
        })
      });

      const syncResult = await syncResponse.json();
      console.log('[handleAddSlot] Sync result:', syncResult);

      const result = await apiService.addHospitalSlot(hospitalId, {
        departmentId: slotFormData.departmentId,
        startDate: slotFormData.startDate,
        endDate: slotFormData.endDate,
        capacity: parseInt(slotFormData.capacity),
        feePerMonth: parseFloat(slotFormData.feePerMonth),
        initialStatus: slotFormData.initialStatus
      });

      console.log('[handleAddSlot] API Response:', result);

      if (!result?.success) {
        setError(result?.error || 'Failed to add slot');
        return;
      }

      setSuccess('Slot added successfully!');
      setSlotFormData({ departmentId: '', startDate: '', endDate: '', capacity: '', feePerMonth: '', initialStatus: 'Open' });
      
      // Fetch slots to display the newly created slot
      setTimeout(() => {
        fetchSlots();
      }, 500);
      
      setTimeout(() => {
        setShowAddSlotModal(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!deptFormData.name.trim() || !deptFormData.code.trim() || !deptFormData.basePrice) {
        setError('Department name, code, and base price are required');
        setIsSubmitting(false);
        return;
      }

      console.log('[handleEditDepartment] Updating department:', editingDept.id);

      const response = await fetch('/api/hospitals/update-department', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: editingDept.id,
          hospitalId: hospitalId,
          name: deptFormData.name,
          code: deptFormData.code.toUpperCase(),
          description: deptFormData.description,
          basePrice: parseFloat(deptFormData.basePrice),
          availabilityCities: deptFormData.availabilityCities
        })
      });

      const result = await response.json();
      console.log('[handleEditDepartment] API Response:', result);

      if (!result.success) {
        setError(result.error || 'Failed to update department');
        return;
      }

      setSuccess('Department updated successfully!');
      
      // Refresh departments list
      setTimeout(() => {
        fetchDepartments();
        setShowEditDepartmentModal(false);
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      console.error('[handleEditDepartment] Error:', err);
      setError(err.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!slotFormData.departmentId || !slotFormData.startDate || !slotFormData.endDate || !slotFormData.capacity || !slotFormData.feePerMonth) {
        setError('All required fields must be filled');
        setIsSubmitting(false);
        return;
      }

      console.log('[handleEditSlot] Updating slot:', editingSlot.id);

      const response = await fetch('/api/hospitals/update-slot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: editingSlot.id,
          hospitalId: hospitalId,
          departmentId: slotFormData.departmentId,
          startDate: slotFormData.startDate,
          endDate: slotFormData.endDate,
          capacity: parseInt(slotFormData.capacity),
          feePerMonth: parseFloat(slotFormData.feePerMonth),
          status: slotFormData.initialStatus
        })
      });

      const result = await response.json();
      console.log('[handleEditSlot] API Response:', result);

      if (!result.success) {
        setError(result.error || 'Failed to update slot');
        return;
      }

      setSuccess('Slot updated successfully!');
      
      // Refresh slots list
      setTimeout(() => {
        fetchSlots();
        setShowEditSlotModal(false);
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      console.error('[handleEditSlot] Error:', err);
      setError(err.message || 'Failed to update slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hospitalDisplayName = (userProfile?.fullName && role === 'hospital') ? userProfile.fullName : 'Hospital';

  // Safety check: don't render if not logged in or not a hospital partner
  if (!isLoggedIn || !isHospitalPartner) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-[#EBF7F1] border border-[#CBE5D7] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#2F855A] shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Hospital Partner Dedicated Login Required</h4>
              <p className="text-[11px] text-slate-600">You are currently logged in as a Trainee Doctor. Please sign in with your Hospital Partner Account to access clinical management.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single Hospital Scoped Entries - Simplified
  const pendingBookings = trainees.filter(trainee => trainee.status === 'Pending').length;
  const activeSlotsCount = 0;

  const tabs: { key: HospitalTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'departments', label: 'Department Management', count: departments.length, icon: <Layers className="w-4 h-4" /> },
    { key: 'slots', label: 'Slot Management', count: slots.length, icon: <CalendarRange className="w-4 h-4" /> },
    { key: 'approvals', label: 'Trainee Approvals', count: pendingBookings, icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 w-full overflow-x-hidden">

      {/* Approval Pending Modal - Hospital Partner Not Yet Approved */}
      {!isHospitalApproved && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-8 rounded-3xl flex flex-col items-center justify-center gap-6 text-center shadow-lg"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Approval Pending</h2>
            <p className="text-slate-600 max-w-md">
              Your hospital partner account is awaiting approval from the DMHCA organization. Once approved, you'll be able to add departments and manage rotation slots.
            </p>
          </div>

          <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 w-full max-w-md text-sm text-slate-700">
            <p className="font-semibold mb-2">What happens next?</p>
            <ul className="text-left space-y-1 text-xs">
              <li>✓ Your account details have been submitted for review</li>
              <li>✓ Our team will verify your hospital partnership</li>
              <li>✓ You'll receive an email once approved (within 24-48 hours)</li>
              <li>✓ Refresh this page after approval to access the portal</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2 rounded-xl transition"
          >
            Refresh Page
          </button>
        </motion.div>
      )}

      {isHospitalApproved && (
        <>
          {/* Header Banner - Single Hospital Account */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel rounded-3xl p-5 sm:p-8 shadow-xl border border-[#CBE5D7] flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full max-w-full"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#E2F0EA] border border-[#C5DED0] text-[#3D7A5C] font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span>Verified Hospital Account</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight flex items-center gap-2">
                  {hospitalDisplayName}
                  <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
                </h1>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Hospital Portal
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
              <div className="bg-[#E2F0EA] border border-[#C5DED0] px-4 py-2.5 rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Pending Trainee Requests</span>
                <span className="text-base sm:text-lg font-black text-[#2F855A] font-heading">{pendingBookings} Applications</span>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation Bar */}
          <div className="w-full max-w-full overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      // Manually fetch departments when clicking the departments tab
                      if (tab.key === 'departments' && hospitalId) {
                        console.log('[Tab Click] Fetching departments for:', hospitalId);
                        fetchDepartments();
                      }
                    }}
                    className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${isActive
                        ? 'text-white font-extrabold shadow-sm'
                        : 'bg-white/90 text-slate-700 hover:bg-slate-100/90 border border-slate-200/80'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-[#2F855A] rounded-2xl"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content - Simplified Placeholders */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-full overflow-x-hidden bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-100"
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Active Trainees - Count of approved/active trainees */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <div className="text-sm text-blue-600 font-semibold">Active Trainees</div>
                    <div className="text-3xl font-bold text-blue-900 mt-2">
                      {trainees.filter((t: any) => t.status === 'Approved' || t.status === 'Active').length}
                    </div>
                  </div>
                  {/* Open Slots - Count from Slot Management */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                    <div className="text-sm text-green-600 font-semibold">Open Slots</div>
                    <div className="text-3xl font-bold text-green-900 mt-2">
                      {slots.filter((s: any) => s.status === 'Open' || s.status === 'Filling Fast').length}
                    </div>
                  </div>
                  {/* Pending Approvals - Count of pending trainees */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
                    <div className="text-sm text-amber-600 font-semibold">Pending Approvals</div>
                    <div className="text-3xl font-bold text-amber-900 mt-2">
                      {trainees.filter((t: any) => t.status === 'Pending').length}
                    </div>
                  </div>
                  {/* Departments - Count from Department Management */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                    <div className="text-sm text-purple-600 font-semibold">Departments</div>
                    <div className="text-3xl font-bold text-purple-900 mt-2">
                      {departments.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Department Management</h2>
                  <button 
                    onClick={() => setShowAddDepartmentModal(true)}
                    className="bg-[#2F855A] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#276749]">
                    + Add Department
                  </button>
                </div>
                
                {loadingDepts ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <div className="inline-block animate-spin">
                      <Clock className="w-8 h-8 text-[#2F855A]" />
                    </div>
                    <p className="text-slate-500 font-medium mt-3">Loading departments...</p>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm">
                      <p className="text-blue-900 font-semibold">Debug Info:</p>
                      <p className="text-blue-700 mt-1">Hospital ID: <code className="bg-blue-100 px-2 py-1 rounded">{hospitalId || 'NOT SET'}</code></p>
                      <p className="text-blue-700 mt-1">Total Departments Found: <code className="bg-blue-100 px-2 py-1 rounded">{departments.length}</code></p>
                      {dbCheckInfo && (
                        <>
                          <p className="text-blue-700 mt-2"><strong>Database Check:</strong></p>
                          <p className="text-blue-600 text-xs ml-2">✓ All DB Departments: {dbCheckInfo.allDepartmentsCount}</p>
                          <p className="text-blue-600 text-xs ml-2">✓ Your Hospital Depts: {dbCheckInfo.hospitalDepartmentsCount}</p>
                          <p className="text-blue-600 text-xs ml-2">✓ Hospital Found: {dbCheckInfo.hospital.found ? '✅ Yes' : '❌ No'}</p>
                        </>
                      )}
                      <p className="text-blue-600 text-xs mt-2">👉 Check browser console (F12) for more details</p>
                    </div>
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No departments added yet</p>
                      <p className="text-sm text-slate-400">Click "Add Department" to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {departments.map((dept: any) => (
                      <motion.div
                        key={dept.id}
                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(47, 133, 90, 0.15)' }}
                        className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-[#CBE5D7] shadow-md hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col"
                      >
                        {/* Header with action buttons */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-[#2F855A] text-white font-mono font-bold text-[11px] px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                {dept.department_code}
                              </span>
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{dept.department_name}</h3>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingDept(dept);
                                setDeptFormData({
                                  name: dept.department_name,
                                  code: dept.department_code,
                                  description: dept.description || '',
                                  basePrice: dept.base_fee_per_month?.toString() || '',
                                  availabilityCities: dept.available_cities || []
                                });
                                setShowEditDepartmentModal(true);
                              }}
                              className="p-2 text-slate-500 hover:text-[#2F855A] hover:bg-[#EBF7F1] rounded-lg transition"
                              title="Edit department"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {dept.description && (
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{dept.description}</p>
                        )}

                        {/* Base Price - Enhanced styling */}
                        <div className="bg-gradient-to-r from-[#EBF7F1] to-slate-50 border border-[#CBE5D7] px-4 py-2.5 rounded-xl">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Base Fee</span>
                            <span className="text-lg font-extrabold text-[#2F855A]">₹{dept.base_fee_per_month?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                        </div>

                        {/* Cities */}
                        {dept.available_cities && dept.available_cities.length > 0 && (
                          <div className="mt-auto pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                              Available Cities ({dept.available_cities.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {dept.available_cities.map((city: string) => (
                                <span key={city} className="bg-white border border-[#CBE5D7] text-[#2F855A] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs hover:bg-[#EBF7F1] transition">
                                  <MapPin className="w-3 h-3" />
                                  {city}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'slots' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Slot Management</h2>
                  <button 
                    onClick={() => setShowAddSlotModal(true)}
                    className="bg-[#2F855A] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#276749]">
                    + Add Slot
                  </button>
                </div>

                {loadingSlots ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <div className="inline-block animate-spin">
                      <Clock className="w-8 h-8 text-[#2F855A]" />
                    </div>
                    <p className="text-slate-500 font-medium mt-3">Loading slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <CalendarRange className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No slots added yet</p>
                    <p className="text-sm text-slate-400">Add departments first, then create slots</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {slots.map((slot: any) => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-3xl p-5 border border-[#CBE5D7] shadow-xs hover:border-[#2F855A] transition space-y-3"
                      >
                        {/* Header with action buttons */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-[#2F855A] text-white font-mono font-bold text-[11px] px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                {slot.department_name || 'N/A'}
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              {new Date(slot.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} → {new Date(slot.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </h3>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingSlot(slot);
                                setSlotFormData({
                                  departmentId: slot.hospital_department_id,
                                  startDate: slot.start_date,
                                  endDate: slot.end_date,
                                  capacity: slot.available_seats?.toString() || slot.total_seats?.toString() || '',
                                  feePerMonth: slot.fee_per_month?.toString() || '',
                                  initialStatus: slot.status || 'Open'
                                });
                                setShowEditSlotModal(true);
                              }}
                              className="p-2 text-slate-500 hover:text-[#2F855A] hover:bg-[#EBF7F1] rounded-lg transition"
                              title="Edit slot"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Seats & Status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#EBF7F1] border border-[#CBE5D7] rounded-xl p-3">
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Seats</div>
                            <div className="text-xl font-extrabold text-[#2F855A]">{slot.total_seats}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{slot.available_seats} available</div>
                          </div>
                          <div className="bg-[#EBF7F1] border border-[#CBE5D7] rounded-xl p-3 flex flex-col justify-center items-center">
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Status</div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              slot.status === 'Open' ? 'bg-green-100 text-green-700' :
                              slot.status === 'Filling Fast' ? 'bg-yellow-100 text-yellow-700' :
                              slot.status === 'Closed' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {slot.status}
                            </span>
                          </div>
                        </div>

                        {/* Fee - Enhanced styling */}
                        <div className="bg-gradient-to-r from-[#EBF7F1] to-slate-50 border border-[#CBE5D7] px-4 py-3 rounded-xl mt-auto">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Monthly Fee</span>
                            <span className="text-lg font-extrabold text-[#2F855A]">₹{slot.fee_per_month?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Trainee Approvals & Rotation Management</h2>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
                {loadingTrainees ? (
                  <div className="text-center py-12 text-slate-500">Loading trainee requests...</div>
                ) : trainees.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No trainee requests</p>
                    <p className="text-sm text-slate-400">Admin-assigned trainees will appear here for approval</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {trainees.map(trainee => (
                      <div key={trainee.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900">{trainee.trainee_name}</h3>
                            <p className="text-sm text-slate-500">{trainee.trainee_email}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trainee.status === 'Approved' ? 'bg-green-100 text-green-700' : trainee.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{trainee.status}</span>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          <div><dt className="text-xs text-slate-500">Qualification</dt><dd className="font-semibold">{trainee.qualification}</dd></div>
                          <div><dt className="text-xs text-slate-500">Course</dt><dd className="font-semibold">{trainee.course_interested}</dd></div>
                          <div><dt className="text-xs text-slate-500">Department</dt><dd>{trainee.department_name}</dd></div>
                          <div><dt className="text-xs text-slate-500">City</dt><dd>{trainee.city}</dd></div>
                          <div className="col-span-2"><dt className="text-xs text-slate-500">Training Period</dt><dd>{new Date(trainee.start_date).toLocaleDateString()} - {new Date(trainee.end_date).toLocaleDateString()}</dd></div>
                        </dl>
                        {trainee.certificate_url ? (
                          <a href={trainee.certificate_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F855A] hover:underline"><FileText size={16} /> View qualification certificate</a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-sm text-slate-400"><FileText size={16} /> Certificate not uploaded</span>
                        )}
                        {trainee.approval_notes && <p className="text-sm bg-slate-50 rounded-lg p-3"><span className="font-semibold">Response notes:</span> {trainee.approval_notes}</p>}
                        {trainee.status === 'Pending' && (
                          <div className="space-y-3 pt-1">
                            <label className="block text-xs font-semibold text-slate-600">
                              Response notes <span className="font-normal text-slate-400">(optional)</span>
                              <textarea
                                rows={2}
                                value={traineeDecisionNotes[trainee.id] || ''}
                                onChange={event => setTraineeDecisionNotes(current => ({ ...current, [trainee.id]: event.target.value }))}
                                placeholder="Add approval or rejection notes"
                                className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:border-[#2F855A] focus:outline-none"
                              />
                            </label>
                            <div className="flex gap-3">
                              <button disabled={decidingTraineeId === trainee.id} onClick={() => handleTraineeDecision(trainee.id, 'Approved')} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2F855A] text-white rounded-lg font-semibold disabled:opacity-50"><UserCheck size={16} /> Approve</button>
                              <button disabled={decidingTraineeId === trainee.id} onClick={() => handleTraineeDecision(trainee.id, 'Rejected')} className="flex-1 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold disabled:opacity-50">Reject</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-[#CBE5D7] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 relative my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2F855A]" />
                <h3 className="text-lg font-extrabold text-slate-900">Add New Department</h3>
              </div>
              <button
                onClick={() => setShowAddDepartmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurology, Nephrology, Oncology"
                    value={deptFormData.name}
                    onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEURO"
                    value={deptFormData.code}
                    onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono font-bold uppercase focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Clinical overview of rotations, ward rounds, OPD and ICU management..."
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl p-3.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Base Monthly Fee (INR) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={1000}
                  value={deptFormData.basePrice}
                  onChange={(e) => setDeptFormData({ ...deptFormData, basePrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Applicable Cities Allocation *</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {citiesAvailable.map((city) => {
                    const isSelected = deptFormData.availabilityCities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setDeptFormData({ ...deptFormData, availabilityCities: deptFormData.availabilityCities.filter(c => c !== city) });
                          } else {
                            setDeptFormData({ ...deptFormData, availabilityCities: [...deptFormData.availabilityCities, city] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#2F855A] text-white shadow-2xs' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <CheckCircle className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        <span>{city}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowAddDepartmentModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-3 sm:p-4 max-w-md w-full shadow-2xl space-y-2 my-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900">Add New Slot</h3>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleAddSlot} className="space-y-2 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Department *</label>
                <select
                  value={slotFormData.departmentId}
                  onChange={(e) => {
                    console.log('[slot form] Department selected:', e.target.value);
                    setSlotFormData({ ...slotFormData, departmentId: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                >
                  <option value="">Choose a department...</option>
                  {departments && departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name} ({dept.department_code})
                      </option>
                    ))
                  ) : (
                    <option disabled>No departments available</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={slotFormData.startDate}
                    onChange={(e) => setSlotFormData({ ...slotFormData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={slotFormData.endDate}
                    onChange={(e) => setSlotFormData({ ...slotFormData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available seats *</label>
                  <input
                    type="number"
                    value={slotFormData.capacity}
                    onChange={(e) => setSlotFormData({ ...slotFormData, capacity: e.target.value })}
                    placeholder="e.g., 5"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee / Month (₹) *</label>
                  <input
                    type="number"
                    value={slotFormData.feePerMonth}
                    onChange={(e) => setSlotFormData({ ...slotFormData, feePerMonth: e.target.value })}
                    placeholder="e.g., 45000"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status *</label>
                <select
                  value={slotFormData.initialStatus}
                  onChange={(e) => setSlotFormData({ ...slotFormData, initialStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#2F855A] text-white rounded-lg font-semibold hover:bg-[#276749] disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartmentModal && editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-[#CBE5D7] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 relative my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#2F855A]" />
                <h3 className="text-lg font-extrabold text-slate-900">Edit Department</h3>
              </div>
              <button
                onClick={() => setShowEditDepartmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleEditDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology"
                    value={deptFormData.name}
                    onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. NEURO"
                    value={deptFormData.code}
                    onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono font-bold uppercase focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description *</label>
                <textarea
                  rows={2}
                  placeholder="Clinical overview of rotations..."
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl p-3.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Base Monthly Fee (INR) *</label>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  value={deptFormData.basePrice}
                  onChange={(e) => setDeptFormData({ ...deptFormData, basePrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowEditDepartmentModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Department'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {showEditSlotModal && editingSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-3 sm:p-4 max-w-md w-full shadow-2xl space-y-2 my-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900">Edit Slot</h3>
              <button
                onClick={() => setShowEditSlotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleEditSlot} className="space-y-2 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={slotFormData.departmentId}
                  onChange={(e) => setSlotFormData({ ...slotFormData, departmentId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name} ({dept.department_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={slotFormData.startDate}
                    onChange={(e) => setSlotFormData({ ...slotFormData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={slotFormData.endDate}
                    onChange={(e) => setSlotFormData({ ...slotFormData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available seats *</label>
                  <input
                    type="number"
                    value={slotFormData.capacity}
                    onChange={(e) => setSlotFormData({ ...slotFormData, capacity: e.target.value })}
                    placeholder="e.g., 5"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee / Month (₹) *</label>
                  <input
                    type="number"
                    value={slotFormData.feePerMonth}
                    onChange={(e) => setSlotFormData({ ...slotFormData, feePerMonth: e.target.value })}
                    placeholder="e.g., 45000"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
                <select
                  value={slotFormData.initialStatus}
                  onChange={(e) => setSlotFormData({ ...slotFormData, initialStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowEditSlotModal(false)}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#2F855A] text-white rounded-lg font-semibold hover:bg-[#276749] disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Slot'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
