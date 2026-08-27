'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Department } from '../../types';
import { getSubCategoryUrl } from '../../utils/subCategoryUtils';
import {
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

interface SubCategoryModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({ department, isOpen, onClose }) => {
  const router = useRouter();
  const { hospitals } = useApp();

  if (!isOpen || !department) return null;

  const deptHospitals = hospitals.filter(h => {
    if (h.offeredDepartments) {
      return Object.keys(h.offeredDepartments).some(
        deptName => deptName.toLowerCase() === department.name.toLowerCase()
      );
    }
    return h.departments.includes(department.id);
  });
  const uniqueCitiesCount = Array.from(new Set(deptHospitals.map(h => h.city))).filter(Boolean).length || department.availableCities.length;
  const uniqueHospitalsCount = deptHospitals.length || department.hospitalsCount;

  const handleSelectSubCategory = (subName: string) => {
    onClose();
    router.push(getSubCategoryUrl(department, subName));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">

        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Pop-Up Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#F6F2EC] border border-[#CBE5D7] rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-[#2F855A] to-[#276749] text-white p-6 sm:p-7">
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
          <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">
                Specializations ({department.subDepartments?.length || 0} Programs)
              </span>
              <span className="text-xs text-[#2F855A] font-bold">Click any program to view details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {department.subDepartments?.map((subName, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSubCategory(subName)}
                  className="w-full bg-white hover:bg-[#EBF7F1] border border-[#CBE5D7] hover:border-[#2F855A] p-4 rounded-2xl text-left transition flex items-center justify-between gap-3 shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E2F0EA] text-[#2F855A] group-hover:bg-[#2F855A] group-hover:text-white flex items-center justify-center text-xs font-black transition shadow-2xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 font-heading group-hover:text-[#2F855A] transition">
                        {subName}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        Clinical Program • DMHCA Certified
                      </span>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#2F855A] text-slate-500 group-hover:text-white flex items-center justify-center transition shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500 font-medium">
                🏥 Available across {uniqueCitiesCount} cities at {uniqueHospitalsCount} partner hospitals
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
