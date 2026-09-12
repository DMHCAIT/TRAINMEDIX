import { supabase, supabaseAdmin } from './supabase';
import { userService } from './supabase-db';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'trainee' | 'hospital' | 'admin';
  profileImageUrl?: string;
  isVerified: boolean;
}

export const authService = {
  // Sign up new user
  async signup(credentials: {
    email: string;
    password: string;
    phone?: string;
    fullName: string;
    role: 'trainee' | 'hospital' | 'admin';
  }) {
    try {
      // Create auth user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile in database
      const userData = await userService.create({
        email: credentials.email,
        phone: credentials.phone,
        fullName: credentials.fullName,
        role: credentials.role,
      });

      // Link auth user to database user
      await supabase
        .from('users')
        .update({ id: authData.user.id })
        .eq('email', credentials.email);

      return {
        user: userData,
        session: authData.session,
      };
    } catch (error: any) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  },

  // Login user
  async login(credentials: {
    email: string;
    password: string;
  }) {
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      // Get user profile
      const userProfile = await userService.getByEmail(credentials.email);

      return {
        user: userProfile,
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  // Login with OTP (for trainees and hospitals)
  async loginWithOTP(phone: string) {
    try {
      // In Supabase, OTP is typically sent to phone via Twilio integration
      // For now, we'll use a custom OTP system
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Store OTP in a temporary table or cache
      // In production, send via SMS using Supabase functions + Twilio

      return {
        otp, // In production, this won't be returned
        sessionToken: `otp_${Date.now()}_${Math.random()}`,
      };
    } catch (error: any) {
      throw new Error(`OTP send failed: ${error.message}`);
    }
  },

  // Verify OTP
  async verifyOTP(phone: string, otp: string) {
    try {
      // Verify OTP (would check against stored OTP)
      const user = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (user.error) throw new Error('User not found');

      // Create session or JWT token
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .insert([
          {
            user_id: user.data.id,
            token: `token_${Date.now()}`,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      return {
        user: user.data,
        session: sessionData,
      };
    } catch (error: any) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  },

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) return null;

      const userProfile = await userService.getById(data.user.id);
      return userProfile;
    } catch (error) {
      return null;
    }
  },

  // Get session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;
      return data.session;
    } catch (error) {
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          profile_image_url: updates.profileImageUrl,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  },

  // Change password
  async changePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
      return { success: true, message: 'Password reset email sent' };
    } catch (error: any) {
      throw new Error(`Password reset request failed: ${error.message}`);
    }
  },

  // Admin: Create user without password (for admin panel)
  async adminCreateUser(userData: {
    email: string;
    fullName: string;
    phone?: string;
    role: 'trainee' | 'hospital' | 'admin';
  }) {
    try {
      const adminClient = supabaseAdmin();

      // Create auth user with temporary password
      const tempPassword = Math.random().toString(36).slice(-12);
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile
      const userProfile = await userService.create({
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        role: userData.role,
      });

      return {
        user: userProfile,
        tempPassword,
      };
    } catch (error: any) {
      throw new Error(`Admin user creation failed: ${error.message}`);
    }
  },

  // Admin: Delete user
  async adminDeleteUser(userId: string) {
    try {
      const adminClient = supabaseAdmin();

      // Delete from auth
      await adminClient.auth.admin.deleteUser(userId);

      // Delete from database (cascade will handle relations)
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  },

  // List all users (admin only)
  async adminListUsers(role?: string) {
    try {
      let query = supabase.from('users').select('*');

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`List users failed: ${error.message}`);
    }
  },
};
