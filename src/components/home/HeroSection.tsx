'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Play,
  CheckCheck,
  Search
} from 'lucide-react';
import { CITIES } from '../../data/mockData';
import type { CityName, DurationOption } from '../../types';
import { CustomSelect } from '../common/CustomSelect';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const {
    departments,
    selectedCity,
    setSelectedCity,
    selectedDepartment,
    setSelectedDepartment,
    setSelectedDuration,
    setActiveTab
  } = useApp();

  const [duration, setDuration] = useState<DurationOption>('3 Months');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  const handleHeroSearch = () => {
    setSelectedDuration(duration);
    setActiveTab('departments');
  };

  return (
    <section className="relative w-full -mt-20 pt-28 pb-16 overflow-hidden bg-[#E6F4F6]">

      {/* Soft Ambient Background Blobs (Corner-to-Corner Canvas matching references) */}
      <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-[#C6EAD7]/50 via-[#D8F2E3]/30 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#3597A4]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#3597A4]/08 rounded-full filter blur-3xl pointer-events-none" />

      {/* Main Full-Bleed Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Content Area (7 Cols) */}
          <div className="lg:col-span-7 space-y-7 z-10 pt-4">

            {/* DMHCA Platform Badge Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-[#E6F4F6] border border-[#E6F4F6] text-[#3597A4] text-xs font-extrabold px-4 py-2 rounded-full shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#3597A4] animate-pulse" />
              <span className="tracking-wide uppercase text-[11px]">Certified Clinical Training Platform by DMHCA</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1F1C18] tracking-tight leading-[1.08] font-heading">
                <span className="gradient-text-periwinkle block">Hospital &</span>
                <span className="gradient-text-bronze block">Clinical Training</span>
                <span className="text-[#1F1C18] block">Rotations</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-xl pt-3 leading-relaxed font-medium">
                Book clinical exposure with certified medical specialists in top DMHCA-accredited tertiary hospitals across India.
              </p>
            </motion.div>

            {/* Pill CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/departments')}
                className="group bg-[#3597A4] hover:bg-[#1F6F76] text-white font-bold text-sm sm:text-base px-3 py-2.5 pr-7 rounded-full shadow-lg shadow-[#3597A4]/30 flex items-center gap-3 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white text-[#3597A4] flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span>Book Clinical Rotation</span>
              </motion.button>

              <button
                onClick={() => setActiveTab('departments')}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-[#3597A4] px-5 py-3 rounded-full hover:bg-slate-100/80 transition cursor-pointer"
              >
                Explore Specialties →
              </button>
            </motion.div>

            {/* Floating Chat & Voice Note Widgets */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="pt-4 space-y-3 max-w-lg"
            >
              {/* Chat Pill 1 */}
              <div className="flex items-center gap-3">
                <div className="bg-[#F0EBE4] text-[#1F1C18] text-xs font-semibold px-4 py-2.5 rounded-2xl rounded-bl-xs border border-[#E3D9CC] shadow-2xs flex items-center gap-2">
                  <span>Greetings 👋 How can I book Cardiology rotation?</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-1">10:57 AM</span>
                </div>
              </div>

              {/* Chat Pill 2 */}
              <div className="flex items-center gap-3 pl-6">
                <div className="bg-[#E6F4F6] text-[#3597A4] text-xs font-semibold px-4 py-2.5 rounded-2xl rounded-tl-xs border border-[#E6F4F6] shadow-2xs flex items-center gap-2">
                  <span>Select hospital & duration for instant DMHCA slot 🏥</span>
                  <span className="text-[10px] text-[#3597A4] font-mono ml-1">11:34 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#3597A4]" />
                </div>
              </div>

              {/* Voice Note Player */}
              <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-[#E6F4F6] rounded-2xl px-4 py-2.5 shadow-md">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-8 h-8 rounded-full bg-[#3597A4] text-white flex items-center justify-center hover:scale-105 transition cursor-pointer shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 fill-white ml-0.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </button>

                <div className="flex items-center gap-1">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70, 40].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h * 0.22}px` }}
                      className={`w-1 rounded-full ${i < 6 ? 'bg-[#3597A4]' : 'bg-[#E6F4F6]'}`}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-mono font-bold text-slate-600 ml-1">0:32</span>
                <span className="text-[9px] text-slate-400 font-mono">12:11 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-[#3597A4]" />
              </div>

            </motion.div>

          </div>

          {/* Right Visual Area (5 Cols - Full-height Doctor Image with Organic Shape Backdrop) */}
          <div className="lg:col-span-5 relative flex justify-center items-end min-h-[490px]">

            {/* Organic Circle/Blob Backdrop (Matching BdHealth & Medicate reference images) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[460px] h-[460px] sm:w-[520px] sm:h-[520px] lg:w-[540px] lg:h-[540px] bg-[#3597A4] rounded-full filter blur-0 opacity-95 transition-all duration-500 shadow-xl"
              style={{
                borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%'
              }}
            />

            {/* Doctor Image */}
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
              alt="Hospital Chief Doctor Specialist"
              className="relative z-10 w-full max-w-[390px] h-[480px] object-cover object-top"
            />

            {/* Top Mentor Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="absolute top-10 left-2 z-20 bg-white/95 backdrop-blur-md p-2 pr-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-2.5"
            >
              <img
                src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80"
                alt="Dr. Mentor"
                className="w-9 h-9 rounded-xl object-cover"
              />
              <div>
                <p className="text-[11px] font-bold text-slate-900 leading-tight">Dr. Rajesh M.</p>
                <p className="text-[9px] text-[#3597A4] font-semibold">10:57 AM ✓✓</p>
              </div>
            </motion.div>

            {/* Bottom Right Doctor Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.6 }}
              className="absolute bottom-6 right-2 z-20 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3"
            >
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"
                alt="Dr. Stella"
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div className="pr-2">
                <div className="bg-[#3597A4] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg">
                  Dr. Stella
                </div>
                <p className="text-[9px] text-slate-500 font-semibold mt-1">Senior Consultant</p>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Quick Search & Slot Booking Bar - HIDDEN */}
        {false && (
        <div className="mt-12 pt-8 border-t border-[#E6F4F6] relative z-30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#E6F4F6] shadow-md relative z-30">

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-heading">
                1. Clinical Specialty
              </label>
              <CustomSelect
                value={selectedDepartment?.id || ''}
                onChange={(val) => {
                  const d = departments.find(item => item.id === val);
                  setSelectedDepartment(d || null);
                }}
                placeholder="Select Specialty (11 Available)"
                options={[
                  { value: '', label: 'Select Specialty' },
                  ...departments.map((d) => ({ value: d.id, label: `${d.name}` }))
                ]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-heading">
                2. Hospital Location
              </label>
              <CustomSelect
                value={isOtherCity || (selectedCity !== 'All' && !CITIES.includes(selectedCity as any)) ? 'Other' : selectedCity}
                onChange={(val) => {
                  if (val === 'Other') {
                    setIsOtherCity(true);
                    setSelectedCity(customCityText.trim() || 'Other');
                  } else {
                    setIsOtherCity(false);
                    setSelectedCity(val as CityName | 'All');
                  }
                }}
                options={[
                  { value: 'All', label: 'All Cities (India)' },
                  ...CITIES.map((c) => ({ value: c, label: c })),
                  { value: 'Other', label: 'Other (Specify City)' },
                ]}
              />
              {(isOtherCity || selectedCity === 'Other' || (!CITIES.includes(selectedCity as any) && selectedCity !== 'All')) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <input
                    type="text"
                    placeholder="Specify city (e.g. Pune, Patna)..."
                    value={customCityText}
                    onChange={(e) => {
                      setCustomCityText(e.target.value);
                      setSelectedCity(e.target.value.trim() || 'Other');
                    }}
                    className="w-full bg-white border border-[#3597A4] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3597A4]/20 shadow-xs"
                  />
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-heading">
                3. Rotation Duration
              </label>
              <CustomSelect
                value={duration}
                onChange={(val) => setDuration(val as DurationOption)}
                options={[
                  { value: '1 Month', label: '1 Month' },
                  { value: '3 Months', label: '3 Months' },
                  { value: '6 Months', label: '6 Months' },
                ]}
              />
            </div>

            <div>
              <label className="hidden lg:block text-[10px] font-extrabold text-transparent mb-1">Search</label>
              <button
                onClick={handleHeroSearch}
                className="w-full bg-[#3597A4] hover:bg-[#1F6F76] text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#3597A4]/25 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Check Open Hospital Slots</span>
              </button>
            </div>

          </div>
        </div>
        )}

        {/* Metrics Counter Bar */}
        <div className="mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-0 pt-4">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6F4F6] text-center shadow-2xs">
            <p className="text-2xl sm:text-3xl font-black text-[#3597A4] font-heading">11+</p>
            <p className="text-xs text-slate-600 font-semibold">Accredited Departments</p>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6F4F6] text-center shadow-2xs">
            <p className="text-2xl sm:text-3xl font-black text-[#D97706] font-heading">50+</p>
            <p className="text-xs text-slate-600 font-semibold">Partner Hospitals</p>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6F4F6] text-center shadow-2xs">
            <p className="text-2xl sm:text-3xl font-black text-[#3597A4] font-heading">12,500+</p>
            <p className="text-xs text-slate-600 font-semibold">Certified Trainees</p>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6F4F6] text-center shadow-2xs">
            <p className="text-2xl sm:text-3xl font-black text-[#E11D48] font-heading">100%</p>
            <p className="text-xs text-slate-600 font-semibold">Real-World Exposure</p>
          </div>
        </div>

      </div>
    </section>
  );
};
