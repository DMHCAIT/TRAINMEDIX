'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

interface AdminLoginPageProps {
  onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const { setIsLoggedIn, setUserProfile, setRole, setActiveTab } = useApp();
  const [email, setEmail] = useState('admin@trainmedix.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API login endpoint
      const res = await apiService.login(email || 'admin@trainmedix.com', 'admin');
      if (res.success && res.user) {
        const session = await apiService.createAdminSession(res.user.email, password, res.user.fullName);
        if (!session.success) {
          throw new Error(session.error || 'Failed to create admin session');
        }
        setIsLoggedIn(true);
        setUserProfile(res.user);
        setRole('admin');
        // 💾 Persist admin session to localStorage for 24 hours
        localStorage.setItem('admin_auth', JSON.stringify({
          isAuthenticated: true,
          email: res.user.email,
          timestamp: Date.now()
        }));
        localStorage.setItem('admin_authenticated', 'true');
        setIsLoading(false);
        onSuccess();
        return;
      }
    } catch (err) {
      console.warn('Backend login fallback active:', err);
    }

    // Local authentication fallback for admin panel
    setTimeout(async () => {
      const session = await apiService.createAdminSession(email || 'admin@trainmedix.com', password, 'System Administrator');
      if (!session.success) {
        setError(session.error || 'Invalid admin credentials.');
        setIsLoading(false);
        return;
      }
      setIsLoggedIn(true);
      setUserProfile({
        fullName: 'System Administrator',
        email: email || 'admin@trainmedix.com',
        phone: '+91 99999 00000',
        interests: ['Platform Administration'],
        role: 'admin'
      });
      setRole('admin');
      // 💾 Persist admin session to localStorage for 24 hours
      localStorage.setItem('admin_auth', JSON.stringify({
        isAuthenticated: true,
        email: email || 'admin@trainmedix.com',
        timestamp: Date.now()
      }));
      localStorage.setItem('admin_authenticated', 'true');
      setIsLoading(false);
      onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-gradient-to-b from-[#EBF7F1] via-slate-50 to-slate-100 flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* Decorative Emerald Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2F855A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#2F855A]/10 rounded-full blur-2xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        
        {/* Top Header Badge & Lock Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#E2F0EA] border-2 border-[#CBE5D7] text-[#2F855A] flex items-center justify-center mx-auto shadow-lg shadow-[#2F855A]/10">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-600 font-bold mt-1 tracking-wide">
              DMHCA Content & Platform Management System
            </p>
          </div>
        </div>

        {/* Clean Modern Login Form Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-[#CBE5D7] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Admin Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-slate-50/80 border border-slate-300/80 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2F855A] focus:ring-2 focus:ring-[#2F855A]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Access Admin Panel Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition shadow-lg shadow-[#2F855A]/25 flex items-center justify-center gap-2 cursor-pointer touch-target mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

          </form>

          {/* Back to Website Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setActiveTab('home');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2F855A] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
          </div>

        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#2F855A]" />
          <span>DMHCA Encrypted Administrative Session</span>
        </div>

      </motion.div>

    </div>
  );
};
