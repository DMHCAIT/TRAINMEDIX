import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Building2,
  CalendarRange
} from 'lucide-react';
import type { Booking } from '../../types';

export const TraineeApprovals: React.FC = () => {
  const { bookings, activeHospital, updateBookingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'pending' | 'active' | 'history'>('pending');

  // Single Hospital Filtered Bookings
  const hospitalBookings = bookings.filter(
    (b) => activeHospital && (b.hospitalId === activeHospital.id || b.hospitalName === activeHospital.name)
  );

  const pendingBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Pending Approval');
  const activeBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation');
  const historyBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Completed' || b.bookingStatus === 'Rejected');

  const filterBookings = (list: Booking[]) => {
    return list.filter((b) =>
      b.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getBadgeStyle = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'Approved':
      case 'In Rotation':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Pending Approval':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-6 text-xs w-full max-w-full overflow-x-hidden">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-[#CBE5D7] shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2F855A] mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{activeHospital?.name || 'Hospital'} Approval Desk</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
            Trainee Approvals & Rotation Management
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Review incoming doctor requests and issue rotation completion signoffs.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trainee or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-[#2F855A] focus:outline-none"
          />
        </div>
      </div>

      {/* Sub Tabs - Responsive Scroll Container */}
      <div className="w-full max-w-full overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/80">
        <div className="flex gap-2 min-w-max pb-2">
          {[
            { key: 'pending', label: 'Pending Requests', count: pendingBookings.length, icon: Clock },
            { key: 'active', label: 'Active Trainees In Rotation', count: activeBookings.length, icon: UserCheck },
            { key: 'history', label: 'Rotation History', count: historyBookings.length, icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSubTab(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold transition cursor-pointer shrink-0 text-xs ${
                  isActive
                    ? 'bg-[#2F855A] text-white shadow-xs'
                    : 'bg-white/90 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PENDING REQUESTS */}
      {subTab === 'pending' && (
        <div className="space-y-4">
          {filterBookings(pendingBookings).length === 0 ? (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center text-slate-500">
              <Clock className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              No pending trainee requests for {activeHospital?.name || 'hospital'}.
            </div>
          ) : (
            filterBookings(pendingBookings).map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -2 }}
                className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80 hover:border-amber-400 transition shadow-xs w-full max-w-full"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                      Pending Approval
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">REF: {b.bookingRef}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 font-heading break-words">{b.traineeName}</h4>
                  <p className="text-slate-600 font-semibold break-words">
                    Qualification: <span className="text-slate-900 font-bold">{b.medicalQualification}</span> · Reg: <span className="text-slate-900 font-mono">{b.councilRegistrationNumber}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed break-words">
                    Specialization: <strong className="text-slate-900">{b.subDepartment || b.departmentName}</strong> <span className="bg-[#E2F0EA] text-[#2F855A] font-bold text-[10px] px-2 py-0.5 rounded border border-[#C5DED0] ml-1">{b.departmentName}</span> · Duration: <strong>{b.duration}</strong> (Start Date: {b.startDate})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => updateBookingStatus(b.id, 'Approved')}
                    className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'Rejected')}
                    className="bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-rose-200 transition cursor-pointer"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE TRAINEES */}
      {subTab === 'active' && (
        <div className="space-y-4">
          {filterBookings(activeBookings).length === 0 ? (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center text-slate-500">
              <CalendarRange className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              No active trainees currently in rotation at {activeHospital?.name || 'hospital'}.
            </div>
          ) : (
            filterBookings(activeBookings).map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -2 }}
                className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80 hover:border-[#2F855A] transition shadow-xs w-full max-w-full"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#E2F0EA] text-[#2F855A] border border-[#C5DED0] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {b.bookingStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">REF: {b.bookingRef}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 font-heading break-words">{b.traineeName}</h4>
                  <p className="text-slate-600 font-semibold break-words">
                    Rotation: <strong className="text-slate-900">{b.departmentName}</strong> · City: <strong className="text-slate-900">{b.city}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">Duration: <strong>{b.duration}</strong> · Started on: <strong>{b.startDate}</strong></p>
                </div>

                <button
                  onClick={() => updateBookingStatus(b.id, 'Completed')}
                  className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 self-start md:self-center"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Issue Rotation Signoff
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ROTATION HISTORY */}
      {subTab === 'history' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs w-full max-w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[550px]">
              <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading text-[10px]">
                <tr>
                  <th className="p-4">Trainee Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 font-medium text-slate-800">
                {filterBookings(historyBookings).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No historical rotation records.
                    </td>
                  </tr>
                ) : (
                  filterBookings(historyBookings).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900 font-heading">{b.traineeName}</td>
                      <td className="p-4 font-semibold text-slate-700">{b.departmentName}</td>
                      <td className="p-4 text-slate-600">{b.city}</td>
                      <td className="p-4 text-slate-600">{b.duration}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border ${getBadgeStyle(b.bookingStatus)}`}>
                          {b.bookingStatus === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
