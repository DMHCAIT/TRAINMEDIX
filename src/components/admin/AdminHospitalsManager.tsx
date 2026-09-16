'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, Mail, Phone, MapPin, Globe, AlertCircle, Upload, X } from 'lucide-react';
import { hospitalService } from '../../lib/supabase-db';
import { ConfirmModal } from '../common/ConfirmModal';
import { useApp } from '../../context/AppContext';

interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string; // For backward compatibility
  cities?: string[]; // New: array of cities for multi-location hospitals
  website?: string;
  accreditation?: string;
  image?: string;
  image_url?: string;
  available_slots?: number;
  description?: string;
}

export const AdminHospitalsManager: React.FC = () => {
  const { refreshDataFromSupabase } = useApp();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '', // Current city input
    cities: [] as string[], // Multiple cities array
    website: '',
    accreditation: '',
    description: '',
    available_slots: 0,
    image_url: ''
  });

  // Load hospitals
  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await hospitalService.getAllForAdmin();
      setHospitals(data || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('cities') || errorMsg.includes('schema cache')) {
        console.warn('Cities column not ready yet; using compatibility fallback.');
        setHospitals([]);
      } else {
        setError('Failed to load hospitals: ' + errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    try {
      setUploadingImage(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', imageFile);
      formDataToSend.append('hospitalName', formData.name);

      const response = await fetch('/api/admin/upload-hospital-image', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setFormData((current) => ({ ...current, image_url: data.publicUrl }));
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
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (formData.cities.length === 0) {
      setError('At least one city/location is required');
      return;
    }

    const nameKey = formData.name.trim().toLowerCase();
    const clash = hospitals.find(h => h.name.trim().toLowerCase() === nameKey && h.id !== editingId);
    if (clash) {
      setError(`"${formData.name.trim()}" already exists. Add the city to that hospital instead of creating a duplicate.`);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (editingId) {
        // Update existing hospital
        const updateData: Record<string, any> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cities: formData.cities, // Store all cities
        };
        
        // Include optional fields if they have values
        if (formData.available_slots !== undefined && formData.available_slots !== null) {
          updateData.available_slots = parseInt(String(formData.available_slots)) || 0;
        }
        if (formData.image_url) {
          updateData.image_url = formData.image_url;
        }
        if (formData.website) {
          updateData.website = formData.website;
        }
        
        await hospitalService.update(editingId, updateData);
        setHospitals(hospitals.map(h => h.id === editingId ? { ...h, ...updateData } : h));
        await refreshDataFromSupabase();
        setShowForm(false);
        setEditingId(null);
      } else {
        // Create new hospital
        const newHospital = await hospitalService.create({
          userId: null,  // Admin-created hospitals have no specific owner
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cities: formData.cities, // Store all cities
          available_slots: parseInt(String(formData.available_slots)) || 0,
          image_url: formData.image_url,
          website: formData.website,
        });
        
        setHospitals([...hospitals, newHospital]);
        await refreshDataFromSupabase();
        setShowForm(false);
      }
      
      resetForm();
    } catch (err: any) {
      const message: string = err.message || 'Unknown error';
      if (message.includes('hospitals_unique_name') || message.includes('duplicate key')) {
        setError(`"${formData.name.trim()}" already exists. Add the city to that hospital instead of creating a duplicate.`);
      } else {
        setError('Error: ' + message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError('');
      await hospitalService.delete(confirmDelete.id);
      setHospitals(hospitals.filter(h => h.id !== confirmDelete.id));
      setConfirmDelete({ isOpen: false, id: '', name: '' });
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setFormData({
      name: hospital.name,
      email: hospital.email,
      phone: hospital.phone || '',
      city: '',
      cities: hospital.cities || (hospital.city ? [hospital.city] : []),
      website: hospital.website || '',
      accreditation: hospital.accreditation || '',
      description: hospital.description || '',
      available_slots: hospital.available_slots || 0,
      image_url: hospital.image_url || hospital.image || ''
    });
    setImagePreview(hospital.image_url || hospital.image || '');
    setEditingId(hospital.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      cities: [],
      website: '',
      accreditation: '',
      description: '',
      available_slots: 0,
      image_url: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleAddCity = () => {
    const city = formData.city.trim();
    const alreadyAdded = formData.cities.some(c => c.toLowerCase() === city.toLowerCase());
    if (city && !alreadyAdded) {
      setFormData({
        ...formData,
        cities: [...formData.cities, city],
        city: '' // Clear the input after adding
      });
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setFormData({
      ...formData,
      cities: formData.cities.filter(c => c !== cityToRemove)
    });
  };

  const filteredHospitals = hospitals.filter(h => {
    const searchLower = searchQuery.toLowerCase();
    const citiesStr = (h.cities || [h.city]).join(', ').toLowerCase();
    return (
      h.name.toLowerCase().includes(searchLower) ||
      h.email.toLowerCase().includes(searchLower) ||
      citiesStr.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={18} /> Add Hospital
        </motion.button>
      </div>

      {/* Error Alert */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                {editingId ? 'Edit Hospital' : 'Add New Hospital'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Available Slots</label>
                    <input
                      type="number"
                      value={formData.available_slots}
                      onChange={(e) => setFormData({ ...formData, available_slots: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Cities/Locations *</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter city name (e.g., Delhi, Mumbai)"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCity}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          Add City
                        </button>
                      </div>
                      
                      {formData.cities.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No cities added yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.cities.map((city, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-lg px-3 py-1 text-sm font-medium text-green-800"
                            >
                              {city}
                              <button
                                type="button"
                                onClick={() => handleRemoveCity(city)}
                                className="text-green-600 hover:text-red-600 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Accreditation</label>
                    <input
                      type="text"
                      value={formData.accreditation}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                      placeholder="e.g., DMHCA Certified"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Details</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Hospital details, specialties, facilities, etc."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Image</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="inline-flex flex-col items-center gap-3">
                          <img src={imagePreview} alt="Preview" className="max-h-32 rounded" />
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
                        <div onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                          <p className="text-slate-600">Click to upload or drag and drop</p>
                        </div>
                      )}
                    </div>
                    {imageFile && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(formData.image_url);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
                        >
                          Cancel replacement
                        </button>
                        <button
                          type="button"
                          onClick={handleUploadImage}
                          disabled={uploadingImage}
                          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload replacement'}
                        </button>
                      </div>
                    )}
                    {formData.image_url && (
                      <p className="mt-2 text-sm text-green-600">✓ Image uploaded successfully</p>
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

      {/* Hospitals List */}
      <div className="grid gap-4">
        {isLoading && !hospitals.length ? (
          <div className="text-center py-8 text-slate-600">Loading hospitals...</div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No hospitals found</div>
        ) : (
          filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                {(hospital.image_url || hospital.image) && (
                  <div className="shrink-0 w-32 h-32">
                    <img 
                      src={hospital.image_url || hospital.image} 
                      alt={hospital.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">{hospital.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> {hospital.email}
                    </div>
                    {hospital.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} /> {hospital.phone}
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {(hospital.cities || [hospital.city]).map((city, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                    {hospital.available_slots !== undefined && (
                      <div className="text-blue-600 font-semibold">
                        Available Slots: {hospital.available_slots}
                      </div>
                    )}
                    {hospital.description && (
                      <p className="mt-2 text-slate-700">{hospital.description}</p>
                    )}
                    {hospital.website && (
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <a href={hospital.website} target="_blank" className="text-green-600 hover:underline">
                          {hospital.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(hospital)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfirmDelete({ isOpen: true, id: hospital.id, name: hospital.name })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Hospital"
        message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
        variant="danger"
      />
    </div>
  );
};
