import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock fetch globally
global.fetch = vi.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  describe('AuthProvider', () => {
    // Positive cases
    describe('positive cases', () => {
      it('should provide isAuthenticated as false initially when no token', () => {
        const TestComponent = () => {
          const { isAuthenticated } = useAuth();
          return <div data-testid="auth-status">{isAuthenticated ? 'true' : 'false'}</div>;
        };

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );

        expect(screen.getByTestId('auth-status')).toHaveTextContent('false');
      });

      it('should provide login and logout functions', () => {
        const TestComponent = () => {
          const { login, logout } = useAuth();
          return (
            <div>
              <span data-testid="login-type">{typeof login}</span>
              <span data-testid="logout-type">{typeof logout}</span>
            </div>
          );
        };

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );

        expect(screen.getByTestId('login-type')).toHaveTextContent('function');
        expect(screen.getByTestId('logout-type')).toHaveTextContent('function');
      });

      it('should provide user as null initially', () => {
        const TestComponent = () => {
          const { user } = useAuth();
          return <div data-testid="user-status">{user === null ? 'null' : 'exists'}</div>;
        };

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );

        expect(screen.getByTestId('user-status')).toHaveTextContent('null');
      });
    });
  });

  describe('useAuth hook', () => {
    // Negative cases
    describe('negative cases', () => {
      it('should throw error when used outside AuthProvider', () => {
        // Suppress console.error for this test since we expect an error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const TestComponent = () => {
          const auth = useAuth();
          return <div>{auth.isAuthenticated}</div>;
        };

        expect(() => {
          render(<TestComponent />);
        }).toThrow('useAuth must be used within an AuthProvider');

        consoleSpy.mockRestore();
      });
    });
  });
});
