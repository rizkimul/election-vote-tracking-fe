import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  // Positive cases
  describe('positive cases', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes with clsx syntax', () => {
      const result = cn('base', { active: true, disabled: false });
      expect(result).toBe('base active');
    });

    it('should handle Tailwind class conflicts with twMerge', () => {
      // twMerge should resolve conflicting Tailwind classes
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4'); // Last one wins
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toBe('class1 class2');
    });
  });

  // Negative / Edge cases
  describe('negative / edge cases', () => {
    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
      const result = cn('valid', undefined, null, 'another');
      expect(result).toBe('valid another');
    });

    it('should handle falsy conditional classes', () => {
      const result = cn('base', false && 'hidden', null, undefined);
      expect(result).toBe('base');
    });
  });
});
