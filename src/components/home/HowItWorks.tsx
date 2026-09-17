'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Clock,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorks: React.FC = () => {
  const { setActiveTab } = useApp();

  const steps = [
    {
      step: '01',
      title: 'Select Department',
      subtitle: 'Choose Specialty',
      description: 'Pick from 11 clinical departments including Emergency Medicine, Cardiology, ICU, Radiology, and Surgery.',
      icon: Building2,
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Choose City & Hospital',
      subtitle: 'Top Partner Hospitals',
      description: 'Select your preferred location (Delhi, Noida, Mumbai, Hyderabad, lucknow).',
      icon: MapPin,
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Pick Duration',
      subtitle: 'Flexible Rotation',
      description: 'Choose 1 Month, 3 Months, or 6 Months clinical training commitment.',
      icon: Clock,
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Check Available Slots',
      subtitle: 'Real-Time Capacity',
      description: 'View live seat counters ("2 slots left") and upcoming batch start dates on the interactive calendar.',
      icon: CalendarCheck,
      badge: 'Step 4'
    },
    {
      step: '05',
      title: 'Confirm & Start Training',
      subtitle: 'DMHCA Onboarding',
      description: 'Fill medical credentials, upload documents, complete payment, and receive instant onboarding confirmation.',
      icon: CheckCircle2,
      badge: 'Step 5'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-10 sm:py-14 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-[#E6F4F6] border border-[#E6F4F6] text-[#3597A4] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#3597A4] animate-spin" style={{ animationDuration: '8s' }} />
            <span>Seamless Booking Process</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
            How to Book Your Hospital Training in <span className="gradient-text-blue">5 Simple Steps</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Fast, transparent, and direct booking process designed for doctors, medical residents, and healthcare professionals.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5"
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => setActiveTab('departments')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#3597A4] bg-[#E6F4F6] border border-[#E6F4F6] px-2.5 py-1 rounded-lg shadow-2xs">
                      {item.badge}
                    </span>
                    <span className="text-2xl font-black text-slate-300 group-hover:text-[#3597A4] transition-colors font-heading">
                      {item.step}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#E6F4F6] border border-[#E6F4F6] flex items-center justify-center text-[#3597A4] mb-4 group-hover:bg-[#3597A4] group-hover:text-white group-hover:border-[#3597A4] transition-all duration-300 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-heading">{item.title}</h3>
                  <p className="text-[11px] font-bold text-[#3597A4] mt-0.5">{item.subtitle}</p>

                  <p className="text-slate-600 text-xs mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Instant Confirmation</span>
                  <ChevronRight className="w-4 h-4 text-[#3597A4] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('departments')}
            className="w-full sm:w-auto bg-[#3597A4] hover:bg-[#1F6F76] text-white font-bold text-sm sm:text-base px-9 py-4 rounded-2xl transition shadow-lg shadow-[#3597A4]/30 inline-flex items-center justify-center gap-2.5 touch-target cursor-pointer"
          >
            <CalendarCheck className="w-5 h-5" />
            <span>Start Interactive Booking Engine</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};
