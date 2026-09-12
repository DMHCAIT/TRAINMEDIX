'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Award,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  Zap,
  Plus,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { CITIES } from '../../data/mockData';
import type { CityName, UserRole } from '../../types';
import { getProfileInitials } from '../../utils/subCategoryUtils';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    selectedCity,
    setSelectedCity,
    activeTab,
    setActiveTab,
    openAuthModal,
    isLoggedIn,
    setIsLoggedIn,
    userProfile,
    setUserProfile
  } = useApp();

  const router = useRouter();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || activeTab === 'admin') {
    return null;
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      // session clear fallback
    }
    setIsLoggedIn(false);
    setUserProfile(null);
    setRole('trainee');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Collapse dropdowns & menus when clicking outside anywhere on the website
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setRole('trainee');
    }
  }, [isLoggedIn, setRole]);

  // Role-based Nav Items
  const getNavItems = () => {
    if (role === 'hospital') {
      return [
        { id: 'hospital-portal', label: 'Hospital Portal' },
        // Departments and Hospitals tabs hidden for hospital partners
      ];
    }
    // Default Public / Trainee Role: Home, Departments, Hospitals
    return [
      { id: 'home', label: 'Home' },
      { id: 'departments', label: 'Departments' },
      { id: 'hospitals', label: 'Hospitals' }
    ];
  };

  const navItems = getNavItems();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[#EBF7F1]/90 backdrop-blur-xl border-b border-[#CBE5D7] shadow-xs py-0'
        : 'bg-transparent border-b border-transparent shadow-none py-1'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // For hospital partners, navigate to hospital portal; others go to home
              if (role === 'hospital' && isLoggedIn) {
                setActiveTab('hospital-portal');
              } else {
                setActiveTab('home');
              }
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2F855A] text-white flex items-center justify-center shadow-md shadow-[#2F855A]/25">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-[#1F1C18] font-heading">
                  Train<span className="text-[#2F855A]">Medix</span>
                </span>
                <span className="bg-[#E2F0EA] text-[#3D7A5C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  DMHCA
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">Hospital Clinical Platform</p>
            </div>
          </motion.div>

          {/* Center Navigation Links (Centered Dead-Center) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-[#EBE4DB] shadow-2xs absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isAlerts = item.id === 'alerts';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${isActive
                    ? 'bg-[#2F855A] text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                  {isAlerts && <Bell className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                  {isAlerts && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Profile Circular Button */}
            <div ref={profileDropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#E2F0EA] hover:bg-[#D5EBE1] text-[#2F855A] flex items-center justify-center font-extrabold text-xs border border-[#CBE5D7] hover:border-[#2F855A] shadow-2xs cursor-pointer transition select-none"
                title={!isLoggedIn || role === 'admin' ? 'Not Signed In' : (userProfile?.fullName || (role === 'trainee' ? 'Dr. Ananya Roy' : 'Max Hospital'))}
              >
                {isLoggedIn && role !== 'admin' ? (
                  getProfileInitials(userProfile?.fullName || (role === 'trainee' ? 'Dr. Ananya Roy' : 'Max Hospital'))
                ) : (
                  <User className="w-4 h-4 text-[#2F855A]" />
                )}
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#EBE4DB] rounded-3xl shadow-xl p-3 z-50 space-y-2.5"
                  >
                    {/* Profile Header: Empty Profile when logged out vs Doctor Details when logged in */}
                    {isLoggedIn ? (
                      <div className="bg-[#EBF7F1] p-3 rounded-2xl border border-[#CBE5D7]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#2F855A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {getProfileInitials(userProfile?.fullName || (role === 'trainee' ? 'Dr. Ananya Roy' : role === 'hospital' ? 'Max Hospital' : 'System Admin'))}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                              {userProfile?.fullName || (role === 'trainee' ? 'Dr. Ananya Roy' : role === 'hospital' ? 'Max Super Speciality' : 'System Administrator')}
                            </h4>
                            <p className="text-[10px] text-[#2F855A] font-bold">
                              {userProfile?.email || (role === 'trainee' ? 'MBBS • MCI-2022-77142' : role === 'hospital' ? 'Certified Partner Training Hospital' : 'DMHCA Platform Coordinator')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-2xs">
                            <User className="w-4.5 h-4.5 text-slate-500" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800 font-heading">
                              Welcome
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold">
                              Sign in or create an account
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile Menu Links */}
                    <div className="space-y-1">
                      {isLoggedIn && role === 'trainee' && (
                        <>
                          <button
                            onClick={() => { setActiveTab('dashboard'); setProfileDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${activeTab === 'dashboard' ? 'bg-[#E2F0EA] text-[#2F855A]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#2F855A]" />
                            <span>My Trainee Dashboard</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('certification'); setProfileDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${activeTab === 'certification' ? 'bg-[#E2F0EA] text-[#2F855A]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <Award className="w-4 h-4 text-[#2F855A]" />
                            <span>Verification & Certificates</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); router.push('/departments'); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-left"
                          >
                            <CalendarCheck className="w-4 h-4 text-[#2F855A]" />
                            <span>Book New Rotation</span>
                          </button>
                        </>
                      )}

                      {isLoggedIn && role === 'hospital' && (
                        <>
                          <button
                            onClick={() => { setActiveTab('hospital-portal'); setProfileDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${activeTab === 'hospital-portal' ? 'bg-[#E2F0EA] text-[#2F855A]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <Building2 className="w-4 h-4 text-[#2F855A]" />
                            <span>Hospital Portal Dashboard</span>
                          </button>
                        </>
                      )}

                      {isLoggedIn && role === 'admin' && (
                        <>
                          <button
                            onClick={() => { setActiveTab('admin'); setProfileDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${activeTab === 'admin' ? 'bg-[#E2F0EA] text-[#2F855A]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <ShieldCheck className="w-4 h-4 text-[#2F855A]" />
                            <span>Admin Control Panel</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('automation'); setProfileDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${activeTab === 'automation' ? 'bg-[#E2F0EA] text-[#2F855A]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <Zap className="w-4 h-4 text-[#2F855A]" />
                            <span>Automation Center</span>
                          </button>
                        </>
                      )}

                      {/* Auth Conditional Button: Log Out if logged in, Sign In / Sign Up if logged out */}
                      {!isLoggedIn ? (
                        <button
                          onClick={() => { openAuthModal('login'); setProfileDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-[#2F855A] bg-[#EBF7F1] hover:bg-[#E2F0EA] transition text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-[#2F855A]" />
                          <span>Sign In / Sign Up</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 transition text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Log Out</span>
                        </button>
                      )}
                    </div>

                    {/* Role Mode Indicator (Only when logged in) */}
                    {isLoggedIn && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="px-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Account Type: <strong className="text-[#2F855A]">{role === 'trainee' ? 'Trainee Doctor' : role === 'hospital' ? 'Hospital Partner' : 'System Admin'}</strong>
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Action Button for Trainees / Guest */}
            {(!isLoggedIn || role === 'trainee') && (
              <button
                onClick={() => router.push('/departments')}
                className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-[#2F855A]/25 cursor-pointer transition"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Rotation</span>
              </button>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div ref={mobileMenuRef} className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full bg-white text-slate-700 border border-[#EBE4DB]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#EBE4DB] px-4 py-4 space-y-4 shadow-xl"
          >
            {/* Active Account Indicator in Mobile */}
            <div className="bg-[#EBF7F1] p-3 rounded-2xl border border-[#CBE5D7]">
              {isLoggedIn && (
                <span className="text-[10px] font-extrabold text-[#2F855A] uppercase tracking-wider block">
                  {role === 'trainee' ? 'Trainee Doctor Account' : role === 'hospital' ? 'Hospital Partner Account' : 'System Admin Account'}
                </span>
              )}
              <span className="text-xs font-extrabold text-slate-900 font-heading">
                {!isLoggedIn ? 'Not Signed In' : (userProfile?.fullName || (role === 'trainee' ? 'Dr. Ananya Roy' : role === 'hospital' ? 'Max Hospital Partner' : 'System Administrator'))}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold text-left ${activeTab === item.id ? 'bg-[#E2F0EA] text-[#3D7A5C]' : 'bg-[#EBF7F1] text-slate-700'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {isLoggedIn && role === 'trainee' && (
                <>
                  <button
                    onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                    className="p-3 rounded-xl text-xs font-bold text-left bg-slate-100 text-slate-800"
                  >
                    My Dashboard
                  </button>
                  <button
                    onClick={() => { setActiveTab('certification'); setMobileMenuOpen(false); }}
                    className="p-3 rounded-xl text-xs font-bold text-left bg-slate-100 text-slate-800"
                  >
                    Certificates
                  </button>
                </>
              )}

              {!isLoggedIn ? (
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="col-span-2 p-3.5 rounded-xl text-xs font-extrabold text-white bg-[#2F855A] hover:bg-[#276749] flex items-center justify-center gap-2 shadow-md cursor-pointer mt-1"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>Sign In / Sign Up</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="col-span-2 p-3.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 shadow-md cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
