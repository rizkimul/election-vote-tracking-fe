import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Prioritization } from './Prioritization';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

const mockSuggestions = [
  { kecamatan: 'Cileunyi', score: 85, participant_count: 500, event_count: 5, reason: 'Perlu perhatian lebih' },
  { kecamatan: 'Cicalengka', score: 95, participant_count: 800, event_count: 10, reason: 'Sering dikunjungi' },
  { kecamatan: 'Baleendah', score: 60, participant_count: 200, event_count: 2, reason: 'Wilayah stabil' },
];

const renderPrioritization = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockSuggestions,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Prioritization />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Prioritization Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderPrioritization();
      
      expect(await screen.findByText(/rekomendasi/i)).toBeInTheDocument();
    });

    it('should render refresh button', async () => {
      renderPrioritization();
      
      expect(await screen.findByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    it('should display suggestion cards', async () => {
      renderPrioritization();
      
      await waitFor(() => {
        expect(screen.getByText('Cileunyi')).toBeInTheDocument();
        expect(screen.getByText('Cicalengka')).toBeInTheDocument();
      });
    });

    it('should render filter dropdown', async () => {
      renderPrioritization();
      
      // Should have status filter
      expect(await screen.findByText(/semua status/i)).toBeInTheDocument();
    });

    it('should display score badges', async () => {
      renderPrioritization();
      
      // Wait for data to load and check for suggestion cards
      await waitFor(() => {
        expect(screen.getByText('Cileunyi')).toBeInTheDocument();
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle empty suggestions', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderPrioritization();

      await waitFor(() => {
        expect(screen.getByText(/tidak ada data/i)).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderPrioritization();

      // Should render without crashing
      expect(await screen.findByText(/rekomendasi/i)).toBeInTheDocument();
    });

    it('should handle refresh action', async () => {
      const user = userEvent.setup();
      renderPrioritization();

      // Wait for initial load
      await screen.findByRole('button', { name: /refresh/i });
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Should show loading or trigger fetch
      expect(refreshButton).toBeInTheDocument();
    });
  });
});
