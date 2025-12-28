import { describe, it, expect } from 'vitest';
import { loginSchema, attendeeSchema, eventSchema } from './validation-schemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    // Positive cases
    describe('positive cases', () => {
      it('should validate correct credentials', () => {
        const validData = { username: 'admin', password: 'password123' };
        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate credentials with special characters', () => {
        const validData = { username: 'admin@example.com', password: 'p@ss!word#123' };
        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    // Negative cases
    describe('negative cases', () => {
      it('should reject empty username', () => {
        const invalidData = { username: '', password: 'password123' };
        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('username'))).toBe(true);
        }
      });

      it('should reject empty password', () => {
        const invalidData = { username: 'admin', password: '' };
        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('password'))).toBe(true);
        }
      });

      it('should reject missing fields', () => {
        const invalidData = {};
        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('attendeeSchema', () => {
    // Positive cases
    describe('positive cases', () => {
      it('should validate valid attendee with required fields', () => {
        const validData = {
          name: 'John Doe',
          nik: '1234567890123456',
        };
        const result = attendeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate attendee with all optional fields', () => {
        const validData = {
          name: 'John Doe',
          nik: '1234567890123456',
          identifier_type: 'NIK' as const,
          kecamatan: 'Cileunyi',
          desa: 'Cileunyi Kulon',
          alamat: 'Jl. Raya No. 123',
          jenis_kelamin: 'L' as const,
          pekerjaan: 'Guru',
          usia: 35,
        };
        const result = attendeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept NIS as identifier_type', () => {
        const validData = {
          name: 'Student',
          nik: '12345',
          identifier_type: 'NIS' as const,
        };
        const result = attendeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    // Negative cases
    describe('negative cases', () => {
      it('should reject name with less than 2 characters', () => {
        const invalidData = { name: 'A', nik: '1234567890123456' };
        const result = attendeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('name'))).toBe(true);
        }
      });

      it('should reject empty NIK', () => {
        const invalidData = { name: 'John Doe', nik: '' };
        const result = attendeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid jenis_kelamin', () => {
        const invalidData = {
          name: 'John',
          nik: '1234567890123456',
          jenis_kelamin: 'X', // Invalid
        };
        const result = attendeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject usia out of range', () => {
        const invalidData = {
          name: 'John',
          nik: '1234567890123456',
          usia: 200, // > 150
        };
        const result = attendeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('eventSchema', () => {
    const validEventBase = {
      title: 'Rapat Koordinasi Desa',
      date: '2024-12-28',
      location_kecamatan: 'Cileunyi',
      location_kelurahan: 'Cileunyi Kulon',
      description: 'Rapat koordinasi untuk membahas program kerja tahun depan',
    };

    // Positive cases
    describe('positive cases', () => {
      it('should validate valid event', () => {
        const result = eventSchema.safeParse(validEventBase);
        expect(result.success).toBe(true);
      });

      it('should validate event with attendees', () => {
        const eventWithAttendees = {
          ...validEventBase,
          attendees: [
            { name: 'John Doe', nik: '1234567890123456' },
            { name: 'Jane Doe', nik: '6543210987654321' },
          ],
        };
        const result = eventSchema.safeParse(eventWithAttendees);
        expect(result.success).toBe(true);
      });
    });

    // Negative cases
    describe('negative cases', () => {
      it('should reject title less than 5 characters', () => {
        const invalidData = { ...validEventBase, title: 'Hi' };
        const result = eventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path.includes('title'))).toBe(true);
        }
      });

      it('should reject invalid date format', () => {
        const invalidData = { ...validEventBase, date: 'not-a-date' };
        const result = eventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty location_kecamatan', () => {
        const invalidData = { ...validEventBase, location_kecamatan: '' };
        const result = eventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty location_kelurahan', () => {
        const invalidData = { ...validEventBase, location_kelurahan: '' };
        const result = eventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject description less than 10 characters', () => {
        const invalidData = { ...validEventBase, description: 'Short' };
        const result = eventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
