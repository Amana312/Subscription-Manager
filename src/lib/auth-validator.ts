import { PasswordValidationResult } from './types';

/**
 * Validates password according to Brightloop & Feature 1 specifications:
 * 1. Must be MORE THAN 8 characters (> 8, i.e., at least 9 characters)
 * 2. Must contain an uppercase letter
 * 3. Must contain a lowercase letter
 * 4. Must contain a special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const moreThanEightChars = typeof password === 'string' && password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const errors: string[] = [];

  if (!moreThanEightChars) {
    errors.push('Password must be more than 8 characters long.');
  }
  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  }

  return {
    isValid: moreThanEightChars && hasUppercase && hasLowercase && hasSpecialChar,
    errors,
    rules: {
      moreThanEightChars,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
    },
  };
}

/**
 * Validates standard email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}
