import {
  calculateStrength,
  getStrengthColor,
  getStrengthPercentage,
  validatePassword,
} from '../passwordStrength.utils';

describe('passwordStrength.utils', () => {
  describe('validatePassword', () => {
    it('should return minLength true for 8+ characters', () => {
      expect(validatePassword('12345678').minLength).toBe(true);
      expect(validatePassword('1234567').minLength).toBe(false);
    });

    it('should detect common passwords', () => {
      expect(validatePassword('password').notCommon).toBe(false);
      expect(validatePassword('admin123').notCommon).toBe(false);
      expect(validatePassword('RandomP@ss1').notCommon).toBe(true);
    });

    it('should detect numeric-only passwords', () => {
      expect(validatePassword('12345678').notNumericOnly).toBe(false);
      expect(validatePassword('Pass1234').notNumericOnly).toBe(true);
    });

    it('should detect uppercase, lowercase, number, special char', () => {
      const result = validatePassword('Abc123!@#');
      expect(result.hasUppercase).toBe(true);
      expect(result.hasLowercase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
    });
  });

  describe('calculateStrength', () => {
    it('should return weak for empty password', () => {
      expect(calculateStrength('')).toBe('weak');
      expect(calculateStrength('   ')).toBe('weak');
    });

    it('should return weak for short passwords', () => {
      expect(calculateStrength('short')).toBe('weak');
    });

    it('should return weak for common passwords', () => {
      expect(calculateStrength('password123')).toBe('weak');
    });

    it('should return weak for numeric-only passwords', () => {
      expect(calculateStrength('12345678')).toBe('weak');
    });

    it('should return fair for basic valid passwords', () => {
      expect(calculateStrength('password123')).toBe('weak');
      expect(calculateStrength('Abcdefgh')).toBe('fair');
    });

    it('should return good for stronger passwords', () => {
      expect(calculateStrength('Abcdefgh1!')).toBe('good');
    });

    it('should return strong for passwords with all criteria and length', () => {
      expect(calculateStrength('Abcdefgh1!ab')).toBe('strong');
    });
  });

  describe('getStrengthColor', () => {
    it('should return correct colors for each strength', () => {
      expect(getStrengthColor('weak')).toBe('bg-destructive');
      expect(getStrengthColor('fair')).toBe('bg-amber-500');
      expect(getStrengthColor('good')).toBe('bg-blue-500');
      expect(getStrengthColor('strong')).toBe('bg-green-500');
    });
  });

  describe('getStrengthPercentage', () => {
    it('should return correct percentages for each strength', () => {
      expect(getStrengthPercentage('weak')).toBe(25);
      expect(getStrengthPercentage('fair')).toBe(50);
      expect(getStrengthPercentage('good')).toBe(75);
      expect(getStrengthPercentage('strong')).toBe(100);
    });
  });
});
