'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, AlertCircle, Layers, CalendarRange, Users, MapPin, DollarSign, Plus, X, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { apiService } from '../../services/apiService';

interface HospitalPartner {
  id: string;
  hospital_name: string;
  email: string;
  phone: string;
  role: string;
  isApproved: boolean;
  created_at: string;
}

interface Department {
  id: string;
  hospital_id: string;
  department_name: string;
  department_code: string;
  description: string;
  base_fee_per_month: number;
  available_cities: string[];
  created_at: string;
}

interface Slot {
  id: string;
  hospital_id: string;
  hospital_department_id: string;
  department_name: string;
  start_date: string;
  end_date: string;
  total_seats: number;
  available_seats: number;
  fee_per_month: number;
  status: string;
  created_at: string;
}

interface HospitalTrainee {
  id: string;
  hospital_id: string;
  trainee_name: string;
  trainee_email: string;
  qualification: string;
  course_interested: string;
  certificate_url: string;
  city: string;
  department_name: string;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
  approval_notes?: string;
}

export const AdminHospitalPartnersManager: React.FC = () => {
  const [hospitalPartners, setHospitalPartners] = useState<HospitalPartner[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [trainees, setTrainees] = useState<HospitalTrainee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAddTraineeModal, setShowAddTraineeModal] = useState(false);
  const [isSubmittingTrainee, setIsSubmittingTrainee] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [traineeForm, setTraineeForm] = useState({
    trainee_name: '',
    trainee_email: '',
    qualification: '',
    course_interested: '',
    city: '',
    hospital_department_id: '',
    start_date: '',
    end_date: ''
  });
  const [stats, setStats] = useState({
    totalPartners: 0,
    totalDepartments: 0,
    totalSlots: 0,
    approvedCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch hospital partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('registered_users')
        .select('*')
        .eq('role', 'hospital');

      if (partnersError) throw partnersError;

      const partners = (partnersData || []).map(partner => ({
        ...partner,
        hospital_name: partner.hospital_name || partner.full_name,
        isApproved: partner.is_approved === true
      })) as HospitalPartner[];
      setHospitalPartners(partners);
      setSelectedHospital(currentHospitalId =>
        currentHospitalId && partners.some(partner => partner.id === currentHospitalId)
          ? currentHospitalId
          : partners[0]?.id || null
      );

      // Fetch all departments
      const { data: deptsData, error: deptsError } = await supabase
        .from('hospital_departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (deptsError) throw deptsError;

      const depts = (deptsData || []) as Department[];
      setDepartments(depts);

      // Fetch all slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('hospital_department_slots')
        .select('*')
        .order('created_at', { ascending: false });

      if (slotsError) throw slotsError;

      const slts = (slotsData || []) as Slot[];
      setSlots(slts);

      const traineeResponses = await Promise.all(
        partners.map(partner => apiService.getHospitalTrainees(partner.id))
      );
      setTrainees(
        traineeResponses.flatMap(response => response.success ? response.trainees || [] : [])
      );

      // Calculate stats
      setStats({
        totalPartners: partners.length,
        totalDepartments: depts.length,
        totalSlots: slts.length,
        approvedCount: partners.filter(p => p.isApproved).length
      });
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load hospital partner data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartners = hospitalPartners.filter(p =>
    (p.hospital_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const partnerDepartments = selectedHospital
    ? departments.filter(d => d.hospital_id === selectedHospital)
    : [];

  const partnerSlots = selectedHospital
    ? slots.filter(s => s.hospital_id === selectedHospital)
    : [];

  const partnerTrainees = selectedHospital
    ? trainees.filter(trainee => trainee.hospital_id === selectedHospital)
    : [];

  const handleAddTrainee = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHospital || !certificateFile) return;

    const department = departments.find(item => item.id === traineeForm.hospital_department_id);
    if (!department) {
      setError('Please select a department.');
      return;
    }

    setIsSubmittingTrainee(true);
    setError('');
    try {
      const upload = await apiService.uploadTraineeCertificate(selectedHospital, certificateFile);
      if (!upload.success || !upload.url) {
        throw new Error(upload.error || 'Certificate upload failed');
      }
      const startDate = new Date(traineeForm.start_date);
      const endDate = new Date(traineeForm.end_date);
      const durationMonths = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const result = await apiService.addHospitalTrainee(selectedHospital, {
        ...traineeForm,
        department_name: department.department_name,
        duration_months: durationMonths,
        certificate_url: upload.url,
        status: 'Pending'
      });

      if (!result.success) throw new Error(result.error || 'Failed to add trainee');

      setShowAddTraineeModal(false);
      setCertificateFile(null);
      setTraineeForm({
        trainee_name: '', trainee_email: '', qualification: '', course_interested: '', city: '',
        hospital_department_id: '', start_date: '', end_date: ''
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add trainee');
    } finally {
      setIsSubmittingTrainee(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-[#2F855A]" size={32} />
            Hospital Partners
          </h1>
          <p className="text-slate-600 mt-1">Manage approved hospital partners and their departments/slots</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedHospital && (
            <button
              onClick={() => setShowAddTraineeModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F855A] text-white rounded-lg font-semibold hover:bg-[#276749]"
            >
              <Plus size={17} /> Add Trainee
            </button>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 bg-[#2F855A] text-white rounded-lg font-semibold hover:bg-[#276749] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-600 font-semibold">Total Partners</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{stats.totalPartners}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="text-sm text-green-600 font-semibold">Departments</div>
          <div className="text-3xl font-bold text-green-900 mt-2">{stats.totalDepartments}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-600 font-semibold">Slots</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">{stats.totalSlots}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <div className="text-sm text-amber-600 font-semibold">Approved</div>
          <div className="text-3xl font-bold text-amber-900 mt-2">{stats.approvedCount}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <Building2 className="w-8 h-8 text-[#2F855A]" />
          </div>
          <p className="text-slate-600 mt-3">Loading hospital partner data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hospital Partners List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-[#2F855A]" />
                Hospital Partners ({filteredPartners.length})
              </h2>
              <input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {filteredPartners.map((partner) => (
                <motion.button
                  key={partner.id}
                  onClick={() => setSelectedHospital(partner.id)}
                  className={`w-full text-left px-4 py-3 transition ${
                    selectedHospital === partner.id
                      ? 'bg-[#EBF7F1] border-l-4 border-l-[#2F855A]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{partner.hospital_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{partner.email}</div>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        partner.isApproved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {partner.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Departments & Slots */}
          <div className="lg:col-span-2 space-y-6">
            {selectedHospital ? (
              <>
                {/* Departments Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Layers size={20} className="text-[#2F855A]" />
                    Departments ({partnerDepartments.length})
                  </h3>

                  {partnerDepartments.length === 0 ? (
                    <p className="text-slate-500 text-sm">No departments added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {partnerDepartments.map((dept) => (
                        <motion.div
                          key={dept.id}
                          className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#2F855A] text-white text-[10px] font-bold px-2 py-1 rounded">
                                  {dept.department_code}
                                </span>
                                <span className="font-semibold text-slate-900">{dept.department_name}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{dept.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <DollarSign size={14} className="text-[#2F855A]" />
                                  ₹{dept.base_fee_per_month?.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} className="text-[#2F855A]" />
                                  {dept.available_cities?.length
                                    ? dept.available_cities.join(', ')
                                    : 'No cities added'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Users size={20} className="text-[#2F855A]" />
                      Trainees ({partnerTrainees.length})
                    </h3>
                    <button
                      onClick={() => setShowAddTraineeModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2F855A] text-white rounded-lg text-sm font-semibold hover:bg-[#276749]"
                    >
                      <Plus size={16} /> Add Trainee
                    </button>
                  </div>
                  {partnerTrainees.length === 0 ? (
                    <p className="text-slate-500 text-sm">No trainees assigned yet</p>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {partnerTrainees.map(trainee => (
                        <div key={trainee.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{trainee.trainee_name}</div>
                              <div className="text-xs text-slate-500 truncate">{trainee.trainee_email}</div>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${trainee.status === 'Approved' ? 'bg-green-100 text-green-700' : trainee.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{trainee.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><div className="text-[11px] font-semibold uppercase text-slate-400">Qualification</div><div className="font-medium text-slate-800">{trainee.qualification || 'Not provided'}</div></div>
                            <div><div className="text-[11px] font-semibold uppercase text-slate-400">Course</div><div className="font-medium text-slate-800">{trainee.course_interested || 'Not provided'}</div></div>
                            <div><div className="text-[11px] font-semibold uppercase text-slate-400">City</div><div className="text-slate-700">{trainee.city || 'Not provided'}</div></div>
                            <div><div className="text-[11px] font-semibold uppercase text-slate-400">Training Dates</div><div className="text-slate-700 whitespace-nowrap">{new Date(trainee.start_date).toLocaleDateString()} - {new Date(trainee.end_date).toLocaleDateString()}</div></div>
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                            {trainee.certificate_url ? (
                              <a href={trainee.certificate_url} target="_blank" rel="noreferrer" className="text-[#2F855A] hover:underline inline-flex items-center gap-1.5 text-sm font-semibold"><FileText size={15} /> View Certificate</a>
                            ) : (
                              <span className="text-xs text-slate-400">Certificate not uploaded</span>
                            )}
                          </div>
                          {trainee.approval_notes && <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-2"><span className="font-semibold">Hospital response:</span> {trainee.approval_notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slots Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <CalendarRange size={20} className="text-[#2F855A]" />
                    Slots ({partnerSlots.length})
                  </h3>

                  {partnerSlots.length === 0 ? (
                    <p className="text-slate-500 text-sm">No slots added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {partnerSlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#2F855A] text-white text-[10px] font-bold px-2 py-1 rounded">
                                  {slot.department_name}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {new Date(slot.start_date).toLocaleDateString()} → {new Date(slot.end_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Users size={14} className="text-[#2F855A]" />
                                  {slot.available_seats} / {slot.total_seats} available
                                </span>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                  slot.status === 'Open' ? 'bg-green-100 text-green-700' :
                                  slot.status === 'Closed' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {slot.status}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={14} className="text-[#2F855A]" />
                                  ₹{slot.fee_per_month?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <Building2 size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Select a hospital partner to view their departments and slots</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddTraineeModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Assign Trainee for Approval</h3>
              <button onClick={() => setShowAddTraineeModal(false)} className="p-1 text-slate-500 hover:text-slate-900" title="Close"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTrainee} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-slate-700">Name *<input required value={traineeForm.trainee_name} onChange={e => setTraineeForm({...traineeForm, trainee_name: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Email *<input type="email" required value={traineeForm.trainee_email} onChange={e => setTraineeForm({...traineeForm, trainee_email: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Qualification *<input required value={traineeForm.qualification} onChange={e => setTraineeForm({...traineeForm, qualification: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Course Interested *<input required value={traineeForm.course_interested} onChange={e => setTraineeForm({...traineeForm, course_interested: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Department *<select required value={traineeForm.hospital_department_id} onChange={e => setTraineeForm({...traineeForm, hospital_department_id: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal bg-white"><option value="">Select department</option>{partnerDepartments.map(department => <option key={department.id} value={department.id}>{department.department_name}</option>)}</select></label>
              <label className="text-sm font-semibold text-slate-700">City *<input required value={traineeForm.city} onChange={e => setTraineeForm({...traineeForm, city: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Start Date *<input type="date" required value={traineeForm.start_date} onChange={e => setTraineeForm({...traineeForm, start_date: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">End Date *<input type="date" required min={traineeForm.start_date} value={traineeForm.end_date} onChange={e => setTraineeForm({...traineeForm, end_date: e.target.value})} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Qualification Certificate *<input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertificateFile(e.target.files?.[0] || null)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" /></label>
              {error && <div className="sm:col-span-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTraineeModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmittingTrainee} className="px-4 py-2 bg-[#2F855A] text-white rounded-lg font-semibold disabled:opacity-50">{isSubmittingTrainee ? 'Submitting...' : 'Send for Approval'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
