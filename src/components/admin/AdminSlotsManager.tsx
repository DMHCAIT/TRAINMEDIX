'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, AlertCircle, Calendar, Users } from 'lucide-react';
import { slotService, hospitalDepartmentService } from '../../lib/supabase-db';
import { ConfirmModal } from '../common/ConfirmModal';

interface TrainingSlot {
  id: string;
  hospital_department_id: string;
  start_date: string;
  end_date: string;
  available_seats: number;
  booked_seats: number;
  status: 'available' | 'full' | 'completed' | 'cancelled';
}

interface SlotWithDetails extends TrainingSlot {
  hospitalDepartmentName?: string;
}

export const AdminSlotsManager: React.FC = () => {
  const [slots, setSlots] = useState<SlotWithDetails[]>([]);
  const [hospitalDepartments, setHospitalDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: ''
  });

  const [formData, setFormData] = useState({
    hospital_department_id: '',
    start_date: '',
    end_date: '',
    available_seats: 5,
    status: 'available' as 'available' | 'full' | 'completed' | 'cancelled'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [slotsData, offerings] = await Promise.all([
        slotService.getAll(),
        hospitalDepartmentService.getAll()
      ]);
      setSlots(slotsData || []);
      setHospitalDepartments(offerings || []);
    } catch (err: any) {
      setError('Failed to load data: ' + err.message);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const offeringLabel = (hd: any) => {
    const hospital = hd.hospitals?.name || 'Unknown hospital';
    const city = hd.city || hd.hospitals?.cities?.[0] || hd.hospitals?.city || '';
    const department = hd.departments?.name || hd.departments?.code || 'Department';
    return city ? `${hospital} (${city}) — ${department}` : `${hospital} — ${department}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospital_department_id || !formData.start_date || !formData.end_date) {
      setError('All fields are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      if (editingId) {
        await slotService.update(editingId, formData);
        setSlots(slots.map(s => s.id === editingId ? { ...s, ...formData } : s));
        setShowForm(false);
        setEditingId(null);
      } else {
        const newSlot = await slotService.create({
          hospitalDepartmentId: formData.hospital_department_id,
          startDate: formData.start_date,
          endDate: formData.end_date,
          availableSeats: formData.available_seats
        });
        setSlots([...slots, newSlot]);
        setShowForm(false);
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError('');
      await slotService.delete(confirmDelete.id);
      setSlots(slots.filter(s => s.id !== confirmDelete.id));
      setConfirmDelete({ isOpen: false, id: '' });
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slot: SlotWithDetails) => {
    setFormData({
      hospital_department_id: slot.hospital_department_id,
      start_date: slot.start_date.split('T')[0],
      end_date: slot.end_date.split('T')[0],
      available_seats: slot.available_seats,
      status: slot.status
    });
    setEditingId(slot.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      hospital_department_id: '',
      start_date: '',
      end_date: '',
      available_seats: 5,
      status: 'available'
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Training Slots Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={18} /> Add Slot
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-600">✕</button>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search slots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Training Slot' : 'Add New Training Slot'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Department *</label>
                  <select
                    value={formData.hospital_department_id}
                    onChange={(e) => setFormData({ ...formData, hospital_department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select department...</option>
                    {hospitalDepartments.map(hd => (
                      <option key={hd.id} value={hd.id}>{offeringLabel(hd)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Available Seats *</label>
                  <input
                    type="number"
                    value={formData.available_seats}
                    onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots List */}
      <div className="grid gap-4">
        {isLoading && !slots.length ? (
          <div className="text-center py-8 text-slate-600">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No slots found</div>
        ) : (
          slots.map((slot) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-slate-600" />
                    <span className="font-semibold text-slate-900">
                      {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={16} />
                    <span>{slot.booked_seats} / {slot.available_seats} seats booked</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(slot.status)}`}>
                    {slot.status}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(slot)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfirmDelete({ isOpen: true, id: slot.id })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Slot"
        message="Are you sure you want to delete this training slot?"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete({ isOpen: false, id: '' })}
        variant="danger"
      />
    </div>
  );
};
