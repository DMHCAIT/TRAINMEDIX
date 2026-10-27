'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowUp,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const WhatsAppIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab, isLoggedIn, openAuthModal, role } = useApp();

  if (pathname?.startsWith('/admin') || activeTab === 'admin') {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#1F1C18] text-slate-300 pt-8 pb-6 mt-6 sm:mt-8 overflow-hidden border-t border-[#36312B]">
      {/* Background Mesh Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3597A4]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3597A4]/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Banner Tagline Strip - Hidden for Hospital Partners */}
        {!(role === 'hospital' && isLoggedIn) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#2B2722] border border-[#3E3831] rounded-3xl p-5 sm:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                <Image
                  src="/Trainmedix_logo.png"
                  alt="TrainMedix logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg font-heading">Book Clinical Experience, Not Just Courses</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">India's First Department-Wise Hospital Training Booking Platform</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('departments')}
              className="w-full md:w-auto bg-[#3597A4] hover:bg-[#1F6F76] text-white font-bold text-xs sm:text-sm px-7 py-4 rounded-full transition shadow-lg shadow-[#3597A4]/25 whitespace-nowrap touch-target cursor-pointer"
            >
              Check Slot Availability
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-6">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-0.5">
              <div className="w-16 h-16 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/Trainmedix_logo.png"
                  alt="TrainMedix logo"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <span className="font-extrabold text-3xl tracking-tight text-white font-heading leading-none">
                Train<span className="text-[#3597A4]">Medix</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              TrainMedix connects healthcare professionals with verified hospital training departments across India, real patient interaction, and completion certificates.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-[#2B2722] border border-[#3E3831] px-3.5 py-2 rounded-xl text-[11px] text-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#7BC0D4]" />
                <span>Verified Training Platform</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2B2722] border border-[#3E3831] px-3.5 py-2 rounded-xl text-[11px] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#3597A4]" />
                <span>50+ Partner Hospitals</span>
              </div>
            </div>

          </div>

          {/* Quick Links Container (Side-by-side on mobile) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-2 lg:gap-8">
            {/* Training Booking / Hospital Partnership Section */}
            {role === 'hospital' && isLoggedIn ? (
              <div>
                <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-heading">Hospital Partnership</h5>
                <ul className="space-y-3 text-xs">
                  <li>
                    <button onClick={() => router.push('/hospital-portal?tab=departments')} className="hover:text-[#3597A4] transition cursor-pointer">
                      Department Management
                    </button>
                  </li>
                  <li>
                    <button onClick={() => router.push('/hospital-portal?tab=slots')} className="hover:text-[#3597A4] transition cursor-pointer">
                      Slot Management
                    </button>
                  </li>
                  <li>
                    <button onClick={() => router.push('/hospital-portal?tab=approvals')} className="hover:text-[#3597A4] transition cursor-pointer">
                      Trainee Approvals
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-heading">Training Booking</h5>
                <ul className="space-y-3 text-xs">
                  <li>
                    <button onClick={() => setActiveTab('departments')} className="hover:text-[#3597A4] transition cursor-pointer">
                      Browse Departments
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('hospitals')} className="hover:text-[#3597A4] transition cursor-pointer">
                      Hospital Directory
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { if (!isLoggedIn) { openAuthModal('login'); } else { setActiveTab('dashboard'); } }} className="hover:text-[#3597A4] transition cursor-pointer">
                      Trainee Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { if (!isLoggedIn) { openAuthModal('login'); } else { setActiveTab('certification'); } }} className="hover:text-[#3597A4] transition cursor-pointer">
                      Certificate Verification
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Company & Legal */}
            <div>
              <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-heading">Company & Legal</h5>
              <ul className="space-y-3 text-xs">
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#3597A4] transition cursor-pointer">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#3597A4] transition cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#3597A4] transition cursor-pointer">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#3597A4] transition cursor-pointer">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Helpdesk */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-heading">
              {role === 'hospital' && isLoggedIn ? 'Hospital Support' : 'Training Helpdesk'}
            </h5>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#3597A4] shrink-0 mt-0.5" />
                <span>8-2-351/W/B 1st Floor, Green Valley, Navodaya society, Banjara Hills Road no-3, Behind Times of India, Hyderabad, Telangana 500034</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#3597A4] shrink-0" />
                <span>+91 9899711530</span>
              </div>

              <a
                href={role === 'hospital' && isLoggedIn 
                  ? "https://wa.me/919899711530?text=Hello%2C%20I%20am%20interested%20in%20hospital%20partnership."
                  : "https://wa.me/919899711530?text=Hello%2C%20I%20am%20interested%20in%20clinical%20training."
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#2B2722] hover:bg-[#3E3831] border border-[#6B9080]/60 text-[#7BC0D4] font-semibold px-4 py-2.5 rounded-full text-xs transition mt-2 touch-target shadow-xs"
              >
                <WhatsAppIcon />
                <span>Instant WhatsApp Support</span>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-[#36312B] pt-4 sm:pt-5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TrainMedix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <span>Verified Hospital Partner Network</span>
              <span>·</span>
              <span>Accredited</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-2.5 rounded-full bg-[#2B2722] border border-[#3E3831] hover:bg-[#3E3831] text-slate-300 transition cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

      </div>
    </footer>
  );
};
