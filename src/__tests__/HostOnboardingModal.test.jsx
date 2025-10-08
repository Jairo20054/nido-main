import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostOnboardingModal from '../components/Host/HostOnboardingModal';
import { login } from '../components/Host/authMock';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock focus-trap-react
jest.mock('focus-trap-react', () => ({ children }) => <div>{children}</div>);

describe('HostOnboardingModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('opens modal, selects card, and checks selection state', () => {
    render(
      <HostOnboardingModal open={true} onClose={mockOnClose} onComplete={mockOnComplete} />
    );

    // Check modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Qué te gustaría compartir?')).toBeInTheDocument();

    // Check cards are present
    expect(screen.getByText('Arrendamiento')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Productos y servicios adicionales')).toBeInTheDocument();

    // Select a card
    const rentalsCard = screen.getByText('Arrendamiento').closest('div');
    fireEvent.click(rentalsCard);

    // Check selection state (assuming selected class is applied)
    expect(rentalsCard).toHaveClass('selected');
  });

  test('simulates non-auth, triggers login, completes questions, and verifies onComplete call', async () => {
    // Mock non-authenticated state
    const originalIsAuthenticated = require('../components/Host/authMock').isAuthenticated;
    require('../components/Host/authMock').isAuthenticated = jest.fn(() => false);

    render(
      <HostOnboardingModal open={true} onClose={mockOnClose} onComplete={mockOnComplete} />
    );

    // Select rentals
    const rentalsCard = screen.getByText('Arrendamiento').closest('div');
    fireEvent.click(rentalsCard);

    // Should show login form
    expect(screen.getByText('Necesitamos tu cuenta para gestionar y publicar tu servicio')).toBeInTheDocument();

    // Fill login form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });

    // Submit login
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Wait for login to resolve
    await waitFor(() => {
      expect(screen.getByText('Completa la información para Arrendamiento')).toBeInTheDocument();
    });

    // Fill a required field (e.g., propertyType)
    const select = screen.getByDisplayValue(''); // Assuming first select is empty
    fireEvent.change(select, { target: { value: 'apartment' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    // Check onComplete called with correct data
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        selectionId: 'rentals',
        answers: expect.objectContaining({ propertyType: 'apartment' })
      });
    });

    // Restore original
    require('../components/Host/authMock').isAuthenticated = originalIsAuthenticated;
  });
});
