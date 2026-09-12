import { supabase, supabaseAdmin } from './supabase';
import { departmentOfferingStore as adminOfferingStore, normalizeAdminHospital } from './departmentOfferingsDb';

// ============================================
// USERS OPERATIONS
// ============================================

export const userService = {
  // Create new user
  async create(userData: {
    email: string;
    phone?: string;
    fullName: string;
    role: 'trainee' | 'hospital' | 'admin';
    passwordHash?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: userData.email,
          phone: userData.phone,
          full_name: userData.fullName,
          role: userData.role,
          password_hash: userData.passwordHash,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user by email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users by role
  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);

    if (error) throw error;
    return data;
  },

  // Update user
  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  },

  // Delete user
  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // Verify user
  async verify(id: string) {
    return this.update(id, { is_verified: true });
  },
};

// ============================================
// HOSPITALS OPERATIONS
// ============================================

export const hospitalService = {
  // Create hospital
  async create(hospitalData: {
    userId?: string | null;
    name: string;
    cities: string[];
    phone: string;
    email: string;
    description?: string;
    available_slots?: number;
    image_url?: string;
    website?: string;
  }) {
    // Determine primary city
    const primaryCity = hospitalData.cities && hospitalData.cities.length > 0 ? hospitalData.cities[0] : 'Unknown';
    
    const insertData: Record<string, any> = {
      user_id: hospitalData.userId || null,  // Allow null for admin-created hospitals
      name: hospitalData.name,
      phone: hospitalData.phone,
      email: hospitalData.email,
      // Add required fields with defaults
      address: `${primaryCity}, India`,  // Default address based on primary city
      city: primaryCity,
      state: primaryCity,  // Use city as state for now (admin panel doesn't collect state separately)
    };

    // Try to add cities array - it will be ignored if column doesn't exist yet
    try {
      insertData.cities = hospitalData.cities;
    } catch (err) {
      console.log('⚠️  Cities column not available yet');
    }

    // Add optional fields if provided
    if (hospitalData.description) insertData.description = hospitalData.description;
    if (hospitalData.available_slots !== undefined) insertData.available_slots = hospitalData.available_slots;
    if (hospitalData.image_url) insertData.image_url = hospitalData.image_url;
    if (hospitalData.website) insertData.website = hospitalData.website;

    const { data, error } = await supabase
      .from('hospitals')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all hospitals
  async getAll() {
    try {
      // Try to fetch with all columns including cities
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, user_id, name, email, phone, cities, is_active, created_at, updated_at, available_slots, image_url, website')
        .eq('is_active', true);
      
      // If error about missing column, fall back to basic columns
      if (error && (
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.message.includes('Could not find the') ||
        error.message.includes('cities')
      )) {
        console.log('⚠️  Cities column not available yet, using fallback...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('hospitals')
          .select('id, user_id, name, email, phone, city, state, address, is_active, created_at, updated_at, available_slots, image_url, website')
          .eq('is_active', true);
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }
  },

  // Get every admin-managed hospital, including inactive records
  async getAllForAdmin() {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(normalizeAdminHospital);
  },

  // Get hospital by ID
  async getById(id: string) {
    try {
      // Try to fetch with all columns including cities
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, user_id, name, email, phone, cities, is_active, created_at, updated_at, available_slots, image_url, website')
        .eq('id', id)
        .single();
      
      // If error about missing column, fall back to basic columns
      if (error && (
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.message.includes('Could not find the') ||
        error.message.includes('cities')
      )) {
        console.log('⚠️  Cities column not available yet, using fallback...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('hospitals')
          .select('id, user_id, name, email, phone, city, state, address, is_active, created_at, updated_at, available_slots, image_url, website')
          .eq('id', id)
          .single();
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching hospital by ID:', error);
      throw error;
    }
  },

  // Get hospitals by city (searches in cities array or falls back to city field)
  async getByCity(city: string) {
    try {
      // Try to fetch with cities array, while keeping legacy city field available for compatibility
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, user_id, name, email, phone, city, cities, is_active, created_at, updated_at, available_slots, image_url, website')
        .eq('is_active', true);
      
      if (error && (
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.message.includes('Could not find the') ||
        error.message.includes('cities')
      )) {
        console.log('⚠️  Cities column not available yet, falling back to city field...');
        // Fall back to city field if cities column doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('hospitals')
          .select('id, user_id, name, email, phone, city, is_active, created_at, updated_at, available_slots, image_url, website')
          .eq('city', city)
          .eq('is_active', true);
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      if (error) throw error;
      
      // Filter hospitals that have the city in their cities array
      return (data || []).filter((h: any) =>
        (Array.isArray(h.cities) && h.cities.includes(city)) ||
        ((h as any).city === city)
      );
    } catch (error) {
      console.error('Error fetching hospitals by city:', error);
      return [];
    }
  },

  // Update hospital
  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('hospitals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete hospital
  async delete(id: string) {
    const { error } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

// ============================================
// DEPARTMENTS OPERATIONS
// ============================================

export const departmentService = {
  // Create department
  async create(deptData: {
    code: string;
    name: string;
    description?: string;
    duration_days?: number;
    icon_url?: string;
    sub_departments?: string[];
  }) {
    const { data, error } = await supabase
      .from('departments')
      .insert([deptData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all departments
  async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  // Get department by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get department by code
  async getByCode(code: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  },

  // Update department
  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload department image
  async uploadImage(file: File, departmentCode: string) {
    try {
      const fileName = `${departmentCode}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('departments')
        .upload(fileName, file, { upsert: true });

      if (error) {
        // Provide helpful error message
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          throw new Error('departments storage bucket not found. Please create it in Supabase. See SETUP_STORAGE_BUCKET.md for instructions.');
        }
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('departments')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err: any) {
      console.error('Image upload error:', err);
      throw err;
    }
  },

  // Delete department
  async delete(id: string) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

// ============================================
// HOSPITAL DEPARTMENTS OPERATIONS
// ============================================

export const hospitalDepartmentService = {
  // Add department to hospital
  async create(data: {
    hospitalId: string;
    departmentId: string;
    city?: string;
    pricing?: Record<string, number>;
    mentorName?: string;
    mentorQualification?: string;
    maxSlots: number;
  }) {
    return adminOfferingStore.upsert({
      hospitalId: data.hospitalId,
      departmentId: data.departmentId,
      city: data.city || '',
      pricing: data.pricing,
      maxSlots: data.maxSlots
    });
  },

  // Create or update the offering for a hospital + department + city
  async upsert(data: {
    hospitalId: string;
    departmentId: string;
    city: string;
    pricing?: Record<string, number>;
    maxSlots?: number;
  }) {
    return adminOfferingStore.upsert(data);
  },

  async syncDepartment(departmentId: string, offerings: Array<{
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
    }>;
  }>) {
    return adminOfferingStore.syncDepartment(departmentId, offerings);
  },

  // Remove a hospital-department offering
  async delete(id: string) {
    return adminOfferingStore.delete(id);
  },

  // Get departments for a hospital
  async getByHospital(hospitalId: string) {
    return adminOfferingStore.getByHospital(hospitalId);
  },

  // Get hospitals offering a department
  async getByDepartment(departmentId: string) {
    return adminOfferingStore.getByDepartment(departmentId);
  },

  // Every hospital + department + city offering, for pickers
  async getAll() {
    return adminOfferingStore.getAll();
  },
};

// ============================================
// TRAINING SLOTS OPERATIONS
// ============================================

export const slotService = {
  // Create slot
  async create(slotData: {
    hospitalDepartmentId: string;
    startDate: string;
    endDate: string;
    availableSeats: number;
    durationMonths?: number;
  }) {
    return adminOfferingStore.createBatch(slotData);
  },

  // Batches for one hospital + department + city offering
  async getByHospitalDepartment(hospitalDepartmentId: string) {
    return adminOfferingStore.getBatches(hospitalDepartmentId);
  },

  // All batches with the hospital/department context the website needs
  async getAllDetailed() {
    return adminOfferingStore.getBatches();
  },

  // Get all available slots
  async getAvailable() {
    return (await adminOfferingStore.getBatches()).filter(batch => batch.status === 'available');
  },

  // Get slots by hospital
  async getByHospital(hospitalId: string) {
    const offeringIds = new Set((await adminOfferingStore.getByHospital(hospitalId)).map(offering => offering.id));
    return (await adminOfferingStore.getBatches()).filter(batch => offeringIds.has(batch.hospital_department_id));
  },

  // Update slot availability
  async updateAvailability(slotId: string, bookedSeats: number, status: string) {
    return adminOfferingStore.updateBatch(slotId, { booked_seats: bookedSeats, status });
  },

  // Update slot
  async update(id: string, updates: Record<string, any>) {
    return adminOfferingStore.updateBatch(id, updates);
  },

  // Get all slots
  async getAll() {
    return adminOfferingStore.getBatches();
  },

  // Delete slot
  async delete(id: string) {
    return adminOfferingStore.deleteBatch(id);
  },
};

// ============================================
// BOOKINGS OPERATIONS
// ============================================

export const bookingService = {
  // Create booking
  async create(bookingData: {
    traineeId: string;
    slotId: string;
    hospitalId: string;
    departmentId: string;
    startDate: string;
    endDate: string;
  }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          trainee_id: bookingData.traineeId,
          slot_id: bookingData.slotId,
          hospital_id: bookingData.hospitalId,
          department_id: bookingData.departmentId,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get bookings for trainee
  async getByTrainee(traineeId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, hospitals(*), departments(*)')
      .eq('trainee_id', traineeId);

    if (error) throw error;
    return data;
  },

  // Get bookings for hospital
  async getByHospital(hospitalId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, users!trainee_id(full_name, email, phone)')
      .eq('hospital_id', hospitalId);

    if (error) throw error;
    return data;
  },

  // Update booking status
  async updateStatus(bookingId: string, status: string, approvalDate?: string, rejectionReason?: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        approval_date: approvalDate,
        rejection_reason: rejectionReason,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all pending bookings for approval
  async getPending() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, users!trainee_id(full_name, email), departments(*), hospitals(*)')
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  // Get all bookings
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');

    if (error) throw error;
    
    // Map Supabase snake_case to frontend camelCase
    return data?.map((booking: any) => ({
      id: booking.id,
      bookingRef: booking.booking_ref,
      traineeName: booking.trainee_name,
      traineeEmail: booking.trainee_email,
      traineePhone: booking.trainee_phone,
      medicalQualification: booking.medical_qualification,
      councilRegistrationNumber: booking.council_registration_number,
      departmentId: booking.department_id,
      departmentName: booking.department_name,
      subDepartment: booking.sub_department,
      hospitalId: booking.hospital_id,
      hospitalName: booking.hospital_name,
      city: booking.city,
      duration: booking.duration,
      startDate: booking.start_date,
      amountPaid: booking.amount_paid,
      paymentMethod: booking.payment_method,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status,
      documents: booking.documents,
      createdAt: booking.created_at,
    })) || [];
  },

  // Delete booking
  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

// ============================================
// LOGBOOK OPERATIONS
// ============================================

export const logbookService = {
  // Add logbook entry
  async create(entryData: {
    bookingId: string;
    traineeId: string;
    departmentId?: string;
    procedureName: string;
    date: string;
    role: 'observed' | 'assisted' | 'performed';
    notes?: string;
    mentorFeedback?: string;
  }) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .insert([
        {
          booking_id: entryData.bookingId,
          trainee_id: entryData.traineeId,
          department_id: entryData.departmentId,
          procedure_name: entryData.procedureName,
          date: entryData.date,
          role: entryData.role,
          notes: entryData.notes,
          mentor_feedback: entryData.mentorFeedback,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get logbook for booking
  async getByBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .select('*')
      .eq('booking_id', bookingId);

    if (error) throw error;
    return data;
  },

  // Get logbook for trainee
  async getByTrainee(traineeId: string) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .select('*')
      .eq('trainee_id', traineeId);

    if (error) throw error;
    return data;
  },

  // Add mentor feedback
  async updateFeedback(entryId: string, feedback: string) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .update({ mentor_feedback: feedback })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// CERTIFICATES OPERATIONS
// ============================================

export const certificateService = {
  // Create certificate
  async create(certData: {
    bookingId: string;
    traineeId: string;
    hospitalId?: string;
    departmentId?: string;
    certificateNumber: string;
    issueDate: string;
    expiryDate?: string;
  }) {
    const { data, error } = await supabase
      .from('certificates')
      .insert([
        {
          booking_id: certData.bookingId,
          trainee_id: certData.traineeId,
          hospital_id: certData.hospitalId,
          department_id: certData.departmentId,
          certificate_number: certData.certificateNumber,
          issue_date: certData.issueDate,
          expiry_date: certData.expiryDate,
          is_verified: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get certificates for trainee
  async getByTrainee(traineeId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, departments(*), hospitals(*)')
      .eq('trainee_id', traineeId);

    if (error) throw error;
    return data;
  },

  // Verify certificate by number
  async verify(certificateNumber: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, users!trainee_id(full_name), departments(*), hospitals(*)')
      .eq('certificate_number', certificateNumber)
      .single();

    if (error) throw error;
    return data;
  },

  // Update certificate with file URLs
  async updateUrls(certId: string, certificateUrl: string, qrCodeUrl: string) {
    const { data, error } = await supabase
      .from('certificates')
      .update({ certificate_url: certificateUrl, qr_code_url: qrCodeUrl })
      .eq('id', certId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// NOTIFICATIONS OPERATIONS
// ============================================

export const notificationService = {
  // Create notification
  async create(notifData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: notifData.userId,
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          related_id: notifData.relatedId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get notifications for user
  async getByUser(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// AUDIT LOGS OPERATIONS
// ============================================

export const auditLogService = {
  // Create audit log entry
  async create(logData: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
  }) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: logData.userId,
          action: logData.action,
          entity_type: logData.entityType,
          entity_id: logData.entityId,
          old_values: logData.oldValues,
          new_values: logData.newValues,
          ip_address: logData.ipAddress,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get audit logs for entity
  async getByEntity(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ============================================
// BULK OPERATIONS (for seeding)
// ============================================

export const bulkService = {
  // Seed initial departments
  async seedDepartments(departments: any[]) {
    const { data, error } = await supabase
      .from('departments')
      .insert(departments)
      .select();

    if (error) throw error;
    return data;
  },

  // Seed initial hospitals
  async seedHospitals(hospitals: any[]) {
    const { data, error } = await supabase
      .from('hospitals')
      .insert(hospitals)
      .select();

    if (error) throw error;
    return data;
  },
};
