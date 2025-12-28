import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

// Wrapper component providing necessary context
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render login form with username and password fields', () => {
      renderLogin();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderLogin();

      expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
    });

    it('should render SABADESA branding', () => {
      renderLogin();

      expect(screen.getByText('SABADESA')).toBeInTheDocument();
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle password/i });
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should allow typing in input fields', async () => {
      const user = userEvent.setup();
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword');

      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpassword');
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should show validation error for empty username on submit', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'somepassword');

      const submitButton = screen.getByRole('button', { name: /masuk/i });
      await user.click(submitButton);

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/username wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password on submit', async () => {
      const user = userEvent.setup();
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'testuser');

      const submitButton = screen.getByRole('button', { name: /masuk/i });
      await user.click(submitButton);

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/password wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('should show both validation errors when submitting empty form', async () => {
      const user = userEvent.setup();
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /masuk/i });
      await user.click(submitButton);

      // Wait for validation errors to appear
      await waitFor(() => {
        expect(screen.getByText(/username wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/password wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      
      // Mock a slow response
      vi.mocked(global.fetch).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(new Response(JSON.stringify({ access_token: 'token', refresh_token: 'refresh' }), { status: 200 })), 100))
      );

      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword');

      const submitButton = screen.getByRole('button', { name: /masuk/i });
      await user.click(submitButton);

      // Check for loading state
      expect(await screen.findByText(/memproses/i)).toBeInTheDocument();
    });
  });
});
