import { supabase } from './supabaseClient';

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ATTEMPTS = 5;

export async function generateOtpDb(email: string, purpose: 'signup' | 'login'): Promise<string> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

    // Upsert: Delete existing OTP if any, then insert new one
    await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);

    const { data, error } = await supabase
      .from('otp_verifications')
      .insert({
        email: normalizedEmail,
        otp_code: otp,
        purpose,
        attempts: 0,
        max_attempts: MAX_ATTEMPTS,
        expires_at: expiresAt
      });

    if (error) {
      console.error('[OTP DB Error] Failed to store OTP:', error.message);
      throw new Error(`Failed to store OTP: ${error.message}`);
    }

    console.log(`[OTP Generated DB] Email: ${normalizedEmail} | OTP: ${otp} | Purpose: ${purpose} | Expires in: 2 min`);
    return otp;
  } catch (error: any) {
    console.error('[OTP Generate Error]', error.message);
    throw error;
  }
}

export async function verifyOtpDb(email: string, submittedOtp: string, purpose: 'signup' | 'login'): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const cleaned = submittedOtp.trim();

    // Fetch OTP record
    const { data: records, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('purpose', purpose)
      .single();

    if (fetchError || !records) {
      console.log(`[OTP Verify DB] No OTP record found for: ${normalizedEmail} (purpose: ${purpose})`);
      return { success: false, error: 'No OTP request found for this email. Please request a new code.' };
    }

    // Check expiry
    if (new Date(records.expires_at) < new Date()) {
      console.log(`[OTP Verify DB] OTP expired for: ${normalizedEmail}`);
      await supabase.from('otp_verifications').delete().eq('id', records.id);
      return { success: false, error: 'This OTP has expired. Please request a new code.' };
    }

    // Check max attempts
    if (records.attempts >= records.max_attempts) {
      console.log(`[OTP Verify DB] Max attempts exceeded for: ${normalizedEmail}`);
      await supabase.from('otp_verifications').delete().eq('id', records.id);
      return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }

    console.log(`[OTP Compare DB] Email: ${normalizedEmail} | Stored: "${records.otp_code}" | Submitted: "${cleaned}" | Match: ${records.otp_code === cleaned}`);

    // Verify OTP
    if (records.otp_code !== cleaned) {
      // Increment attempts
      await supabase
        .from('otp_verifications')
        .update({ attempts: records.attempts + 1 })
        .eq('id', records.id);

      console.log(`[OTP Mismatch DB] Attempt ${records.attempts + 1}/${records.max_attempts} for: ${normalizedEmail}`);
      return { success: false, error: 'Incorrect OTP. Please try again.' };
    }

    // OTP verified - delete it
    console.log(`[OTP Success DB] Email ${normalizedEmail} verified (purpose: ${purpose})`);
    await supabase.from('otp_verifications').delete().eq('id', records.id);
    return { success: true };
  } catch (error: any) {
    console.error('[OTP Verify Error]', error.message);
    throw error;
  }
}

export async function cleanupExpiredOtps(): Promise<void> {
  try {
    const { error } = await supabase
      .from('otp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[OTP Cleanup Error]', error.message);
    } else {
      console.log('[OTP Cleanup] Expired OTPs removed from database');
    }
  } catch (error: any) {
    console.error('[OTP Cleanup Error]', error.message);
  }
}
