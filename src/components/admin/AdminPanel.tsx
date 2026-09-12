'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Home,
  ChevronRight
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminHospitalsManager } from './AdminHospitalsManager';
import { AdminHospitalPartnersManager } from './AdminHospitalPartnersManager';
import { AdminDepartmentsManager } from './AdminDepartmentsManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminBookingsManager } from './AdminBookingsManager';
import { AdminSlotsManager } from './AdminSlotsManager';

type AdminTab = 'dashboard' | 'users' | 'hospitals' | 'hospital-partners' | 'departments' | 'bookings' | 'slots';

interface AdminPanelProps {
  initialTab?: AdminTab;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab = 'dashboard' }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check for admin session persistence on mount
  useEffect(() => {
    try {
      const adminAuth = localStorage.getItem('admin_auth');
      if (adminAuth) {
        const authData = JSON.parse(adminAuth);
        // Check if session is still valid (within 24 hours)
        if (authData.isAuthenticated && authData.timestamp && Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('✅ Admin session restored from localStorage');
          setIsLoggedIn(true);
          return;
        } else {
          // Session expired, clear it
          localStorage.removeItem('admin_auth');
          localStorage.removeItem('admin_authenticated');
          console.log('⏰ Admin session expired, cleared');
        }
      }
    } catch (err) {
      console.error('Error checking admin session:', err);
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_authenticated');
    }
  }, []);

  // Auto-initialize storage buckets and database on admin panel load
  useEffect(() => {
    if (!isLoggedIn) return;

    const initializeAdmin = async () => {
      try {
        // Initialize storage bucket for department images
        console.log('🔧 Initializing admin features...');
        
        const storageResponse = await fetch('/api/admin/setup-storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const storageData = await storageResponse.json();
        
        if (storageData.success) {
          console.log('✅ Storage bucket ready:', storageData.message);
        } else {
          console.warn('⚠️ Storage setup:', storageData.message);
        }

        // Initialize duration_options column if needed
        const durationResponse = await fetch('/api/admin/setup-duration-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const durationData = await durationResponse.json();
        
        if (durationData.success) {
          console.log('✅ Duration options ready');
        }

        console.log('✨ Admin panel fully initialized');
      } catch (error) {
        console.error('Initialization note (non-blocking):', error);
        // Don't fail the admin panel if setup has issues
      }
    };

    initializeAdmin();
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear session from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
      localStorage.removeItem('user_role');
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_authenticated');
    }
    router.push('/');
  };

  const handleViewWebsite = () => {
    router.push('/');
  };

  if (!isLoggedIn) {
    return <AdminLoginPage onSuccess={() => setIsLoggedIn(true)} />;
  }

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, description: 'Overview & statistics' },
    { id: 'users', label: 'Users', icon: <Users size={20} />, description: 'Manage all users (Trainees, Hospitals, Admins)' },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 size={20} />, description: 'Add, edit, delete hospitals' },
    { id: 'hospital-partners', label: 'Hospital Partners', icon: <Building2 size={20} />, description: 'View partner departments & slots' },
    { id: 'departments', label: 'Departments', icon: <BookOpen size={20} />, description: 'Manage clinical departments' },
    { id: 'bookings', label: 'Bookings', icon: <ClipboardList size={20} />, description: 'Approve & manage bookings' },
    { id: 'slots', label: 'Training Slots', icon: <ShieldCheck size={20} />, description: 'Manage training slots' },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <motion.div
        initial={isMobileSidebarOpen ? { x: -300 } : { x: 0 }}
        animate={{ x: 0 }}
        className={`${isMobileSidebarOpen ? 'fixed' : 'hidden'} md:block w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-40 h-screen overflow-y-auto flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center font-bold">TM</div>
            <div>
              <h1 className="text-lg font-bold">TrainMedix Admin</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-slate-400 font-normal">{item.description}</div>
                </div>
              </div>
              {activeTab === item.id && <ChevronRight size={18} />}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewWebsite}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition"
          >
            <Home size={16} /> View Website
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
          >
            <LogOut size={16} /> Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 md:hidden z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="text-sm text-slate-600">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'users' && <AdminUsersManager />}
                {activeTab === 'hospitals' && <AdminHospitalsManager />}
                {activeTab === 'hospital-partners' && <AdminHospitalPartnersManager />}
                {activeTab === 'departments' && <AdminDepartmentsManager />}
                {activeTab === 'bookings' && <AdminBookingsManager />}
                {activeTab === 'slots' && <AdminSlotsManager />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: 'Loading...', icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Hospitals', value: 'Loading...', icon: Building2, color: 'bg-green-100 text-green-600' },
          { label: 'Total Departments', value: 'Loading...', icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
          { label: 'Pending Bookings', value: 'Loading...', icon: ClipboardList, color: 'bg-orange-100 text-orange-600' }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6 border border-slate-200"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">Admin Panel Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              name: 'Users', 
              description: 'Create, edit, and delete users with different roles (Trainee, Hospital, Admin)',
              action: 'Manage Users'
            },
            { 
              name: 'Hospitals', 
              description: 'Add and manage hospital profiles, contact information, and accreditation',
              action: 'Manage Hospitals'
            },
            { 
              name: 'Departments', 
              description: 'Configure clinical departments, duration, and course details',
              action: 'Manage Departments'
            },
            { 
              name: 'Training Slots', 
              description: 'Create and manage training slots with seat capacity and dates',
              action: 'Manage Slots'
            },
            { 
              name: 'Bookings', 
              description: 'Approve, reject, or manage booking requests from trainees',
              action: 'Manage Bookings'
            },
            { 
              name: 'Dashboard', 
              description: 'View overall statistics and platform performance metrics',
              action: 'View Stats'
            }
          ].map((item) => (
            <div
              key={item.name}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition"
            >
              <h4 className="font-semibold text-slate-900 mb-2">{item.name}</h4>
              <p className="text-sm text-slate-600 mb-3">{item.description}</p>
              <button className="text-sm font-semibold text-green-600 hover:text-green-700">
                {item.action} →
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white"
      >
        <h3 className="text-xl font-bold mb-2">Welcome to TrainMedix Admin Panel</h3>
        <p className="text-green-50">
          Use the sidebar navigation to manage all aspects of the platform. All changes are automatically saved to the database and will be reflected on the website immediately.
        </p>
      </motion.div>
    </div>
  );
};
