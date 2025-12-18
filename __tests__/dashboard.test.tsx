import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DashboardStats } from '../src/components/dashboard/DashboardStats';
import { Act } from 'react';

// Mock Firebase
jest.mock('@/firebase/client', () => ({
    db: {}
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    // Mock onSnapshot to simulate data return
    onSnapshot: jest.fn((query, callback) => {
        // Simulate empty snapshot initially or immediate data
        const mockSnapshot = {
            docs: [
                {
                    data: () => ({
                        totalAmount: 100000,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        items: [{ name: 'Picanha', quantity: 1 }]
                    })
                }
            ]
        };
        callback(mockSnapshot);
        return () => { }; // unsubscribe function
    })
}));

// Mock Recharts to avoid canvas issues in JSDOM
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    BarChart: () => <div>BarChart</div>,
    Bar: () => null,
}));

describe('DashboardStats', () => {
    it('renders stats correctly', () => {
        render(<DashboardStats />);

        // Check for KPI Titles
        expect(screen.getByText('Ventas Hoy')).toBeInTheDocument();
        expect(screen.getByText('Pedidos Hoy')).toBeInTheDocument();

        // Check for calculated values based on mock
        // 100,000 COP formatted might look like $100.000 or $100,000 depending on locale mock
        // We check partial match
        expect(screen.getByText(/100\.000/)).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument(); // 1 order
    });
});
