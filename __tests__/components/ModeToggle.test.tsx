import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from '@/components/ModeToggle';
import { ThemeProvider } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('ModeToggle', () => {
  it('renders the toggle button', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /cambiar tema/i });
    expect(button).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    );
    expect(screen.getByText('Cambiar tema')).toHaveClass('sr-only');
  });
});
