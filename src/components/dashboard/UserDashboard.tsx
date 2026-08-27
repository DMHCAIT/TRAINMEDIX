'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ClipboardList
} from 'lucide-react';

import { DEPARTMENTS } from '../../data/mockData';
import { useRouter } from 'next/navigation';

export const UserDashboard: React.FC = () => {
  const router = useRouter();
  const { bookings, logbook, addLogbookEntry, setActiveTab, isLoggedIn, userProfile } = useApp();

  React.useEffect(() => {
    if (!isLoggedIn) {
      setActiveTab('home');
      router.push('/');
    }
  }, [isLoggedIn, setActiveTab, router]);

  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'logbook' | 'documents' | 'schedule'>('bookings');

  // New Logbook Form state
  const [procedureName, setProcedureName] = useState('');
  const [casesObserved, setCasesObserved] = useState<number>(2);
  const [casesAssisted, setCasesAssisted] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  const activeBooking = bookings[0]; // Primary active rotation
  const userName = userProfile?.fullName || 'Trainee Doctor';

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureName) return;

    addLogbookEntry({
      bookingId: activeBooking?.id || 'bk-9901',
      date: new Date().toISOString().split('T')[0],
      procedureName,
      casesObserved: Number(casesObserved),
      casesAssisted: Number(casesAssisted),
      notes
    });

    setProcedureName('');
    setNotes('');
    setShowAddLogModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Dashboard Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{bookings.length > 0 ? 'Active Rotation Registered' : 'Trainee Doctor Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              Welcome, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {activeBooking ? (
                <>Department of <strong>{activeBooking.departmentName}</strong> · {activeBooking.hospitalName}, {activeBooking.city}</>
              ) : (
                <>{(userProfile as any)?.qualification || 'Clinical Trainee'} · {userProfile?.email || userProfile?.phone || 'TrainMedix Portal'}</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('certification')}
              className="w-full md:w-auto bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-6 py-3.5 rounded-2xl transition shadow-md shadow-[#2F855A]/25 flex items-center justify-center gap-2 touch-target cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Claim / View DMHCA Certificate</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'bookings', label: 'My Training Bookings', icon: Calendar },
          { id: 'logbook', label: 'Clinical Attendance & Logbook', icon: ClipboardList },
          { id: 'documents', label: 'Document Upload Status', icon: FileText },
          { id: 'schedule', label: 'Hospital Shift Schedule', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap touch-target cursor-pointer min-w-max ${isActive
                ? 'text-white font-extrabold'
                : 'bg-white/80 text-slate-700 hover:bg-slate-100/80 border border-slate-200/80'
                }`}
            >
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-[#2F855A] rounded-2xl shadow-xs"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY BOOKINGS */}
      {activeSubTab === 'bookings' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* Main Booking Card / Empty State */}
            <div className="lg:col-span-2 space-y-4">
              {bookings.length === 0 ? (
                <div className="glass-card rounded-3xl p-8 border border-slate-200/80 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#E2F0EA] text-[#2F855A] flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">No Active Rotation Bookings</h3>
                    <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                      You haven't booked any clinical training rotations yet. Explore available hospital slots to begin your rotation.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('hospitals')}
                    className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    Explore Training Slots
                  </button>
                </div>
              ) : (
                bookings.map((bk) => {
                  const deptMatch = DEPARTMENTS.find(d => d.id === bk.departmentId || d.name === bk.departmentName);
                  const CategoryName = deptMatch ? deptMatch.name : (bk.departmentName || 'Clinical Department');
                  const specializationTitle = bk.subDepartment || deptMatch?.subDepartments?.[0] || bk.departmentName || 'Specialty Clinical';

                  return (
                    <motion.div
                      key={bk.id}
                      whileHover={{ y: -3 }}
                      className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 space-y-5 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-[#3D7A5C] bg-[#E2F0EA] px-2.5 py-1 rounded-md border border-[#C5DED0]">
                              REF: {bk.bookingRef}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                              {CategoryName}
                            </span>
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                            {specializationTitle} Rotation
                          </h3>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{bk.hospitalName} · {bk.city}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold px-3 py-1 rounded-full uppercase shadow-2xs font-heading">
                          {bk.bookingStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Duration</span>
                          <span className="font-extrabold text-slate-900 font-heading">{bk.duration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Start Date</span>
                          <span className="font-extrabold text-slate-900 font-heading">{bk.startDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Paid Amount</span>
                          <span className="font-extrabold text-emerald-700 font-heading">₹{bk.amountPaid.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Payment Method</span>
                          <span className="font-bold text-slate-700 font-heading">{bk.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Supervisor Details */}
                      <div className="p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-[#E2F0EA] border border-[#C5DED0] flex items-center justify-center text-[#2F855A] font-bold font-heading">
                            DR
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 font-heading">Clinical Department Lead</p>
                            <p className="text-[11px] text-slate-600">{specializationTitle} ({CategoryName}) · {bk.hospitalName}</p>
                          </div>
                        </div>

                        <a
                          href="tel:+919876543210"
                          className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-200/80 transition text-[11px] touch-target shadow-2xs"
                        >
                          Call Desk
                        </a>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
                <h4 className="text-xs font-extrabold text-[#2F855A] uppercase tracking-wider font-heading">Rotation Completion</h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Clinical Rotation Progress</span>
                    <span className="text-[#2F855A] font-heading">{bookings.length > 0 ? '65%' : '0%'}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: bookings.length > 0 ? '65%' : '0%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[#2F855A] rounded-full shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Cases Logged:</span> <span className="font-bold text-slate-900">{logbook.length} Procedures</span></div>
                  <div className="flex justify-between"><span>Shift Attendance:</span> <span className="font-extrabold text-emerald-700">{bookings.length > 0 ? '100% Present' : '0%'}</span></div>
                  <div className="flex justify-between"><span>DMHCA QR Verification:</span> <span className="font-bold text-[#2F855A]">{isLoggedIn ? 'Verified' : 'Pending'}</span></div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* TAB 2: CLINICAL LOGBOOK */}
      {activeSubTab === 'logbook' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Daily Clinical Attendance & Procedure Logbook</h3>
              <p className="text-xs text-slate-600">Log observed procedures, assisted surgeries, and ward cases for mentor signoff.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddLogModal(true)}
              className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#2F855A]/25 touch-target cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Procedure</span>
            </motion.button>
          </div>

          {/* Logbook Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading">
                  <tr>
                    <th className="p-4.5">Date</th>
                    <th className="p-4.5">Procedure / Clinical Task</th>
                    <th className="p-4.5 text-center">Observed</th>
                    <th className="p-4.5 text-center">Assisted</th>
                    <th className="p-4.5">Supervisor Signoff</th>
                    <th className="p-4.5">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-slate-700 font-medium">
                  {logbook.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                        No procedure logbook entries recorded yet. Click "Log New Procedure" above to add a case.
                      </td>
                    </tr>
                  ) : (
                    logbook.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#E2F0EA]/50 transition">
                        <td className="p-4.5 font-mono text-[#2F855A] font-bold">{entry.date}</td>
                        <td className="p-4.5 font-bold text-slate-900 font-heading">{entry.procedureName}</td>
                        <td className="p-4.5 text-center font-bold">{entry.casesObserved}</td>
                        <td className="p-4.5 text-center font-bold text-emerald-700">{entry.casesAssisted}</td>
                        <td className="p-4.5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Signed by Mentor
                          </span>
                        </td>
                        <td className="p-4.5 text-slate-600 max-w-xs truncate">{entry.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeSubTab === 'documents' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-3xl p-7 space-y-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Hospital Credentialing Documents</h3>
            <p className="text-xs text-slate-600">All submitted documents are verified by DMHCA & hospital administration.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { title: 'Degree Certificate', status: 'Verified', date: '2026-07-20' }
              ].map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <FileText className="w-5 h-5 text-[#2F855A]" />
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {doc.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Submitted on {doc.date}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-3xl p-7 space-y-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Emergency Medicine Shift Schedule</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] font-extrabold text-[#2F855A] uppercase font-heading">Morning Shift</p>
                <p className="text-base font-bold text-slate-900 font-heading">08:00 AM – 02:00 PM</p>
                <p className="text-xs text-slate-600 font-medium">Trauma Bay & Resuscitation Room</p>
              </div>
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] font-extrabold text-[#2F855A] uppercase font-heading">Evening Shift</p>
                <p className="text-base font-bold text-slate-900 font-heading">02:00 PM – 08:00 PM</p>
                <p className="text-xs text-slate-600 font-medium">Acute OPD Triage & Procedure OT</p>
              </div>
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] font-extrabold text-[#2F855A] uppercase font-heading">Night Call (Optional)</p>
                <p className="text-base font-bold text-slate-900 font-heading">08:00 PM – 08:00 AM</p>
                <p className="text-xs text-slate-600 font-medium">Trauma ICU & Mass Casualty Rotations</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Log Modal */}
      <AnimatePresence>
        {showAddLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-900"
            >
              <h3 className="text-lg font-bold text-slate-900 font-heading">Log Clinical Procedure</h3>

              <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Procedure Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Endotracheal Intubation, Central Line, Chest Tube"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cases Observed</label>
                    <input
                      type="number"
                      min={0}
                      value={casesObserved}
                      onChange={(e) => setCasesObserved(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cases Assisted</label>
                    <input
                      type="number"
                      min={0}
                      value={casesAssisted}
                      onChange={(e) => setCasesAssisted(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Clinical Learning Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe patient case details and key steps learned under supervisor..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl p-3.5 text-slate-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLogModal(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Save Log Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
