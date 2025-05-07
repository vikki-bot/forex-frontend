import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForexDashboard from '../Userpage/ForexDashboard';
import instance from '../../axios';

// Mock axios instance
jest.mock('../../axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ForexDashboard Component', () => {
  const mockForexData = {
    cardNumber: '1234567890123456',
    expiryDate: '2025-12',
    cvv: '123',
    balance: 1000,
    maxLimit: 5000,
    status: 'Active',
  };

  const mockUserData = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'jwt':
          return 'mock-token';
        case 'id':
          return '123';
        default:
          return null;
      }
    });
    instance.get.mockImplementation((url) => {
      if (url.includes('/card/')) {
        return Promise.resolve({ data: mockForexData });
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUserData });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  // 1. Initial Rendering Tests
  test('renders loading spinner initially', () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('renders welcome message with user name after loading', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      const welcomeText = screen.getByText('Welcome back,');
      const userName = screen.getAllByText('John Doe')[0]; // Get the first occurrence
      expect(welcomeText).toBeInTheDocument();
      expect(userName).toBeInTheDocument();
    });
  });

  test('renders market update alert', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Market Update:/)).toBeInTheDocument();
      expect(screen.getByText(/RBI has revised forex card limits/)).toBeInTheDocument();
    });
  });

  // 2. Card Details Display Tests
  test('displays masked card number by default', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/•••• •••• •••• 3456/)).toBeInTheDocument();
    });
  });

  // 3. Balance and Limits Tests
  test('displays formatted balance correctly', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('₹1,000.00')).toBeInTheDocument();
    });
  });

  test('displays formatted card limit correctly', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('₹5,000.00')).toBeInTheDocument();
    });
  });

  // 4. Card Status Tests
  test('displays active card status with correct badge color', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-success');
    });
  });

  // 5. Notification Tests
  test('shows notification badge with correct count', async () => {
    render(
      <BrowserRouter>
        <ForexDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toHaveClass('badge');
      expect(badge).toHaveClass('bg-danger');
    });
  });
}); 