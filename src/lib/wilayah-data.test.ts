import { describe, it, expect } from 'vitest';
import { KECAMATAN_DATA, DAPIL_OPTIONS } from './wilayah-data';

describe('Wilayah Data', () => {
  describe('DAPIL_OPTIONS', () => {
    it('should be defined and be an array', () => {
      expect(DAPIL_OPTIONS).toBeDefined();
      expect(Array.isArray(DAPIL_OPTIONS)).toBe(true);
    });

    it('should contain expected DAPIL values', () => {
      expect(DAPIL_OPTIONS).toContain('DAPIL 1');
      expect(DAPIL_OPTIONS).toContain('DAPIL 6');
    });

    it('should have at least 6 DAPIL options', () => {
      expect(DAPIL_OPTIONS.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('KECAMATAN_DATA', () => {
    it('should be defined and be an array', () => {
      expect(KECAMATAN_DATA).toBeDefined();
      expect(Array.isArray(KECAMATAN_DATA)).toBe(true);
    });

    it('should contain multiple kecamatan entries', () => {
      expect(KECAMATAN_DATA.length).toBeGreaterThan(0);
    });

    it('each kecamatan should have required structure', () => {
      KECAMATAN_DATA.forEach(kecamatan => {
        expect(kecamatan).toHaveProperty('name');
        expect(kecamatan).toHaveProperty('dapil');
        expect(kecamatan).toHaveProperty('villages');
        expect(typeof kecamatan.name).toBe('string');
        expect(typeof kecamatan.dapil).toBe('string');
        expect(Array.isArray(kecamatan.villages)).toBe(true);
      });
    });

    it('each village should have name and type', () => {
      KECAMATAN_DATA.forEach(kecamatan => {
        kecamatan.villages.forEach(village => {
          expect(village).toHaveProperty('name');
          expect(village).toHaveProperty('type');
          expect(typeof village.name).toBe('string');
          expect(['Desa', 'Kelurahan']).toContain(village.type);
        });
      });
    });

    it('should contain known kecamatan like Cileunyi', () => {
      const cileunyi = KECAMATAN_DATA.find(k => k.name === 'CILEUNYI');
      expect(cileunyi).toBeDefined();
      expect(cileunyi?.villages.length).toBeGreaterThan(0);
    });

    it('should have dapil values from DAPIL_OPTIONS or DAPIL 7', () => {
      const validDapils = [...DAPIL_OPTIONS, 'DAPIL 7'];
      KECAMATAN_DATA.forEach(kecamatan => {
        expect(validDapils).toContain(kecamatan.dapil);
      });
    });
  });
});
