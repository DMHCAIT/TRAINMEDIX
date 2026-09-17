'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Department } from '../../types';
import {
  X,
  Layers
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

interface SubCategoryModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({ department, isOpen, onClose }) => {
  const { hospitals } = useApp();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !department) return null;

  const deptHospitals = hospitals.filter(h => {
    if (h.offeredDepartments) {
      return Object.keys(h.offeredDepartments).some(
        deptName => deptName.toLowerCase() === department.name.toLowerCase()
      );
    }
    return h.departments && h.departments.includes(department.id);
  });
  const uniqueCitiesCount = Array.from(new Set(deptHospitals.map(h => h.city))).filter(Boolean).length || department.availableCities.length;
  const uniqueHospitalsCount = deptHospitals.length || department.hospitalsCount;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden">

        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40"
        />

        {/* Pop-Up Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#F6F2EC] border border-[#E6F4F6] rounded-3xl shadow-2xl overflow-hidden z-50 max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div
            className="relative p-6 text-white sm:p-7"
            style={{ backgroundImage: 'linear-gradient(to right, #3597A4, #1F6F76)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                  CODE: {department.code}
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white mt-0.5">
                  {department.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Modal Body: Specializations List */}
          <div className="p-6 sm:p-8 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto"
>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">
                Specializations ({department.subDepartments?.length || 0} Programs)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {department.subDepartments?.map((subName, index) => (
                <div
                  key={index}
                  className="w-full bg-white border border-[#E6F4F6] p-4 rounded-2xl text-left flex items-center gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E6F4F6] text-[#3597A4] flex items-center justify-center text-xs font-black shadow-2xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                        {subName}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        Clinical Program • DMHCA Certified
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              {department.hospitalOfferings && department.hospitalOfferings.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    🏥 Available at {department.hospitalOfferings.length} hospital{department.hospitalOfferings.length !== 1 ? 's' : ''}
                  </span>
                  {department.hospitalOfferings.map((offering, idx) => (
                    <span key={idx} className="text-[10px] text-slate-600 font-medium block">
                      {offering.hospitalName} • {offering.cities.join(', ')}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  🏥 Available across {uniqueCitiesCount} cities at {uniqueHospitalsCount} partner hospitals
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
