'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowUp,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2F855A]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2F855A]/10 rounded-full filter blur-3xl pointer-events-none" />

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
              <div className="w-14 h-14 rounded-2xl bg-[#2F855A]/20 border border-[#2F855A]/30 flex items-center justify-center text-[#2F855A] shrink-0 shadow-inner">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg font-heading">Book Clinical Experience, Not Just Courses</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">India's First Department-Wise Hospital Training Booking Platform by DMHCA</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('departments')}
              className="w-full md:w-auto bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs sm:text-sm px-7 py-4 rounded-full transition shadow-lg shadow-[#2F855A]/25 whitespace-nowrap touch-target cursor-pointer"
            >
              Check Slot Availability
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-6">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2F855A] text-white flex items-center justify-center shadow-md">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-heading">
                Train<span className="text-[#2F855A]">Medix</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              TrainMedix connects healthcare professionals with verified hospital training departments across India, real patient interaction, and DMHCA certification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-[#2B2722] border border-[#3E3831] px-3.5 py-2 rounded-xl text-[11px] text-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#84A98C]" />
                <span>DMHCA Verified Platform</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2B2722] border border-[#3E3831] px-3.5 py-2 rounded-xl text-[11px] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#2F855A]" />
                <span>50+ Partner Hospitals</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2 font-heading">Connect With Us</span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/dmhca_official/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-md shadow-pink-600/25"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://www.facebook.com/dmhca.in"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-md shadow-blue-600/25"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://www.youtube.com/@dmhca"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#FF0000] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-md shadow-red-600/25"
                  aria-label="YouTube"
                >
                  <YoutubeIcon />
                </a>
                <a
                  href="https://www.linkedin.com/company/dmhca/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-md shadow-blue-700/25"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon />
                </a>
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
                    <button onClick={() => router.push('/hospital-portal?tab=departments')} className="hover:text-[#2F855A] transition cursor-pointer">
                      Department Management
                    </button>
                  </li>
                  <li>
                    <button onClick={() => router.push('/hospital-portal?tab=slots')} className="hover:text-[#2F855A] transition cursor-pointer">
                      Slot Management
                    </button>
                  </li>
                  <li>
                    <button onClick={() => router.push('/hospital-portal?tab=approvals')} className="hover:text-[#2F855A] transition cursor-pointer">
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
                    <button onClick={() => setActiveTab('departments')} className="hover:text-[#2F855A] transition cursor-pointer">
                      Browse Departments
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('hospitals')} className="hover:text-[#2F855A] transition cursor-pointer">
                      Hospital Directory
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { if (!isLoggedIn) { openAuthModal('login'); } else { setActiveTab('dashboard'); } }} className="hover:text-[#2F855A] transition cursor-pointer">
                      Trainee Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { if (!isLoggedIn) { openAuthModal('login'); } else { setActiveTab('certification'); } }} className="hover:text-[#2F855A] transition cursor-pointer">
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
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2F855A] transition cursor-pointer">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2F855A] transition cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2F855A] transition cursor-pointer">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2F855A] transition cursor-pointer">
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
                <MapPin className="w-4 h-4 text-[#2F855A] shrink-0 mt-0.5" />
                <span>Buliding No.-581/2, First Floor, Khatana Farm, Mandi Rd, Sultanpur, New Delhi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2F855A] shrink-0" />
                <span>info@dmhca.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2F855A] shrink-0" />
                <span>+91 9899711530</span>
              </div>

              <a
                href={role === 'hospital' && isLoggedIn 
                  ? "https://wa.me/919899711530?text=Hello%2C%20I%20am%20interested%20in%20hospital%20Partner%20with%20DMHCA."
                  : "https://wa.me/919899711530?text=Hello%2C%20I%20am%20interested%20in%20clinical%20training."
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#2B2722] hover:bg-[#3E3831] border border-[#6B9080]/60 text-[#84A98C] font-semibold px-4 py-2.5 rounded-full text-xs transition mt-2 touch-target shadow-xs"
              >
                <WhatsAppIcon />
                <span>Instant WhatsApp Support</span>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-[#36312B] pt-4 sm:pt-5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TrainMedix by DMHCA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <span>Verified Hospital Partner Network</span>
              <span>·</span>
              <span>DMHCA Accredited</span>
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
