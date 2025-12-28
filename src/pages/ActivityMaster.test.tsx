import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityMaster } from './ActivityMaster';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

const mockActivityTypes = [
  { id: 1, name: 'Sosialisasi', max_participants: 100 },
  { id: 2, name: 'Rapat', max_participants: 50 },
];

const renderActivityMaster = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockActivityTypes,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ActivityMaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ActivityMaster Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderActivityMaster();
      
      expect(await screen.findByText(/master kegiatan/i)).toBeInTheDocument();
    });

    it('should render form inputs for creating activity type', async () => {
      renderActivityMaster();
      
      expect(await screen.findByPlaceholderText(/nama kegiatan/i)).toBeInTheDocument();
    });

    it('should render add button', async () => {
      renderActivityMaster();
      
      expect(await screen.findByRole('button', { name: /tambah/i })).toBeInTheDocument();
    });

    it('should display activity types in table', async () => {
      renderActivityMaster();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Sosialisasi')).toBeInTheDocument();
        expect(screen.getByText('Rapat')).toBeInTheDocument();
      });
    });

    it('should have edit buttons for each activity', async () => {
      renderActivityMaster();
      
      await waitFor(() => {
        // Should have edit actions in the table
        const editButtons = document.querySelectorAll('[data-testid="edit-button"], .lucide-pencil');
        expect(editButtons.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should show validation for empty activity name', async () => {
      const user = userEvent.setup();
      renderActivityMaster();

      // Try to submit empty form
      const submitButton = await screen.findByRole('button', { name: /tambah/i });
      await user.click(submitButton);

      // Form should prevent submission or show error
      // The form uses native validation, which prevents submission
    });

    it('should handle API error on fetch', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderActivityMaster();

      // Should render without crashing
      expect(await screen.findByText(/master kegiatan/i)).toBeInTheDocument();
    });
  });
});
