import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportData } from './ExportData';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

// Mock jspdf and xlsx
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    save: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

const mockAttendees = [
  { id: 1, nik: '1234567890123456', name: 'John Doe', kecamatan: 'Cileunyi', desa: 'Cileunyi Kulon', alamat: 'Jl. Raya', jenis_kelamin: 'L', pekerjaan: 'Guru', usia: 35 },
  { id: 2, nik: '6543210987654321', name: 'Jane Doe', kecamatan: 'Cileunyi', desa: 'Cileunyi Wetan', alamat: 'Jl. Mawar', jenis_kelamin: 'P', pekerjaan: 'Dokter', usia: 30 },
];

const renderExportData = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockAttendees,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ExportData />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ExportData Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderExportData();
      
      expect(await screen.findByText(/export/i)).toBeInTheDocument();
    });

    it('should render filter dropdowns', async () => {
      renderExportData();
      
      // Should have dapil and kecamatan filters
      expect(await screen.findByText(/dapil/i)).toBeInTheDocument();
    });

    it('should render export button', async () => {
      renderExportData();
      
      // Should have export button or dropdown
      expect(await screen.findByText(/export/i)).toBeInTheDocument();
    });

    it('should display attendees in table', async () => {
      renderExportData();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should display NIK column', async () => {
      renderExportData();
      
      await waitFor(() => {
        expect(screen.getByText(/nik/i)).toBeInTheDocument();
      });
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle empty data state', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderExportData();

      // Should still render the page
      expect(await screen.findByText(/export/i)).toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderExportData();

      // Should render without crashing
      expect(await screen.findByText(/export/i)).toBeInTheDocument();
    });
  });
});
