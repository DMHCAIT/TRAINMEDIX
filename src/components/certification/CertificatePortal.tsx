'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  ShieldCheck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  Printer,
  Sparkles
} from 'lucide-react';
import type { Certificate } from '../../types';

export const CertificatePortal: React.FC = () => {
  const { certificates, verifyCertificate } = useApp();

  const [searchCode, setSearchCode] = useState('');
  const [activeCert, setActiveCert] = useState<Certificate | null>(certificates[0] || null);
  const [verificationError, setVerificationError] = useState(false);

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(false);
    if (!searchCode.trim()) return;

    const res = verifyCertificate(searchCode);
    if (res) {
      setActiveCert(res);
    } else {
      setVerificationError(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-[#E2F0EA] border border-[#C5DED0] text-[#3D7A5C] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
          <Award className="w-4 h-4 text-[#2F855A] animate-pulse" />
          <span>DMHCA Verified Credentialing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Official Clinical Training <span className="gradient-text-blue">Certification</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Every TrainMedix clinical rotation culminates in an official DMHCA digital & physical certificate equipped with tamper-proof QR code verification.
        </p>
      </motion.div>

      {/* QR Code Verification Search Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl max-w-2xl mx-auto border border-slate-200/80"
      >
        <form onSubmit={handleVerifySearch} className="space-y-3.5">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider font-heading">
            Verify Certificate Code / DMHCA Registration Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Code (e.g. DMHCA-TMX-2026-0041 or DMHCA-8891-VERIFIED)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full bg-white/90 border border-slate-300/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 focus:border-[#2F855A] focus:ring-2 focus:ring-[#2F855A]/20 focus:outline-none touch-target transition shadow-2xs font-medium"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-7 py-3.5 rounded-2xl transition shadow-md shadow-[#2F855A]/25 flex items-center justify-center gap-2 touch-target cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Now</span>
            </motion.button>
          </div>

          {verificationError && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-rose-600 font-bold flex items-center gap-1"
            >
              ⚠️ Certificate code not found. Try searching with "DMHCA-8891-VERIFIED" or "TMX-2026".
            </motion.p>
          )}
        </form>
      </motion.div>

      {/* Interactive Paper-Style Certificate View Card */}
      <AnimatePresence mode="wait">
        {activeCert && (
          <motion.div 
            key={activeCert.certificateId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden border border-slate-200/80"
          >
            
            {/* Certificate Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E2F0EA] border border-[#C5DED0] flex items-center justify-center text-[#2F855A] shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Authenticated & Verified by DMHCA
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">Reg No: {activeCert.dmhcaRegNumber}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className="bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 font-bold text-xs px-4.5 py-2.5 rounded-2xl border border-slate-200/80 transition flex items-center gap-2 touch-target cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </motion.button>
            </div>

            {/* Certificate Frame Preview */}
            <div className="border-4 border-double border-slate-300/80 bg-gradient-to-br from-amber-50/30 via-white to-slate-50/50 p-8 sm:p-12 rounded-3xl text-center space-y-6 relative shadow-inner">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#E2F0EA] border border-[#C5DED0] text-[#3D7A5C] font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  DMHCA Hospital Training Certification
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
                  Certificate of Clinical Excellence
                </h2>
                <p className="text-xs text-slate-500 font-serif italic">This is to certify that</p>
              </div>

              <div className="py-3 border-b border-t border-slate-200/80 max-w-lg mx-auto">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-[#2F855A] tracking-wide font-heading">
                  {activeCert.traineeName}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">{activeCert.qualification}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                has successfully completed <strong>{activeCert.duration}</strong> of direct hands-on clinical training in the Department of <strong className="text-slate-900 font-heading">{activeCert.departmentName}</strong> at <strong className="text-slate-900 font-heading">{activeCert.hospitalName}</strong> under the supervision of DMHCA accredited clinical faculty.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 font-heading">Date of Issue</p>
                  <p className="text-slate-600 font-mono font-semibold">{activeCert.issueDate}</p>
                </div>

                {/* QR Code Verification Display */}
                <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-md">
                  <img
                    src={activeCert.qrCodeUrl}
                    alt="QR Code Verification"
                    className="w-20 h-20 bg-white p-1"
                  />
                  <span className="text-[10px] font-mono text-[#2F855A] font-extrabold">{activeCert.verificationCode}</span>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900 font-heading">DMHCA Director Seal</p>
                  <p className="text-emerald-700 font-bold text-xs font-heading">Dr. S. K. Mehta, MD</p>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
