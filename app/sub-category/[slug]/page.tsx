'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '../../../src/context/AppContext';
import { getSubCategoryDetailBySlug } from '../../../src/utils/subCategoryUtils';
import {
  ArrowLeft,
  Building2,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function SubCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    hospitals,
    slots,
    setSelectedDepartment,
    setSelectedSpecialization,
    setSelectedHospital,
    setSelectedCity,
    setActiveTab
  } = useApp();

  const slug = params?.slug as string;
  const subCategory = getSubCategoryDetailBySlug(slug);

  React.useEffect(() => {
    if (subCategory) {
      const code = subCategory.parentDepartment.code || subCategory.parentDepartment.id.replace('dept-', '').toUpperCase();
      router.replace(`/departments/${code}/${subCategory.slug}`);
    }
  }, [subCategory, router]);

  if (!subCategory) {
    return (
      <div className="min-h-screen py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Specialization Program Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested specialization program could not be located.</p>
        <button
          onClick={() => router.push('/departments')}
          className="bg-[#2F855A] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Return to All Departments
        </button>
      </div>
    );
  }

  const parentDept = subCategory.parentDepartment;
  const affiliatedHospitals = hospitals.filter(h => {
    if (h.offeredDepartments) {
      return Object.entries(h.offeredDepartments).some(([deptName, specs]) => {
        return (
          deptName.toLowerCase() === parentDept.name.toLowerCase() ||
          specs.some(s => s.toLowerCase() === subCategory.name.toLowerCase() || s === 'All Department')
        );
      });
    }
    return h.departments.includes(parentDept.id);
  });
  const availableCitiesList = Array.from(new Set(affiliatedHospitals.map(h => h.city))).filter(Boolean);
  const displayCities = availableCitiesList.length > 0 ? availableCitiesList : parentDept.availableCities;
  const categorySlots = slots.filter(s => s.departmentId === parentDept.id);

  const handleStartBooking = () => {
    setSelectedDepartment(parentDept);
    setSelectedSpecialization(subCategory.name);
    setSelectedHospital(null);
    setSelectedCity('All');
    setActiveTab('departments');
  };

  const handleHospitalBooking = (hosp: any) => {
    setSelectedDepartment(parentDept);
    setSelectedSpecialization(subCategory.name);
    setSelectedHospital(hosp);
    setSelectedCity(hosp.city);
    setActiveTab('departments');
  };

  return (
    <div className="min-h-screen pt-4 sm:pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

      {/* Back Navigation */}
      <div>
        <button
          onClick={() => router.push('/departments')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#2F855A] transition cursor-pointer bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#CBE5D7] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clinical Departments</span>
        </button>
      </div>

      {/* Sub-Category Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#2F855A] via-[#276749] to-[#1E4D36] text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full filter blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                Department: {parentDept.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
              {subCategory.name} Clinical Rotation
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-3xl">
              Specialized clinical rotation in <strong>{subCategory.name}</strong> under the <strong>{parentDept.name}</strong> department. Includes patient exposure, procedural skills, case logbook signatures, and official DMHCA certification.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-white/90">
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>{affiliatedHospitals.length} Affiliated Hospitals</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>{displayCities.length} Cities</span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] text-slate-900 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-heading">
                Program Fee
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-[#2F855A] font-heading">
                  ₹{parentDept.baseFeePerMonth.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ Month</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Specialized clinical training with dedicated hospital supervision.
            </p>

            <button
              onClick={handleStartBooking}
              className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book {subCategory.name} Rotation</span>
            </button>
          </div>

        </div>
      </motion.div>


      {/* Content Grid & Responsive Mobile Stacking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Column (Mobile Order Controls + Desktop Left 8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-8">

          {/* 1. Clinical Competencies (Highlights) - Mobile Order 1 */}
          <div className="order-1 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2F855A]" />
                Specialized Procedural Skills in {subCategory.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Core clinical competencies and practical case management covered during rotation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parentDept.clinicalHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="w-5 h-5 rounded-full bg-[#E2F0EA] text-[#2F855A] flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-slate-800">{hl}</span>
                </div>
              ))}
            </div>
          </div>


          {/* 2. Available Cities (Mobile Insert: Order 2 on Mobile, Hidden on Desktop) */}
          <div className="order-2 lg:hidden bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2F855A]" />
              Available Cities ({displayCities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayCities.map((city) => (
                <span
                  key={city}
                  className="bg-[#EBF7F1] text-[#2F855A] border border-[#CBE5D7] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{city}</span>
                </span>
              ))}
            </div>
          </div>


          {/* 3. Active Slots (Mobile Insert: Order 3 on Mobile, Hidden on Desktop) */}
          <div className="order-3 lg:hidden bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#2F855A]" />
              Active Slots ({categorySlots.length})
            </h4>

            {categorySlots.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">
                Click "Book Rotation" to request customized training dates.
              </p>
            ) : (
              <div className="space-y-3">
                {categorySlots.map((slot) => {
                  const parentHosp = hospitals.find(h => h.id === slot.hospitalId);
                  return (
                    <div key={slot.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{parentHosp?.name || 'Partner Hospital'}</span>
                        <span className="text-[10px] font-extrabold bg-[#2F855A] text-white px-2 py-0.5 rounded-full">
                          {slot.duration}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium flex items-center justify-between">
                        <span>{slot.city}</span>
                        <span className="text-[#2F855A] font-bold">{slot.availableSeats} Seats Left</span>
                      </div>
                      <button
                        onClick={handleStartBooking}
                        className="w-full bg-[#2F855A] text-white font-bold text-xs py-2 rounded-xl transition hover:bg-[#276749] cursor-pointer"
                      >
                        Book {subCategory.name} Slot
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* 4. Affiliated Hospitals - Mobile Order 4 */}
          <div className="order-4 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2F855A]" />
                Affiliated Hospitals for {subCategory.name} ({affiliatedHospitals.length})
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Partner clinical centers providing training in this category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {affiliatedHospitals.map((hosp) => (
                <div key={hosp.id} className="bg-slate-50 rounded-2xl border border-[#CBE5D7] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2.5 py-0.5 rounded-full">
                      {hosp.city}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 font-heading leading-tight">{hosp.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{hosp.address}</p>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                      <span>⭐ {hosp.rating} Rating</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartBooking}
                    className="w-full bg-white hover:bg-[#2F855A] text-slate-900 hover:text-white border border-[#2F855A] font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Check Open Slots</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>


        {/* Desktop-Only Right Sidebar (lg:col-span-4): Available Cities & Active Slots */}
        <div className="hidden lg:block lg:col-span-4 space-y-8">

          {/* Available Cities (Desktop) */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2F855A]" />
              Available Cities ({displayCities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayCities.map((city) => (
                <span
                  key={city}
                  className="bg-[#EBF7F1] text-[#2F855A] border border-[#CBE5D7] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{city}</span>
                </span>
              ))}
            </div>
          </div>


          {/* Active Slots (Desktop) */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#2F855A]" />
              Active Slots ({categorySlots.length})
            </h4>

            {categorySlots.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">
                Click "Book Rotation" to request customized training dates.
              </p>
            ) : (
              <div className="space-y-3">
                {categorySlots.map((slot) => {
                  const parentHosp = hospitals.find(h => h.id === slot.hospitalId);
                  return (
                    <div key={slot.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{parentHosp?.name || 'Partner Hospital'}</span>
                        <span className="text-[10px] font-extrabold bg-[#2F855A] text-white px-2 py-0.5 rounded-full">
                          {slot.duration}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium flex items-center justify-between">
                        <span>{slot.city}</span>
                        <span className="text-[#2F855A] font-bold">{slot.availableSeats} Seats Left</span>
                      </div>
                      <button
                        onClick={handleStartBooking}
                        className="w-full bg-[#2F855A] text-white font-bold text-xs py-2 rounded-xl transition hover:bg-[#276749] cursor-pointer"
                      >
                        Book {subCategory.name} Slot
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
