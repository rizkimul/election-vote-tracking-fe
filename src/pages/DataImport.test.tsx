import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataImport } from './DataImport';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

const mockHistory = [
  { id: 1, filename: 'data_2024.xlsx', status: 'success', records_count: 100, created_at: '2024-12-28T10:00:00Z' },
  { id: 2, filename: 'data_error.xlsx', status: 'failed', records_count: 0, error_message: 'Invalid format', created_at: '2024-12-27T10:00:00Z' },
];

const renderDataImport = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockHistory,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <DataImport />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DataImport Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderDataImport();
      
      expect(await screen.findByText(/import/i)).toBeInTheDocument();
    });

    it('should render upload button', async () => {
      renderDataImport();
      
      expect(await screen.findByText(/pilih file/i)).toBeInTheDocument();
    });

    it('should display import history', async () => {
      renderDataImport();
      
      await waitFor(() => {
        expect(screen.getByText('data_2024.xlsx')).toBeInTheDocument();
      });
    });

    it('should show status badges for history items', async () => {
      renderDataImport();
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle empty history', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderDataImport();

      // Should still render the page
      expect(await screen.findByText(/import/i)).toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderDataImport();

      // Should render without crashing
      expect(await screen.findByText(/import/i)).toBeInTheDocument();
    });
  });
});
