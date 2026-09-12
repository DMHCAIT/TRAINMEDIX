import { supabase } from './supabaseClient';

// ============================================================================
// HOSPITAL DEPARTMENT OPERATIONS
// ============================================================================

export interface HospitalDepartment {
  id: string;
  hospital_id: string;
  department_name: string;
  department_code: string;
  description?: string;
  available_cities: string[];
  base_fee_per_month: number;
  total_slots: number;
  active_slots: number;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalDepartmentSlot {
  id: string;
  hospital_id: string;
  hospital_department_id: string;
  department_name: string;
  specialization?: string;
  start_date: string;
  end_date: string;
  total_seats: number;
  available_seats: number;
  fee_per_month: number;
  status: 'Open' | 'Filling Fast' | 'Closed' | 'Completed';
  created_at?: string;
  updated_at?: string;
}

export interface HospitalTrainee {
  id: string;
  hospital_id: string;
  trainee_email: string;
  trainee_name: string;
  qualification: string;
  course_interested: string;
  certificate_url: string;
  city: string;
  trainee_id?: string;
  hospital_department_id: string;
  department_name: string;
  duration_months: number;
  start_date: string;
  end_date?: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
  approval_notes?: string;
  approved_at?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface TraineeMetadata {
  qualification?: string;
  course_interested?: string;
  certificate_url?: string;
  city?: string;
  response_notes?: string;
}

function parseTraineeMetadata(value?: string): TraineeMetadata {
  if (!value) return {};
  try {
    return JSON.parse(value) as TraineeMetadata;
  } catch {
    return { response_notes: value };
  }
}

function mapHospitalTrainee(row: any): HospitalTrainee {
  const metadata = parseTraineeMetadata(row.approval_notes);
  return {
    ...row,
    qualification: row.qualification || metadata.qualification || '',
    course_interested: row.course_interested || metadata.course_interested || row.department_name || '',
    certificate_url: row.certificate_url || metadata.certificate_url || row.trainee_id || '',
    city: row.city || metadata.city || '',
    approval_notes: metadata.response_notes || (row.approval_notes && !row.approval_notes.startsWith('{') ? row.approval_notes : undefined)
  };
}

function serializeTraineeMetadata(trainee: Partial<HospitalTrainee>, responseNotes?: string) {
  return JSON.stringify({
    qualification: trainee.qualification,
    course_interested: trainee.course_interested,
    certificate_url: trainee.certificate_url,
    city: trainee.city,
    response_notes: responseNotes
  } satisfies TraineeMetadata);
}

// ============================================================================
// HOSPITAL DEPARTMENTS
// ============================================================================

/**
 * Add a new department for a hospital
 */
export async function addHospitalDepartmentDb(hospitalId: string, data: Omit<HospitalDepartment, 'id' | 'created_at' | 'updated_at' | 'hospital_id'> & { hospital_id: string }) {
  try {
    console.log('[addHospitalDepartmentDb] Adding department');
    console.log('[addHospitalDepartmentDb] hospitalId:', hospitalId);
    console.log('[addHospitalDepartmentDb] data:', data);

    const { data: result, error } = await supabase
      .from('hospital_departments')
      .insert([{
        hospital_id: hospitalId,
        department_name: data.department_name,
        department_code: data.department_code.toUpperCase(),
        description: data.description,
        available_cities: data.available_cities,
        base_fee_per_month: data.base_fee_per_month,
        total_slots: data.total_slots || 0,
        active_slots: data.active_slots || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('[Hospital Department Add DB] Error:', error.message);
      console.error('[Hospital Department Add DB] Error details:', error);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Department Add DB] Created:', result.id);
    console.log('[Hospital Department Add DB] Full result:', result);
    return { success: true, department: result };
  } catch (err: any) {
    console.error('[Hospital Department Add DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all departments for a specific hospital
 */
export async function getHospitalDepartmentsDb(hospitalId: string) {
  try {
    console.log('[getHospitalDepartmentsDb] Querying for hospital_id:', hospitalId);
    const { data, error } = await supabase
      .from('hospital_departments')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Hospital Departments Get DB] Error:', error.message);
      return { success: false, error: error.message, departments: [] };
    }

    console.log(`[Hospital Departments Get DB] Query success - Found ${data?.length || 0} departments for hospital ${hospitalId}`);
    if (data && data.length > 0) {
      console.log('[Hospital Departments Get DB] First department:', data[0]);
    }
    return { success: true, departments: data || [] };
  } catch (err: any) {
    console.error('[Hospital Departments Get DB] Exception:', err);
    return { success: false, error: err.message, departments: [] };
  }
}

/**
 * Get a specific department for a hospital
 */
export async function getHospitalDepartmentDb(departmentId: string) {
  try {
    const { data, error } = await supabase
      .from('hospital_departments')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error('[Hospital Department Get DB] Error:', error.message);
      return { success: false, error: error.message, department: null };
    }

    return { success: true, department: data };
  } catch (err: any) {
    console.error('[Hospital Department Get DB] Exception:', err);
    return { success: false, error: err.message, department: null };
  }
}

/**
 * Update hospital department
 */
export async function updateHospitalDepartmentDb(departmentId: string, updates: Partial<HospitalDepartment>) {
  try {
    const { data, error } = await supabase
      .from('hospital_departments')
      .update(updates)
      .eq('id', departmentId)
      .select()
      .single();

    if (error) {
      console.error('[Hospital Department Update DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Department Update DB] Updated:', departmentId);
    return { success: true, department: data };
  } catch (err: any) {
    console.error('[Hospital Department Update DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// HOSPITAL DEPARTMENT SLOTS
// ============================================================================

/**
 * Add a new slot for a hospital department
 */
export async function addHospitalSlotDb(hospitalId: string, data: Omit<HospitalDepartmentSlot, 'id' | 'created_at' | 'updated_at' | 'hospital_id'> & { hospital_id: string }) {
  try {
    console.log('[addHospitalSlotDb] Adding slot');
    console.log('[addHospitalSlotDb] data:', data);
    
    const { data: result, error } = await supabase
      .from('hospital_department_slots')
      .insert([{
        hospital_id: hospitalId,
        hospital_department_id: data.hospital_department_id,
        department_name: data.department_name,
        specialization: data.specialization,
        start_date: data.start_date,
        end_date: data.end_date,
        total_seats: data.total_seats,
        available_seats: data.available_seats,
        fee_per_month: data.fee_per_month,
        status: data.status
      }])
      .select()
      .single();

    if (error) {
      console.error('[Hospital Slot Add DB] Error:', error.message);
      console.error('[Hospital Slot Add DB] Error details:', error);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Slot Add DB] Created:', result.id);
    console.log('[Hospital Slot Add DB] Full result:', result);
    return { success: true, slot: result };
  } catch (err: any) {
    console.error('[Hospital Slot Add DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all slots for a hospital
 */
export async function getHospitalSlotsDb(hospitalId: string) {
  try {
    const { data, error } = await supabase
      .from('hospital_department_slots')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Hospital Slots Get DB] Error:', error.message);
      return { success: false, error: error.message, slots: [] };
    }

    console.log(`[Hospital Slots Get DB] Found ${data?.length || 0} slots for hospital ${hospitalId}`);
    return { success: true, slots: data || [] };
  } catch (err: any) {
    console.error('[Hospital Slots Get DB] Exception:', err);
    return { success: false, error: err.message, slots: [] };
  }
}

/**
 * Get slots for a specific hospital department
 */
export async function getHospitalDepartmentSlotsDb(departmentId: string) {
  try {
    const { data, error } = await supabase
      .from('hospital_department_slots')
      .select('*')
      .eq('hospital_department_id', departmentId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Hospital Department Slots Get DB] Error:', error.message);
      return { success: false, error: error.message, slots: [] };
    }

    return { success: true, slots: data || [] };
  } catch (err: any) {
    console.error('[Hospital Department Slots Get DB] Exception:', err);
    return { success: false, error: err.message, slots: [] };
  }
}

/**
 * Update hospital slot
 */
export async function updateHospitalSlotDb(slotId: string, updates: Partial<HospitalDepartmentSlot>) {
  try {
    const { data, error } = await supabase
      .from('hospital_department_slots')
      .update(updates)
      .eq('id', slotId)
      .select()
      .single();

    if (error) {
      console.error('[Hospital Slot Update DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Slot Update DB] Updated:', slotId);
    return { success: true, slot: data };
  } catch (err: any) {
    console.error('[Hospital Slot Update DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete hospital slot
 */
export async function deleteHospitalSlotDb(slotId: string) {
  try {
    const { error } = await supabase
      .from('hospital_department_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      console.error('[Hospital Slot Delete DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Slot Delete DB] Deleted:', slotId);
    return { success: true };
  } catch (err: any) {
    console.error('[Hospital Slot Delete DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// HOSPITAL TRAINEES
// ============================================================================

/**
 * Add a trainee assignment to hospital department (Admin function)
 */
export async function addHospitalTraineeDb(hospitalId: string, data: Omit<HospitalTrainee, 'id' | 'created_at' | 'updated_at' | 'hospital_id'> & { hospital_id: string }) {
  try {
    const { data: result, error } = await supabase
      .from('hospital_trainees')
      .insert([{
        hospital_id: hospitalId,
        trainee_email: data.trainee_email,
        trainee_name: data.trainee_name,
        trainee_id: data.certificate_url || data.trainee_id,
        hospital_department_id: data.hospital_department_id,
        department_name: data.department_name,
        duration_months: data.duration_months,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        approval_notes: serializeTraineeMetadata(data)
      }])
      .select()
      .single();

    if (error) {
      console.error('[Hospital Trainee Add DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Trainee Add DB] Created:', result.id);
    return { success: true, trainee: mapHospitalTrainee(result) };
  } catch (err: any) {
    console.error('[Hospital Trainee Add DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all trainees for a hospital
 */
export async function getHospitalTraineesDb(hospitalId: string) {
  try {
    const { data, error } = await supabase
      .from('hospital_trainees')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Hospital Trainees Get DB] Error:', error.message);
      return { success: false, error: error.message, trainees: [] };
    }

    console.log(`[Hospital Trainees Get DB] Found ${data?.length || 0} trainees for hospital ${hospitalId}`);
    return { success: true, trainees: (data || []).map(mapHospitalTrainee) };
  } catch (err: any) {
    console.error('[Hospital Trainees Get DB] Exception:', err);
    return { success: false, error: err.message, trainees: [] };
  }
}

/**
 * Get pending trainees for a hospital
 */
export async function getHospitalPendingTraineesDb(hospitalId: string) {
  try {
    const { data, error } = await supabase
      .from('hospital_trainees')
      .select('*')
      .eq('hospital_id', hospitalId)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Hospital Pending Trainees Get DB] Error:', error.message);
      return { success: false, error: error.message, trainees: [] };
    }

    return { success: true, trainees: (data || []).map(mapHospitalTrainee) };
  } catch (err: any) {
    console.error('[Hospital Pending Trainees Get DB] Exception:', err);
    return { success: false, error: err.message, trainees: [] };
  }
}

/**
 * Approve trainee for hospital department
 */
export async function approveHospitalTraineeDb(traineeId: string, approvedBy: string, notes?: string) {
  try {
    const { data: current } = await supabase
      .from('hospital_trainees')
      .select('*')
      .eq('id', traineeId)
      .single();
    const trainee = current ? mapHospitalTrainee(current) : {};
    const { data, error } = await supabase
      .from('hospital_trainees')
      .update({
        status: 'Approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        approval_notes: serializeTraineeMetadata(trainee, notes)
      })
      .eq('id', traineeId)
      .select()
      .single();

    if (error) {
      console.error('[Hospital Trainee Approve DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Trainee Approve DB] Approved:', traineeId);
    return { success: true, trainee: mapHospitalTrainee(data) };
  } catch (err: any) {
    console.error('[Hospital Trainee Approve DB] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Reject trainee for hospital department
 */
export async function rejectHospitalTraineeDb(traineeId: string, notes?: string) {
  try {
    const { data: current } = await supabase
      .from('hospital_trainees')
      .select('*')
      .eq('id', traineeId)
      .single();
    const trainee = current ? mapHospitalTrainee(current) : {};
    const { data, error } = await supabase
      .from('hospital_trainees')
      .update({
        status: 'Rejected',
        approval_notes: serializeTraineeMetadata(trainee, notes)
      })
      .eq('id', traineeId)
      .select()
      .single();

    if (error) {
      console.error('[Hospital Trainee Reject DB] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Hospital Trainee Reject DB] Rejected:', traineeId);
    return { success: true, trainee: mapHospitalTrainee(data) };
  } catch (err: any) {
    console.error('[Hospital Trainee Reject DB] Exception:', err);
    return { success: false, error: err.message };
  }
}
