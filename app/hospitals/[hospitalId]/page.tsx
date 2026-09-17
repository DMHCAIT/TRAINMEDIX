'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '../../../src/context/AppContext';
import { DEPARTMENTS } from '../../../src/data/mockData';
import { Department } from '../../../src/types';
import { getSubCategoryUrl, toSlug } from '../../../src/utils/subCategoryUtils';
import {
  ArrowLeft,
  MapPin,
  Star,
  CheckCircle2,
  CalendarCheck,
  Stethoscope,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    hospitals,
    slots,
    setSelectedHospital,
    setSelectedDepartment,
    setSelectedSpecialization,
    setSelectedCity,
    setActiveTab
  } = useApp();

  const hospitalId = params?.hospitalId as string;

  // Find hospital by name-based slug (e.g. /hospitals/dharma-diabetic-centre) or fallback to ID
  const hospital = hospitals.find(
    (h) => toSlug(h.name) === hospitalId || h.id === hospitalId
  );

  // Get departments offered at this hospital (MUST be before early return - React Hooks Rule)
  const hospitalDepartments = React.useMemo(() => {
    if (!hospital || !hospital.departments || !Array.isArray(hospital.departments)) {
      return [];
    }
    return DEPARTMENTS.filter((dept) =>
      hospital.departments.includes(dept.id) || hospital.departments.includes(dept.code)
    );
  }, [hospital]);

  // Compute exact program cards offered (MUST be before early return - React Hooks Rule)
  const programCards = React.useMemo(() => {
    if (!hospital) return [];
    
    if (hospital.offeredDepartments && Object.keys(hospital.offeredDepartments).length > 0) {
      if (hospital.offeredDepartments['All Departments'] || hospital.offeredDepartments['All Department']) {
        return DEPARTMENTS.flatMap((dept) =>
          (dept.subDepartments || []).map((subName) => ({
            dept,
            deptName: dept.name,
            subName
          }))
        );
      }

      return Object.entries(hospital.offeredDepartments).flatMap(([deptTitle, specs]) => {
        const matchedDept = DEPARTMENTS.find(
          (d) =>
            d.name.toLowerCase() === deptTitle.toLowerCase() ||
            d.name.toLowerCase().includes(deptTitle.toLowerCase()) ||
            deptTitle.toLowerCase().includes(d.name.toLowerCase())
        );

        const deptObj: Department = matchedDept || {
          id: 'dept-general',
          name: deptTitle,
          code: 'CLINICAL',
          description: `${deptTitle} specialized clinical training program.`,
          availableCities: [hospital.city || 'Unknown'],
          subDepartments: specs,
          hospitalsCount: 1,
          iconName: 'Stethoscope',
          featured: false,
          baseFeePerMonth: 45000,
          clinicalHighlights: ['Patient care', 'DMHCA certification'],
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
        };

        return specs.map((subName) => ({
          dept: deptObj,
          deptName: deptTitle,
          subName
        }));
      });
    }

    return hospitalDepartments.flatMap((dept) =>
      (dept.subDepartments || []).map((subName) => ({
        dept,
        deptName: dept.name,
        subName
      }))
    );
  }, [hospital, hospitalDepartments]);

  // Get open training slots for this hospital
  const hospitalSlots = React.useMemo(() => {
    if (!hospital) return [];
    return slots.filter(
      (s) => s.hospitalId === hospital.id || s.city === hospital.city
    );
  }, [hospital, slots]);

  // Early return if hospital not found (NOW safe - all hooks called above)
  if (!hospital) {
    return (
      <div className="min-h-screen py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Hospital Center Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested partner hospital could not be located.</p>
        <button
          onClick={() => router.push('/hospitals')}
          className="bg-[#3597A4] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Return to Hospital Network
        </button>
      </div>
    );
  }

  const handleBookSpecialization = (dept: any, subName: string) => {
    setSelectedHospital(hospital);
    setSelectedCity((hospital.city ?? hospital.cities?.[0] ?? 'All') as any);
    setSelectedDepartment(dept);
    setSelectedSpecialization(subName);
    setActiveTab('departments');
  };

  return (
    <div className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

      {/* Back Button Navigation */}
      <div>
        <button
          onClick={() => router.push('/hospitals')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#3597A4] transition cursor-pointer bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#E6F4F6] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hospital Network</span>
        </button>
      </div>

      {/* Hospital Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl overflow-hidden border border-[#E6F4F6] shadow-xl bg-white grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] bg-slate-100 overflow-hidden">
          <img
            src={hospital.image}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />

          <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-amber-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-xs">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {hospital.rating} Rating
          </span>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#E6F4F6] text-[#3597A4] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-[#E6F4F6]">
                Trainmedix Certified Training Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight">
              {hospital.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#3597A4] shrink-0" />
              {(hospital.cities || [hospital.city]).join(', ')}
            </p>

            {hospital.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-normal">
                {hospital.description}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-[#E6F4F6] p-3 rounded-2xl border border-[#E6F4F6]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Available Slots</span>
              <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1 font-heading">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {hospital.availableSlotsCount} Open Slots
              </span>
            </div>

            <button
              onClick={() => router.push('/departments')}
              className="bg-[#3597A4] hover:bg-[#1F6F76] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#3597A4]/25 cursor-pointer shrink-0"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Rotation</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* CLINICAL HIGHLIGHTS (FULL WIDTH) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6F4F6] shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E6F4F6] text-[#3597A4] flex items-center justify-center border border-[#E6F4F6] shrink-0">
            <Award className="w-4 h-4 text-[#3597A4]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#3597A4] uppercase tracking-wide font-heading">
              Key Institutional Strengths
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {(hospital.clinicalHighlights || [
            'Comprehensive multidisciplinary healthcare services',
            'Modern diagnostic and treatment facilities',
            'Experienced medical and surgical specialists',
            'Quality emergency and critical care support'
          ]).map((highlight, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-[#E6F4F6]/70 p-3.5 rounded-2xl border border-[#E6F4F6]/70 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#3597A4] shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800 leading-snug">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SPECIALIZATIONS — listed per Sub-Department with category badge */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#3597A4] uppercase tracking-wider block font-heading">
              Clinical Specializations Offered
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Training Programs at {hospital.name}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {programCards.length} Available Specializations
          </span>
        </div>

        {programCards.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-200 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-700">No active specialization programs configured yet</h4>
            <p className="text-xs text-slate-500 font-medium">Please contact hospital administration or check back soon for updated rotation slots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programCards.map(({ dept, deptName, subName }, sIdx) => {
              const subUrl = getSubCategoryUrl(dept, subName);
              return (
                <div
                  key={`${dept.id}-${subName}-${sIdx}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6F4F6] shadow-xs hover:shadow-md hover:border-[#3597A4] text-left transition group flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    {/* Category Badge */}
                    <span className="inline-flex items-center gap-1 bg-[#E6F4F6] text-[#3597A4] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-[#E6F4F6]">
                      <Stethoscope className="w-3 h-3" />
                      {dept.code || 'CLINICAL'} ({deptName})
                    </span>

                    {/* Sub-Department Name (Primary) */}
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-heading leading-snug">
                        {subName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                        Clinical exposure & DMHCA certified logbook evaluation.
                      </p>
                    </div>
                  </div>

                  {/* Fee & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#3597A4] font-heading">
                        ₹{(dept.baseFeePerMonth || 45000).toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(subUrl)}
                        className="text-[11px] text-[#3597A4] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>View details</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookSpecialization(dept, subName)}
                      className="w-full bg-[#3597A4] hover:bg-[#1F6F76] text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Check Availability</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Slots at this Hospital */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            Open Rotation Slots at {hospital.name}
          </h2>
          <span className="text-xs font-bold text-[#3597A4]">{hospitalSlots.length} Active Slots</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitalSlots.map((slot) => {
            const slotDept = DEPARTMENTS.find(d => d.id === slot.departmentId);
            return (
              <div key={slot.id} className="bg-white p-5 rounded-3xl border border-[#E6F4F6] shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Category badge */}
                  {slotDept && (
                    <span className="inline-flex items-center gap-1 bg-[#E6F4F6] text-[#3597A4] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-[#E6F4F6]">
                      <Stethoscope className="w-3 h-3" />
                      {slotDept.code}
                    </span>
                  )}
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {slot.status}
                  </span>
                </div>

                <div>
                  {/* Sub-department as primary title */}
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                    {slot.subDepartment || slotDept?.name || 'Clinical Specialty Rotation'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#3597A4]" />
                      Starts {slot.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3 text-[#3597A4]" />
                      {slot.duration}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 font-heading">
                    ₹{slot.monthlyFee.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-semibold">/mo</span>
                  </span>
                  <button
                    onClick={() => handleBookSpecialization(slotDept, slot.subDepartment || '')}
                    className="bg-[#3597A4] hover:bg-[#1F6F76] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
