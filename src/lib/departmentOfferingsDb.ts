import { supabase } from './supabase';

type BatchStatus = 'available' | 'full' | 'completed' | 'cancelled';

interface StoredBatch {
  id: string;
  hospital_department_id: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  available_seats: number;
  booked_seats: number;
  status: BatchStatus;
  created_at: string;
}

interface StoredOffering {
  id: string;
  hospital_id: string;
  department_id: string;
  city: string;
  pricing: Record<string, number>;
  max_slots: number;
  batches: StoredBatch[];
  created_at: string;
}

interface OfferingInput {
  hospitalId: string;
  city: string;
  pricing: Record<string, number>;
  maxSlots: number;
  batches: Array<{
    id?: string;
    durationMonths: number;
    startDate: string;
    endDate: string;
    seats: number;
    bookedSeats?: number;
    status?: BatchStatus;
  }>;
}

interface LegacyHospitalConfig {
  __trainmedixAdminConfig: 1;
  profileDescription: string;
  departmentOfferings: StoredOffering[];
}

const createId = (prefix: string) => {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
};

const emptyLegacyConfig = (description = ''): LegacyHospitalConfig => ({
  __trainmedixAdminConfig: 1,
  profileDescription: description,
  departmentOfferings: []
});

const parseLegacyConfig = (description?: string | null): LegacyHospitalConfig => {
  if (!description) return emptyLegacyConfig();
  try {
    const parsed = JSON.parse(description);
    if (parsed?.__trainmedixAdminConfig === 1 && Array.isArray(parsed.departmentOfferings)) {
      return parsed as LegacyHospitalConfig;
    }
  } catch {
    // Existing descriptions can be plain text.
  }
  return emptyLegacyConfig(description);
};

export const normalizeAdminHospital = <T extends { description?: string | null }>(hospital: T): T => ({
  ...hospital,
  description: parseLegacyConfig(hospital.description).profileDescription
});

const isMissingColumnError = (error: any) =>
  error?.code === 'PGRST204'
  || error?.code === '42703'
  || error?.code === '400'
  || error?.status === 400
  || error?.message?.includes('hospital_offerings')
  || error?.message?.includes('column')
  || error?.message?.includes('does not exist');

const getDepartmentStorage = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, hospital_offerings');
    if (!error) return { available: true, departments: data || [] };
    if (isMissingColumnError(error)) return { available: false, departments: [] };
    throw error;
  } catch (err) {
    // If any error occurs and might be related to missing column, use fallback
    console.log('[AppConfig] hospital_offerings column unavailable, using fallback storage');
    return { available: false, departments: [] };
  }
};

const getRawHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('id, name, city, cities, description');
  if (error) throw error;
  return data || [];
};

const updateLegacyHospitalConfig = async (
  hospitalId: string,
  update: (config: LegacyHospitalConfig) => void
) => {
  const { data: hospital, error: fetchError } = await supabase
    .from('hospitals')
    .select('description')
    .eq('id', hospitalId)
    .single();
  if (fetchError) throw fetchError;

  const config = parseLegacyConfig(hospital.description);
  update(config);
  const { error: updateError } = await supabase
    .from('hospitals')
    .update({ description: JSON.stringify(config) })
    .eq('id', hospitalId);
  if (updateError) throw updateError;
};

const enrichOfferings = async (offerings: StoredOffering[]) => {
  const [hospitals, departmentResult] = await Promise.all([
    getRawHospitals(),
    supabase.from('departments').select('id, name, code')
  ]);
  if (departmentResult.error) throw departmentResult.error;
  const hospitalMap = new Map(hospitals.map(hospital => [hospital.id, hospital]));
  const departmentMap = new Map((departmentResult.data || []).map(department => [department.id, department]));

  return offerings.map(offering => {
    const hospital = hospitalMap.get(offering.hospital_id);
    return {
      ...offering,
      hospitals: hospital ? { name: hospital.name, city: hospital.city, cities: hospital.cities } : null,
      departments: departmentMap.get(offering.department_id) || null
    };
  });
};

