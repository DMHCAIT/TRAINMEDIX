import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Booking } from '../../types';

export const HospitalOverview: React.FC = () => {
  const { bookings, activeHospital, departments, slots } = useApp();

  // DEBUG: Log incoming data
  React.useEffect(() => {
    console.log('[HospitalOverview] activeHospital:', activeHospital);
    console.log('[HospitalOverview] bookings count:', bookings?.length || 0);
    console.log('[HospitalOverview] slots count:', slots?.length || 0);
    console.log('[HospitalOverview] departments count:', departments?.length || 0);
  }, [activeHospital, bookings, slots, departments]);

  // Scope to Single Active Hospital
  const hospitalBookings = bookings.filter(
    (b) => activeHospital && (b.hospitalId === activeHospital.id || b.hospitalName === activeHospital.name)
  );
  const hospitalSlots = slots.filter((s) => activeHospital && s.hospitalId === activeHospital.id);
  
  // Get departments for this hospital
  const hospitalDepartments = departments.filter((d) => {
    // Check if department is assigned to this hospital
    if (activeHospital && d.availableCities && activeHospital.city && d.availableCities.includes(activeHospital.city)) {
      return true;
    }
    return false;
  });

  const pendingBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Pending Approval');
  const activeBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation');
  const completedBookings = hospitalBookings.filter((b) => b.bookingStatus === 'Completed');
  const openSlotsCount = hospitalSlots.filter((s) => s.status === 'Open' || s.status === 'Filling Fast').length;

  // DEBUG: Log filtered data
  React.useEffect(() => {
    console.log('[HospitalOverview] hospitalBookings count:', hospitalBookings.length);
    console.log('[HospitalOverview] hospitalSlots count:', hospitalSlots.length);
    console.log('[HospitalOverview] hospitalDepartments count:', hospitalDepartments.length);
    console.log('[HospitalOverview] activeBookings:', activeBookings.length);
    console.log('[HospitalOverview] pendingBookings:', pendingBookings.length);
  }, [hospitalBookings, hospitalSlots, hospitalDepartments, activeBookings, pendingBookings]);

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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Active Trainees', value: activeBookings.length, sub: 'Currently In Rotation', icon: <Users className="w-5 h-5 text-emerald-700" />, iconBg: 'bg-emerald-100/90 border border-emerald-300', border: 'border-emerald-500' },
          { label: 'Open Slots', value: openSlotsCount, sub: `${hospitalSlots.length} Total Slots`, icon: <Layers className="w-5 h-5 text-indigo-700" />, iconBg: 'bg-indigo-100/90 border border-indigo-300', border: 'border-indigo-500' },
          { label: 'Pending Approvals', value: pendingBookings.length, sub: 'Requires Review', icon: <Clock className="w-5 h-5 text-amber-700" />, iconBg: 'bg-amber-100/90 border border-amber-300', border: 'border-amber-500' },
          { label: 'Departments', value: hospitalDepartments.length || departments.length, sub: 'Active Programs', icon: <Building2 className="w-5 h-5 text-[#3597A4]" />, iconBg: 'bg-[#E6F4F6] border border-[#E6F4F6]', border: 'border-[#3597A4]' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -1, scale: 1.001 }}
            className={`bg-white border-2 ${kpi.border} rounded-3xl p-4 sm:p-6 space-y-3 shadow-md hover:shadow-xl transition-all duration-100`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl ${kpi.iconBg} flex items-center justify-center shadow-2xs`}>
                {kpi.icon}
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider font-heading">{kpi.label}</span>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading truncate">{kpi.value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-extrabold truncate mt-1">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Summary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Booking Log */}
        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs w-full max-w-full">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              Applications for {activeHospital?.name || 'Hospital'}
            </h3>
            <span className="text-[10px] font-bold text-slate-500">{hospitalBookings.length} total entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] uppercase font-heading text-slate-600">
                  <th className="px-5 py-3 font-extrabold">Trainee</th>
                  <th className="px-5 py-3 font-extrabold">Department</th>
                  <th className="px-5 py-3 font-extrabold">Duration</th>
                  <th className="px-5 py-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-700">
                {hospitalBookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      No applications recorded for this hospital unit.
                    </td>
                  </tr>
                ) : (
                  hospitalBookings.slice(0, 6).map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-[#E6F4F6]/30 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900 font-heading">{b.traineeName}</td>
                      <td className="px-5 py-3.5 text-slate-700">{b.departmentName}</td>
                      <td className="px-5 py-3.5 text-slate-600">{b.duration}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border ${getBadgeStyle(b.bookingStatus)}`}>
                          {(b.bookingStatus === 'Approved' || b.bookingStatus === 'In Rotation') && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {b.bookingStatus === 'Pending Approval' && <Clock className="w-3 h-3 text-amber-600" />}
                          {b.bookingStatus === 'Rejected' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
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

        {/* Live Slot Capacity Summary */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 w-full max-w-full">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">Hospital Slot Capacity</h3>

          <div className="space-y-3 text-xs">
            {hospitalSlots.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No slots opened yet for {activeHospital?.name || 'hospital'}.</p>
            ) : (
              hospitalSlots.slice(0, 4).map((slot) => {
                const dept = departments.find((d) => d.id === slot.departmentId);
                const percent = Math.round(((slot.totalSeats - slot.availableSeats) / slot.totalSeats) * 100);

                return (
                  <div key={slot.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{dept?.name || 'Department'} ({slot.city})</span>
                      <span className="text-[#3597A4]">{slot.availableSeats} left</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3597A4] rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>{slot.duration} · Starts {slot.startDate}</span>
                      <span>{percent}% Booked</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
