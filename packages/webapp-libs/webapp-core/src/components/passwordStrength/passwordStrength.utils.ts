/**
 * Password strength calculation utilities
 * Based on Django's password validators:
 * - MinimumLengthValidator (8 chars)
 * - CommonPasswordValidator
 * - NumericPasswordValidator
 * - UserAttributeSimilarityValidator (not checked client-side)
 */

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  notCommon: boolean;
  notNumericOnly: boolean;
}

// Common passwords list (subset of Django's common passwords)
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwerty123',
  'letmein',
  'welcome',
  'admin',
  'admin123',
  'login',
  'abc123',
  'monkey',
  'master',
  'dragon',
  'passw0rd',
  'hello',
  'shadow',
  'sunshine',
  'princess',
  'football',
  'baseball',
  'iloveyou',
  'trustno1',
  'superman',
  'batman',
  'whatever',
  'qazwsx',
  'michael',
  'jennifer',
  'hunter',
  'buster',
  'soccer',
  'harley',
  'charlie',
  'george',
  'killer',
  'maggie',
  'pepper',
  'summer',
  'starwars',
  'ashley',
  'jessica',
  'computer',
  'internet',
]);

export const validatePassword = (password: string): PasswordValidation => {
  const lowerPassword = password.toLowerCase();

  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
    notCommon: !COMMON_PASSWORDS.has(lowerPassword),
    notNumericOnly: !/^\d+$/.test(password),
  };
};

export const calculateStrength = (password: string): PasswordStrength => {
  if (!password || password.length === 0) {
    return 'weak';
  }

  const validation = validatePassword(password);

  // Must pass basic requirements
  if (!validation.minLength || !validation.notCommon || !validation.notNumericOnly) {
    return 'weak';
  }

  let score = 0;

  // Base score for meeting requirements
  if (validation.minLength) score += 1;
  if (validation.hasUppercase) score += 1;
  if (validation.hasLowercase) score += 1;
  if (validation.hasNumber) score += 1;
  if (validation.hasSpecialChar) score += 1;

  // Bonus for longer passwords
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 5) return 'good';
  return 'strong';
};

export const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'bg-destructive';
    case 'fair':
      return 'bg-amber-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-green-500';
  }
};

export const getStrengthPercentage = (strength: PasswordStrength): number => {
  switch (strength) {
    case 'weak':
      return 25;
    case 'fair':
      return 50;
    case 'good':
      return 75;
    case 'strong':
      return 100;
  }
};
