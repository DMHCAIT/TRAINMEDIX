// In-memory OTP store (per server instance) with expiry, used for email-based login/signup verification.
interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const otpStore = new Map<string, OtpRecord>();

const normalizeKey = (email: string) => email.trim().toLowerCase();

export function generateOtp(email: string): string {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const key = normalizeKey(email);
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0
  });
  console.log(`[OTP Generated] Email: ${key} | OTP: ${otp} | Expires in: 5 min`);
  return otp;
}

export function verifyOtp(email: string, submittedOtp: string): { success: boolean; error?: string } {
  const key = normalizeKey(email);
  const record = otpStore.get(key);
  const cleaned = submittedOtp.trim();

  if (!record) {
    console.log(`[OTP Store] No OTP record found for: ${key}`);
    return { success: false, error: 'No OTP request found for this email. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    console.log(`[OTP Store] OTP expired for: ${key}`);
    otpStore.delete(key);
    return { success: false, error: 'This OTP has expired. Please request a new code.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    console.log(`[OTP Store] Max attempts exceeded for: ${key}`);
    otpStore.delete(key);
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  console.log(`[OTP Compare] Email: ${key} | Stored: "${record.otp}" | Submitted: "${cleaned}" | Match: ${record.otp === cleaned}`);

  if (record.otp !== cleaned) {
    record.attempts += 1;
    console.log(`[OTP Mismatch] Attempt ${record.attempts}/${MAX_ATTEMPTS} for: ${key}`);
    return { success: false, error: 'Incorrect OTP. Please try again.' };
  }

  console.log(`[OTP Success] Email ${key} verified`);
  otpStore.delete(key);
  return { success: true };
}
