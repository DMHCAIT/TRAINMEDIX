// In-memory registered-user directory (per server instance) used to gate signup/login
// and to surface registrations in the Admin Panel for this passwordless OTP-based auth flow.
export interface RegisteredUser {
  id: string;
  role: 'trainee' | 'hospital' | 'admin';
  fullName: string;
  email: string;
  phone?: string;
  qualification?: string;
  interests?: string[];
  address?: string;
  preferredCity?: string;
  createdAt: string;
  lastLoginAt?: string;
}

const usersByEmail = new Map<string, RegisteredUser>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findUserByEmail(email: string): RegisteredUser | undefined {
  return usersByEmail.get(normalizeEmail(email));
}

export function createUser(data: Omit<RegisteredUser, 'id' | 'createdAt'>): RegisteredUser {
  const key = normalizeEmail(data.email);
  const user: RegisteredUser = {
    ...data,
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  usersByEmail.set(key, user);
  return user;
}

export function recordLogin(email: string): RegisteredUser | undefined {
  const key = normalizeEmail(email);
  const user = usersByEmail.get(key);
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    usersByEmail.set(key, user);
  }
  return user;
}

export function listUsers(): RegisteredUser[] {
  return Array.from(usersByEmail.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
