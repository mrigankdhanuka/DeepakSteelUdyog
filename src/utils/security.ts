
import DOMPurify from 'dompurify';

// --- Hashing (Mock) ---
export const hashPassword = async (password: string): Promise<string> => {
  // Simple mock hash for frontend demo
  // In production, this should be handled by the backend or use bcryptjs
  return btoa(password + "_hashed_salt");
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return btoa(password + "_hashed_salt") === hash;
};

// --- Sanitization ---
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validatePasswordStrength = (password: string): boolean => {
  // Min 8 chars, at least 1 number/special char
  return password.length >= 8 && /[\d!@#$%^&*]/.test(password);
};

// --- Rate Limiting ---
const loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};
const LOGIN_BLOCK_TIME = 60 * 1000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 5;

export const checkLoginRateLimit = (email: string): { allowed: boolean, waitTime?: number } => {
  const now = Date.now();
  const record = loginAttempts[email];

  if (!record) return { allowed: true };

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    const timeSinceLast = now - record.lastAttempt;
    if (timeSinceLast < LOGIN_BLOCK_TIME) {
      return { allowed: false, waitTime: Math.ceil((LOGIN_BLOCK_TIME - timeSinceLast) / 1000) };
    } else {
      // Reset after block time expires
      delete loginAttempts[email];
      return { allowed: true };
    }
  }

  return { allowed: true };
};

export const recordLoginAttempt = (email: string, success: boolean) => {
  if (success) {
    delete loginAttempts[email];
  } else {
    const now = Date.now();
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
    } else {
      loginAttempts[email].count++;
      loginAttempts[email].lastAttempt = now;
    }
  }
};

// Checkout Rate Limit
let lastOrderTime = 0;
const ORDER_COOLDOWN = 5000; // 5 seconds

export const checkCheckoutRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastOrderTime < ORDER_COOLDOWN) {
    return false;
  }
  lastOrderTime = now;
  return true;
};
