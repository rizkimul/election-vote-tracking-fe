import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { Users, TrendingUp, Calendar } from 'lucide-react';

describe('StatCard Component', () => {
  // Positive cases
  describe('positive cases', () => {
    it('should render title, value, and icon', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          icon={Users}
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(
        <StatCard
          title="Revenue"
          value="Rp 1.000.000"
          icon={TrendingUp}
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <StatCard
          title="Events"
          value={50}
          icon={Calendar}
          description="Total kegiatan bulan ini"
        />
      );

      expect(screen.getByText('Total kegiatan bulan ini')).toBeInTheDocument();
    });

    it('should render upward trend indicator', () => {
      render(
        <StatCard
          title="Growth"
          value={100}
          icon={TrendingUp}
          trend={{
            value: 15,
            label: 'dari bulan lalu',
            direction: 'up',
          }}
        />
      );

      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('dari bulan lalu')).toBeInTheDocument();
    });

    it('should render downward trend indicator', () => {
      render(
        <StatCard
          title="Decrease"
          value={50}
          icon={TrendingUp}
          trend={{
            value: 10,
            label: 'from previous',
            direction: 'down',
          }}
        />
      );

      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('should render neutral trend indicator', () => {
      render(
        <StatCard
          title="Stable"
          value={75}
          icon={TrendingUp}
          trend={{
            value: 0,
            label: 'no change',
            direction: 'neutral',
          }}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('no change')).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should render without optional trend prop', () => {
      render(
        <StatCard
          title="Simple Stat"
          value={42}
          icon={Users}
        />
      );

      expect(screen.getByText('Simple Stat')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      // Trend elements should not be present
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });

    it('should render without description', () => {
      render(
        <StatCard
          title="No Description"
          value={100}
          icon={Calendar}
        />
      );

      expect(screen.getByText('No Description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatCard
          title="Custom"
          value={0}
          icon={Users}
          className="custom-class"
        />
      );

      // The card should have the custom class
      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });
});
