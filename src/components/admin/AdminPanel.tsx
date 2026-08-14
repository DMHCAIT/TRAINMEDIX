'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import {
  ShieldCheck,
  Users,
  Building2,
  CalendarRange,
  BarChart3,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  X,
  Check,
  Edit3,
  Layers,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  UserCheck,
  Award,
  ChevronRight,
  Globe,
  LogOut,
  RotateCcw,
  Save,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Zap
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { AdminLoginPage } from './AdminLoginPage';
import { AutomationCenter } from '../automation/AutomationCenter';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Department, Hospital, TrainingSlot, Booking } from '../../types';

type AdminTab = 'dashboard' | 'training' | 'bookings' | 'revenue' | 'automation' | 'users' | 'compliance';

interface AdminPanelProps {
  initialTab?: AdminTab;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab = 'dashboard' }) => {
  const router = useRouter();
  const {
    bookings,
    hospitals,
    departments,
    slots,
    role,
    setRole,
    isLoggedIn,
    setIsLoggedIn,
    setUserProfile,
    setActiveTab: setGlobalTab,
    addDepartment,
    deleteDepartment,
    addHospital,
    addSlot,
    deleteSlot,
    updateSlotStatus,
    updateSlotSeats,
    updateBookingStatus,
    updatePaymentStatus,
    triggerNotification
  } = useApp();

  type TrainingSubTab = 'departments' | 'hospitals' | 'slots';

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [trainingSubTab, setTrainingSubTab] = useState<TrainingSubTab>('departments');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'approved' | 'waitlisted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Custom Confirmation Alert State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'danger'
  });

  const requestConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      variant
    });
  };

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingCapacitySlot, setEditingCapacitySlot] = useState<TrainingSlot | null>(null);
  const [releasingPayoutHosp, setReleasingPayoutHosp] = useState<Hospital | null>(null);

  // Form states: Add Department
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptSubDepts, setDeptSubDepts] = useState('');
  const [deptFee, setDeptFee] = useState(45000);

  // Form states: Add Hospital
  const [hospName, setHospName] = useState('');
  const [hospCity, setHospCity] = useState('Delhi');
  const [hospBeds, setHospBeds] = useState(500);
  const [hospMentor, setHospMentor] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospAccreditation, setHospAccreditation] = useState('NABH Accredited');

  // Form states: Add Slot
  const [slotHospId, setSlotHospId] = useState(hospitals[0]?.id || 'hosp-1');
  const [slotDeptId, setSlotDeptId] = useState(departments[0]?.id || 'dept-em');
  const [slotSubCategory, setSlotSubCategory] = useState('');
  const [slotSeats, setSlotSeats] = useState(6);
  const [slotFee, setSlotFee] = useState(45000);

  // Form states: Edit Capacity
  const [capTotal, setCapTotal] = useState(6);
  const [capAvailable, setCapAvailable] = useState(4);

  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(isLoggedIn && role === 'admin');

  React.useEffect(() => {
    if (isLoggedIn && role === 'admin') {
      setIsAdminAuthorized(true);
    } else {
      setIsAdminAuthorized(false);
    }
  }, [isLoggedIn, role]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isAdminAuthorized) {
    return <AdminLoginPage onSuccess={() => setIsAdminAuthorized(true)} />;
  }

  // Revenue computations
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.amountPaid, 0);

  const platformCommission = Math.round(totalRevenue * 0.18);
  const hospitalNetPayout = Math.round(totalRevenue * 0.82);

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    if (bookingFilter === 'pending') return matchesSearch && b.bookingStatus === 'Pending Approval';
    if (bookingFilter === 'approved') return matchesSearch && (b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation');
    if (bookingFilter === 'waitlisted') return matchesSearch && (b.bookingStatus as string) === 'Waitlisted';
    if (bookingFilter === 'rejected') return matchesSearch && b.bookingStatus === 'Rejected';
    return matchesSearch;
  });

  // Action Handlers
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      // ignore
    }
    setIsLoggedIn(false);
    setUserProfile(null);
    setRole('trainee');
    setGlobalTab('home');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
    }
    router.push('/');
  };

  const handleViewWebsite = () => {
    setRole('trainee');
    setGlobalTab('home');
    router.push('/');
  };

  const handleSaveAllChanges = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    const subList = deptSubDepts.split(',').map(s => s.trim()).filter(Boolean);
    addDepartment({
      name: deptName,
      code: deptCode.toUpperCase(),
      description: deptDesc || 'Clinical training rotation department.',
      subDepartments: subList.length > 0 ? subList : [deptName],
      availableCities: ['Delhi', 'Noida', 'Gurugram', 'Mumbai', 'Bengaluru'],
      hospitalsCount: 1,
      iconName: 'Activity',
      featured: true,
      baseFeePerMonth: Number(deptFee),
      clinicalHighlights: ['Hands-on Procedures', 'HOD Mentorship']
    });
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setDeptSubDepts('');
    setShowAddDeptModal(false);
  };

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName) return;
    addHospital({
      name: hospName,
      city: hospCity as any,
      bedCapacity: Number(hospBeds),
      accreditation: hospAccreditation,
      rating: 4.9,
      departments: departments.map(d => d.id),
      availableSlotsCount: 8,
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      address: hospAddress || `${hospCity} Medical District`,
      chiefMentor: hospMentor || 'Dr. Chief HOD'
    });
    setHospName('');
    setHospMentor('');
    setHospAddress('');
    setShowAddHospitalModal(false);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const hosp = hospitals.find(h => h.id === slotHospId);
    addSlot({
      hospitalId: slotHospId,
      departmentId: slotDeptId,
      subDepartment: slotSubCategory || 'Clinical Specialty',
      city: hosp?.city || 'Delhi',
      duration: '3 Months',
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      totalSeats: Number(slotSeats),
      availableSeats: Number(slotSeats),
      monthlyFee: Number(slotFee),
      status: 'Open'
    });
    setShowAddSlotModal(false);
  };

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCapacitySlot) {
      updateSlotSeats(editingCapacitySlot.id, Number(capTotal), Number(capAvailable));
      setEditingCapacitySlot(null);
    }
  };

  const handleReleasePayout = (hosp: Hospital) => {
    triggerNotification(
      'Email',
      `${hosp.name} Finance Dept`,
      'Payout Released',
      `Net payout for ${hosp.name} has been processed and released via automated bank transfer.`
    );
    setReleasingPayoutHosp(null);
  };

  const navItems: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'training', label: 'Training Management', icon: <Layers className="w-4 h-4" /> },
    { key: 'bookings', label: 'Booking Control', icon: <CalendarRange className="w-4 h-4" /> },
    { key: 'revenue', label: 'Revenue & Payouts', icon: <IndianRupee className="w-4 h-4" /> },
    { key: 'automation', label: 'Automation Center', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { key: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { key: 'compliance', label: 'Compliance & Audit', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F8FAFC] flex flex-col lg:flex-row select-none overflow-hidden z-30">

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E2F0EA] border border-[#C5DED0] text-[#2F855A] flex items-center justify-center font-black text-xs font-heading">
            TM
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 font-heading">TrainMedix Admin</h2>
            <p className="text-[10px] text-slate-500 font-semibold">Content Manager</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-slate-700 bg-slate-100 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* LEFT VERTICAL SIDEBAR NAVIGATION (Fixed Size, Touches Top & Bottom, Non-Scrollable) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-72 shrink-0 h-full bg-white border-r border-slate-200 p-5 sm:p-6 flex flex-col justify-between shadow-xl lg:shadow-none transition-transform duration-300 overflow-hidden select-none
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="space-y-6">

          {/* Top Admin Identity Badge */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-[#E2F0EA] border-2 border-[#C5DED0] text-[#2F855A] flex items-center justify-center font-black text-sm font-heading shadow-xs shrink-0">
              TM
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-extrabold text-slate-900 font-heading truncate">TrainMedix Admin</h2>
              <p className="text-[11px] text-slate-500 font-semibold truncate">Content & Ops Manager</p>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition touch-target cursor-pointer ${isActive
                      ? 'bg-[#2F855A] text-white font-extrabold shadow-md shadow-[#2F855A]/20'
                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Sidebar Action Items */}
        <div className="pt-6 border-t border-slate-100 space-y-1 shrink-0">
          <button
            onClick={handleViewWebsite}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#2F855A] hover:bg-[#E2F0EA]/60 transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>View Website</span>
          </button>
          <button
            onClick={() => requestConfirmation(
              'Admin Logout',
              'Are you sure you want to log out of the TrainMedix Admin Panel?',
              handleLogout,
              'warning'
            )}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT AREA (Independently Scrollable) */}
      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-8 space-y-6 lg:space-y-8 min-w-0 bg-[#F8FAFC]">

        {/* Top Section Header & Metrics Grid (Hidden in Automation Center) */}
        {activeTab !== 'automation' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage your website content, clinical rotation slots & hospital payouts
                </p>
              </div>

              {/* Quick Action Buttons in Top Right */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddDeptModal(true)}
                  className="bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </button>
                <button
                  onClick={() => setShowAddHospitalModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Add Hospital</span>
                </button>
              </div>
            </div>

            {/* QUICK METRIC CARDS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Broad Departments', value: `${departments.length}`, icon: <Layers className="w-5 h-5 text-[#2F855A]" />, bg: 'bg-white' },
                { label: 'Partner Hospitals', value: `${hospitals.length}`, icon: <Building2 className="w-5 h-5 text-indigo-600" />, bg: 'bg-white' },
                { label: 'Active Rotations', value: `${bookings.filter(b => b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation').length}+`, icon: <CalendarRange className="w-5 h-5 text-emerald-600" />, bg: 'bg-white' },
                { label: 'Platform Status', value: 'Active', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: 'bg-white' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-[#CBE5D7]/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#E2F0EA] border border-[#C5DED0] flex items-center justify-center shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-heading">{stat.value}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SECTION 1: DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Department-wise Rotation Load</h3>
              <div className="space-y-4">
                {departments.slice(0, 6).map((dept) => {
                  const count = bookings.filter(b => b.departmentName === dept.name).length;
                  const max = Math.max(...departments.map(d => bookings.filter(b => b.departmentName === d.name).length), 1);
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={dept.id} className="flex items-center gap-3 text-xs">
                      <span className="w-28 sm:w-40 font-bold text-slate-800 truncate shrink-0 font-heading">{dept.name}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 5)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-[#2F855A] rounded-full shadow-2xs"
                        />
                      </div>
                      <span className="text-slate-900 font-extrabold w-8 text-right shrink-0 font-heading">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 2: TRAINING MANAGEMENT TAB WITH SUB-TOGGLE MENU */}
        {activeTab === 'training' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Training Management Sub-Toggle Menu */}
            <div className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-300/60 w-fit max-w-full overflow-x-auto no-scrollbar shadow-inner">
              {[
                { key: 'departments', label: 'Broad Clinical Departments', icon: <Layers className="w-3.5 h-3.5" /> },
                { key: 'hospitals', label: 'Partner Hospitals', icon: <Building2 className="w-3.5 h-3.5" /> },
                { key: 'slots', label: 'Rotation Slot Availability & Capacity', icon: <CalendarRange className="w-3.5 h-3.5" /> },
              ].map((sub) => {
                const isSubActive = trainingSubTab === sub.key;
                return (
                  <button
                    key={sub.key}
                    onClick={() => setTrainingSubTab(sub.key as TrainingSubTab)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${isSubActive ? 'text-white font-extrabold' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      }`}
                  >
                    {isSubActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-[#2F855A] rounded-xl shadow-xs"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {sub.icon}
                      <span>{sub.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: Broad Clinical Departments */}
            {trainingSubTab === 'departments' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">Broad Clinical Departments ({departments.length})</h3>
                    <p className="text-xs text-slate-600">Configure medical categories, specializations, and base monthly fees.</p>
                  </div>
                  <button
                    onClick={() => setShowAddDeptModal(true)}
                    className="bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Department</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="glass-card rounded-2xl p-5 border border-slate-200/80 space-y-3 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2 py-0.5 rounded-md border border-[#C5DED0]">
                            {dept.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 font-heading mt-1.5">{dept.name}</h4>
                        </div>
                        <button
                          onClick={() => requestConfirmation(
                            'Delete Clinical Department',
                            `Are you sure you want to delete "${dept.name}" (${dept.code})? This will remove all associated rotation slots and categories.`,
                            () => deleteDepartment(dept.id),
                            'danger'
                          )}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                          title="Delete Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{dept.description}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {dept.subDepartments?.map((sub, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                            {sub}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-semibold">Monthly Base Fee:</span>
                        <span className="font-extrabold text-[#2F855A] font-heading">₹{dept.baseFeePerMonth?.toLocaleString('en-IN') || '45,000'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 2: Partner Hospitals */}
            {trainingSubTab === 'hospitals' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">Partner Hospitals ({hospitals.length})</h3>
                    <p className="text-xs text-slate-600">Registered clinical training hospitals and mentor details.</p>
                  </div>
                  <button
                    onClick={() => setShowAddHospitalModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hospital</span>
                  </button>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading">
                        <tr>
                          <th className="p-4">Hospital Name</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Chief Mentor</th>
                          <th className="p-4 text-center">Active Slots</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 text-slate-700 font-medium">
                        {hospitals.map((hosp) => {
                          const hospSlotCount = slots.filter(s => s.hospitalId === hosp.id).length;
                          return (
                            <tr key={hosp.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-bold text-slate-900 font-heading">{hosp.name}</td>
                              <td className="p-4 font-semibold text-slate-600">{hosp.city}</td>
                              <td className="p-4 font-semibold text-slate-800">{hosp.chiefMentor}</td>
                              <td className="p-4 text-center">
                                <span className="font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2.5 py-1 rounded-lg border border-[#C5DED0]">
                                  {hospSlotCount} slots
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 3: Rotation Slot Availability & Capacity */}
            {trainingSubTab === 'slots' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">Rotation Slot Availability & Capacity ({slots.length})</h3>
                    <p className="text-xs text-slate-600">Configure available rotation seats, monthly fee, and operational status.</p>
                  </div>
                  <button
                    onClick={() => setShowAddSlotModal(true)}
                    className="bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Define New Slot</span>
                  </button>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading">
                        <tr>
                          <th className="p-4">Hospital Unit</th>
                          <th className="p-4">Department / Specialty</th>
                          <th className="p-4">Duration</th>
                          <th className="p-4">Monthly Fee</th>
                          <th className="p-4 text-center">Seat Capacity</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 text-slate-700 font-medium">
                        {slots.map((slot) => {
                          const hosp = hospitals.find(h => h.id === slot.hospitalId);
                          const dept = departments.find(d => d.id === slot.departmentId);
                          return (
                            <tr key={slot.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-bold text-slate-900 font-heading">{hosp?.name || slot.hospitalId}</td>
                              <td className="p-4 font-semibold text-slate-800">
                                {slot.subDepartment || dept?.name}
                                <span className="block text-[10px] text-slate-500 font-normal">{dept?.code}</span>
                              </td>
                              <td className="p-4 font-bold text-slate-700">{slot.duration}</td>
                              <td className="p-4 font-extrabold text-[#2F855A] font-heading">₹{slot.monthlyFee?.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-center">
                                <span className="font-extrabold text-slate-900">
                                  {slot.availableSeats} available / {slot.totalSeats} total
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${slot.status === 'Open' ? 'bg-[#E2F0EA] text-[#2F855A] border-[#C5DED0]' :
                                    slot.status === 'Filling Fast' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                  {slot.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingCapacitySlot(slot);
                                    setCapTotal(slot.totalSeats);
                                    setCapAvailable(slot.availableSeats);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer"
                                >
                                  Assign Capacity
                                </button>
                                <button
                                  onClick={() => requestConfirmation(
                                    'Delete Rotation Slot',
                                    `Are you sure you want to delete this rotation slot for ${slot.subDepartment || 'Clinical Specialty'} at ${hosp?.name || 'Partner Hospital'}?`,
                                    () => deleteSlot(slot.id),
                                    'danger'
                                  )}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION 3: BOOKING CONTROL TAB */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-4 border border-slate-200/80">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Requests' },
                  { id: 'pending', label: 'Pending Approval' },
                  { id: 'approved', label: 'Approved / In Rotation' },
                  { id: 'waitlisted', label: 'Waitlisted Queue' },
                  { id: 'rejected', label: 'Rejected' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${bookingFilter === f.id ? 'bg-[#2F855A] text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search trainee or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2F855A]"
                />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading">
                    <tr>
                      <th className="p-4">REF & Trainee</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Hospital Unit</th>
                      <th className="p-4">Duration & Start</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 text-slate-700 font-medium">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                          No rotation booking records match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4">
                            <span className="text-[10px] font-mono font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2 py-0.5 rounded-md border border-[#C5DED0]">
                              {b.bookingRef}
                            </span>
                            <p className="font-bold text-slate-900 font-heading mt-1">{b.traineeName}</p>
                            <p className="text-[10px] text-slate-500">{b.traineeEmail || b.traineePhone}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-900 font-heading block">{b.subDepartment || b.departmentName}</span>
                            <span className="text-[10px] font-bold text-[#2F855A] bg-[#E2F0EA] px-2 py-0.5 rounded-md border border-[#C5DED0] inline-block mt-0.5">
                              {b.departmentName}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">{b.hospitalName}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900">{b.duration}</span>
                            <span className="block text-[10px] text-slate-500">From {b.startDate}</span>
                          </td>
                          <td className="p-4 font-extrabold text-[#2F855A] font-heading">₹{b.amountPaid?.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation' ? 'bg-[#E2F0EA] text-[#2F855A] border-[#C5DED0]' :
                                b.bookingStatus === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  (b.bookingStatus as string) === 'Waitlisted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {b.bookingStatus !== 'Approved' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'Approved')}
                                className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {(b.bookingStatus as string) !== 'Waitlisted' && b.bookingStatus !== 'Approved' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'Waitlisted' as any)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Waitlist
                              </button>
                            )}
                            {b.bookingStatus !== 'Rejected' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'Rejected')}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2 py-1 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 4: REVENUE & PAYOUTS TAB */}
        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white border border-[#CBE5D7] rounded-3xl p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-heading">Gross Platform Revenue</span>
                <p className="text-3xl font-black text-slate-900 font-heading">₹{totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-500 font-medium">All confirmed trainee rotation fees</p>
              </div>

              <div className="bg-white border border-[#CBE5D7] rounded-3xl p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-heading">Platform Fee (18%)</span>
                <p className="text-3xl font-black text-[#2F855A] font-heading">₹{platformCommission.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-500 font-medium">TrainMedix retained commission</p>
              </div>

              <div className="bg-white border border-[#CBE5D7] rounded-3xl p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-heading">Hospital Net Payouts (82%)</span>
                <p className="text-3xl font-black text-indigo-900 font-heading">₹{hospitalNetPayout.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-500 font-medium">Net payable to partner hospitals</p>
              </div>
            </div>

            {/* Hospital Payout Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">Hospital Payout Release System</h3>
              <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading">
                      <tr>
                        <th className="p-4">Partner Hospital</th>
                        <th className="p-4">Location</th>
                        <th className="p-4 text-center">Hosted Rotations</th>
                        <th className="p-4">Gross Collected</th>
                        <th className="p-4">Platform Fee (18%)</th>
                        <th className="p-4 font-bold text-indigo-900">Net Payable (82%)</th>
                        <th className="p-4 text-right">Payout Release</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 text-slate-700 font-medium">
                      {hospitals.map((hosp) => {
                        const hospBookings = bookings.filter(b => b.hospitalId === hosp.id || b.hospitalName === hosp.name);
                        const gross = hospBookings.reduce((sum, b) => sum + b.amountPaid, 0);
                        const platformFee = Math.round(gross * 0.18);
                        const netPayout = Math.round(gross * 0.82);

                        return (
                          <tr key={hosp.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4 font-bold text-slate-900 font-heading">{hosp.name}</td>
                            <td className="p-4 font-semibold text-slate-600">{hosp.city}</td>
                            <td className="p-4 text-center font-bold text-slate-900">{hospBookings.length}</td>
                            <td className="p-4 font-extrabold text-slate-900">₹{gross.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-semibold text-slate-500">₹{platformFee.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-extrabold text-indigo-900 font-heading">₹{netPayout.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setReleasingPayoutHosp(hosp)}
                                className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>Release Payout</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 5: AUTOMATION CENTER TAB */}
        {activeTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AutomationCenter />
          </motion.div>
        )}

        {/* SECTION 6: USER DIRECTORY */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-6 shadow-xs border border-slate-200/80">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-4">Registered Platform Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 font-heading">
                      <th className="text-left px-5 py-3 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">User Name</th>
                      <th className="text-left px-5 py-3 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Role</th>
                      <th className="text-left px-5 py-3 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Bookings Count</th>
                      <th className="text-left px-5 py-3 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {(() => {
                      const registeredUsers = [
                        ...bookings.map(b => ({
                          name: b.traineeName,
                          role: 'Trainee Doctor',
                          count: bookings.filter(x => x.traineeName === b.traineeName).length,
                          status: 'Active'
                        })),
                        ...hospitals.map(h => ({
                          name: `${h.name} Admin`,
                          role: 'Hospital Partner',
                          count: bookings.filter(x => x.hospitalId === h.id || x.hospitalName === h.name).length,
                          status: 'Active'
                        }))
                      ].filter((u, index, self) => index === self.findIndex(t => t.name === u.name));

                      if (registeredUsers.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-5 py-8 text-center text-slate-500 font-medium">
                              No registered users found. Users will appear here dynamically when registered or when rotation slots are booked.
                            </td>
                          </tr>
                        );
                      }

                      return registeredUsers.map((user, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3.5 font-bold text-slate-900 font-heading">{user.name}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${user.role.includes('Trainee') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>{user.role}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{user.count}</td>
                          <td className="px-5 py-3.5">
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${user.status === 'Active' ? 'text-[#2F855A]' : 'text-slate-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-[#2F855A]' : 'bg-slate-300'}`} />
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 6: COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-7 shadow-xs border border-slate-200/80">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2F855A]" />
                DMHCA Compliance Status & Audit Trail
              </h3>
              <div className="space-y-3">
                {[
                  { item: 'Hospital Accreditation Certificates', status: 'verified', date: '2026-01-15' },
                  { item: 'Mentor Qualification Verification', status: 'verified', date: '2026-03-20' },
                  { item: 'Training Module Standards Review', status: 'verified', date: '2026-05-01' },
                  { item: 'Patient Safety Protocols Audit', status: 'pending', date: '2026-08-01' },
                  { item: 'Annual Platform Security Assessment', status: 'pending', date: '2026-09-15' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      {c.status === 'verified' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2F855A] shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-heading">{c.item}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Due: {c.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.status === 'verified' ? 'bg-[#E2F0EA] text-[#2F855A] border-[#C5DED0]' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {c.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* MODAL 1: ADD DEPARTMENT */}
      <AnimatePresence>
        {showAddDeptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Add Broad Clinical Department</h3>
                <button onClick={() => setShowAddDeptModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pediatric Surgery & Neonatology"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PED-NEO"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono uppercase font-bold focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specializations (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Neonatal ICU, Pediatric Emergency, Child Surgery"
                    value={deptSubDepts}
                    onChange={(e) => setDeptSubDepts(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Base Fee (INR)</label>
                  <input
                    type="number"
                    value={deptFee}
                    onChange={(e) => setDeptFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe clinical scope and hands-on exposure..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddDeptModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md">
                    Create Department
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD HOSPITAL */}
      <AnimatePresence>
        {showAddHospitalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Add Partner Hospital Unit</h3>
                <button onClick={() => setShowAddHospitalModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateHospital} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hospital Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortis Escorts Heart Institute"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={hospCity}
                      onChange={(e) => setHospCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chief Medical Mentor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Naresh Trehan (Director)"
                    value={hospMentor}
                    onChange={(e) => setHospMentor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter complete hospital address..."
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddHospitalModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md">
                    Save Hospital Unit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DEFINE SLOT */}
      <AnimatePresence>
        {showAddSlotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Define Training Slot Availability</h3>
                <button onClick={() => setShowAddSlotModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Hospital Unit</label>
                  <select
                    value={slotHospId}
                    onChange={(e) => setSlotHospId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Department</label>
                  <select
                    value={slotDeptId}
                    onChange={(e) => setSlotDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ACLS / BLS or Emergency Medicine"
                    value={slotSubCategory}
                    onChange={(e) => setSlotSubCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total Seat Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={slotSeats}
                      onChange={(e) => setSlotSeats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Monthly Fee (INR)</label>
                    <input
                      type="number"
                      value={slotFee}
                      onChange={(e) => setSlotFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddSlotModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md">
                    Save Slot Availability
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: ASSIGN CAPACITY */}
      <AnimatePresence>
        {editingCapacitySlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Assign Slot Seat Capacity</h3>
                <button onClick={() => setEditingCapacitySlot(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">{editingCapacitySlot.subDepartment || 'Clinical Slot'}</p>
                <p className="text-[11px] text-slate-600">{editingCapacitySlot.duration} Rotation</p>
              </div>

              <form onSubmit={handleSaveCapacity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Assigned Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={capTotal}
                    onChange={(e) => setCapTotal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Available Open Seats</label>
                  <input
                    type="number"
                    min={0}
                    max={capTotal}
                    value={capAvailable}
                    onChange={(e) => setCapAvailable(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#2F855A]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingCapacitySlot(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md">
                    Update Capacity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: CONFIRM RELEASE PAYOUT */}
      <AnimatePresence>
        {releasingPayoutHosp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Release Hospital Net Payout</h3>
                <button onClick={() => setReleasingPayoutHosp(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#E2F0EA] p-4 rounded-2xl border border-[#C5DED0] text-xs space-y-2">
                <p className="font-bold text-slate-900 font-heading">{releasingPayoutHosp.name}</p>
                <div className="flex justify-between text-slate-700">
                  <span>Gross Rotations Revenue:</span>
                  <span className="font-bold">₹{bookings.filter(b => b.hospitalId === releasingPayoutHosp.id || b.hospitalName === releasingPayoutHosp.name).reduce((sum, b) => sum + b.amountPaid, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Platform Fee (18%):</span>
                  <span className="font-bold text-slate-500">₹{Math.round(bookings.filter(b => b.hospitalId === releasingPayoutHosp.id || b.hospitalName === releasingPayoutHosp.name).reduce((sum, b) => sum + b.amountPaid, 0) * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#173F2B] text-sm font-extrabold pt-2 border-t border-[#C5DED0] font-heading">
                  <span>Net Payable (82%):</span>
                  <span>₹{Math.round(bookings.filter(b => b.hospitalId === releasingPayoutHosp.id || b.hospitalName === releasingPayoutHosp.name).reduce((sum, b) => sum + b.amountPaid, 0) * 0.82).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Releasing this payout will initiate automated direct bank transfer to {releasingPayoutHosp.name} and send a notification dispatch.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setReleasingPayoutHosp(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => handleReleasePayout(releasingPayoutHosp)}
                  className="px-5 py-2 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Release Payout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL CUSTOM CONFIRMATION ALERT MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText="Confirm Action"
        cancelText="Cancel"
      />

    </div>
  );
};
