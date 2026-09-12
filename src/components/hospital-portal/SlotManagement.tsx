import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  CalendarRange,
  Plus,
  Trash2,
  Search,
  Filter,
  Building2,
  X,
  Edit2,
  Calendar as CalendarIcon
} from 'lucide-react';
import type { TrainingSlot, CityName, DurationOption } from '../../types';
import { CITIES } from '../../data/mockData';
import { CustomSelect } from '../common/CustomSelect';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const SlotManagement: React.FC = () => {
  const {
    slots,
    departments,
    activeHospital,
    addSlot,
    deleteSlot,
    updateSlotStatus,
    updateSlotSeats
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedCityFilter, setSelectedCityFilter] = useState<CityName | 'All'>('All');
  const [isOtherCityFilter, setIsOtherCityFilter] = useState(false);
  const [customCityFilterText, setCustomCityFilterText] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');

  // Modals state
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TrainingSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);

  // Form State for Add Slot (Single Hospital Default)
  const [deptId, setDeptId] = useState<string>(departments[0]?.id || 'dept-em');
  const [subDept, setSubDept] = useState<string>('All Sub-Departments');
  const [city, setCity] = useState<CityName>(activeHospital?.city || 'Delhi');
  const [isOtherCityForm, setIsOtherCityForm] = useState(false);
  const [customCityFormText, setCustomCityFormText] = useState('');
  const [duration, setDuration] = useState<DurationOption>('3 Months');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-12-01');
  const [totalSeats, setTotalSeats] = useState<number>(5);
  const [availableSeats, setAvailableSeats] = useState<number>(3);
  const [monthlyFee, setMonthlyFee] = useState<number>(45000);
  const [status, setStatus] = useState<TrainingSlot['status']>('Open');

  // Edit Seats State
  const [editTotalSeats, setEditTotalSeats] = useState<number>(5);
  const [editAvailableSeats, setEditAvailableSeats] = useState<number>(3);

  // Single Hospital Filtered Slots
  const hospitalSlots = slots.filter((s) => activeHospital && s.hospitalId === activeHospital.id);

  // Filter logic
  const filteredSlots = hospitalSlots.filter((slot) => {
    const dept = departments.find((d) => d.id === slot.departmentId);
    const deptName = dept?.name || '';

    const matchesSearch = deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (slot.subDepartment && slot.subDepartment.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDeptFilter === 'All' || slot.departmentId === selectedDeptFilter;
    const matchesCity = selectedCityFilter === 'All' || slot.city === selectedCityFilter;
    const matchesStatus = selectedStatusFilter === 'All' || slot.status === selectedStatusFilter;

    let matchesDate = true;
    if (dateFilterStart) {
      matchesDate = matchesDate && slot.startDate >= dateFilterStart;
    }
    if (dateFilterEnd) {
      matchesDate = matchesDate && slot.startDate <= dateFilterEnd;
    }

    return matchesSearch && matchesDept && matchesCity && matchesStatus && matchesDate;
  });

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHospital) return;
    addSlot({
      departmentId: deptId,
      subDepartment: subDept !== 'All Sub-Departments' ? subDept : undefined,
      hospitalId: activeHospital.id,
      city,
      duration,
      startDate,
      endDate,
      totalSeats: Number(totalSeats),
      availableSeats: Number(availableSeats),
      monthlyFee: Number(monthlyFee),
      status
    });

    setShowAddSlotModal(false);
  };

  const handleSaveSeatsEdit = () => {
    if (editingSlot) {
      updateSlotSeats(editingSlot.id, Number(editTotalSeats), Number(editAvailableSeats));
      setEditingSlot(null);
    }
  };

  const getStatusBadgeStyle = (slotStatus: TrainingSlot['status']) => {
    switch (slotStatus) {
      case 'Open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Filling Fast':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Sold Out':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-[#CBE5D7] shadow-xs">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#2F855A] mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{activeHospital?.name || 'Hospital'} Slot Controller</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">Date-Wise Training Slot Management</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Configure seat availability and dates for {activeHospital?.name || 'hospital'}.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddSlotModal(true)}
          className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Training Slot</span>
        </motion.button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/90 p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs w-full max-w-full">
        <div className="flex items-center gap-2 font-bold text-slate-700 font-heading">
          <Filter className="w-4 h-4 text-[#2F855A]" />
          <span>Date-Wise & Department Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300/80 rounded-xl pl-8 pr-3 py-2 text-slate-900 focus:border-[#2F855A] focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <CustomSelect
            value={selectedDeptFilter}
            onChange={(val) => setSelectedDeptFilter(val)}
            options={[
              { value: 'All', label: 'All Departments' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />

          {/* City Filter */}
          <div className="relative">
            <CustomSelect
              value={isOtherCityFilter || (selectedCityFilter !== 'All' && !CITIES.includes(selectedCityFilter as any)) ? 'Other' : selectedCityFilter}
              onChange={(val) => {
                if (val === 'Other') {
                  setIsOtherCityFilter(true);
                  setSelectedCityFilter(customCityFilterText.trim() || 'Other');
                } else {
                  setIsOtherCityFilter(false);
                  setSelectedCityFilter(val as CityName | 'All');
                }
              }}
              options={[
                { value: 'All', label: 'All Cities' },
                ...CITIES.map((c) => ({ value: c, label: c })),
                { value: 'Other', label: 'Other (Specify City)' },
              ]}
            />
            {(isOtherCityFilter || selectedCityFilter === 'Other' || (!CITIES.includes(selectedCityFilter as any) && selectedCityFilter !== 'All')) && (
              <div className="mt-1.5">
                <input
                  type="text"
                  placeholder="Specify city..."
                  value={customCityFilterText}
                  onChange={(e) => {
                    setCustomCityFilterText(e.target.value);
                    setSelectedCityFilter(e.target.value.trim() || 'Other');
                  }}
                  className="w-full bg-white border border-[#2F855A] rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <CustomSelect
            value={selectedStatusFilter}
            onChange={(val) => setSelectedStatusFilter(val)}
            options={['All', 'Open', 'Filling Fast', 'Sold Out']}
          />

          {/* Date Start Filter */}
          <div className="w-44">
            <CustomDatePicker
              value={dateFilterStart}
              onChange={(val) => setDateFilterStart(val)}
              placeholder="Filter Date From"
            />
          </div>
        </div>
      </div>

      {/* Slots Table View - Fully Scrollable Responsive Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs w-full max-w-full">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            {activeHospital?.name || 'Hospital'} Slots ({filteredSlots.length})
          </h3>
          <span className="text-xs font-semibold text-[#2F855A]">Live Slot Controller</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead className="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200/80 font-heading text-[10px]">
              <tr>
                <th className="p-4">Department</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rotation Dates</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-center">Seat Capacity</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Fee / Month</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-medium text-slate-800">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    No slots match your filters for {activeHospital?.name || 'hospital'}.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => {
                  const dept = departments.find((d) => d.id === slot.departmentId);

                  return (
                    <tr key={slot.id} className="hover:bg-[#E2F0EA]/30 transition">
                      <td className="p-4 font-extrabold text-slate-900 font-heading">
                        <div>{dept?.name || 'Clinical Department'}</div>
                        {slot.subDepartment && (
                          <span className="inline-block mt-1 bg-[#EBF7F1] border border-[#CBE5D7] text-[#2F855A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {slot.subDepartment}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-700">{slot.city}</td>

                      <td className="p-4">
                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono font-semibold whitespace-nowrap">
                          <span>{slot.startDate} – {slot.endDate}</span>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-700">{slot.duration}</td>

                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {slot.availableSeats} / {slot.totalSeats}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Left</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <CustomSelect
                          value={slot.status}
                          onChange={(val) => updateSlotStatus(slot.id, val as TrainingSlot['status'])}
                          options={['Open', 'Filling Fast', 'Sold Out']}
                        />
                      </td>

                      <td className="p-4 text-right font-extrabold text-slate-900 font-heading whitespace-nowrap">
                        ₹{slot.monthlyFee.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSlot(slot);
                              setEditTotalSeats(slot.totalSeats);
                              setEditAvailableSeats(slot.availableSeats);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                            title="Edit Seats Capacity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSlotToDelete(slot.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showAddSlotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-[#CBE5D7] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900 relative my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    Open New Slot for {activeHospital?.name || 'Hospital'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Add a date-wise clinical training rotation slot.</p>
                </div>
                <button
                  onClick={() => setShowAddSlotModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSlotSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Department *</label>
                    <CustomSelect
                      value={deptId}
                      onChange={(val) => {
                        setDeptId(val);
                        setSubDept('All Sub-Departments');
                      }}
                      options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Specialization</label>
                    <CustomSelect
                      value={subDept}
                      onChange={(val) => setSubDept(val)}
                      options={[
                        { value: 'All Specializations', label: 'All Specializations' },
                        ...(departments.find((d) => d.id === deptId)?.subDepartments?.map((sub) => ({ value: sub, label: sub })) || [])
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Location City *</label>
                    <CustomSelect
                      value={isOtherCityForm || !CITIES.includes(city as any) ? 'Other' : city}
                      onChange={(val) => {
                        if (val === 'Other') {
                          setIsOtherCityForm(true);
                          setCity((customCityFormText.trim() || 'Other') as CityName);
                        } else {
                          setIsOtherCityForm(false);
                          setCity(val as CityName);
                        }
                      }}
                      options={[
                        ...CITIES.map((c) => ({ value: c, label: c })),
                        { value: 'Other', label: 'Other (Specify City)' }
                      ]}
                    />
                    {(isOtherCityForm || city === 'Other' || !CITIES.includes(city as any)) && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Specify city name..."
                          value={customCityFormText}
                          onChange={(e) => {
                            setCustomCityFormText(e.target.value);
                            setCity((e.target.value.trim() || 'Other') as CityName);
                          }}
                          className="w-full bg-white border border-[#2F855A] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none shadow-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration *</label>
                    <CustomSelect
                      value={duration}
                      onChange={(val) => setDuration(val as DurationOption)}
                      options={['1 Month', '3 Months', '6 Months']}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Start Date *</label>
                    <CustomDatePicker
                      value={startDate}
                      onChange={(val) => setStartDate(val)}
                      placeholder="Select Start Date"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">End Date *</label>
                    <CustomDatePicker
                      value={endDate}
                      onChange={(val) => setEndDate(val)}
                      placeholder="Select End Date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={totalSeats}
                      onChange={(e) => setTotalSeats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Available Seats *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={availableSeats}
                      onChange={(e) => setAvailableSeats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Fee / Month (₹) *</label>
                    <input
                      type="number"
                      required
                      step={1000}
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Status *</label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as TrainingSlot['status'])}
                    options={['Open', 'Filling Fast', 'Sold Out']}
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowAddSlotModal(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Create Training Slot
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Seats Capacity Modal */}
      <AnimatePresence>
        {editingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#CBE5D7] rounded-3xl w-full max-w-sm p-5 sm:p-6 space-y-4 shadow-2xl text-slate-900"
            >
              <h3 className="text-base font-extrabold text-slate-900 font-heading">Modify Seat Capacity</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={editTotalSeats}
                    onChange={(e) => setEditTotalSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Available Seats Left</label>
                  <input
                    type="number"
                    min={0}
                    value={editAvailableSeats}
                    onChange={(e) => setEditAvailableSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSeatsEdit}
                    className="px-4 py-2 bg-[#2F855A] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Update Seats
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        onConfirm={() => {
          if (slotToDelete) {
            deleteSlot(slotToDelete);
          }
        }}
        title="Delete Training Slot"
        message="Are you sure you want to delete this clinical rotation training slot? This action cannot be undone."
        confirmText="Delete Slot"
        variant="danger"
      />
    </div>
  );
};
