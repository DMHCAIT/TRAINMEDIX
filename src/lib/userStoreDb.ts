import { supabase } from './supabaseClient';

export interface RegisteredUser {
  id: string;
  role: 'trainee' | 'hospital';
  fullName: string;
  email: string;
  phone?: string;
  qualification?: string;
  interests: string[];
  address?: string;
  preferredCity?: string;
  isApproved?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export async function findUserByEmailDb(email: string): Promise<RegisteredUser | null> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('registered_users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbUserToUser(data);
  } catch (error: any) {
    console.error('[User DB] Error finding user:', error.message);
    return null;
  }
}

export async function createUserDb(userData: {
  role: 'trainee' | 'hospital';
  fullName: string;
  email: string;
  phone?: string;
  qualification?: string;
  interests?: string[];
  address?: string;
  preferredCity?: string;
}): Promise<RegisteredUser> {
  try {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const id = 'usr-' + Date.now();

    const { data, error } = await supabase
      .from('registered_users')
      .insert({
        id,
        role: userData.role,
        full_name: userData.fullName,
        email: normalizedEmail,
        phone: userData.phone || null,
        qualification: userData.qualification || null,
        interests: userData.interests || [],
        address: userData.address || null,
        preferred_city: userData.preferredCity || null,
        created_at: new Date().toISOString(),
        last_login_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('[User DB] Error creating user:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log(`[User Created DB] User: ${normalizedEmail} (ID: ${id})`);
    return mapDbUserToUser(data);
  } catch (error: any) {
    console.error('[User Create Error]', error.message);
    throw error;
  }
}

export async function recordLoginDb(email: string): Promise<RegisteredUser | null> {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('registered_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', normalizedEmail)
      .select()
      .single();

    if (error || !data) {
      console.log(`[User DB] No user found for login: ${normalizedEmail}`);
      return null;
    }

    console.log(`[User Login DB] User logged in: ${normalizedEmail}`);
    return mapDbUserToUser(data);
  } catch (error: any) {
    console.error('[User Login Error]', error.message);
    return null;
  }
}

export async function listUsersDb(): Promise<RegisteredUser[]> {
  try {
    const { data, error } = await supabase
      .from('registered_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDbUserToUser);
  } catch (error: any) {
    console.error('[User List Error]', error.message);
    return [];
  }
}

function mapDbUserToUser(dbUser: any): RegisteredUser {
  return {
    id: dbUser.id,
    role: dbUser.role,
    fullName: dbUser.full_name,
    email: dbUser.email,
    phone: dbUser.phone,
    qualification: dbUser.qualification,
    interests: dbUser.interests || [],
    address: dbUser.address,
    preferredCity: dbUser.preferred_city,
    isApproved: dbUser.is_approved || false,
    createdAt: dbUser.created_at,
    lastLoginAt: dbUser.last_login_at
  };
}

export async function approveHospitalPartnerDb(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('registered_users')
      .update({ is_approved: true })
      .eq('id', userId)
      .eq('role', 'hospital');

    if (error) {
      console.error('[User Approve Error]', error.message);
      return false;
    }

    console.log(`[User Approved] Hospital partner approved: ${userId}`);
    return true;
  } catch (error: any) {
    console.error('[User Approve Error]', error.message);
    return false;
  }
}

export async function rejectHospitalPartnerDb(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('registered_users')
      .delete()
      .eq('id', userId)
      .eq('role', 'hospital');

    if (error) {
      console.error('[User Reject Error]', error.message);
      return false;
    }

    console.log(`[User Rejected] Hospital partner rejected: ${userId}`);
    return true;
  } catch (error: any) {
    console.error('[User Reject Error]', error.message);
    return false;
  }
}
