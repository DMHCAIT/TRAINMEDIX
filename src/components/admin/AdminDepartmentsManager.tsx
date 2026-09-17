'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, AlertCircle, Upload, X } from 'lucide-react';
import { departmentService, hospitalDepartmentService, hospitalService, slotService } from '../../lib/supabase-db';
import { ConfirmModal } from '../common/ConfirmModal';
import { useApp } from '../../context/AppContext';

interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration_days?: number;
  icon_url?: string;
  duration_options?: string | number[];
  is_active: boolean;
  sub_departments?: string[];
}

interface Hospital {
  id: string;
  name: string;
  city?: string;
  cities?: string[];
}

interface Batch {
  id?: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  seats: number;
}

const addMonths = (date: string, months: number) => {
  if (!date) return '';
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

export const AdminDepartmentsManager: React.FC = () => {
  const { refreshDataFromSupabase } = useApp();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    duration_days: 30,
    durationOptions: [1, 3, 6, 12],
    icon_url: '',
    subDepartments: [] as string[],
    partnerHospitals: [] as string[],
    // 'hospitalId|city' -> { '1': 35000, '3': 90000, ... }
    pricing: {} as Record<string, Record<string, number>>,
    // 'hospitalId|city' -> available slots
    slots: {} as Record<string, number>,
    // 'hospitalId|city' -> date batches
    batches: {} as Record<string, Batch[]>
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specializationsText, setSpecializationsText] = useState('');
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [depts, hosps] = await Promise.all([
        departmentService.getAll(),
        hospitalService.getAll()
      ]);
      setDepartments(depts || []);
      setHospitals(hosps || []);
    } catch (err: any) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    try {
      setUploadingImage(true);
      
      // Use API endpoint for secure server-side upload
      const formDataToSend = new FormData();
      formDataToSend.append('file', imageFile);
      formDataToSend.append('departmentCode', formData.code);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setFormData((current) => ({ ...current, icon_url: data.publicUrl }));
      setImageFile(null);
      setImagePreview(data.publicUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      setError('Code and name are required');
      return;
    }

    for (const key of formData.partnerHospitals) {
      const batches = formData.batches[key] || [];
      const incomplete = batches.find(b => !b.startDate || !b.endDate);
      if (incomplete) {
        setError('Every batch needs a start date. Remove any empty batch rows before saving.');
        return;
      }

      const capacity = formData.slots[key] ?? 0;
      const allocated = batches.reduce((sum, b) => sum + (b.seats || 0), 0);
      if (capacity > 0 && allocated > capacity) {
        setError(`Batch seats (${allocated}) exceed the ${capacity} available slots configured for one of the hospitals.`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const deptData = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        duration_days: formData.duration_days,
        icon_url: formData.icon_url,
        duration_options: formData.durationOptions.join(','),
        sub_departments: formData.subDepartments.filter(s => s.trim()).length > 0 ? formData.subDepartments.filter(s => s.trim()) : undefined
      };

      if (editingId) {
        // Update existing department
        console.log('🔄 Updating department:', editingId);
        console.log('   Data:', deptData);
        const updatedDept = await departmentService.update(editingId, deptData);
        console.log('   ✅ Update result:', updatedDept);

        console.log('💾 Syncing offerings for department:', editingId);
        console.log('   Partner hospitals:', formData.partnerHospitals);
        
        const offeringsToSync = formData.partnerHospitals.map(key => {
          const [hospitalId, city] = key.split('|');
          return {
            hospitalId,
            city,
            pricing: formData.pricing[key] || {},
            maxSlots: formData.slots[key] ?? 0,
            batches: formData.batches[key] || []
          };
        });
        
        console.log('   Offerings to sync:', offeringsToSync);
        
        const savedOfferings = await hospitalDepartmentService.syncDepartment(
          editingId,
          offeringsToSync
        );
        
        console.log('   ✅ Sync complete. Returned offerings:', savedOfferings);
        
        // Verify that we have offerings for our department
        if (!savedOfferings || savedOfferings.length === 0) {
          console.warn('⚠️  No offerings returned, but sync completed without error');
        }

        console.log('🔄 Reloading departments from Supabase...');
        setShowForm(false);
        setEditingId(null);
        setError('');
        
        // Reload data from Supabase
        await loadData();
        console.log('   ✅ Departments reloaded');
        
        // Refresh data in AppContext for website
        console.log('🔄 Refreshing website context...');
        await refreshDataFromSupabase();
        console.log('   ✅ Website context refreshed');
        
        setSuccessMessage('Department pricing and batches saved to Supabase and published to the website.');
        console.log('✨ Save complete!');
      } else {
        // Create new department
        console.log('✨ Creating new department');
        console.log('   Data:', deptData);
        const newDept = await departmentService.create(deptData);
        console.log('   ✅ Department created:', newDept.id);

        console.log('💾 Syncing offerings for new department:', newDept.id);
        
        const offeringsToSync = formData.partnerHospitals.map(key => {
          const [hospitalId, city] = key.split('|');
          return {
            hospitalId,
            city,
            pricing: formData.pricing[key] || {},
            maxSlots: formData.slots[key] ?? 0,
            batches: formData.batches[key] || []
          };
        });
        
        console.log('   Offerings to sync:', offeringsToSync);
        
        const savedOfferings = await hospitalDepartmentService.syncDepartment(
          newDept.id,
          offeringsToSync
        );
        
        console.log('   ✅ Sync complete. Returned offerings:', savedOfferings);

        console.log('🔄 Reloading departments from Supabase...');
        setShowForm(false);
        setError('');
        
        // Reload data from Supabase
        await loadData();
        console.log('   ✅ Departments reloaded');
        
        // Refresh data in AppContext for website
        console.log('🔄 Refreshing website context...');
        await refreshDataFromSupabase();
        console.log('   ✅ Website context refreshed');
        
        setSuccessMessage('Department pricing and batches saved to Supabase and published to the website.');
        console.log('✨ Save complete!');
      }
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      console.error('   Error message:', err.message);
      console.error('   Error code:', err.code);
      console.error('   Full error:', JSON.stringify(err, null, 2));
      
      // Check if the error is about duration_options column
      if (err.message?.includes('duration_options')) {
        setError(`Database column error: The 'duration_options' column needs to be added to Supabase. 
        
Please run this SQL in your Supabase Console (SQL Editor):
ALTER TABLE departments ADD COLUMN IF NOT EXISTS duration_options TEXT DEFAULT '1,3,6,12';

After running the SQL, reload the admin panel and try again.`);
      } else if (err.message?.includes('hospital_offerings')) {
        setError(`Storage column not available yet. The system will use fallback storage (hospitals.description). 
        
Your data will be saved, but we recommend creating the hospital_offerings column in Supabase for better organization. 
        
Error details: ${err.message}`);
      } else {
        setError('❌ Save failed: ' + (err.message || 'Unknown error occurred') + '\n\nCheck browser console (F12) for more details.');
      }
      
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError('');
      await departmentService.delete(confirmDelete.id);
      setDepartments(departments.filter(d => d.id !== confirmDelete.id));
      setConfirmDelete({ isOpen: false, id: '', name: '' });
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (dept: Department) => {
    try {
      setIsLoading(true);
      // Load partner hospitals for this department
      const partners = await hospitalDepartmentService.getByDepartment(dept.id);
      
      // Parse duration_options from comma-separated string
      const durationOptions = dept.duration_options 
        ? (typeof dept.duration_options === 'string' 
            ? dept.duration_options.split(',').map(Number) 
            : dept.duration_options)
        : [1, 3, 6, 12];
      
      // Each offering row is already specific to one hospital + city
      const compositeKeys: string[] = [];
      const pricing: Record<string, Record<string, number>> = {};
      const slots: Record<string, number> = {};
      const batches: Record<string, Batch[]> = {};

      await Promise.all((partners || []).map(async (p: any) => {
        const hospital = hospitals.find(item => item.id === p.hospital_id);
        const city = p.city || hospital?.cities?.[0] || hospital?.city || '';
        const key = `${p.hospital_id}|${city}`;
        if (!compositeKeys.includes(key)) compositeKeys.push(key);
        pricing[key] = p.pricing || {};
        slots[key] = p.max_slots ?? 0;

        try {
          const rows = await slotService.getByHospitalDepartment(p.id);
          batches[key] = (rows || []).map((r: any) => ({
            id: r.id,
            durationMonths: r.duration_months || 1,
            startDate: r.start_date || '',
            endDate: r.end_date || '',
            seats: r.available_seats ?? 0
          }));
        } catch {
          batches[key] = [];
        }
      }));

      setFormData({
        code: dept.code,
        name: dept.name,
        description: dept.description || '',
        duration_days: dept.duration_days || 30,
        durationOptions: durationOptions,
        icon_url: dept.icon_url || '',
        subDepartments: dept.sub_departments || [],
        partnerHospitals: compositeKeys,
        pricing,
        slots,
        batches
      });
      setSpecializationsText((dept.sub_departments || []).join(', '));
      setImageFile(null);
      setImagePreview(dept.icon_url || '');
      setEditingId(dept.id);
      setShowForm(true);
    } catch (err: any) {
      setError('Failed to load department details: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      duration_days: 30,
      durationOptions: [1, 3, 6, 12],
      icon_url: '',
      subDepartments: [],
      partnerHospitals: [],
      pricing: {},
      slots: {},
      batches: {}
    });
    setImageFile(null);
    setImagePreview('');
    setSpecializationsText('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const togglePartnerHospital = (compositeKey: string) => {
    // compositeKey format: 'hospital-id|city'
    setFormData({
      ...formData,
      partnerHospitals: formData.partnerHospitals.includes(compositeKey)
        ? formData.partnerHospitals.filter(key => key !== compositeKey)
        : [...formData.partnerHospitals, compositeKey]
    });
  };

  const setOfferingPrice = (compositeKey: string, months: number, value: string) => {
    const amount = value === '' ? NaN : Number(value);
    setFormData(prev => {
      const forOffering = { ...prev.pricing[compositeKey] };
      if (Number.isNaN(amount)) {
        delete forOffering[String(months)];
      } else {
        forOffering[String(months)] = amount;
      }
      return { ...prev, pricing: { ...prev.pricing, [compositeKey]: forOffering } };
    });
  };

  const setOfferingSlots = (compositeKey: string, value: string) => {
    const seats = value === '' ? NaN : Number(value);
    setFormData(prev => {
      const next = { ...prev.slots };
      if (Number.isNaN(seats)) {
        delete next[compositeKey];
      } else {
        next[compositeKey] = seats;
      }
      return { ...prev, slots: next };
    });
  };

  const addBatch = (compositeKey: string) => {
    const defaultDuration = formData.durationOptions[0] || 1;
    setFormData(prev => ({
      ...prev,
      batches: {
        ...prev.batches,
        [compositeKey]: [
          ...(prev.batches[compositeKey] || []),
          { durationMonths: defaultDuration, startDate: '', endDate: '', seats: 1 }
        ]
      }
    }));
  };

  const updateBatch = (compositeKey: string, index: number, patch: Partial<Batch>) => {
    setFormData(prev => {
      const list = [...(prev.batches[compositeKey] || [])];
      const next = { ...list[index], ...patch };

      // Keep the end date in step with the start date and duration
      if (patch.startDate !== undefined || patch.durationMonths !== undefined) {
        next.endDate = addMonths(next.startDate, next.durationMonths);
      }

      list[index] = next;
      return { ...prev, batches: { ...prev.batches, [compositeKey]: list } };
    });
  };

  const removeBatch = (compositeKey: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      batches: {
        ...prev.batches,
        [compositeKey]: (prev.batches[compositeKey] || []).filter((_, i) => i !== index)
      }
    }));
  };

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Department Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#3597A4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3597A4]"
        >
          <Plus size={18} /> Add Department
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

      {successMessage && (
        <div className="bg-[#E6F4F6] border border-[#E6F4F6] text-[#3597A4] px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl my-8"
            >
              <h3 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Department' : 'Add New Department'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., CARD"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Cardiology"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Department description..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4] h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specializations (Comma-separated)</label>
                  <input
                    type="text"
                    value={specializationsText}
                    onChange={(e) => {
                      setSpecializationsText(e.target.value);
                      const specs = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                      setFormData({ ...formData, subDepartments: specs });
                    }}
                    placeholder="e.g., General Surgery, Laparoscopy, Orthopaedics, Urology"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter specializations separated by commas. These will display as sub-options on the website.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Base Duration (days)</label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration Options (Months)</label>
                  <div className="flex gap-4">
                    {[1, 3, 6, 12].map(month => (
                      <label key={month} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.durationOptions.includes(month)}
                          onChange={(e) => {
                            const options = e.target.checked
                              ? [...formData.durationOptions, month].sort((a, b) => a - b)
                              : formData.durationOptions.filter(m => m !== month);
                            setFormData({ ...formData, durationOptions: options });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{month} Month{month > 1 ? 's' : ''}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="inline-flex flex-col items-center gap-3">
                        <img src={imagePreview} alt="Preview" className="max-h-40 rounded" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <Upload size={16} />
                          Replace image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 py-6"
                      >
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Click to upload an image</span>
                      </button>
                    )}
                    {imageFile && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(formData.icon_url);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                        >
                          Cancel replacement
                        </button>
                        <button
                          type="button"
                          onClick={handleUploadImage}
                          disabled={uploadingImage}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload replacement'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Partner Hospitals &amp; Pricing</label>
                  <p className="text-xs text-slate-500 mb-2">Prices are per hospital, city and duration.</p>
                  <div className="border border-slate-300 rounded-lg p-3 max-h-72 overflow-y-auto space-y-3">
                    {hospitals.length === 0 ? (
                      <p className="text-sm text-slate-500">No hospitals available</p>
                    ) : (
                      hospitals.flatMap(hospital => {
                        // Expand hospitals with multiple cities into separate location-specific entries
                        const rawCities = Array.isArray(hospital.cities) && hospital.cities.length > 0
                          ? hospital.cities
                          : (hospital.city ? [hospital.city] : ['Unknown']);
                        const cities = Array.from(new Set(rawCities));
                        
                        return cities.map((city) => {
                          const compositeKey = `${hospital.id}|${city}`;
                          const isSelected = formData.partnerHospitals.includes(compositeKey);
                          return (
                            <div key={compositeKey} className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePartnerHospital(compositeKey)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">{hospital.name}</span>
                                <span className="text-xs text-slate-500">({city})</span>
                              </label>

                              {isSelected && (
                                <div className="ml-6 space-y-2">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {formData.durationOptions.map((months) => (
                                      <div key={months}>
                                        <label className="block text-[11px] text-slate-500 mb-1">
                                          {months} {months === 1 ? 'Month' : 'Months'}
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          placeholder="0"
                                          value={formData.pricing[compositeKey]?.[String(months)] ?? ''}
                                          onChange={(e) => setOfferingPrice(compositeKey, months, e.target.value)}
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="w-40">
                                    <label className="block text-[11px] text-slate-500 mb-1">Available Slots</label>
                                    <input
                                      type="number"
                                      min={0}
                                      placeholder="0"
                                      value={formData.slots[compositeKey] ?? ''}
                                      onChange={(e) => setOfferingSlots(compositeKey, e.target.value)}
                                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-semibold text-slate-600">Batch Dates</span>
                                      <button
                                        type="button"
                                        onClick={() => addBatch(compositeKey)}
                                        className="text-[11px] font-semibold text-green-700 hover:text-[#3597A4]"
                                      >
                                        + Add Batch
                                      </button>
                                    </div>

                                    {(formData.batches[compositeKey] || []).length === 0 ? (
                                      <p className="text-[11px] text-slate-400">No batches yet.</p>
                                    ) : (
                                      (formData.batches[compositeKey] || []).map((batch, bIdx) => (
                                        <div key={batch.id || bIdx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-slate-50 p-2 rounded">
                                          <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Duration</label>
                                            <select
                                              value={batch.durationMonths}
                                              onChange={(e) => updateBatch(compositeKey, bIdx, { durationMonths: Number(e.target.value) })}
                                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                            >
                                              {formData.durationOptions.map(m => (
                                                <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Start Date</label>
                                            <input
                                              type="date"
                                              value={batch.startDate}
                                              onChange={(e) => updateBatch(compositeKey, bIdx, { startDate: e.target.value })}
                                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">End Date</label>
                                            <input
                                              type="date"
                                              value={batch.endDate}
                                              onChange={(e) => updateBatch(compositeKey, bIdx, { endDate: e.target.value })}
                                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Seats</label>
                                            <input
                                              type="number"
                                              min={0}
                                              value={batch.seats}
                                              onChange={(e) => updateBatch(compositeKey, bIdx, { seats: Number(e.target.value) })}
                                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeBatch(compositeKey, bIdx)}
                                            className="text-red-600 hover:text-red-700 text-xs font-semibold py-1"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })
                    )}
                  </div>
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
                    className="px-4 py-2 bg-[#3597A4] text-white rounded-lg hover:bg-[#3597A4] disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && !departments.length ? (
          <div className="col-span-full text-center py-8 text-slate-600">Loading departments...</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-600">No departments found</div>
        ) : (
          filteredDepartments.map((dept) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {dept.icon_url && (
                <img src={dept.icon_url} alt={dept.name} className="w-full h-32 object-cover rounded mb-3" />
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs font-semibold text-[#3597A4] uppercase">{dept.code}</div>
                  <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${dept.is_active ? 'bg-[#E6F4F6] text-[#3597A4]' : 'bg-slate-100 text-slate-800'}`}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {dept.description && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{dept.description}</p>
              )}

              {dept.duration_days && (
                <p className="text-xs text-slate-500 mb-2">Base Duration: {dept.duration_days} days</p>
              )}

              <div className="flex gap-2 justify-end border-t pt-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(dept)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDelete({ isOpen: true, id: dept.id, name: dept.name })}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${confirmDelete.name}"?`}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
        variant="danger"
      />
    </div>
  );
};
