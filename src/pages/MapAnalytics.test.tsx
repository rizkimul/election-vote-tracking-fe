import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapAnalytics } from './MapAnalytics';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = vi.fn();

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="circle-marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

const mockHeatmapData = [
  { kecamatan: 'CILEUNYI', intensity: 250 },
  { kecamatan: 'CICALENGKA', intensity: 150 },
  { kecamatan: 'BALEENDAH', intensity: 50 },
];

const renderMapAnalytics = () => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockHeatmapData,
  } as Response);

  return render(
    <BrowserRouter>
      <AuthProvider>
        <MapAnalytics />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('MapAnalytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render page title', async () => {
      renderMapAnalytics();
      
      expect(await screen.findByText(/peta/i)).toBeInTheDocument();
    });

    it('should render map container', async () => {
      renderMapAnalytics();
      
      expect(await screen.findByTestId('map-container')).toBeInTheDocument();
    });

    it('should render legend', async () => {
      renderMapAnalytics();
      
      expect(await screen.findByText(/legenda/i)).toBeInTheDocument();
    });

    it('should display legend categories', async () => {
      renderMapAnalytics();
      
      expect(await screen.findByText(/tinggi/i)).toBeInTheDocument();
      expect(await screen.findByText(/menengah/i)).toBeInTheDocument();
      expect(await screen.findByText(/rendah/i)).toBeInTheDocument();
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should handle empty heatmap data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderMapAnalytics();

      // Should still render the page
      expect(await screen.findByText(/peta/i)).toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      renderMapAnalytics();

      // Should render without crashing
      expect(await screen.findByText(/peta/i)).toBeInTheDocument();
    });
  });
});
