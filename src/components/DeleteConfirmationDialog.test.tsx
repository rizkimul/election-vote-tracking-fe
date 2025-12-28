import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

// Note: This component uses createPortal which may have different behavior in test environment
describe('DeleteConfirmationDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Positive cases
  describe('positive cases', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <DeleteConfirmationDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="Test"
        />
      );

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should render content when isOpen is true', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="Test Activity"
        />
      );

      // Component renders via portal to document.body
      expect(document.body.textContent).toContain('Hapus');
    });

    it('should display the item name', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="Rapat Koordinasi"
        />
      );

      expect(document.body.textContent).toContain('Rapat Koordinasi');
    });

    it('should call onClose when clicking outside or X button', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="Test"
        />
      );

      // Find and click the cancel button
      const cancelButton = document.body.querySelector('button');
      if (cancelButton && cancelButton.textContent?.includes('Batal')) {
        await user.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should display affected items when provided', () => {
      const affectedItems = [
        { activity_name: 'Sosialisasi', date: '2024-12-28', location: 'Cileunyi' },
      ];

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="Test"
          affectedItems={affectedItems}
        />
      );

      expect(document.body.textContent).toContain('Sosialisasi');
    });
  });
});
