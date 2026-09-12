'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Lock,
  KeyRound,
  Building2,
  MapPin,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEPARTMENTS } from '../../data/mockData';
import { CustomSelect } from '../common/CustomSelect';

const CLINICAL_SPECIALTIES = [
  'Emergency Medicine',
  'Cardiology',
  'ICU / Critical Care',
  'Radiology & Diagnostics',
  'Obstetrics & Gynaecology',
  'Paediatrics',
  'General Medicine',
  'General Surgery',
  'Orthopaedics',
  'Dermatology',
  'ENT Surgery'
];

const PREFERRED_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Bangalore',
  'Noida',
  'Hyderabad',
  'Other'
];

interface SeamlessOTPInputProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  idPrefix: string;
}

const SeamlessOTPInput: React.FC<SeamlessOTPInputProps> = ({ otp, setOtp, idPrefix }) => {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    // Automatically select & focus the 1st OTP input box when redirected to OTP page
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    const lastChar = val.slice(-1);

    if (/^[0-9]$/.test(lastChar)) {
      const newOtp = [...otp];
      newOtp[idx] = lastChar;
      setOtp(newOtp);
      // Advance to next box
      if (idx < 3) {
        inputRefs.current[idx + 1]?.focus();
        inputRefs.current[idx + 1]?.select();
      }
    } else if (val === '') {
      const newOtp = [...otp];
      newOtp[idx] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        inputRefs.current[idx - 1]?.focus();
        inputRefs.current[idx - 1]?.select();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      inputRefs.current[idx - 1]?.select();
    } else if (e.key === 'ArrowRight' && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
      inputRefs.current[idx + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedText) {
      const digits = pastedText.split('');
      const newOtp = ['', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 4) newOtp[i] = d;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(digits.length, 3);
      inputRefs.current[focusIndex]?.focus();
      inputRefs.current[focusIndex]?.select();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          id={`${idPrefix}-${idx}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center bg-white border-2 border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs transition-all duration-200"
        />
      ))}
    </div>
  );
};

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setIsLoggedIn,
    setUserProfile,
    setActiveTab,
    setRole
  } = useApp();

  // Mode: 'login' | 'signup'
  const [activeTab, setActiveTabMode] = useState<'login' | 'signup'>(authMode || 'login');

  // Login & Signup State (Trainee vs Hospital)
  const [loginRole, setLoginRole] = useState<'trainee' | 'hospital'>('trainee');
  const [signupRole, setSignupRole] = useState<'trainee' | 'hospital'>('trainee');
  const [loginInput, setLoginInput] = useState('');
  const [loginStep, setLoginStep] = useState<'input' | 'otp'>('input');
  const [loginOtp, setLoginOtp] = useState(['', '', '', '']);
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  // Signup Multi-Step State (1 to 4)
  const [signupStep, setSignupStep] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [qualification, setQualification] = useState('MBBS Doctor');
  const [emailId, setEmailId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Emergency Medicine', 'Cardiology']);
  const [preferredCity, setPreferredCity] = useState('Delhi NCR');
  const [signupOtp, setSignupOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [signupError, setSignupError] = useState('');
  const [signupBusy, setSignupBusy] = useState(false);

  // Hospital-specific signup state
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [hospitalAddress, setHospitalAddress] = useState('');

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  // Reset form helper
  const resetFormState = () => {
    setLoginInput('');
    setLoginStep('input');
    setLoginOtp(['', '', '', '']);
    setSignupStep(1);
    setFullName('');
    setQualification('MBBS Doctor');
    setEmailId('');
    setPhoneNumber('');
    setSelectedInterests(['Emergency Medicine', 'Cardiology']);
    setPreferredCity('Delhi NCR');
    setSignupOtp(['', '', '', '']);
    setSelectedDepartments([]);
    setHospitalAddress('');
    setLoginError('');
    setLoginBusy(false);
    setSignupError('');
    setSignupBusy(false);
  };

  // Reset form state when switching signup role (trainee <-> hospital)
  const handleSignupRoleSwitch = (newRole: 'trainee' | 'hospital') => {
    if (newRole !== signupRole) {
      setSignupRole(newRole);
      setSignupStep(1);
      setFullName('');
      setQualification(newRole === 'hospital' ? 'Tertiary Super Speciality Hospital' : 'MBBS Doctor');
      setEmailId('');
      setPhoneNumber('');
      setSelectedInterests(['Emergency Medicine', 'Cardiology']);
      setPreferredCity('Delhi NCR');
      setSelectedDepartments([]);
      setHospitalAddress('');
      setSignupOtp(['', '', '', '']);
    }
  };

  const handleContactStep = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!phoneNumber.trim()) {
      setSignupError('Please enter your mobile number.');
      return;
    }
    if (!emailId.trim()) {
      setSignupError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(emailId.trim())) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    setSignupStep(3);
  };

  // Reset login state when switching login role
  const handleLoginRoleSwitch = (newRole: 'trainee' | 'hospital') => {
    if (newRole !== loginRole) {
      setLoginRole(newRole);
      setLoginInput('');
      setLoginStep('input');
      setLoginOtp(['', '', '', '']);
      setLoginError('');
    }
  };

  React.useEffect(() => {
    if (authMode) {
      setActiveTabMode(authMode);
    }
    if (isAuthModalOpen) {
      resetFormState();
    }
  }, [isAuthModalOpen, authMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    resetFormState();
  };

  // Toggle interest item
  const toggleInterest = (spec: string) => {
    if (selectedInterests.includes(spec)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter(i => i !== spec));
      }
    } else {
      setSelectedInterests([...selectedInterests, spec]);
    }
  };

  // Handle Login OTP Request — sends a real OTP via email; guest/mock bypass has been removed
  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginInput.includes('@')) {
      setLoginError('Please enter a valid email address to receive your OTP.');
      return;
    }

    setLoginBusy(true);
    try {
      const res = await apiService.sendOtp(loginInput.trim(), 'login', loginRole);
      if (!res.success) {
        setLoginError(res.error || 'Failed to send OTP. Please try again.');
        return;
      }
      setLoginOtp(['', '', '', '']);
      setLoginStep('otp');
    } catch (err) {
      setLoginError('Failed to send OTP. Please check your connection and try again.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleResendLoginOtp = async () => {
    setLoginError('');
    setLoginBusy(true);
    try {
      const res = await apiService.sendOtp(loginInput.trim(), 'login', loginRole);
      if (!res.success) {
        setLoginError(res.error || 'Failed to resend OTP.');
        return;
      }
      setResendTimer(30);
    } catch (err) {
      setLoginError('Failed to resend OTP.');
    } finally {
      setLoginBusy(false);
    }
  };

  // Handle Login Verification — requires the OTP to actually match before a session is created
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const code = loginOtp.join('');
    if (code.length !== 4) {
      setLoginError('Please enter the 4-digit OTP.');
      return;
    }

    setLoginBusy(true);
    try {
      const verifyRes = await apiService.verifyOtp(loginInput.trim(), code, 'login');
      if (!verifyRes.success) {
        setLoginError(verifyRes.error || 'Incorrect OTP. Please try again.');
        return;
      }
    } catch (err) {
      setLoginError('Failed to verify OTP. Please try again.');
      return;
    } finally {
      setLoginBusy(false);
    }

    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    try {
      const res = await apiService.recordLogin(loginInput.trim());
      if (res.success && res.user) {
        setIsLoggedIn(true);
        setUserProfile(res.user);
        setRole(res.user.role);
        // Store session in localStorage for persistence
        localStorage.setItem('user_session', JSON.stringify(res.user));
        localStorage.setItem('user_role', res.user.role);
        console.log('[Persistent Login] Session saved to localStorage');
        setIsAuthModalOpen(false);
        resetFormState();
        setActiveTab(res.user.role === 'hospital' ? 'hospital-portal' : 'dashboard');
        return;
      }
      setLoginError(res.error || 'Account not found. Please sign up before signing in.');
    } catch (err) {
      setLoginError('Failed to complete sign in. Please try again.');
    }
  };

  // Handle Signup Final Verify (Trainee vs Hospital) — requires the OTP to actually match
  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const code = signupOtp.join('');
    if (code.length !== 4) {
      setSignupError('Please enter the 4-digit OTP.');
      return;
    }

    const targetEmail = emailId.trim();

    setSignupBusy(true);
    try {
      const verifyRes = await apiService.verifyOtp(targetEmail, code, 'signup');
      if (!verifyRes.success) {
        setSignupError(verifyRes.error || 'Incorrect OTP. Please try again.');
        return;
      }
    } catch (err) {
      setSignupError('Failed to verify OTP. Please try again.');
      return;
    } finally {
      setSignupBusy(false);
    }

    const signupPayload = {
      role: signupRole,
      fullName: fullName.trim(),
      email: emailId.trim(),
      phone: phoneNumber.trim(),
      qualification,
      interests: signupRole === 'hospital'
        ? selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name || id)
        : selectedInterests,
      address: hospitalAddress.trim(),
      preferredCity
    };

    try {
      const res = await apiService.registerUser(signupPayload);
      if (res.success && res.user) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        setIsLoggedIn(true);
        const userProfile = { ...res.user, accreditation: qualification };
        setUserProfile(userProfile);
        setRole(res.user.role);
        // Store session in localStorage for persistence
        localStorage.setItem('user_session', JSON.stringify(userProfile));
        localStorage.setItem('user_role', res.user.role);
        console.log('[Persistent Login] Session saved to localStorage');
        setIsAuthModalOpen(false);
        resetFormState();
        setActiveTab(res.user.role === 'hospital' ? 'hospital-portal' : 'dashboard');
        return;
      }
      setSignupError(res.error || 'Failed to create your account. Please try again.');
    } catch (err) {
      setSignupError('Failed to create your account. Please try again.');
    }
  };

  // Handle Signup Step 3: Authenticate button — sends a real OTP to the registered email
  const handleAuthenticateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const targetEmail = emailId.trim();

    if (!targetEmail) {
      setSignupError('Please enter your email address.');
      return;
    }

    if (signupRole === 'hospital' && selectedDepartments.length === 0) {
      setSignupError('Please select at least one clinical department.');
      return;
    }

    if (signupRole === 'trainee' && !phoneNumber.trim()) {
      setSignupError('Please enter your mobile phone number.');
      return;
    }

    setSignupBusy(true);
    try {
      const res = await apiService.sendOtp(targetEmail, 'signup');
      if (!res.success) {
        setSignupError(res.error || 'Failed to send OTP. Please try again.');
        return;
      }
      setSignupOtp(['', '', '', '']);
      setSignupStep(4);
    } catch (err) {
      setSignupError('Failed to send OTP. Please check your connection and try again.');
    } finally {
      setSignupBusy(false);
    }
  };

  const handleResendSignupOtp = async () => {
    setSignupError('');
    const targetEmail = emailId.trim();
    if (!targetEmail) return;

    setSignupBusy(true);
    try {
      const res = await apiService.sendOtp(targetEmail, 'signup');
      if (!res.success) {
        setSignupError(res.error || 'Failed to resend OTP.');
        return;
      }
      setResendTimer(30);
    } catch (err) {
      setSignupError('Failed to resend OTP.');
    } finally {
      setSignupBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md">

        {/* Backdrop overlay - No click to close, only X button can close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
        />

        {/* Modal Container Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg bg-[#F6F2EC] border border-[#CBE5D7] rounded-3xl shadow-2xl z-10 my-auto"
        >

          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-[#2F855A] to-[#276749] text-white p-6 sm:p-7 rounded-t-3xl">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                  DMHCA Certified Portal
                </span>
                <h3 className="text-xl font-extrabold font-heading tracking-tight text-white mt-0.5">
                  {activeTab === 'login' ? 'Welcome Back to TrainMedix' : signupRole === 'hospital' ? 'Register Hospital Partner' : 'Create Trainee Account'}
                </h3>
              </div>
            </div>

            {/* Auth Mode Toggle Pills */}
            <div className="mt-5 bg-black/20 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/20">
              <button
                onClick={() => { setActiveTabMode('login'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${activeTab === 'login'
                  ? 'bg-white text-[#2F855A] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTabMode('signup'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${activeTab === 'signup'
                  ? 'bg-white text-[#2F855A] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 sm:p-8">

            {/* ================= LOGIN FLOW ================= */}
            {activeTab === 'login' && (
              <div>
                {loginStep === 'input' ? (
                  <form onSubmit={handleRequestLoginOtp} className="space-y-5">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 font-heading">
                        {loginRole === 'trainee' ? 'Trainee Doctor Sign In' : loginRole === 'hospital' ? 'Hospital Partner Sign In' : 'System Administrator Sign In'}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Enter your registered email address to receive a one-time code
                      </p>
                    </div>

                    {/* Dedicated Role Selection Tabs (Trainee vs Hospital) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Select Account Type to Sign In
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleLoginRoleSwitch('trainee')}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${loginRole === 'trainee'
                            ? 'bg-[#EBF7F1] border-[#2F855A] text-[#2F855A] font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white border border-[#CBE5D7] flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#2F855A]" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Trainee Doctor</span>
                            <span className="text-[10px] text-slate-500 font-medium">Doctor / Medical Trainee</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoginRoleSwitch('hospital')}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${loginRole === 'hospital'
                            ? 'bg-[#EBF7F1] border-[#2F855A] text-[#2F855A] font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white border border-[#CBE5D7] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#2F855A]" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Hospital Partner</span>
                            <span className="text-[10px] text-slate-500 font-medium">Hospital Admin / Partner</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {loginRole === 'trainee' ? 'Email Address' : loginRole === 'hospital' ? 'Hospital Partner Email' : 'Administrator Email'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4 text-[#2F855A]" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder={loginRole === 'trainee' ? 'e.g. dr.ananya@gmail.com' : loginRole === 'hospital' ? 'e.g. partner@maxhealthcare.in' : 'e.g. admin@trainmedix.com'}
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginBusy}
                      className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>{loginBusy ? 'Sending OTP...' : 'Get OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLogin} className="space-y-6">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E2F0EA] text-[#2F855A] mb-2 border border-[#BBE2D1]">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 font-heading">
                        Enter OTP Code
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Enter 4-digit code sent to <strong className="text-slate-900">{loginInput}</strong>
                      </p>
                    </div>

                    <SeamlessOTPInput otp={loginOtp} setOtp={setLoginOtp} idPrefix="login-otp" />

                    {loginError && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center">
                        {loginError}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Didn't receive code?</span>
                      <button
                        type="button"
                        onClick={handleResendLoginOtp}
                        disabled={loginBusy}
                        className="text-[#2F855A] font-bold hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-60"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loginBusy}
                      className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loginBusy ? 'Verifying...' : 'Verify'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setLoginStep('input'); setLoginError(''); }}
                      className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#2F855A] transition"
                    >
                      ← Change Email Address
                    </button>
                  </form>
                )}
              </div>
            )}


            {/* ================= SIGNUP MULTI-STEP FLOW (4 STEPS) ================= */}
            {activeTab === 'signup' && (
              <div className="space-y-6">

                {/* Progress Step Indicator (1 to 4) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <span>Step {signupStep} of 4</span>
                    <span className="text-[#2F855A]">
                      {signupStep === 1 && 'Full Name'}
                      {signupStep === 2 && (signupRole === 'hospital' ? 'Contact & Capacity' : 'Email ID & Phone')}
                      {signupStep === 3 && (signupRole === 'hospital' ? 'Departments & Address' : 'Interest Selection & Authenticate')}
                      {signupStep === 4 && 'Enter OTP'}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2F855A] to-[#3D7A5C] transition-all duration-500 rounded-full"
                      style={{ width: `${(signupStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* STEP 1: ACCOUNT TYPE, NAME & QUALIFICATION / ACCREDITATION */}
                {signupStep === 1 && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={(e) => { e.preventDefault(); if (fullName.trim()) setSignupStep(2); }}
                    className="space-y-4"
                  >
                    {/* Account Type Selector for Sign Up */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Select Account Type to Register
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSignupRoleSwitch('trainee')}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${signupRole === 'trainee'
                            ? 'bg-[#EBF7F1] border-[#2F855A] text-[#2F855A] font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white border border-[#CBE5D7] flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#2F855A]" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Trainee Doctor</span>
                            <span className="text-[10px] text-slate-500 font-medium">Doctor Account</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignupRoleSwitch('hospital')}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${signupRole === 'hospital'
                            ? 'bg-[#EBF7F1] border-[#2F855A] text-[#2F855A] font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white border border-[#CBE5D7] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#2F855A]" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Hospital Partner</span>
                            <span className="text-[10px] text-slate-500 font-medium">Hospital Account</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 font-heading">
                        {signupRole === 'hospital' ? 'Step 1: Hospital / Center Details' : 'Step 1: What is your Full Name?'}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {signupRole === 'hospital' ? 'Enter official hospital name and center details.' : 'Enter your official name as it appears on your medical degree.'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {signupRole === 'hospital' ? 'Hospital / Center Name' : 'Full Name'}
                      </label>
                      <div className="relative">
                        {signupRole === 'hospital' ? <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /> : <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />}
                        <input
                          type="text"
                          required
                          placeholder={signupRole === 'hospital' ? 'e.g. Max Super Speciality Hospital' : 'e.g. Dr. Ananya Roy'}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {signupRole === 'hospital' ? 'Hospital / Center Category' : 'Medical Designation / Qualification'}
                      </label>
                      {signupRole === 'hospital' ? (
                        <CustomSelect
                          value={qualification}
                          onChange={(val) => setQualification(val)}
                          options={[
                            'Super Specialty Hospitals',
                            'Multi-Specialty Hospitals',
                            'Specialty Hospitals',
                            'General Hospitals',
                            'Specialty Clinic setup'
                          ]}
                        />
                      ) : (
                        <CustomSelect
                          value={qualification}
                          onChange={(val) => setQualification(val)}
                          options={[
                            'MBBS Doctor',
                            'Postgraduate Trainee (MD/MS/DNB)',
                            'Intern Doctor',
                            'Clinical Fellow / Specialist',
                            'BAMS / BHMS / Medical Student'
                          ]}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer mt-2"
                    >
                      <span>Next: Email ID</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}


                {/* STEP 2: CONTACT (Hospital) / EMAIL & PHONE (Trainee) */}
                {signupStep === 2 && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleContactStep}
                    noValidate
                    className="space-y-4"
                  >
                    {signupRole === 'hospital' ? (
                      /* ——— HOSPITAL STEP 2 ——— */
                      <>
                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-slate-900 font-heading">
                            Step 2: Contact
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            Provide a primary contact for coordination
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-700">
                            Email Address <span className="text-red-600">*</span>
                            <span className="relative mt-1.5 block">
                              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                              <input
                                type="email"
                                value={emailId}
                                onChange={(e) => { setEmailId(e.target.value); setSignupError(''); }}
                                placeholder="e.g. admin@maxhospital.in"
                                className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                              />
                            </span>
                          </label>
                          <label className="block text-xs font-bold text-slate-700">
                            Mobile Number <span className="text-red-600">*</span>
                            <span className="relative mt-1.5 block">
                              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => { setPhoneNumber(e.target.value); setSignupError(''); }}
                                placeholder="e.g. +91 98765 43210"
                                className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                              />
                            </span>
                          </label>
                          {signupError && (
                            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold" role="alert">
                              {signupError}
                            </div>
                          )}
                          </div>
                      </>
                    ) : (
                      /* ——— TRAINEE STEP 2 (unchanged) ——— */
                      <>
                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-slate-900 font-heading">
                            Step 2: Enter your Email ID & Contact
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            We will send your DMHCA training certificates and rotation confirmations to this email.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                              type="email"
                              required
                              placeholder="e.g. ananya.roy@example.com"
                              value={emailId}
                              onChange={(e) => setEmailId(e.target.value)}
                              className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Mobile Phone Number</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +91 98765 43210"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer"
                      >
                        <span>{signupRole === 'hospital' ? 'Next: Select Departments' : 'Next: Select Specialties'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.form>
                )}


                {/* STEP 3: DEPARTMENTS + ADDRESS (Hospital) / INTERESTS (Trainee) */}
                {signupStep === 3 && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleAuthenticateSignup}
                    className="space-y-4"
                  >
                    {signupRole === 'hospital' ? (
                      /* ——— HOSPITAL STEP 3 ——— */
                      <>
                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-slate-900 font-heading">
                            Step 3: Departments & Hospital Address
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            Select the clinical departments.
                          </p>
                        </div>

                        {/* Department multi-select */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Clinical Departments Offered
                            {selectedDepartments.length > 0 && (
                              <span className="ml-1.5 text-[#2F855A]">({selectedDepartments.length} selected)</span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2.5 bg-white rounded-2xl border border-[#CBE5D7] no-scrollbar">
                            {DEPARTMENTS.map((dept) => {
                              const isSelected = selectedDepartments.includes(dept.id);
                              return (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() => toggleDepartment(dept.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isSelected
                                    ? 'bg-[#2F855A] text-white border-[#2F855A] shadow-2xs'
                                    : 'bg-[#EBF7F1] text-[#3D7A5C] border-[#CBE5D7] hover:bg-[#E2F0EA]'
                                    }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                  <span>{dept.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Hospital Address */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Hospital Address</label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. 1, Press Enclave Road, Saket, New Delhi"
                              value={hospitalAddress}
                              onChange={(e) => setHospitalAddress(e.target.value)}
                              className="w-full bg-white border border-[#CBE5D7] focus:border-[#2F855A] rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ——— TRAINEE STEP 3 (unchanged) ——— */
                      <>
                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-slate-900 font-heading">
                            Step 3: Select Clinical Rotation Interests
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            Choose your primary specialty interests.
                          </p>
                        </div>

                        {/* Multi-Select Specialties Grid */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Specialty Interests (Select Multiple)</label>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-2xl border border-[#CBE5D7] no-scrollbar">
                            {CLINICAL_SPECIALTIES.map((spec) => {
                              const isSelected = selectedInterests.includes(spec);
                              return (
                                <button
                                  key={spec}
                                  type="button"
                                  onClick={() => toggleInterest(spec)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isSelected
                                    ? 'bg-[#2F855A] text-white shadow-2xs'
                                    : 'bg-[#EBF7F1] text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                  <span>{spec}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Preferred City Selection */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Preferred Training Location</label>
                          <CustomSelect
                            value={preferredCity}
                            onChange={(val) => setPreferredCity(val)}
                            options={PREFERRED_CITIES}
                          />
                        </div>
                      </>
                    )}

                    {signupError && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                        {signupError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(2)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={signupBusy}
                        className="flex-1 bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-200" />
                        <span>{signupBusy ? 'Sending OTP...' : 'Authenticate Account'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}


                {/* STEP 4: ENTER OTP PAGE */}
                {signupStep === 4 && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleVerifySignup}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E2F0EA] text-[#2F855A] mb-2 border border-[#BBE2D1]">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 font-heading">
                        Step 4: Enter Verification OTP
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        We sent a 4-digit security code to <strong className="text-slate-900">{emailId}</strong>
                      </p>
                    </div>

                    <SeamlessOTPInput otp={signupOtp} setOtp={setSignupOtp} idPrefix="signup-otp" />

                    {signupError && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center">
                        {signupError}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Didn't receive code?</span>
                      <button
                        type="button"
                        onClick={handleResendSignupOtp}
                        disabled={signupBusy}
                        className="text-[#2F855A] font-bold hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-60"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSignupStep(3); setSignupError(''); }}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={signupBusy}
                        className="flex-1 bg-[#2F855A] hover:bg-[#276749] text-white font-extrabold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span>{signupBusy ? 'Verifying...' : 'Verify'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
