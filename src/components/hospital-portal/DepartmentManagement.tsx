import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Search, 
  MapPin, 
  Layers, 
  Clock,
  Building2,
  X,
  Check
} from 'lucide-react';
import type { CityName } from '../../types';
import { CITIES } from '../../data/mockData';
import { CustomSelect } from '../common/CustomSelect';
import { ConfirmModal } from '../common/ConfirmModal';

export const DepartmentManagement: React.FC = () => {
  const { departments, slots, addDepartment, deleteDepartment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<CityName | 'All'>('All');
  const [isOtherCityFilter, setIsOtherCityFilter] = useState(false);
  const [customCityFilterText, setCustomCityFilterText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);

  // Utility Form State for Add Department
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [subDepartmentsText, setSubDepartmentsText] = useState('');
  const [baseFeePerMonth, setBaseFeePerMonth] = useState<number>(45000);
  const [selectedCities, setSelectedCities] = useState<CityName[]>(['Delhi', 'Noida']);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  const [newCustomCityName, setNewCustomCityName] = useState('');

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCityFilter === 'All' || dept.availableCities.includes(selectedCityFilter);
    return matchesSearch && matchesCity;
  });

  const toggleCity = (city: CityName) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter((c) => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleAddCustomCity = () => {
    const trimmed = newCustomCityName.trim();
    if (trimmed && !selectedCities.includes(trimmed as CityName)) {
      setSelectedCities([...selectedCities, trimmed as CityName]);
      setNewCustomCityName('');
    }
  };

  const handleSubmitDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !description) return;

    const parsedSubDepts = subDepartmentsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addDepartment({
      name,
      code: code.toUpperCase(),
      description,
      availableCities: selectedCities.length > 0 ? selectedCities : ['Delhi'],
      subDepartments: parsedSubDepts.length > 0 ? parsedSubDepts : [name],
      hospitalsCount: 8,
      iconName: 'Activity',
      featured: true,
      baseFeePerMonth: Number(baseFeePerMonth),
      clinicalHighlights: []
    });

    // Reset Form
    setName('');
    setCode('');
    setDescription('');
    setSubDepartmentsText('');
    setBaseFeePerMonth(45000);
    setSelectedCities(['Delhi', 'Noida']);
    setShowAddModal(false);
  };

  // Helper to calculate total & active slots for a department
  const getDepartmentSlotStats = (deptId: string) => {
    const deptSlots = slots.filter((s) => s.departmentId === deptId);
    const totalSlots = deptSlots.length;
    const activeSlots = deptSlots.filter((s) => s.status === 'Open' || s.status === 'Filling Fast').length;
    const totalSeats = deptSlots.reduce((acc, curr) => acc + curr.availableSeats, 0);
    return { totalSlots, activeSlots, totalSeats };
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Utility Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#CBE5D7] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">Department Utility Controller</h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Manage clinical departments, code designations, monthly fee structures, slot availability, and city allocations.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </motion.button>
      </div>

      {/* Utility Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name or code (e.g. Cardiology, CARD, Emergency...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 border border-slate-300/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:border-[#2F855A] focus:ring-2 focus:ring-[#2F855A]/20 focus:outline-none transition shadow-2xs font-medium"
          />
        </div>

        <div className="sm:col-span-4 relative">
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
              { value: 'All', label: 'All City Allocations' },
              ...CITIES.map((c) => ({ value: c, label: c })),
              { value: 'Other', label: 'Other (Specify City)' },
            ]}
          />
          {(isOtherCityFilter || selectedCityFilter === 'Other' || (!CITIES.includes(selectedCityFilter as any) && selectedCityFilter !== 'All')) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <input
                type="text"
                placeholder="Specify city (e.g. Pune, Patna)..."
                value={customCityFilterText}
                onChange={(e) => {
                  setCustomCityFilterText(e.target.value);
                  setSelectedCityFilter(e.target.value.trim() || 'Other');
                }}
                className="w-full bg-white border border-[#2F855A] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-xs"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Utility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((dept) => {
          const stats = getDepartmentSlotStats(dept.id);

          return (
            <motion.div
              key={dept.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-3xl p-6 border border-[#CBE5D7] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2F855A] transition"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2F855A] text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                      {dept.code}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">{dept.name}</h3>
                  </div>

                  <button
                    onClick={() => setDeptToDelete({ id: dept.id, name: dept.name })}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{dept.description}</p>

                {/* Base Fee Tag */}
                <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-extrabold text-slate-900">
                  <span>Monthly Base Fee:</span>
                  <span className="text-[#2F855A]">₹{dept.baseFeePerMonth.toLocaleString('en-IN')}/mo</span>
                </div>

                {/* Slot Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#E2F0EA]/50 p-3 rounded-2xl border border-[#C5DED0]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Slots</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1 font-heading text-xs mt-0.5">
                      <Layers className="w-3.5 h-3.5 text-[#2F855A]" />
                      {stats.totalSlots} Slots
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Active Open Slots</span>
                    <span className="font-extrabold text-[#2F855A] flex items-center gap-1 font-heading text-xs mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#2F855A]" />
                      {stats.activeSlots} Active
                    </span>
                  </div>
                </div>

                {/* Specializations List */}
                {dept.subDepartments && dept.subDepartments.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1 font-heading">
                      Specializations ({dept.subDepartments.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dept.subDepartments.map((sub, sIdx) => (
                        <span key={sIdx} className="bg-[#EBF7F1] border border-[#CBE5D7] text-[#2F855A] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5 text-[#2F855A]" />
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applicable Cities List */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1 font-heading">
                    Allocated Cities ({dept.availableCities.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.availableCities.map((city) => (
                      <span key={city} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#2F855A]" />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Bottom Capacity Counter */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Seats Availability:</span>
                <span className="font-extrabold text-[#2F855A] font-heading">{stats.totalSeats} Total Open Seats</span>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Utility Add Department Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-[#CBE5D7] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 relative my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2F855A]" />
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">Add New Department</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDepartment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neurology, Nephrology, Oncology"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NEURO"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono font-bold uppercase focus:border-[#2F855A] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Clinical overview of rotations, ward rounds, OPD and ICU management..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl p-3.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specializations (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Emergency Medicine, ICU / Critical Care, Trauma Care"
                    value={subDepartmentsText}
                    onChange={(e) => setSubDepartmentsText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Monthly Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={1000}
                    value={baseFeePerMonth}
                    onChange={(e) => setBaseFeePerMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:border-[#2F855A] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Cities Multi Select */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Applicable Cities Allocation *</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {CITIES.map((city) => {
                      const isSelected = selectedCities.includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => toggleCity(city)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#2F855A] text-white shadow-2xs' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          <span>{city}</span>
                        </button>
                      );
                    })}

                    {/* Render any non-standard custom allocated cities */}
                    {selectedCities.filter(c => !CITIES.includes(c)).map((customCity) => (
                      <button
                        key={customCity}
                        type="button"
                        onClick={() => toggleCity(customCity)}
                        className="px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 bg-[#2F855A] text-white shadow-2xs cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>{customCity}</span>
                      </button>
                    ))}

                    {/* Other (Specify) Pill Button */}
                    <button
                      type="button"
                      onClick={() => setShowCustomCityInput(!showCustomCityInput)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                        showCustomCityInput 
                          ? 'bg-[#E2F0EA] text-[#2F855A] border border-[#2F855A]' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/60'
                      }`}
                    >
                      <Plus className="w-3 h-3 text-[#2F855A]" />
                      <span>Other (Specify)</span>
                    </button>
                  </div>

                  {/* Inline Specify Input Field */}
                  {showCustomCityInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 flex items-center gap-2 max-w-sm"
                    >
                      <input
                        type="text"
                        placeholder="Type city name (e.g. Pune, Patna)..."
                        value={newCustomCityName}
                        onChange={(e) => setNewCustomCityName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCity();
                          }
                        }}
                        autoFocus
                        className="w-full bg-white border border-[#2F855A] rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]/20 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCity}
                        className="bg-[#2F855A] hover:bg-[#276749] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2F855A] hover:bg-[#276749] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Create Department
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        onConfirm={() => {
          if (deptToDelete) {
            deleteDepartment(deptToDelete.id);
          }
        }}
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Department"
        variant="danger"
      />
    </div>
  );
};
