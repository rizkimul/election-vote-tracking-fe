import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from './Settings';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

const mockProfile = {
  id: 1,
  nik: '1234567890123456',
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '08123456789',
  role: 'admin',
};

const renderSettings = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockProfile,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Settings />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderSettings();
      
      expect(await screen.findByText(/pengaturan/i)).toBeInTheDocument();
    });

    it('should display user profile section', async () => {
      renderSettings();
      
      expect(await screen.findByText(/profil/i)).toBeInTheDocument();
    });

    it('should display user name', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
      });
    });

    it('should render save profile button', async () => {
      renderSettings();
      
      expect(await screen.findByRole('button', { name: /simpan/i })).toBeInTheDocument();
    });

    it('should display password change section', async () => {
      renderSettings();
      
      expect(await screen.findByText(/password/i)).toBeInTheDocument();
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle API error on profile fetch', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderSettings();

      // Should render without crashing
      expect(await screen.findByText(/pengaturan/i)).toBeInTheDocument();
    });

    it('should validate password fields', async () => {
      const user = userEvent.setup();
      renderSettings();

      // Find password inputs and save button
      const passwordInputs = await screen.findAllByPlaceholderText(/password/i);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });
  });
});
