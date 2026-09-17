'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Stethoscope,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ValueSection: React.FC = () => {
  const { setActiveTab } = useApp();

  const coreValues = [
    {
      icon: Building2,
      title: 'Department-Wise Booking',
      subtitle: 'Precision Specialty Focus',
      description: 'Book clinical exposure in specific departments like Emergency Medicine, Cardiology, ICU, Radiology, Surgery, and 6 more.',
      iconBg: 'bg-[#E6F4F6] text-[#3597A4] border-[#E6F4F6]',
      badge: '11 Departments'
    },
    {
      icon: Stethoscope,
      title: 'Real Hospital Exposure',
      subtitle: 'Live Patient Interaction',
      description: 'Train directly in tertiary JCI & Partner hospitals alongside senior consultants & specialist faculty, scrub in OTs, and manage ward rounds.',
      iconBg: 'bg-[#E8F3EE] text-[#4A7865] border-[#CBE2D7]',
      badge: 'Live Clinical Practice'
    },
    {
      icon: Clock,
      title: 'Flexible Training Duration',
      subtitle: '1 / 3 / 6 Months Options',
      description: 'Tailor your rotation to your schedule with flexible 1-month, 3-month, or 6-month clinical rotation options.',
      iconBg: 'bg-[#E6F4F6] text-[#3597A4] border-[#E6F4F6]',
      badge: '1 - 6 Months'
    },
    {
      icon: MapPin,
      title: 'City & Hospital Selection',
      subtitle: 'Top Metro Hubs',
      description: 'Choose your preferred location and pick top partner hospitals matching your career goals.',
      iconBg: 'bg-[#E6F4F6] text-[#3597A4] border-[#E6F4F6]',
      badge: 'Top Cities'
    },
    {
      icon: Award,
      title: 'Verified Certification',
      subtitle: 'DMHCA Verified',
      description: 'Receive an official DMHCA clinical completion certificate with instant verification credentialing and career advancement.',
      iconBg: 'bg-[#FCF7E8] text-[#D6A125] border-[#F4E6BD]',
      badge: 'Instant Verification'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-10 sm:py-14 bg-[#E6F4F6] border-b border-[#E6F4F6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-[#E3D9CC] text-[#4A7865] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#4A7865]" />
            <span>Core Value Proposition</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1F1C18] tracking-tight font-heading">
            Why Healthcare Professionals Choose <span className="gradient-text-blue">TrainMedix</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Positioned specifically as a direct hospital training booking platform — not a theoretical LMS or course marketplace.
          </p>
        </motion.div>

        {/* Value Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {coreValues.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                className="glass-card rounded-3xl p-7 flex flex-col justify-between border border-[#EBE4DB] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center ${item.iconBg} shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="bg-[#E6F4F6] text-[#4A7865] border border-[#E6F4F6] text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#1F1C18] font-heading">{item.title}</h3>
                    <p className="text-xs font-bold text-[#3597A4] mt-0.5">{item.subtitle}</p>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
                    Verified Partner Network
                  </span>
                  <button
                    onClick={() => setActiveTab('departments')}
                    className="text-xs font-extrabold text-[#3597A4] hover:text-[#1F6F76] transition flex items-center gap-1 cursor-pointer group"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Brand Comparison Card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01 }}
            className="bg-[#1F1C18] text-white rounded-3xl p-7 flex flex-col justify-between shadow-2xl border border-slate-700/50"
          >
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-[#3597A4]/20 border border-[#3597A4]/40 flex items-center justify-center text-[#A8DEC2] shadow-inner">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">TrainMedix vs LMS</h3>
                <p className="text-xs font-bold text-[#A8DEC2] mt-0.5">Hospital-Based Practice</p>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7BC0D4] shrink-0" />
                  <span><strong>100% Real Patient Exposure</strong> in OPD/IPD/OT</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7BC0D4] shrink-0" />
                  <span>Supervised by Senior Hospital Mentors</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7BC0D4] shrink-0" />
                  <span>Clinical Logbook Verification</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 line-through">
                  <span className="text-[#E53E3E] font-bold shrink-0">✕</span>
                  <span>Not video lectures or online MCQs</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('departments')}
              className="w-full mt-6 bg-[#3597A4] hover:bg-[#1F6F76] text-white text-xs font-bold py-3.5 rounded-xl transition touch-target cursor-pointer shadow-sm"
            >
              Explore Clinical Departments
            </button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
