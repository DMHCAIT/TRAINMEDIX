'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

import {
  Building2,
  Clock,
  CalendarCheck,
  Search,
  Filter,
  Activity,
  HeartPulse,
  Stethoscope,
  Scan,
  Baby,
  ShieldPlus,
  Bone,
  Sparkles,
  Users,
  Ear,
  Crosshair,
  CheckCircle2,
  Zap,
  ChevronRight,
  Layers,
  Brain
} from 'lucide-react';
import { CITIES } from '../../data/mockData';
import type { CityName, Department } from '../../types';
import { SubCategoryModal } from './SubCategoryModal';
import { CustomSelect } from '../common/CustomSelect';

export const DepartmentCatalog: React.FC = () => {
  const router = useRouter();
  const {
    departments,
    selectedCity,
    setActiveTab,
    setSelectedDepartment,
    startBookingForDepartment,
    role
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState<CityName | 'All'>('All');
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  // Sub-Category Pop-Up Modal State
  const [modalDepartment, setModalDepartment] = useState<Department | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const handleOpenSubCategories = (dept: Department) => {
    setModalDepartment(dept);
    setIsSubModalOpen(true);
  };

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return Activity;
      case 'HeartPulse': return HeartPulse;
      case 'Stethoscope': return Stethoscope;
      case 'Scan': return Scan;
      case 'Baby': return Baby;
      case 'ShieldPlus': return ShieldPlus;
      case 'Bone': return Bone;
      case 'Sparkles': return Sparkles;
      case 'Users': return Users;
      case 'Ear': return Ear;
      case 'Crosshair': return Crosshair;
      case 'Brain': return Brain;
      case 'Zap': return Zap;
      default: return Building2;
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity =
      filterCity === 'All' ||
      filterCity === 'Other' ||
      dept.availableCities.some(c => c.toLowerCase().includes(filterCity.toLowerCase()));

    return matchesSearch && matchesCity;
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCity, customCityText]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleDepartments = filteredDepartments.slice(startIndex, endIndex);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section className="pt-2 sm:pt-4 pb-10 sm:pb-14 bg-gradient-to-b from-[#F0F8F4] via-[#EBF7F1]/50 to-slate-50 relative overflow-hidden">
      {/* Background Ambient Mesh Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2F855A]/8 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#2F855A]/8 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10 z-10">

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-4"
        >
        <div className="inline-flex items-center gap-2 bg-[#E2F0EA] border border-[#BBE2D1] text-[#2F855A] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
          <Building2 className="w-4 h-4 text-[#2F855A] animate-pulse" />
          <span>Department-Wise Clinical Rotations</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Explore Clinical Training <span className="gradient-text-blue">Departments</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Choose your specialty rotation from DMHCA accredited departments across partner tertiary hospitals.
        </p>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl max-w-4xl mx-auto border border-slate-200/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department (e.g. Emergency Medicine, Cardiology, Surgery...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 border border-slate-300/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2F855A] focus:ring-2 focus:ring-[#2F855A]/20 focus:outline-none touch-target transition shadow-2xs font-medium"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <CustomSelect
              value={isOtherCity || (filterCity !== 'All' && !CITIES.includes(filterCity as any)) ? 'Other' : filterCity}
              onChange={(val) => {
                if (val === 'Other') {
                  setIsOtherCity(true);
                  setFilterCity(customCityText.trim() || 'Other');
                } else {
                  setIsOtherCity(false);
                  setFilterCity(val as CityName | 'All');
                }
              }}
              options={[
                { value: 'All', label: 'Filter by City (All India)' },
                ...CITIES.map((c) => ({ value: c, label: c })),
                { value: 'Other', label: 'Other (Specify City)' },
              ]}
              icon={<Filter className="w-4 h-4" />}
            />
            {(isOtherCity || filterCity === 'Other' || (!CITIES.includes(filterCity as any) && filterCity !== 'All')) && (
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
                    setFilterCity(e.target.value.trim() || 'Other');
                  }}
                  className="w-full bg-white border border-[#2F855A] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-xs"
                />
              </motion.div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Department Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        <AnimatePresence>
          {visibleDepartments.map((dept) => {
            const IconComponent = getDepartmentIcon(dept.iconName);

            return (
              <motion.div
                key={dept.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => handleOpenSubCategories(dept)}
              >
                <div>
                  {/* Realistic Visual Image Header */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={dept.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'}
                      alt={dept.name}
                      className="w-full h-full object-cover brightness-105 saturate-110 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Subtle bottom-only gradient for title contrast without dulling the main photo */}
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent pointer-events-none" />

                    {/* Top Accreditation & Status Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className="bg-white/95 backdrop-blur-md text-[#2F855A] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase shadow-sm border border-white/40">
                        DMHCA Accredited
                      </span>
                      {dept.featured && (
                        <span className="bg-[#2F855A] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-white" />
                          High Demand
                        </span>
                      )}
                    </div>

                    {/* Bottom Image Overlay: Department Name & Code */}
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shrink-0 shadow-md">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white font-heading tracking-tight drop-shadow-sm leading-tight group-hover:text-emerald-200 transition-colors">
                          {dept.name}
                        </h3>
                        <p className="text-[11px] text-emerald-200 font-extrabold font-mono tracking-wider">
                          CODE: {dept.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                      {dept.description}
                    </p>

                    {/* Sub-Departments Tags - Hidden, only show in modal when clicking View Specializations */}



                    {/* Key Specs Bar Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">Partner Hospitals</span>
                        <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 font-heading">
                          <Building2 className="w-3.5 h-3.5 text-[#2F855A]" />
                          {dept.hospitalsCount} Available
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">Duration Options</span>
                        <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 font-heading">
                          <Clock className="w-3.5 h-3.5 text-[#2F855A]" />
                          {dept.durationOptions?.map(opt => opt.split(' ')[0]).join('/') || '1/3/6'} Months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer & Action */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSubCategories(dept);
                    }}
                    className="text-[#2F855A] hover:text-[#276749] font-extrabold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>View Specializations({dept.subDepartments?.length || 0})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {role === 'trainee' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDepartment(dept);
                        router.push('/booking');
                      }}
                      className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-[#2F855A]/25 touch-target cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Book Training</span>
                    </motion.button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 py-6 sm:py-8"
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-slate-200 text-slate-700 hover:bg-slate-300 enabled:hover:shadow-md"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium text-sm">
              Page <span className="font-bold text-[#2F855A]">{currentPage}</span> of <span className="font-bold text-[#2F855A]">{totalPages}</span>
            </span>
            <span className="text-slate-500 text-xs">({filteredDepartments.length} total)</span>
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-[#2F855A] text-white hover:bg-[#276749] enabled:hover:shadow-md"
          >
            Next →
          </button>
        </motion.div>
      )}

      {/* Sub-Category Pop-Up Window Modal */}
      <SubCategoryModal
        department={modalDepartment}
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />

      </div>
    </section>
  );
};
