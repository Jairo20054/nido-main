import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostOnboardingModal from '../components/host/HostOnboardingModal';

// Mock the hooks and utilities
jest.mock('../components/host/authMock', () => ({
  useIsAuthenticated: jest.fn(),
  useLogin: jest.fn()
}));

jest.mock('../utils/localDraft', () => ({
  saveDraft: jest.fn(),
  loadDraft: jest.fn(),
  clearDraft: jest.fn()
}));

// Mock the questionsMap
jest.mock('../components/host/questionsMap', () => ({
  questionsMap: {
    rentals: [
      {
        id: 'propertyType',
        type: 'select',
        label: 'Tipo de propiedad',
        required: true,
        options: [
          { value: 'apartment', label: 'Apartamento' },
          { value: 'house', label: 'Casa' }
        ]
      }
    ]
  }
}));

const mockUseIsAuthenticated = require('../components/host/authMock').useIsAuthenticated;
const mockUseLogin = require('../components/host/authMock').useLogin;
const mockSaveDraft = require('../utils/localDraft').saveDraft;
const mockLoadDraft = require('../utils/localDraft').loadDraft;
const mockClearDraft = require('../utils/localDraft').clearDraft;

describe('HostOnboardingModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseLogin.mockReturnValue({
      loginUser: jest.fn(),
      loading: false,
      error: null
    });
    mockLoadDraft.mockReturnValue(null);
  });

  test('renders modal when open prop is true', () => {
    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Qué te gustaría compartir?')).toBeInTheDocument();
  });

  test('does not render modal when open prop is false', () => {
    render(
      <HostOnboardingModal
        open={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('closes modal when close button is clicked', () => {
    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const closeButton = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('closes modal when overlay is clicked', () => {
    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const overlay = document.querySelector('.host-onboarding-modal-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows auth step when unauthenticated user selects a card', () => {
    mockUseIsAuthenticated.mockReturnValue(false);

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
    expect(screen.getByText('Necesitamos tu cuenta para gestionar y publicar tu servicio')).toBeInTheDocument();
  });

  test('shows questions step when authenticated user selects a card', () => {
    mockUseIsAuthenticated.mockReturnValue(true);

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    expect(screen.getByText('Configura tu arrendamiento')).toBeInTheDocument();
  });

  test('handles login form submission', async () => {
    const mockLoginUser = jest.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' } });
    mockUseLogin.mockReturnValue({
      loginUser: mockLoginUser,
      loading: false,
      error: null
    });

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Select card to trigger auth step
    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    // Fill login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Should proceed to questions after successful login
    await waitFor(() => {
      expect(screen.getByText('Configura tu arrendamiento')).toBeInTheDocument();
    });
  });

  test('shows login error on failed authentication', async () => {
    const mockLoginUser = jest.fn().mockRejectedValue('Credenciales inválidas');
    mockUseLogin.mockReturnValue({
      loginUser: mockLoginUser,
      loading: false,
      error: null
    });

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Select card to trigger auth step
    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    // Fill and submit login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  test('completes onboarding when form is submitted', async () => {
    mockUseIsAuthenticated.mockReturnValue(true);

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Select card
    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    // Fill and submit form
    const selectInput = screen.getByRole('combobox');
    fireEvent.change(selectInput, { target: { value: 'apartment' } });

    const submitButton = screen.getByRole('button', { name: 'Enviar información' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        selectionId: 'rentals',
        answers: { propertyType: 'apartment' }
      });
      expect(mockClearDraft).toHaveBeenCalledWith('rentals');
    });
  });

  test('loads and saves draft automatically', async () => {
    jest.useFakeTimers();
    mockUseIsAuthenticated.mockReturnValue(true);
    mockLoadDraft.mockReturnValue({ propertyType: 'house' });

    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Select card - should load draft
    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    await waitFor(() => {
      expect(mockLoadDraft).toHaveBeenCalledWith('rentals');
    });

    // Change answer - should trigger save
    const selectInput = screen.getByRole('combobox');
    fireEvent.change(selectInput, { target: { value: 'apartment' } });

    // Advance timers to trigger autosave
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSaveDraft).toHaveBeenCalledWith('rentals', { propertyType: 'apartment' });
    jest.useRealTimers();
  });

  test('handles back navigation correctly', () => {
    render(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Select card to go to auth step
    const rentalsCard = screen.getByText('Arrendamiento');
    fireEvent.click(rentalsCard);

    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();

    // Click back button
    const backButton = screen.getByLabelText('Volver');
    fireEvent.click(backButton);

    expect(screen.getByText('¿Qué te gustaría compartir?')).toBeInTheDocument();
  });

  test('focuses modal on open and returns focus on close', () => {
    const { rerender } = render(
      <HostOnboardingModal
        open={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Create a button to focus initially
    const initialButton = document.createElement('button');
    document.body.appendChild(initialButton);
    initialButton.focus();

    // Open modal
    rerender(
      <HostOnboardingModal
        open={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(document.activeElement).toBe(screen.getByRole('dialog'));

    // Close modal
    const closeButton = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeButton);

    expect(document.activeElement).toBe(initialButton);

    // Cleanup
    document.body.removeChild(initialButton);
  });
});
