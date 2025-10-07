import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntelligentSearchPanel from './SearchHub';

// Mock lodash.debounce
jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

// Mock AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  abort: jest.fn(),
  signal: { aborted: false }
}));

// Mock fetchSearchResults
jest.mock('./SearchHub', () => {
  const originalModule = jest.requireActual('./SearchHub');
  return {
    ...originalModule,
    fetchSearchResults: jest.fn()
  };
});

const mockOnClose = jest.fn();

describe('IntelligentSearchPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful search
    const { fetchSearchResults } = require('./SearchHub');
    fetchSearchResults.mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Test Property',
          location: 'Test Location',
          price_per_night: 100,
          rating: 4.5,
          badges: ['Test'],
          image_url: 'test.jpg',
          rooms: 2,
          guests: 4,
          amenities: ['wifi'],
          description: 'Test description'
        }
      ],
      total: 1,
      page: 1,
      pageSize: 12
    });
  });

  it('renders the search panel correctly', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);

    expect(screen.getByText('Búsqueda Inteligente')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('focuses the input on mount', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');
    expect(input).toHaveFocus();
  });

  it('updates query and triggers search on input change', async () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    fireEvent.change(input, { target: { value: 'Bogotá' } });

    await waitFor(() => {
      const { fetchSearchResults } = require('./SearchHub');
      expect(fetchSearchResults).toHaveBeenCalledWith(
        expect.objectContaining({ location: 'Bogotá' }),
        expect.any(Object),
        1
      );
    });
  });

  it('shows autocomplete suggestions when typing', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    fireEvent.change(input, { target: { value: 'Bo' } });

    expect(screen.getByText('Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Barranquilla')).toBeInTheDocument();
  });

  it('selects suggestion and updates query', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    fireEvent.change(input, { target: { value: 'Bo' } });
    fireEvent.click(screen.getByText('Bogotá'));

    expect(input.value).toBe('Bogotá');
  });

  it('updates filters on input change', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const minPriceInput = screen.getByPlaceholderText('Precio mínimo');

    fireEvent.change(minPriceInput, { target: { value: '50' } });

    expect(minPriceInput.value).toBe('50');
  });

  it('toggles amenities correctly', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const wifiCheckbox = screen.getByLabelText('WiFi');

    fireEvent.click(wifiCheckbox);
    expect(wifiCheckbox).toBeChecked();

    fireEvent.click(wifiCheckbox);
    expect(wifiCheckbox).not.toBeChecked();
  });

  it('selects property type', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const casaButton = screen.getByText('Casa');

    fireEvent.click(casaButton);
    expect(casaButton).toHaveClass('active');

    fireEvent.click(casaButton);
    expect(casaButton).not.toHaveClass('active');
  });

  it('clears all filters', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const clearButton = screen.getByText('Limpiar filtros');
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    // Set some filters
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByLabelText('WiFi'));

    // Clear
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(screen.getByLabelText('WiFi')).not.toBeChecked();
  });

  it('displays search results', async () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const searchButton = screen.getByText('Buscar');

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
      expect(screen.getByText('$100/noche')).toBeInTheDocument();
    });
  });

  it('shows loading state during search', async () => {
    const { fetchSearchResults } = require('./SearchHub');
    fetchSearchResults.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const searchButton = screen.getByText('Buscar');

    fireEvent.click(searchButton);

    expect(screen.getByText('Cargando resultados...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando resultados...')).not.toBeInTheDocument();
    });
  });

  it('displays error message on search failure', async () => {
    const { fetchSearchResults } = require('./SearchHub');
    fetchSearchResults.mockRejectedValue(new Error('Search failed'));

    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const searchButton = screen.getByText('Buscar');

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar resultados. Intenta nuevamente.')).toBeInTheDocument();
    });
  });

  it('loads more results', async () => {
    const { fetchSearchResults } = require('./SearchHub');
    fetchSearchResults.mockResolvedValueOnce({
      results: [{ id: 1, title: 'Property 1', location: 'Loc 1', price_per_night: 100, rating: 4.5, badges: [], image_url: '', rooms: 1, guests: 2, amenities: [], description: '' }],
      total: 25,
      page: 1,
      pageSize: 12
    }).mockResolvedValueOnce({
      results: [{ id: 2, title: 'Property 2', location: 'Loc 2', price_per_night: 150, rating: 4.0, badges: [], image_url: '', rooms: 1, guests: 2, amenities: [], description: '' }],
      total: 25,
      page: 2,
      pageSize: 12
    });

    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const searchButton = screen.getByText('Buscar');

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByText('Cargar más');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Property 2')).toBeInTheDocument();
    });
  });

  it('closes panel on escape key', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes panel on close button click', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const closeButton = screen.getByLabelText('Cerrar panel');

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('sorts results correctly', async () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const sortSelect = screen.getByLabelText('Ordenar por:');

    fireEvent.change(sortSelect, { target: { value: 'price_low' } });

    await waitFor(() => {
      const { fetchSearchResults } = require('./SearchHub');
      expect(fetchSearchResults).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price_low' }),
        expect.any(Object),
        1
      );
    });
  });

  it('updates guest count', () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const guestSelect = screen.getByDisplayValue('1 huésped');

    fireEvent.change(guestSelect, { target: { value: '2' } });

    expect(guestSelect.value).toBe('2');
  });

  it('displays no results message when no matches', async () => {
    const { fetchSearchResults } = require('./SearchHub');
    fetchSearchResults.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      pageSize: 12
    });

    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Buscar ciudad, barrio o palabra clave...');

    fireEvent.change(input, { target: { value: 'Nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron propiedades que coincidan con tus criterios.')).toBeInTheDocument();
    });
  });

  it('displays results count', async () => {
    render(<IntelligentSearchPanel onClose={mockOnClose} />);
    const searchButton = screen.getByText('Buscar');

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('1 resultados encontrados')).toBeInTheDocument();
    });
  });
});
