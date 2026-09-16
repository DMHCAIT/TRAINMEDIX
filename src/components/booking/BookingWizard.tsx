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
  Stethoscope,
  FileText,
  Trash2
} from 'lucide-react';
import type { CityName, DurationOption, Booking } from '../../types';
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

const ROTATION_DURATION_OPTIONS: Array<{
  dur: DurationOption;
  desc: string;
  recommended?: boolean;
}> = [
  {
    dur: '1 Month',
    desc: 'Ideal for intensive specialty exposure, procedural observation, and clinical ward rounds.'
  },
  {
    dur: '3 Months',
    desc: 'Recommended for comprehensive practice, case presentation, and procedure assists.',
    recommended: true
  },
  {
    dur: '6 Months',
    desc: 'In-depth clinical mastery, emergency response leadership, sub-specialty exposure, and DMHCA certification.'
  },
  {
    dur: '12 Months',
    desc: 'Full-year immersion with advanced procedural independence, research exposure, and complete DMHCA certification.'
  }
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
    setActiveTab,
    offeringPricing,
    offeringSlots,
    isLoggedIn,
    setIsAuthModalOpen,
    userProfile
  } = useApp();

  // Local Form Inputs for Step 6
  const [traineeName, setTraineeName] = useState(userProfile?.fullName || '');
  const [traineeEmail, setTraineeEmail] = useState(userProfile?.email || '');
  const [traineePhone, setTraineePhone] = useState(userProfile?.phone || '');
  const [medicalQualification, setMedicalQualification] = useState((userProfile as any)?.qualification || 'MBBS');
  const [councilRegistrationNumber, setCouncilRegistrationNumber] = useState((userProfile as any)?.councilRegNo || 'MCI-2022-77142');
  const [isPendingPaymentAfterLogin, setIsPendingPaymentAfterLogin] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setTraineeName(userProfile.fullName);
      if (userProfile.email) setTraineeEmail(userProfile.email);
      if (userProfile.phone) setTraineePhone(userProfile.phone);
      if ((userProfile as any).qualification) setMedicalQualification((userProfile as any).qualification);
    }
  }, [userProfile]);

  // Auto-skip to Step 2 if department was already selected (e.g., from departments page)
  React.useEffect(() => {
    if (selectedDepartment && bookingStep === 1) {
      setBookingStep(2);
    }
  }, [selectedDepartment, bookingStep, setBookingStep]);

  // Auto-proceed to payment after user logs in from Step 6
  React.useEffect(() => {
    if (isLoggedIn && isPendingPaymentAfterLogin) {
      setIsAuthModalOpen(false);
      setIsPaymentModalOpen(true);
      setIsPendingPaymentAfterLogin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isPendingPaymentAfterLogin]);

  const [isOtherCity, setIsOtherCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  // Real File Upload State for MBBS / PG Degree Certificate
  const degreeFileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedDegreeFile, setUploadedDegreeFile] = useState<{ file: File; name: string; size: string } | null>(null);
  const [step6Error, setStep6Error] = useState('');

  const handleDegreeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedDegreeFile({
        file,
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

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Expand hospitals with multiple cities into separate location-specific entries
  // Example: "Dharma Diabetic Centre (Delhi)" and "Dharma Diabetic Centre (Mumbai)"
  const locationSpecificHospitals = hospitals.flatMap((hosp) => {
    const locations = Array.isArray((hosp as any).cities) && (hosp as any).cities.length > 0
      ? (hosp as any).cities
      : [hosp.city].filter(Boolean);

    if (locations.length === 0) {
      return [{ ...hosp, displayName: hosp.name, city: hosp.city || selectedCity || 'Unknown', originalHospitalId: hosp.id, listKey: `${hosp.id}-default` }];
    }

    return locations.map((loc: string) => ({
      ...hosp,
      id: `${hosp.id}-${loc}`,
      originalHospitalId: hosp.id,
      city: loc,
      displayName: `${hosp.name} (${loc})`,
      listKey: `${hosp.id}-${loc}`,
      address: loc,
    }));
  });

  // Filter hospitals based on selected department & location
  const availableHospitals = locationSpecificHospitals.filter((hosp) => {
    const matchesCity = selectedCity === 'All' || hosp.city === selectedCity;
    const matchesDept = !selectedDepartment || (hosp.departments && hosp.departments.includes(selectedDepartment.id));
    return matchesCity && matchesDept;
  });

  // Get cities available for the selected department
  const availableCitiesForDepartment = React.useMemo(() => {
    if (!selectedDepartment) return CITIES as string[];

    const citiesSet = new Set<string>();

    locationSpecificHospitals.forEach((hosp) => {
      if (hosp.departments && hosp.departments.includes(selectedDepartment.id) && hosp.city) {
        citiesSet.add(hosp.city);
      }
    });

    // Fall back to the cities recorded on the department itself
    if (citiesSet.size === 0) {
      (selectedDepartment.availableCities || []).forEach((c) => citiesSet.add(c));
    }

    return Array.from(citiesSet);
  }, [selectedDepartment, locationSpecificHospitals]);

  // Admin-configured batches for the exact hospital, department and city selection.
  const configuredSlots = slots.filter((s) => {
    const hospitalId = selectedHospital?.originalHospitalId || selectedHospital?.id;
    const matchesHosp = !hospitalId || s.hospitalId === hospitalId;
    const matchesDept = !selectedDepartment || s.departmentId === selectedDepartment.id;
    const matchesCity = !selectedCity || selectedCity === 'All' || s.city === selectedCity;
    return matchesHosp && matchesDept && matchesCity;
  });

  const availableDurations = new Set(configuredSlots.map((slot) => slot.duration));

  const displaySlots = configuredSlots.filter((slot) => slot.duration === selectedDuration);

  const durationToMonths = (d: DurationOption) => parseInt(d, 10);

  // Admin-configured price for this hospital + department + city, else monthly rate x months
  const getPriceForDuration = (duration: DurationOption) => {
    const months = durationToMonths(duration);
    const hospitalId = (selectedHospital as any)?.originalHospitalId || selectedHospital?.id;
    const city = selectedHospital?.city || (selectedCity !== 'All' ? selectedCity : undefined);

    if (hospitalId && selectedDepartment && city) {
      const configured = offeringPricing[`${hospitalId}|${selectedDepartment.id}|${city}`]?.[String(months)];
      if (typeof configured === 'number' && configured > 0) return configured;
    }

    return (selectedDepartment?.baseFeePerMonth || 45000) * months;
  };

  // Slots the admin configured for this hospital + department + city
  const getSlotsForHospital = (hosp: any) => {
    const hospitalId = hosp?.originalHospitalId || hosp?.id;
    if (hospitalId && selectedDepartment && hosp?.city) {
      const configured = offeringSlots[`${hospitalId}|${selectedDepartment.id}|${hosp.city}`];
      if (typeof configured === 'number') return configured;
    }
    return hosp?.availableSlotsCount ?? 0;
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedDepartment;
      case 2:
        return selectedCity !== 'All' && String(selectedCity).trim() !== '';
      case 3:
        return !!selectedHospital;
      case 4:
        return availableDurations.has(selectedDuration);
      case 5:
        return displaySlots.some((slot) => slot.id === selectedSlotId);
      default:
        return true;
    }
  };

  const canProceed = canProceedFromStep(bookingStep);

  const handleNextStep = () => {
    if (bookingStep < 6 && canProceed) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const isStep6Valid = () =>
    !!traineeName.trim() &&
    !!traineeEmail.trim() &&
    !!traineePhone.trim() &&
    !!medicalQualification.trim() &&
    !!uploadedDegreeFile;

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep6Valid()) {
      setStep6Error(!uploadedDegreeFile
        ? 'Please upload your degree/provisional certificate to proceed.'
        : 'Please fill in all required fields to proceed.');
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      setStep6Error('');
      setIsPendingPaymentAfterLogin(true);
      setIsAuthModalOpen(true);
      return;
    }

    setStep6Error('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (method: Booking['paymentMethod']) => {
    const baseFee = getPriceForDuration(selectedDuration);
    const gstAmount = Math.round(baseFee * 0.18);
    const gatewayFee = Math.round(baseFee * 0.04);
    const totalAmount = baseFee + gstAmount + gatewayFee;
    const selectedSlot = displaySlots.find((slot) => slot.id === selectedSlotId);

    if (!uploadedDegreeFile || !selectedSlot) {
      setIsPaymentModalOpen(false);
      setStep6Error('The selected batch or degree certificate is missing. Please review your booking details.');
      return;
    }

    try {
      const newBooking = await createBooking({
        traineeName,
        traineeEmail,
        traineePhone,
        medicalQualification,
        councilRegistrationNumber,
        departmentId: selectedDepartment?.id,
        departmentName: selectedDepartment?.name || 'Emergency Medicine',
        hospitalId: selectedHospital?.originalHospitalId || selectedHospital?.id,
        hospitalName: selectedHospital?.name || 'Apollo Super Speciality Hospital',
        city: selectedCity !== 'All' ? selectedCity : 'Delhi',
        duration: selectedDuration,
        slotId: selectedSlot.id,
        startDate: selectedSlot.startDate,
        endDate: selectedSlot.endDate,
        courseFee: baseFee,
        gstAmount,
        gatewayFee,
        amountPaid: totalAmount,
        paymentMethod: method,
        paymentStatus: 'Paid',
        bookingStatus: 'Pending Approval',
        documents: {
          degreeCertificateName: uploadedDegreeFile.name,
          degreeCertificateSize: uploadedDegreeFile.size
        }
      }, uploadedDegreeFile.file);

      setIsPaymentModalOpen(false);
      sendBookingConfirmationEmail(newBooking, totalAmount, method);

      setIsBookingOpen(false);
      setActiveTab('dashboard');
    } catch (error: any) {
      setIsPaymentModalOpen(false);
      setStep6Error(error.message || 'Payment succeeded, but the booking could not be saved. Please contact support.');
    }
  };

  const sendBookingConfirmationEmail = async (
    booking: Booking,
    amount: number,
    paymentMethod: string
  ) => {
    try {
      const response = await fetch('/api/emails/send-booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: booking.traineeName,
          traineeEmail: booking.traineeEmail,
          traineePhone: booking.traineePhone,
          bookingRef: booking.bookingRef,
          departmentName: booking.departmentName,
          hospitalName: booking.hospitalName,
          city: booking.city,
          duration: booking.duration,
          amountPaid: amount,
          paymentMethod: paymentMethod,
          startDate: booking.startDate
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Booking confirmation email sent successfully:', result.messageId);
      } else {
        console.error('Failed to send booking confirmation email:', result.error);
      }
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
    }
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
                  disabled={!canProceed}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md ${canProceed
                    ? 'bg-[#2F855A] hover:bg-[#276749] text-white shadow-[#2F855A]/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed opacity-60'
                    }`}
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

                {/* Active Department Selection */}
                {selectedDepartment && (
                  <div className="bg-[#EBF7F1] border border-[#C5DED0] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#2F855A] shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2F855A] bg-white px-2 py-0.5 rounded-md border border-[#C5DED0] mr-2">
                          {selectedDepartment.code}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm font-heading">
                          {selectedDepartment.name}
                        </span>
                      </div>
                    </div>
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
                          // Select department and proceed directly to Step 2 (location selection)
                          setSelectedDepartment(dept);
                          setTimeout(() => setBookingStep(2), 150);
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

                          {/* Sub-Departments Tags - Hidden, only shown in modal */}
                        </div>
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">{dept.hospitalsCount} Hospitals</span>
                          <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                            <span>Book Now</span>
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
                    {selectedDepartment
                      ? `Locations where ${selectedDepartment.name} rotations are currently offered.`
                      : 'Choose the city where you want to complete your hospital clinical rotation.'}
                  </p>
                </div>

                {selectedDepartment && availableCitiesForDepartment.length === 0 && (
                  <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
                    No partner hospital locations are configured for this department yet.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCitiesForDepartment.map((c) => {
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

                  {/* Other (Specify City) Card - only when no department context */}
                  {!selectedDepartment && (
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
                  )}
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
                    const selected = selectedHospital?.id === hosp.id || selectedHospital?.id === (hosp as any).originalHospitalId;
                    return (
                      <motion.div
                        key={hosp.listKey || hosp.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedHospital({
                            ...hosp,
                            id: (hosp as any).originalHospitalId || hosp.id,
                            city: hosp.city,
                            displayName: hosp.displayName,
                            listKey: hosp.listKey,
                          });
                          setSelectedSlotId('');
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
                              <h4 className="text-lg font-bold text-slate-900 font-heading">{hosp.displayName || hosp.name}</h4>
                              <p className="text-xs text-blue-600 font-semibold">{hosp.city || hosp.address}</p>
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
                          <span className="text-emerald-700 font-extrabold">{getSlotsForHospital(hosp)} Training Slots Open</span>
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
                  {ROTATION_DURATION_OPTIONS.filter((option) => availableDurations.has(option.dur)).map((opt) => {
                    const selected = selectedDuration === opt.dur;
                    const totalPrice = getPriceForDuration(opt.dur as DurationOption);

                    return (
                      <motion.div
                        key={opt.dur}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedDuration(opt.dur as DurationOption);
                          setSelectedSlotId('');
                          setTimeout(() => setBookingStep(5), 150);
                        }}
                        className={`p-6 rounded-3xl border cursor-pointer transition flex flex-col justify-between relative touch-target ${selected
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/30'
                          : 'glass-card border-slate-200/80 text-slate-800 hover:border-blue-300'
                          }`}
                      >
                        {opt.recommended && (
                          <span
                            className="absolute top-0 right-0 px-3.5 py-1 text-[10px] font-extrabold text-white rounded-bl-2xl uppercase tracking-wider shadow-xs"
                            style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
                          >
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
                {availableDurations.size === 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                    <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-600" />
                    <p className="font-bold text-slate-900">No batches are configured for this hospital and city.</p>
                    <p className="mt-1 text-sm text-slate-600">Please select another hospital or city.</p>
                  </div>
                )}
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
                      {selectedDepartment?.name || 'Department'}
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

                      const totalFee = getPriceForDuration(selectedDuration);

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

                            {/* Primary Department Title */}
                            <div>
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading leading-tight flex items-center gap-2 flex-wrap">
                                <span>{slotDept?.name || 'Clinical Rotation'}</span>
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
                    <div className="bg-amber-50 p-8 rounded-3xl text-center border border-amber-200 space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                      <p className="text-base font-bold text-slate-900 font-heading">No batches found for this duration.</p>
                      <p className="text-xs text-slate-600">Please select another duration or city.</p>
                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        className="mt-2 text-xs font-extrabold text-blue-600 underline cursor-pointer"
                      >
                        Back to duration selection
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        required
                        value={traineeName}
                        onChange={(e) => setTraineeName(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address <span className="text-red-600">*</span></label>
                      <input
                        type="email"
                        required
                        value={traineeEmail}
                        onChange={(e) => setTraineeEmail(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        required
                        value={traineePhone}
                        onChange={(e) => setTraineePhone(e.target.value)}
                        className="w-full bg-white/90 border border-slate-300/80 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none touch-target shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical Qualification <span className="text-red-600">*</span></label>
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
                          Document Upload <span className="text-red-600">*</span> (Required)
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
                        accept=".pdf,.jpg,.jpeg,.png"
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

                {step6Error && (
                  <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold">
                    {step6Error}
                  </div>
                )}

                <motion.button
                  whileHover={isStep6Valid() ? { scale: 1.02 } : undefined}
                  whileTap={isStep6Valid() ? { scale: 0.98 } : undefined}
                  type="submit"
                  className={`w-full font-bold text-base py-4 rounded-2xl transition flex items-center justify-center gap-2 touch-target ${isStep6Valid()
                    ? 'bg-[#2F855A] hover:bg-[#276749] text-white shadow-lg shadow-[#2F855A]/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-70'
                    }`}
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
          departmentName: selectedDepartment?.name || 'Emergency Medicine',
          hospitalName: selectedHospital?.name || 'Apollo Super Speciality Hospital',
          duration: selectedDuration,
          amountPaid: getPriceForDuration(selectedDuration)
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
};
