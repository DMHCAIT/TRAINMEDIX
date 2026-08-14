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
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HospitalOverview } from './HospitalOverview';
import { DepartmentManagement } from './DepartmentManagement';
import { SlotManagement } from './SlotManagement';
import { TraineeApprovals } from './TraineeApprovals';

export type HospitalTab = 'overview' | 'departments' | 'slots' | 'approvals';

export const HospitalDashboard: React.FC = () => {
  const router = useRouter();
  const { 
    bookings, 
    departments, 
    slots, 
    hospitals, 
    activeHospital, 
    userProfile,
    role,
    isLoggedIn,
    openAuthModal,
    setActiveTab: setGlobalTab
  } = useApp();

  React.useEffect(() => {
    if (!isLoggedIn) {
      setGlobalTab('home');
      router.push('/');
    }
  }, [isLoggedIn, setGlobalTab, router]);

  const [activeTab, setActiveTab] = useState<HospitalTab>('overview');

  const hospitalDisplayName = (userProfile?.fullName && role === 'hospital') ? userProfile.fullName : activeHospital.name;

  // Single Hospital Scoped Entries
  const hospitalBookings = bookings.filter(
    (b) => b.hospitalId === activeHospital.id || b.hospitalName === activeHospital.name || b.hospitalName === hospitalDisplayName
  );
  const hospitalSlots = slots.filter((s) => s.hospitalId === activeHospital.id);

  const pendingBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Pending Approval');
  const activeSlotsCount = hospitalSlots.filter((s) => s.status === 'Open' || s.status === 'Filling Fast').length;

  const tabs: { key: HospitalTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'departments', label: 'Department Management', count: departments.length, icon: <Layers className="w-4 h-4" /> },
    { key: 'slots', label: 'Slot Management', count: activeSlotsCount, icon: <CalendarRange className="w-4 h-4" /> },
    { key: 'approvals', label: 'Trainee Approvals', count: pendingBookings.length, icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 w-full overflow-x-hidden">

      {role !== 'hospital' && (
        <div className="bg-[#EBF7F1] border border-[#CBE5D7] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#2F855A] shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Hospital Partner Dedicated Login Required</h4>
              <p className="text-[11px] text-slate-600">You are currently logged in as a Trainee Doctor. Please sign in with your Hospital Partner Account to access clinical management.</p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
          >
            Sign In as Hospital Partner
          </button>
        </div>
      )}

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
              <Building2 className="w-3.5 h-3.5 text-[#2F855A] animate-pulse" />
              Logged In Hospital Account
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              {hospitalDisplayName}
            </h1>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            {activeHospital.address}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          <div className="bg-[#E2F0EA] border border-[#C5DED0] px-4 py-2.5 rounded-2xl text-center shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Pending Trainee Requests</span>
            <span className="text-base sm:text-lg font-black text-[#2F855A] font-heading">{pendingBookings.length} Applications</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation Bar - Fully Responsive Scrollable Bar */}
      <div className="w-full max-w-full overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  isActive
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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

      {/* Tab Views */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-full overflow-x-hidden"
      >
        {activeTab === 'overview' && <HospitalOverview />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'slots' && <SlotManagement />}
        {activeTab === 'approvals' && <TraineeApprovals />}
      </motion.div>

    </div>
  );
};
