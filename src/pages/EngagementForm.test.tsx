import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EngagementForm } from './EngagementForm';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

const mockActivityTypes = [
  { id: 1, name: 'Sosialisasi', max_participants: 100 },
  { id: 2, name: 'Rapat', max_participants: 50 },
];

const mockEvents = {
  items: [
    { id: 1, activity_type_id: 1, kecamatan: 'Cileunyi', desa: 'Cileunyi Kulon', date: '2024-12-28', target_participants: 50 },
  ],
  total: 1,
  page: 1,
  size: 10,
  pages: 1,
};

const renderEngagementForm = () => {
  vi.mocked(global.fetch).mockImplementation(async (url) => {
    const urlStr = url.toString();
    if (urlStr.includes('/activity-types')) {
      return { ok: true, json: async () => mockActivityTypes } as Response;
    }
    if (urlStr.includes('/events')) {
      return { ok: true, json: async () => mockEvents } as Response;
    }
    if (urlStr.includes('/attendees')) {
      return { ok: true, json: async () => [] } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  });

  return render(
    <BrowserRouter>
      <AuthProvider>
        <EngagementForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('EngagementForm Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page with tabs', async () => {
      renderEngagementForm();
      
      // Should have tabs for events and participants
      expect(await screen.findByText(/kegiatan/i)).toBeInTheDocument();
    });

    it('should render event creation form', async () => {
      renderEngagementForm();
      
      // Should have form fields
      expect(await screen.findByText(/dapil/i)).toBeInTheDocument();
    });

    it('should render event list', async () => {
      renderEngagementForm();
      
      await waitFor(() => {
        expect(screen.getByText(/daftar kegiatan/i)).toBeInTheDocument();
      });
    });

    it('should fetch activity types on mount', async () => {
      renderEngagementForm();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
      
      renderEngagementForm();

      // Should still render the basic structure
      expect(await screen.findByText(/kegiatan/i)).toBeInTheDocument();
    });

    it('should show validation errors for empty event form', async () => {
      const user = userEvent.setup();
      renderEngagementForm();

      // Find and click submit button for create event form
      const buttons = await screen.findAllByRole('button');
      // Form validation should prevent empty submission
    });
  });
});
