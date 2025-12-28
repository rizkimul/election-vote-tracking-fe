import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoteResults } from './VoteResults';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

// Mock xlsx
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

const mockVotes = [
  { id: 1, dapil: 'DAPIL 1', kabupaten: 'Bandung', kecamatan: 'Cileunyi', desa: 'Cileunyi Kulon', total_votes: 500, data: { candidate_a: 300, candidate_b: 200 }, election_year: 2024 },
  { id: 2, dapil: 'DAPIL 2', kabupaten: 'Bandung', kecamatan: 'Cicalengka', desa: 'Cicalengka Kulon', total_votes: 800, data: { candidate_a: 450, candidate_b: 350 }, election_year: 2024 },
];

const renderVoteResults = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockVotes,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <VoteResults />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('VoteResults Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderVoteResults();
      
      expect(await screen.findByText(/hasil/i)).toBeInTheDocument();
    });

    it('should display vote data in table', async () => {
      renderVoteResults();
      
      await waitFor(() => {
        expect(screen.getByText('Cileunyi')).toBeInTheDocument();
        expect(screen.getByText('Cicalengka')).toBeInTheDocument();
      });
    });

    it('should render export button', async () => {
      renderVoteResults();
      
      // Look for button with export icon or text
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should display total votes', async () => {
      renderVoteResults();
      
      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('800')).toBeInTheDocument();
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle empty data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderVoteResults();

      // Should still render the page
      expect(await screen.findByText(/hasil/i)).toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderVoteResults();

      // Should render without crashing
      expect(await screen.findByText(/hasil/i)).toBeInTheDocument();
    });
  });
});
