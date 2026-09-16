'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Search, Calendar, User, Building2, Eye, Stethoscope, CreditCard, FileText, MapPin, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Booking } from '../../types';

export const AdminBookingsManager: React.FC = () => {
  const { bookings, updateBookingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Booking['bookingStatus']>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [actionError, setActionError] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    id: string;
  }>({
    isOpen: false,
    action: 'approve',
    id: ''
  });

  const handleApprove = async () => {
    try {
      setActionError('');
      await updateBookingStatus(confirmModal.id, 'Approved');
      setConfirmModal({ isOpen: false, action: 'approve', id: '' });
    } catch (error: any) {
      setActionError(error.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setActionError('');
      await updateBookingStatus(confirmModal.id, 'Rejected', rejectionReason);
      setConfirmModal({ isOpen: false, action: 'approve', id: '' });
      setRejectingId(null);
      setRejectionReason('');
    } catch (error: any) {
      setActionError(error.message || 'Failed to reject booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.bookingStatus === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.traineeName?.toLowerCase().includes(q) ||
      b.hospitalName?.toLowerCase().includes(q) ||
      b.departmentName?.toLowerCase().includes(q) ||
      b.bookingRef?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'In Rotation': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Booking Management</h2>
      <p className="text-sm text-slate-500 -mt-4">Full trainee booking submissions from Step 1 through Step 6, recorded after successful payment.</p>
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by trainee, hospital, department, or booking ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'Pending Approval', 'Approved', 'In Rotation', 'Completed', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                filterStatus === status
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Booking Ref</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trainee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hospital</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-xs font-mono font-bold text-slate-500">{booking.bookingRef}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <div>
                          <div className="font-semibold">{booking.traineeName}</div>
                          <div className="text-xs text-slate-500">{booking.traineeEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        {booking.hospitalName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {booking.departmentName}
                      {booking.subDepartment && (
                        <div className="text-xs text-slate-400">{booking.subDepartment}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {booking.duration}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">₹{booking.amountPaid?.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate-500">{booking.paymentMethod} · {booking.paymentStatus}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewingBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Full Details"
                        >
                          <Eye size={18} />
                        </motion.button>
                        {booking.bookingStatus === 'Pending Approval' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setConfirmModal({ isOpen: true, action: 'approve', id: booking.id })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <Check size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setRejectingId(booking.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <X size={18} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Booking Details Modal (Step 1 - Step 6 summary) */}
      <AnimatePresence>
        {viewingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Booking Details</h3>
                  <p className="text-xs font-mono font-bold text-slate-500">{viewingBooking.bookingRef}</p>
                </div>
                <button onClick={() => setViewingBooking(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Stethoscope size={13} /> Step 1 · Department</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.departmentName}</p>
                </div>

                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><MapPin size={13} /> Step 2 · City</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.city}</p>
                </div>

                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Building2 size={13} /> Step 3 · Hospital</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.hospitalName}</p>
                </div>

                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Clock size={13} /> Step 4 · Duration</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.duration}</p>
                </div>

                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar size={13} /> Step 5 · Batch</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.startDate} to {viewingBooking.endDate || 'Not provided'}</p>
                  {viewingBooking.slotId && <p className="text-xs text-slate-500">Batch ID: {viewingBooking.slotId}</p>}
                </div>

                <div className="space-y-1 rounded-lg border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><User size={13} /> Step 6 · Trainee</span>
                  <p className="font-semibold text-slate-900">{viewingBooking.traineeName}</p>
                  <p className="text-slate-600">{viewingBooking.traineeEmail}</p>
                  <p className="text-slate-600">{viewingBooking.traineePhone}</p>
                  <p className="text-slate-600">{viewingBooking.medicalQualification}</p>
                  <p className="text-slate-600">Council Reg No: {viewingBooking.councilRegistrationNumber}</p>
                </div>

                <div className="space-y-2 rounded-lg border border-slate-200 p-4 sm:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><CreditCard size={13} /> Course Price & Payment</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 sm:grid-cols-4">
                    <p>Course fee<br /><strong className="text-slate-900">₹{(viewingBooking.courseFee ?? viewingBooking.amountPaid)?.toLocaleString('en-IN')}</strong></p>
                    <p>GST<br /><strong className="text-slate-900">₹{(viewingBooking.gstAmount ?? 0).toLocaleString('en-IN')}</strong></p>
                    <p>Gateway fee<br /><strong className="text-slate-900">₹{(viewingBooking.gatewayFee ?? 0).toLocaleString('en-IN')}</strong></p>
                    <p>Total paid<br /><strong className="text-green-700">₹{viewingBooking.amountPaid?.toLocaleString('en-IN')}</strong></p>
                  </div>
                  <p className="text-xs text-slate-500">{viewingBooking.paymentMethod} · {viewingBooking.paymentStatus}</p>
                </div>

                <div className="space-y-2 rounded-lg border border-slate-200 p-4 sm:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><FileText size={13} /> Uploaded Certificate</span>
                  {viewingBooking.documents?.degreeCertificate ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{viewingBooking.documents.degreeCertificateName || 'Degree certificate'}</p>
                        <p className="text-xs text-slate-500">{viewingBooking.documents.degreeCertificateSize} {viewingBooking.documents.degreeCertificateType ? `· ${viewingBooking.documents.degreeCertificateType}` : ''}</p>
                      </div>
                      <a
                        href={viewingBooking.documents.degreeCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        View document
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No document attached.</p>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Booking Status</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingBooking.bookingStatus)}`}>
                    {viewingBooking.bookingStatus}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Created: {new Date(viewingBooking.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setRejectingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">Reject Booking</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 h-24 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmModal({ isOpen: true, action: 'reject', id: rejectingId })}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === 'approve' ? 'Approve Booking' : 'Reject Booking'}
        message={
          confirmModal.action === 'approve'
            ? 'Are you sure you want to approve this booking?'
            : `Reject this booking with reason: "${rejectionReason}"?`
        }
        onConfirm={confirmModal.action === 'approve' ? handleApprove : handleReject}
        onClose={() => setConfirmModal({ isOpen: false, action: 'approve', id: '' })}
        variant={confirmModal.action === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
};
