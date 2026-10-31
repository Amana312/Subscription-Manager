export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  resetToken?: string;
  resetTokenExpiry?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  rules: {
    moreThanEightChars: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecialChar: boolean;
  };
}
