'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Clock,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Zap,
  Lock,
  X,
  Stethoscope,
  FileText,
  Trash2
} from 'lucide-react';
import type { CityName, DurationOption, Booking, Department } from '../../types';
import { CITIES } from '../../data/mockData';
import { PaymentModal } from '../payment/PaymentModal';
import { CustomSelect } from '../common/CustomSelect';

const QUALIFICATION_OPTIONS = [
  'MBBS',
  'MD / MS/ DNB',
  'DM / MCh',
  'AYUSH Doctor',
  'Other Medical Qualification'
];

export const BookingWizard: React.FC = () => {
  const {
    departments,
    hospitals,
    slots,
    selectedCity,
    setSelectedCity,
    selectedDepartment,
    setSelectedDepartment,
    selectedHospital,
    setSelectedHospital,
    selectedDuration,
    setSelectedDuration,
    bookingStep,
    setBookingStep,
    setIsBookingOpen,
    createBooking,
    setActiveTab
  } = useApp();

  const { userProfile } = useApp();

  // Local Form Inputs for Step 6
  const [traineeName, setTraineeName] = useState(userProfile?.fullName || '');
  const [traineeEmail, setTraineeEmail] = useState(userProfile?.email || '');
  const [traineePhone, setTraineePhone] = useState(userProfile?.phone || '');
  const [medicalQualification, setMedicalQualification] = useState((userProfile as any)?.qualification || 'MBBS');
  const [councilRegistrationNumber, setCouncilRegistrationNumber] = useState((userProfile as any)?.councilRegNo || 'MCI-2022-77142');

  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setTraineeName(userProfile.fullName);
      if (userProfile.email) setTraineeEmail(userProfile.email);
      if (userProfile.phone) setTraineePhone(userProfile.phone);
      if ((userProfile as any).qualification) setMedicalQualification((userProfile as any).qualification);
    }
  }, [userProfile]);

  const [isOtherCity, setIsOtherCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  // Real File Upload State for MBBS / PG Degree Certificate
  const degreeFileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedDegreeFile, setUploadedDegreeFile] = useState<{ name: string; size: string } | null>({
    name: 'MBBS_Degree_Certificate.pdf',
    size: '1.8 MB'
  });

  const handleDegreeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedDegreeFile({
        name: file.name,
        size: `${sizeInMb} MB`
      });
    }
  };

  const handleRemoveDegreeFile = () => {
    setUploadedDegreeFile(null);
    if (degreeFileInputRef.current) {
      degreeFileInputRef.current.value = '';
    }
  };

  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-101');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [specializationModalDept, setSpecializationModalDept] = useState<Department | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');

  // Filter hospitals based on selected department & location
  const availableHospitals = hospitals.filter((hosp) => {
    const matchesCity = selectedCity === 'All' || hosp.city === selectedCity;
    const matchesDept = !selectedDepartment || hosp.departments.includes(selectedDepartment.id);
    return matchesCity && matchesDept;
  });

  // Filter slots based on selected hospital, department, city & duration
  const matchedSlots = slots.filter((s) => {
    const matchesHosp = !selectedHospital || s.hospitalId === selectedHospital.id;
    const matchesDept = !selectedDepartment || s.departmentId === selectedDepartment.id;
    const matchesCity = !selectedCity || selectedCity === 'All' || s.city === selectedCity;
    const matchesDuration = !selectedDuration || s.duration === selectedDuration;
    return matchesHosp && matchesDept && matchesCity && matchesDuration;
  });

  const filteredSlots = matchedSlots.length > 0 ? matchedSlots : slots.filter((s) => {
    const matchesDept = !selectedDepartment || s.departmentId === selectedDepartment.id;
    const matchesCity = !selectedCity || selectedCity === 'All' || s.city === selectedCity;
    return matchesDept && matchesCity;
  });

  const displaySlots = filteredSlots.length > 0 ? filteredSlots : slots;

  const handleNextStep = () => {
    if (bookingStep < 6) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (method: Booking['paymentMethod']) => {
    setIsPaymentModalOpen(false);

    const feeMultiplier = selectedDuration === '1 Month' ? 1 : selectedDuration === '3 Months' ? 3 : 6;
    const baseFee = selectedDepartment ? selectedDepartment.baseFeePerMonth * feeMultiplier : 45000 * feeMultiplier;

    createBooking({
      traineeName,
      traineeEmail,
      traineePhone,
      medicalQualification,
      councilRegistrationNumber,
      departmentId: selectedDepartment?.id,
      departmentName: selectedDepartment?.name || 'Emergency Medicine',
      subDepartment: selectedSpecialization || selectedDepartment?.subDepartments?.[0] || selectedDepartment?.name,
      hospitalId: selectedHospital?.id,
      hospitalName: selectedHospital?.name || 'Apollo Super Speciality Hospital',
      city: selectedCity !== 'All' ? selectedCity : 'Delhi',
      duration: selectedDuration,
      amountPaid: baseFee,
      paymentMethod: method
    });

    setIsBookingOpen(false);
    setActiveTab('dashboard');
  };

  const stepTitles = [
    'Select Department',
    'Select City / Location',
    'Select Partner Hospital',
    'Select Training Duration',
    'Select Available Slot & Batch',
    'Confirm Details & Document Upload'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Wizard Header Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-200/80 relative overflow-hidden"
      >

        {/* Top Header & Step Navigation */}
        <div className="mb-8 pb-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#E2F0EA] text-[#2F855A] text-xs font-mono font-extrabold px-3 py-1 rounded-lg border border-[#C5DED0]">
                Step {bookingStep} of 6
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 font-heading">
                {stepTitles[bookingStep - 1]}
              </span>
            </div>

            {/* TOP NAVIGATION BUTTONS FOR MOBILE & DESKTOP */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={bookingStep === 1}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${bookingStep === 1
                  ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-2xs cursor-pointer'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              {bookingStep < 6 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#2F855A] hover:bg-[#276749] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-[#2F855A]/20 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 h-2.5 bg-slate-100/90 rounded-full p-0.5 border border-slate-200/80 shadow-inner">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <motion.div
                key={st}
                initial={false}
                animate={{
                  backgroundColor: st <= bookingStep ? '#2F855A' : '#e2e8f0',
                  scale: st === bookingStep ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full shadow-2xs"
              />
            ))}
          </div>
        </div>

        {/* Animated Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={bookingStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1: SELECT DEPARTMENT */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    <span>Step 1: Select Clinical Department</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Choose the department where you wish to undergo direct hospital exposure.
                  </p>
                </div>

                {/* Active Selection Banner if Specialization Chosen */}
                {selectedDepartment && selectedSpecialization && (
                  <div className="bg-[#EBF7F1] border border-[#C5DED0] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#2F855A] shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2F855A] bg-white px-2 py-0.5 rounded-md border border-[#C5DED0] mr-2">
                          {selectedDepartment.code}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm font-heading">{selectedSpecialization}</span>
                        <span className="text-slate-500 font-medium ml-1.5">({selectedDepartment.name})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpecializationModalDept(selectedDepartment)}
                      className="text-xs font-extrabold text-[#2F855A] hover:underline cursor-pointer self-start sm:self-auto"
                    >
                      Change Specialization →
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {departments.map((dept) => {
                    const selected = selectedDepartment?.id === dept.id;
                    return (
                      <motion.div
                        key={dept.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSpecializationModalDept(dept);
                        }}
                        className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between touch-target ${selected
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 font-bold shadow-md ring-2 ring-blue-500/30'
                          : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-blue-700">
                              {dept.code}
                            </span>
                            {selected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 font-heading">{dept.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{dept.description}</p>

                          {/* Sub-Departments Tags */}
                          {dept.subDepartments && dept.subDepartments.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {dept.subDepartments.slice(0, 2).map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="bg-[#EBF7F1] border border-[#CBE5D7] text-[#2F855A] text-[10px] px-2 py-0.5 rounded-md font-bold"
                                >
                                  {sub}
                                </span>
                              ))}
                              {dept.subDepartments.length > 2 && (
                                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                                  +{dept.subDepartments.length - 2} More
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">{dept.hospitalsCount} Hospitals</span>
                          <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                            <span>Select Specialization</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: SELECT LOCATION */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <MapPin className="w-7 h-7 text-blue-600" />
                    <span>Step 2: Select Training City & Region</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Choose the city where you want to complete your hospital clinical rotation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CITIES.map((c) => {
                    const selected = selectedCity === c;
                    return (
                      <motion.div
                        key={c}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsOtherCity(false);
                          setSelectedCity(c as CityName);
                          setTimeout(() => setBookingStep(3), 150);
                        }}
                        className={`p-5 rounded-2xl border cursor-pointer transition touch-target ${selected
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/30'
                          : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h4 className="text-lg font-bold text-slate-900 font-heading">{c}</h4>
                          </div>
                          {selected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-xs text-slate-600">
                          Partner tertiary hospitals available in {c}.
                        </p>
                      </motion.div>
                    );
                  })}

                  {/* Other (Specify City) Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsOtherCity(true);
                      if (selectedCity !== 'Other' && CITIES.includes(selectedCity as any)) {
                        setSelectedCity('Other');
                      }
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition touch-target ${isOtherCity || selectedCity === 'Other' || (!CITIES.includes(selectedCity as any) && selectedCity !== 'All')
                      ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/30'
                      : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-bold text-slate-900 font-heading">Other (Specify)</h4>
                      </div>
                      {(isOtherCity || selectedCity === 'Other' || (!CITIES.includes(selectedCity as any) && selectedCity !== 'All')) && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      Specify any other city or region for custom hospital allocation.
                    </p>

                    {(isOtherCity || selectedCity === 'Other' || (!CITIES.includes(selectedCity as any) && selectedCity !== 'All')) && (
                      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="Type city (e.g. Pune, Patna, Goa)..."
                          value={customCityText}
                          onChange={(e) => {
                            setCustomCityText(e.target.value);
                            setSelectedCity(e.target.value.trim() || 'Other');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customCityText.trim()) {
                              setBookingStep(3);
                            }
                          }}
                          className="w-full bg-white border border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customCityText.trim()) {
                              setSelectedCity(customCityText.trim());
                              setBookingStep(3);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Confirm & Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            )}

            {/* STEP 3: SELECT HOSPITAL */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    <span>Step 3: Select Partner Hospital</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Showing hospitals in <strong>{selectedCity === 'All' ? 'All Cities' : selectedCity}</strong> for <strong>{selectedDepartment?.name || 'Selected Department'}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableHospitals.map((hosp) => {
                    const selected = selectedHospital?.id === hosp.id;
                    return (
                      <motion.div
                        key={hosp.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedHospital(hosp);
                          setTimeout(() => setBookingStep(4), 150);
                        }}
                        className={`p-6 rounded-2xl border cursor-pointer transition flex flex-col justify-between touch-target ${selected
                          ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/30'
                          : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                          }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900 font-heading">{hosp.name}</h4>
                              <p className="text-xs text-blue-600 font-semibold">{hosp.address}</p>
                            </div>
                            {selected && <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />}
                          </div>

                          <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                              ⭐ {hosp.rating} / 5.0 Rating
                            </span>
                          </div>

                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-emerald-700 font-extrabold">{hosp.availableSlotsCount} Training Slots Open</span>
                          <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                            <span>Select & Continue</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: SELECT DURATION */}
            {bookingStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <Clock className="w-7 h-7 text-blue-600" />
                    <span>Step 4: Select Rotation Duration</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Choose the duration of your clinical commitment.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      dur: '1 Month',
                      desc: 'Ideal for intensive specialty exposure, procedural observation, and clinical ward rounds.',
                      multiplier: 1
                    },
                    {
                      dur: '3 Months',
                      desc: 'Recommended for comprehensive practice, case presentation, and procedure assists.',
                      recommended: true,
                      multiplier: 3
                    },
                    {
                      dur: '6 Months',
                      desc: 'In-depth clinical mastery, emergency response leadership, sub-specialty exposure, and DMHCA certification.',
                      multiplier: 6
                    }
                  ].map((opt) => {
                    const selected = selectedDuration === opt.dur;
                    const baseMonthly = selectedDepartment?.baseFeePerMonth || 45000;
                    const totalPrice = baseMonthly * opt.multiplier;

                    return (
                      <motion.div
                        key={opt.dur}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedDuration(opt.dur as DurationOption);
                          setTimeout(() => setBookingStep(5), 150);
                        }}
                        className={`p-6 rounded-3xl border cursor-pointer transition flex flex-col justify-between relative touch-target ${selected
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/30'
                          : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                          }`}
                      >
                        {opt.recommended && (
                          <span className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3.5 py-1 rounded-bl-2xl uppercase tracking-wider shadow-xs">
                            Most Popular
                          </span>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-slate-900 font-heading">{opt.dur}</h4>
                            {selected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Training Fee</span>
                          <span className="text-2xl font-extrabold text-slate-900 font-heading">
                            ₹{totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: SELECT SLOT & DATE */}
            {bookingStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <CalendarCheck className="w-7 h-7 text-blue-600" />
                    <span>Step 5: Select Available Slot & Batch</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Choose your batch start date. Seat capacity is strictly capped per hospital department.
                  </p>
                </div>

                {/* Search Filter Banner */}
                <div className="bg-[#EBF7F1] border border-[#C5DED0] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-[#2F855A] uppercase tracking-wide">Active Filters:</span>
                    <span className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg border border-[#C5DED0]">
                      Specialty: {selectedSpecialization ? `${selectedSpecialization} (${selectedDepartment?.name || ''})` : selectedDepartment?.name || 'All Specialties'}
                    </span>
                    {selectedHospital && (
                      <span className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg border border-[#C5DED0]">
                        Hospital: {selectedHospital.name}
                      </span>
                    )}
                    <span className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg border border-[#C5DED0]">
                      City: {selectedCity !== 'All' ? selectedCity : (selectedHospital?.city || 'All Cities')}
                    </span>
                    <span className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg border border-[#C5DED0]">
                      Duration: {selectedDuration}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="text-xs font-bold text-[#2F855A] hover:underline cursor-pointer"
                  >
                    Modify Search →
                  </button>
                </div>

                <div className="space-y-3.5">
                  {displaySlots.length > 0 ? (
                    displaySlots.map((s) => {
                      const selected = selectedSlotId === s.id;
                      const slotHosp = hospitals.find((h) => h.id === s.hospitalId) || selectedHospital;
                      const slotDept = departments.find((d) => d.id === s.departmentId) || selectedDepartment;

                      // Primary Specialization Name
                      const specName = s.subDepartment || selectedSpecialization || (slotDept?.subDepartments?.[0] ?? slotDept?.name ?? 'Clinical Rotation');

                      const feeMultiplier = selectedDuration === '1 Month' ? 1 : selectedDuration === '3 Months' ? 3 : 6;
                      const totalFee = s.monthlyFee * feeMultiplier;

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSlotId(s.id);
                            setTimeout(() => setBookingStep(6), 150);
                          }}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${selected
                            ? 'bg-[#EBF7F1] border-[#2F855A] shadow-md ring-2 ring-[#2F855A]/20'
                            : 'bg-white border-slate-200/90 hover:border-[#2F855A] hover:bg-[#F4F9F6] hover:shadow-md'
                            }`}
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            {/* Badges Row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Category Badge */}
                              {slotDept && (
                                <span className="inline-flex items-center gap-1 bg-[#E2F0EA] text-[#2F855A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-[#C5DED0]">
                                  <Stethoscope className="w-3 h-3" />
                                  <span>Category: {slotDept.name}</span>
                                </span>
                              )}
                              {/* Seat Capacity Warning */}
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                                <AlertTriangle className="w-3 h-3 text-amber-600 animate-bounce" />
                                <span>{s.availableSeats} seats available!</span>
                              </span>
                            </div>

                            {/* Primary Specialization Title */}
                            <div>
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading leading-tight flex items-center gap-2 flex-wrap">
                                <span>{specName}</span>
                                {selected && (
                                  <span className="inline-flex items-center gap-1 bg-[#2F855A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                    <span>Selected</span>
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                {slotHosp?.name || 'Partner Hospital'} · {slotHosp?.city || selectedCity}
                              </p>
                            </div>

                            {/* Batch Start & End Dates */}
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex-wrap">
                              <CalendarCheck className="w-4 h-4 text-[#2F855A] shrink-0" />
                              <span>Batch Rotation:</span>
                              <span className="text-[#2F855A] font-extrabold">{s.startDate}</span>
                              <span className="text-slate-400">to</span>
                              <span className="text-[#2F855A] font-extrabold">{s.endDate}</span>
                              <span className="text-slate-400">({selectedDuration})</span>
                            </div>
                          </div>

                          {/* Price & Selection CTA */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 gap-3 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider">Total Training Fee</span>
                              <span className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                                ₹{totalFee.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${selected
                                ? 'bg-[#2F855A] text-white'
                                : 'bg-slate-100 hover:bg-[#2F855A] text-slate-700 hover:text-white'
                                }`}
                            >
                              <span>{selected ? 'Selected' : 'Select Slot'}</span>
                              {selected ? <CheckCircle2 className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-slate-50/80 p-8 rounded-3xl text-center border border-slate-200/80 space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                      <p className="text-base font-bold text-slate-900 font-heading">Live Batch Opening for {selectedDepartment?.name || 'Department'}</p>
                      <p className="text-xs text-slate-600">Batch starting next month. Select slot to lock seat allocation.</p>
                      <button
                        onClick={() => {
                          setSelectedSlotId('slot-101');
                          setTimeout(() => setBookingStep(6), 150);
                        }}
                        className="mt-2 text-xs font-extrabold text-blue-600 underline cursor-pointer"
                      >
                        Select Default Batch Slot (Aug 15 - Nov 15)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRM DETAILS & DOCUMENT UPLOAD */}
            {bookingStep === 6 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 font-heading">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                    <span>Step 6: Trainee Details & Document Verification</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Provide your medical qualifications and upload degree documentation for hospital credentialing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                  {/* Form Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={traineeName}
                        onChange={(e) => setTraineeName(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={traineeEmail}
                        onChange={(e) => setTraineeEmail(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={traineePhone}
                        onChange={(e) => setTraineePhone(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical Qualification</label>
                      <CustomSelect
                        value={medicalQualification}
                        onChange={(val) => setMedicalQualification(val)}
                        options={QUALIFICATION_OPTIONS}
                        placeholder="Select Medical Qualification"
                      />
                    </div>
                  </div>

                  {/* Document Upload Area */}
                  <div className="space-y-4 bg-slate-50/90 p-6 rounded-3xl border border-slate-200/80 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider font-heading">
                          Document Upload (Required)
                        </h4>
                        <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-800 px-2.5 py-0.5 rounded-full">
                          PDF / JPG / PNG
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={degreeFileInputRef}
                        onChange={handleDegreeFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />

                      {/* Degree Certificate Upload Box */}
                      <div className="p-4 sm:p-5 bg-white/95 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">Degree or Provisional Passing Certificate</p>
                              {uploadedDegreeFile && (
                                <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5">
                                  {uploadedDegreeFile.name} ({uploadedDegreeFile.size})
                                </p>
                              )}
                            </div>
                          </div>

                          {uploadedDegreeFile && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Attached</span>
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => degreeFileInputRef.current?.click()}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer touch-target ${uploadedDegreeFile
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              }`}
                          >
                            <Upload className="w-4 h-4" />
                            <span>{uploadedDegreeFile ? 'Change File' : 'Upload Certificate'}</span>
                          </motion.button>

                          {uploadedDegreeFile && (
                            <button
                              type="button"
                              onClick={handleRemoveDegreeFile}
                              className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer shrink-0"
                              title="Remove Uploaded File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>All document uploads are securely verified by DMHCA & hospital administration prior to rotation onboarding.</span>
                    </div>
                  </div>

                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-base py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#2F855A]/30 touch-target cursor-pointer"
                >
                  <span>Proceed to Payment & Confirm Booking</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingData={{
          traineeName,
          traineeEmail,
          traineePhone,
          medicalQualification,
          councilRegistrationNumber,
          departmentName: `${selectedSpecialization || selectedDepartment?.name} (${selectedDepartment?.name})`,
          hospitalName: selectedHospital?.name || 'Apollo Super Speciality Hospital',
          duration: selectedDuration,
          amountPaid: selectedDepartment ? selectedDepartment.baseFeePerMonth * (selectedDuration === '1 Month' ? 1 : selectedDuration === '3 Months' ? 3 : 6) : 135000
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* FLOATING SPECIALIZATION SELECTION MODAL */}
      <AnimatePresence>
        {specializationModalDept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white border border-[#CBE5D7] rounded-3xl shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden z-10 max-h-[88vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 sm:pb-4 shrink-0 gap-3">
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2.5 py-0.5 rounded-md border border-[#C5DED0]">
                      {specializationModalDept.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Clinical Department</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 font-heading leading-tight">
                    Select Specialization in {specializationModalDept.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Your clinical rotation certificate and procedure logbook will be issued under the specialization you select below:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecializationModalDept(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Specialization Options List */}
              <div className="overflow-y-auto space-y-3 pr-1 no-scrollbar grow">
                {(specializationModalDept.subDepartments && specializationModalDept.subDepartments.length > 0
                  ? specializationModalDept.subDepartments
                  : [specializationModalDept.name]
                ).map((subName: string, sIdx: number) => {
                  const isSubSelected = selectedDepartment?.id === specializationModalDept.id && selectedSpecialization === subName;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => {
                        setSelectedDepartment(specializationModalDept);
                        setSelectedSpecialization(subName);
                        setSpecializationModalDept(null);
                        setTimeout(() => setBookingStep(2), 150);
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${isSubSelected
                        ? 'bg-[#EBF7F1] border-[#2F855A] shadow-md ring-2 ring-[#2F855A]/20'
                        : 'bg-white border-slate-200/90 hover:border-[#2F855A] hover:bg-[#F4F9F6] hover:shadow-md'
                        }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 font-heading leading-tight">
                            {subName}
                          </span>
                          {isSubSelected && (
                            <span className="inline-flex items-center gap-1 bg-[#E2F0EA] text-[#2F855A] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#C5DED0]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F855A]" />
                              <span>Selected</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          Supervised Clinical Rotation • DMHCA-Certified Logbook • Hospital Mentorship
                        </p>
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2F855A] bg-[#E2F0EA] px-2.5 py-1 rounded-lg border border-[#C5DED0] whitespace-nowrap">
                            Base Fee: ₹{specializationModalDept.baseFeePerMonth?.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full sm:w-auto bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        <span>Select & Continue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