const getAllOfferings = async () => {
  const storage = await getDepartmentStorage();
  if (storage.available) {
    const offerings = storage.departments.flatMap(department =>
      (Array.isArray(department.hospital_offerings) ? department.hospital_offerings : []).map((offering: any) => ({
        ...offering,
        department_id: department.id,
        batches: Array.isArray(offering.batches) ? offering.batches : []
      }))
    );
    return enrichOfferings(offerings as StoredOffering[]);
  }

  const hospitals = await getRawHospitals();
  return enrichOfferings(hospitals.flatMap(hospital =>
    parseLegacyConfig(hospital.description).departmentOfferings
  ));
};

const toInput = (offering: StoredOffering): OfferingInput => ({
  hospitalId: offering.hospital_id,
  city: offering.city,
  pricing: offering.pricing || {},
  maxSlots: offering.max_slots ?? 0,
  batches: (offering.batches || []).map(batch => ({
    id: batch.id,
    durationMonths: batch.duration_months,
    startDate: batch.start_date,
    endDate: batch.end_date,
    seats: batch.available_seats,
    bookedSeats: batch.booked_seats,
    status: batch.status
  }))
});

export const departmentOfferingStore = {
  async getAll() {
    return getAllOfferings();
  },

  async getByHospital(hospitalId: string) {
    return (await getAllOfferings()).filter(offering => offering.hospital_id === hospitalId);
  },

  async getByDepartment(departmentId: string) {
    return (await getAllOfferings()).filter(offering => offering.department_id === departmentId);
  },

  async syncDepartment(departmentId: string, inputs: OfferingInput[]) {
    const current = await this.getByDepartment(departmentId) as StoredOffering[];
    const replacements = inputs.map(input => {
      const previous = current.find(item => item.hospital_id === input.hospitalId && item.city === input.city);
      const offeringId = previous?.id || createId('offering');
      return {
        id: offeringId,
        hospital_id: input.hospitalId,
        department_id: departmentId,
        city: input.city,
        pricing: input.pricing || {},
        max_slots: input.maxSlots ?? 0,
        batches: input.batches.map(batch => {
          const previousBatch = previous?.batches?.find(item => item.id === batch.id);
          return {
            id: batch.id || createId('batch'),
            hospital_department_id: offeringId,
            duration_months: batch.durationMonths,
            start_date: batch.startDate,
            end_date: batch.endDate,
            available_seats: batch.seats,
            booked_seats: batch.bookedSeats ?? previousBatch?.booked_seats ?? 0,
            status: batch.status || previousBatch?.status || 'available',
            created_at: previousBatch?.created_at || new Date().toISOString()
          } satisfies StoredBatch;
        }),
        created_at: previous?.created_at || new Date().toISOString()
      } satisfies StoredOffering;
    });

    const storage = await getDepartmentStorage();
    if (storage.available) {
      const { error } = await supabase
        .from('departments')
        .update({ hospital_offerings: replacements })
        .eq('id', departmentId);
      if (error) throw error;
      return this.getByDepartment(departmentId);
    }

    const hospitals = await getRawHospitals();
    const byHospital = new Map<string, StoredOffering[]>();
    replacements.forEach(offering => {
      const items = byHospital.get(offering.hospital_id) || [];
      byHospital.set(offering.hospital_id, [...items, offering]);
    });
    const affected = hospitals.filter(hospital =>
      byHospital.has(hospital.id)
      || parseLegacyConfig(hospital.description).departmentOfferings.some(item => item.department_id === departmentId)
    );
    await Promise.all(affected.map(hospital => updateLegacyHospitalConfig(hospital.id, config => {
      config.departmentOfferings = [
        ...config.departmentOfferings.filter(item => item.department_id !== departmentId),
        ...(byHospital.get(hospital.id) || [])
      ];
    })));
    return this.getByDepartment(departmentId);
  },

  async upsert(data: {
    hospitalId: string;
    departmentId: string;
    city: string;
    pricing?: Record<string, number>;
    maxSlots?: number;
  }) {
    const existing = await this.getByDepartment(data.departmentId) as StoredOffering[];
    const match = existing.find(item => item.hospital_id === data.hospitalId && item.city === data.city);
    const inputs = existing
      .filter(item => item.id !== match?.id)
      .map(toInput);
    inputs.push({
      hospitalId: data.hospitalId,
      city: data.city,
      pricing: data.pricing || {},
      maxSlots: data.maxSlots ?? 0,
      batches: match ? toInput(match).batches : []
    });
    const saved = await this.syncDepartment(data.departmentId, inputs);
    return saved.find(item => item.hospital_id === data.hospitalId && item.city === data.city)!;
  },

  async delete(offeringId: string) {
    const all = await getAllOfferings() as StoredOffering[];
    const target = all.find(item => item.id === offeringId);
    if (!target) return { success: true };
    await this.syncDepartment(
      target.department_id,
      all.filter(item => item.department_id === target.department_id && item.id !== offeringId).map(toInput)
    );
    return { success: true };
  },

  async getBatches(offeringId?: string) {
    const offerings = await getAllOfferings();
    return offerings.flatMap(offering =>
      (offering.batches || [])
        .filter(() => !offeringId || offering.id === offeringId)
        .map(batch => ({ ...batch, hospital_departments: offering }))
    );
  },

  async createBatch(data: {
    hospitalDepartmentId: string;
    startDate: string;
    endDate: string;
    availableSeats: number;
    durationMonths?: number;
  }) {
    const offerings = await getAllOfferings() as StoredOffering[];
    const target = offerings.find(item => item.id === data.hospitalDepartmentId);
    if (!target) throw new Error('Hospital department offering not found');
    const batchId = createId('batch');
    const inputs = offerings
      .filter(item => item.department_id === target.department_id)
      .map(item => {
        const input = toInput(item);
        if (item.id === target.id) {
          input.batches.push({
            id: batchId,
            durationMonths: data.durationMonths || 1,
            startDate: data.startDate,
            endDate: data.endDate,
            seats: data.availableSeats,
            bookedSeats: 0,
            status: 'available'
          });
        }
        return input;
      });
    const saved = await this.syncDepartment(target.department_id, inputs) as StoredOffering[];
    return saved.flatMap(item => item.batches).find(batch => batch.id === batchId)!;
  },

  async updateBatch(batchId: string, updates: Record<string, any>) {
    const offerings = await getAllOfferings() as StoredOffering[];
    const target = offerings.find(item => item.batches?.some(batch => batch.id === batchId));
    if (!target) throw new Error('Training batch not found');
    const inputs = offerings.filter(item => item.department_id === target.department_id).map(item => {
      const input = toInput(item);
      input.batches = input.batches.map(batch => batch.id === batchId ? {
        ...batch,
        durationMonths: updates.duration_months ?? batch.durationMonths,
        startDate: updates.start_date ?? batch.startDate,
        endDate: updates.end_date ?? batch.endDate,
        seats: updates.available_seats ?? batch.seats,
        bookedSeats: updates.booked_seats ?? batch.bookedSeats,
        status: updates.status ?? batch.status
      } : batch);
      return input;
    });
    const saved = await this.syncDepartment(target.department_id, inputs) as StoredOffering[];
    return saved.flatMap(item => item.batches).find(batch => batch.id === batchId)!;
  },

  async deleteBatch(batchId: string) {
    const offerings = await getAllOfferings() as StoredOffering[];
    const target = offerings.find(item => item.batches?.some(batch => batch.id === batchId));
    if (!target) return { success: true };
    const inputs = offerings.filter(item => item.department_id === target.department_id).map(item => {
      const input = toInput(item);
      input.batches = input.batches.filter(batch => batch.id !== batchId);
      return input;
    });
    await this.syncDepartment(target.department_id, inputs);
    return { success: true };
  }
};
