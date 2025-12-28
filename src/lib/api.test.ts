import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiUrl, getApiHeaders, API_BASE_URL } from './api';

describe('API utilities', () => {
  describe('getApiUrl', () => {
    // Positive cases
    describe('positive cases', () => {
      it('should return /api prefixed URL when VITE_API_URL is not set', () => {
        // API_BASE_URL defaults to empty string when env var not set
        const result = getApiUrl('/auth/login');
        // When API_BASE_URL is empty, it should prefix with /api
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL}/auth/login`);
        } else {
          expect(result).toBe('/api/auth/login');
        }
      });

      it('should construct correct URL for different endpoints', () => {
        const endpoints = ['/events', '/users', '/auth/me'];
        endpoints.forEach(endpoint => {
          const result = getApiUrl(endpoint);
          expect(result).toContain(endpoint);
        });
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('should handle empty endpoint', () => {
        const result = getApiUrl('');
        expect(typeof result).toBe('string');
      });

      it('should handle endpoint without leading slash', () => {
        const result = getApiUrl('auth/login');
        expect(result).toContain('auth/login');
      });
    });
  });

  describe('getApiHeaders', () => {
    // Positive cases
    describe('positive cases', () => {
      it('should include ngrok-skip-browser-warning header', () => {
        const headers = getApiHeaders();
        expect(headers['ngrok-skip-browser-warning']).toBe('true');
      });

      it('should merge additional headers', () => {
        const headers = getApiHeaders({ 'Content-Type': 'application/json' });
        expect(headers['ngrok-skip-browser-warning']).toBe('true');
        expect(headers['Content-Type']).toBe('application/json');
      });

      it('should allow overriding with custom headers', () => {
        const headers = getApiHeaders({ 
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value'
        });
        expect(headers['Authorization']).toBe('Bearer token123');
        expect(headers['X-Custom-Header']).toBe('value');
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('should handle empty additional headers object', () => {
        const headers = getApiHeaders({});
        expect(headers['ngrok-skip-browser-warning']).toBe('true');
        expect(Object.keys(headers).length).toBe(1);
      });
    });
  });
});
