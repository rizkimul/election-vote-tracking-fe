import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateNIKConfirmationDialog } from './DuplicateNIKConfirmationDialog';

describe('DuplicateNIKConfirmationDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const mockActivities = [
    { activity_name: 'Sosialisasi Desa', date: '2024-12-28', location: 'Cileunyi' },
    { activity_name: 'Rapat Koordinasi', date: '2024-12-27', location: 'Cicalengka' },
    { activity_name: 'Pelatihan', date: '2024-12-26', location: 'Baleendah' },
    { activity_name: 'Workshop', date: '2024-12-25', location: 'Majalaya' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Positive cases
  describe('positive cases', () => {
    it('should render when isOpen is true', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.getByText(/NIK Sudah Terdaftar/)).toBeInTheDocument();
    });

    it('should display the NIK', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.getByText('1234567890123456')).toBeInTheDocument();
    });

    it('should display activities list', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.getByText('Sosialisasi Desa')).toBeInTheDocument();
      expect(screen.getByText('Rapat Koordinasi')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tambahkan/i })).toBeInTheDocument();
    });

    it('should call onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      await user.click(screen.getByRole('button', { name: /batal/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup();
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      await user.click(screen.getByRole('button', { name: /tambahkan/i }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should show expand button for more than 3 activities', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.getByText(/\+1 lainnya/i)).toBeInTheDocument();
    });

    it('should expand to show all activities when clicked', async () => {
      const user = userEvent.setup();
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      await user.click(screen.getByText(/\+1 lainnya/i));
      
      // All 4 activities should be visible
      expect(screen.getByText('Workshop')).toBeInTheDocument();
    });
  });

  // Negative cases
  describe('negative cases', () => {
    it('should not render when isOpen is false', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities}
        />
      );

      expect(screen.queryByText(/nik sudah terdaftar/i)).not.toBeInTheDocument();
    });

    it('should handle empty activities array', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={[]}
        />
      );

      expect(screen.getByText(/NIK Sudah Terdaftar/)).toBeInTheDocument();
    });

    it('should not show expand button for 3 or fewer activities', () => {
      render(
        <DuplicateNIKConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          nik="1234567890123456"
          activities={mockActivities.slice(0, 2)}
        />
      );

      expect(screen.queryByText(/lainnya/i)).not.toBeInTheDocument();
    });
  });
});
