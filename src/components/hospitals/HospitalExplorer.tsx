'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Star, 
  CheckCircle2, 
  CalendarCheck,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import type { CityName } from '../../types';
import { CITIES } from '../../data/mockData';
import { toSlug } from '../../utils/subCategoryUtils';
import { CustomSelect } from '../common/CustomSelect';

export const HospitalExplorer: React.FC = () => {
  const router = useRouter();
  const { hospitals, selectedCity, setSelectedCity, setSelectedHospital, setBookingStep, setIsBookingOpen, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  const filteredHospitals = hospitals.filter((hosp) => {
    const matchesSearch = 
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.chiefMentor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = 
      selectedCity === 'All' || 
      selectedCity === 'Other' ||
      hosp.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      hosp.address.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  });

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScroll(filteredHospitals.length, 6);
  const visibleHospitals = filteredHospitals.slice(0, visibleCount);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-[#E2F0EA] border border-[#C5DED0] text-[#3D7A5C] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
          <Building2 className="w-4 h-4 text-[#2F855A] animate-pulse" />
          <span>Accredited Partner Hospital Network</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Explore Partner <span className="gradient-text-blue">Hospital Centres</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          TrainMedix connects healthcare professionals with top tertiary hospitals across India for supervised clinical exposure and real patient interaction.
        </p>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl max-w-4xl mx-auto border border-slate-200/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hospital name or location (e.g. Apollo, Fortis, Max...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 border border-slate-300/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2F855A] focus:ring-2 focus:ring-[#2F855A]/20 focus:outline-none touch-target transition shadow-2xs font-medium"
            />
          </div>
          <div className="relative">
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
                { value: 'All', label: 'All Metro Cities' },
                ...CITIES.map((c) => ({ value: c, label: c })),
                { value: 'Other', label: 'Other (Specify City)' },
              ]}
              icon={<Filter className="w-4 h-4" />}
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
                  className="w-full bg-white border border-[#2F855A] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-xs"
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hospital Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        <AnimatePresence>
          {visibleHospitals.map((hosp) => (
            <motion.div
              key={hosp.id}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => router.push(`/hospitals/${toSlug(hosp.name)}`)}
              className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Image & Accreditation Badge */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="w-full h-full object-cover brightness-105 saturate-110 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent pointer-events-none" />
                  <span className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md text-amber-800 font-bold text-xs px-3 py-1 rounded-xl border border-slate-200/80 flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {hosp.rating}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2F855A] transition font-heading">{hosp.name}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#2F855A] shrink-0" />
                      {hosp.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">Open Slots</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1 font-heading">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {hosp.availableSlotsCount} Slots
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hospitals/${toSlug(hosp.name)}`);
                  }}
                  className="w-full bg-[#EBF7F1] hover:bg-[#E2F0EA] text-[#2F855A] font-extrabold text-xs py-2.5 rounded-xl border border-[#CBE5D7] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHospital(hosp);
                    setSelectedCity(hosp.city);
                    setBookingStep(5);
                    setIsBookingOpen(true);
                    setActiveTab('booking');
                  }}
                  className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Rotation</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Infinite Scroll Sentinel & Loader */}
      <div ref={sentinelRef} className="flex justify-center py-6">
        <AnimatePresence>
          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs font-semibold text-slate-500">Loading more hospitals…</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
