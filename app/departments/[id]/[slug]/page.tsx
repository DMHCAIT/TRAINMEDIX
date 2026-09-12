'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '../../../../src/context/AppContext';
import { getSubCategoryDetailByDeptAndSlug, getSubCategoryUrl, toSlug } from '../../../../src/utils/subCategoryUtils';
import {
  ArrowLeft,
  Building2,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  Award,
  Layers,
  Star
} from 'lucide-react';

export default function DepartmentSubCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    hospitals,
    slots,
    departments,
    setSelectedDepartment,
    setSelectedSpecialization,
    setSelectedHospital,
    setSelectedCity,
    setActiveTab
  } = useApp();

  const deptParam = params?.id as string;
  const slugParam = params?.slug as string;

  // First, try to find the department from AppContext (loaded from Supabase with admin-entered specializations)
  const cleanDeptParam = deptParam?.trim().toUpperCase();
  const parentDept = departments.find(d => 
    d.code?.toUpperCase() === cleanDeptParam || 
    d.id?.toUpperCase() === cleanDeptParam ||
    d.id?.toUpperCase() === `DEPT-${cleanDeptParam}`
  );

  // Find the specialization within the parent department
  let subCategory = null;
  if (parentDept && slugParam) {
    const targetSlug = toSlug(slugParam);
    const foundSub = parentDept.subDepartments?.find(
      subName => toSlug(subName) === targetSlug || toSlug(subName).includes(targetSlug)
    );
    
    if (foundSub) {
      subCategory = {
        name: foundSub,
        slug: toSlug(foundSub),
        parentDepartment: parentDept,
        description: `Specialized ${foundSub} clinical rotation program under the ${parentDept.name} department, featuring direct patient care, mentor supervision, and DMHCA certification.`,
        competencies: parentDept.clinicalHighlights || []
      };
    }
  }

  // Fallback to utility function if not found in AppContext (for backward compatibility with mock data)
  if (!subCategory) {
    subCategory = getSubCategoryDetailByDeptAndSlug(deptParam, slugParam);
  }

  if (!subCategory || !parentDept) {
    return (
      <div className="min-h-screen py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Specialization Program Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested clinical specialization program could not be located.</p>
        <button
          onClick={() => router.push('/departments')}
          className="bg-[#2F855A] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Return to All Clinical Departments
        </button>
      </div>
    );
  }
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
    <div className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

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
                DEPARTMENT: {parentDept.name.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
              {subCategory.name} Clinical Rotation
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-3xl">
              Specialized clinical rotation in <strong>{subCategory.name}</strong> under the <strong>{parentDept.name}</strong> department. Includes patient exposure, procedural skills, case logbook signatures, and official DMHCA certification.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-300" />
                {affiliatedHospitals.length} Affiliated Hospitals
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-300" />
                {displayCities.length} Cities
              </span>
            </div>
          </div>

          {/* Pricing & Call-to-Action Card */}
          <div className="lg:col-span-4 bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-white/30 space-y-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-heading">Program Fee</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-[#2F855A] font-heading">
                  ₹{parentDept.baseFeePerMonth.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-slate-500">/ Month</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Specialized clinical training with dedicated hospital supervision.
              </p>
            </div>

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

      {/* Clinical Competencies & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBE5D7] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2F855A]" />
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Core Speciality Competencies Covered
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {parentDept.clinicalHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#EBF7F1] border border-[#CBE5D7]">
                  <CheckCircle2 className="w-4 h-4 text-[#2F855A] shrink-0 mt-0.5" />
                  <span className="text-xs font-extrabold text-slate-800 font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certification Badge Box */}
        <div className="bg-[#EBF7F1] rounded-3xl p-6 border border-[#CBE5D7] space-y-4 self-start shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2F855A] text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">DMHCA Certificate</h3>
              <p className="text-[11px] text-slate-600 font-medium">Verify online with QR Code</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Upon successful completion of the {subCategory.name} rotation and logbook evaluation by the hospital department lead, candidates receive an official DMHCA accredited rotation certificate.
          </p>
        </div>

      </div>

      {/* Affiliated Hospitals Offering this Rotation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            Hospitals Offering {subCategory.name} Rotation
          </h2>
          <span className="text-xs font-bold text-[#2F855A]">{affiliatedHospitals.length} Centers Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affiliatedHospitals.map(hosp => (
            <motion.div
              key={hosp.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-3xl overflow-hidden border border-[#CBE5D7] shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              onClick={() => router.push(`/hospitals/${toSlug(hosp.name)}`)}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img src={hosp.image} alt={hosp.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 right-3 bg-white/95 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {hosp.rating}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 hover:text-[#2F855A] transition font-heading">{hosp.name}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#2F855A] shrink-0" />
                      {hosp.city} · {hosp.address}
                    </p>
                  </div>
                  <div className="bg-[#EBF7F1] p-3 rounded-xl border border-[#CBE5D7] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Open Slots</span>
                    <span className="font-extrabold text-[#2F855A] font-heading text-xs">{hosp.availableSlotsCount} Open Slots</span>
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/departments');
                  }}
                  className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Rotation</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
