/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SalesBot } from '@/components/SalesBot';
import userEvent from '@testing-library/user-event';

// Mock dependencies
jest.mock('@/hooks/use-activity-tracker', () => ({
  useActivityTracker: () => ({
    logEvent: jest.fn(),
  }),
}));

jest.mock('@/components/cart-provider', () => ({
  useCart: () => ({
    order: [],
  }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe.skip('SalesBot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should not render initially', () => {
    render(<SalesBot />);
    expect(screen.queryByText('Asistente Virtual')).not.toBeInTheDocument();
  });

  test('should show return visitor message after 1 day', async () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    localStorage.setItem('bc_last_visit', yesterday.toString());

    render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(2100); // Wait for setTimeout
    });

    await waitFor(() => {
      expect(screen.getByText(/Qué bueno verte de nuevo/i)).toBeInTheDocument();
    });
  });

  test('should not show return visitor message if visited today', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    localStorage.setItem('bc_last_visit', twoHoursAgo.toString());

    render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText(/Qué bueno verte de nuevo/i)
    ).not.toBeInTheDocument();
  });

  test('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('bc_last_visit', 'invalid-data');

    expect(() => render(<SalesBot />)).not.toThrow();
  });

  test('should dismiss message when X button is clicked', async () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem('bc_last_visit', yesterday.toString());

    render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      expect(screen.getByText(/Qué bueno verte de nuevo/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);

    expect(
      screen.queryByText(/Qué bueno verte de nuevo/i)
    ).not.toBeInTheDocument();
  });

  test('should auto-dismiss after 10 seconds', async () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem('bc_last_visit', yesterday.toString());

    render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      expect(screen.getByText(/Qué bueno verte de nuevo/i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(10100);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Qué bueno verte de nuevo/i)
      ).not.toBeInTheDocument();
    });
  });

  test('should not show same message twice (anti-spam)', async () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem('bc_last_visit', yesterday.toString());

    const { rerender } = render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      expect(screen.getByText(/Qué bueno verte de nuevo/i)).toBeInTheDocument();
    });

    // Dismiss
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);

    // Rerender (simulating navigation or state change)
    rerender(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    // Message should not appear again
    expect(
      screen.queryByText(/Qué bueno verte de nuevo/i)
    ).not.toBeInTheDocument();
  });

  test('should expose global tracking methods', () => {
    render(<SalesBot />);

    expect((window as any).salesBotTrackCategory).toBeDefined();
    expect((window as any).salesBotTrackProduct).toBeDefined();
  });

  test('should update memory when tracking category', async () => {
    render(<SalesBot />);

    act(() => {
      (window as any).salesBotTrackCategory('Res');
      (window as any).salesBotTrackCategory('Res');
    });

    // After viewing 2 Res products, wait for evaluation
    act(() => {
      jest.advanceTimersByTime(16000); // 15s + buffer
    });

    await waitFor(() => {
      const categoryMessage = screen.queryByText(/Veo que te interesa Res/i);
      expect(categoryMessage).toBeInTheDocument();
    });
  });

  test('should sanitize localStorage timestamp', () => {
    // Malicious timestamp (future date)
    const futureDate = Date.now() + 365 * 24 * 60 * 60 * 1000;
    localStorage.setItem('bc_last_visit', futureDate.toString());

    render(<SalesBot />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should not show message for invalid (future) date
    expect(
      screen.queryByText(/Qué bueno verte de nuevo/i)
    ).not.toBeInTheDocument();
  });
});
