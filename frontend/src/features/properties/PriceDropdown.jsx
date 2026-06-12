import React from 'react';
import { formatCurrency } from '../../lib/formatters';
import { DEFAULT_SEARCH_FILTERS, PRICE_FILTER_LIMIT } from './searchFilterParams';

const PRICE_STEP = 100000;

const clampPrice = (value) => Math.min(Math.max(Number(value) || 0, 0), PRICE_FILTER_LIMIT);

const getPercent = (value) => `${(clampPrice(value) / PRICE_FILTER_LIMIT) * 100}%`;

/**
 * @typedef {typeof DEFAULT_SEARCH_FILTERS} SearchFilters
 *
 * @typedef {object} PriceDropdownProps
 * @property {SearchFilters} filters
 * @property {(field: 'minRent' | 'maxRent', value: number) => void} onChange
 * @property {() => void} onClear
 * @property {() => void} onApply
 */

/**
 * @param {PriceDropdownProps} props
 */
export function PriceDropdown({ filters, onChange, onClear, onApply }) {
  const minValue = clampPrice(filters.minRent);
  const maxValue = clampPrice(filters.maxRent);
  const hasInvalidPrice = minValue > maxValue;

  const updateMinimum = (value) => {
    onChange('minRent', value === '' ? DEFAULT_SEARCH_FILTERS.minRent : clampPrice(value));
  };

  const updateMaximum = (value) => {
    onChange('maxRent', value === '' ? DEFAULT_SEARCH_FILTERS.maxRent : clampPrice(value));
  };

  return (
    <div
      className="price-dropdown"
      style={{
        '--range-start': getPercent(Math.min(minValue, maxValue)),
        '--range-end': getPercent(Math.max(minValue, maxValue)),
      }}
    >
      <header className="price-dropdown__header">
        <strong>Precio mensual</strong>
      </header>

      <div className="price-dropdown__inputs">
        <label className="price-dropdown__field" htmlFor="price-filter-min">
          <span>Minimo</span>
          <div className="price-dropdown__input-shell">
            <span className="price-dropdown__prefix">$</span>
            <input
              id="price-filter-min"
              type="number"
              min="0"
              step={PRICE_STEP}
              value={filters.minRent || ''}
              placeholder="Ej: 800000"
              onChange={(event) => updateMinimum(event.target.value)}
            />
            <span className="price-dropdown__suffix">COP</span>
          </div>
        </label>

        <label className="price-dropdown__field" htmlFor="price-filter-max">
          <span>Maximo</span>
          <div className="price-dropdown__input-shell">
            <span className="price-dropdown__prefix">$</span>
            <input
              id="price-filter-max"
              type="number"
              min="0"
              step={PRICE_STEP}
              value={filters.maxRent === PRICE_FILTER_LIMIT ? '' : filters.maxRent}
              placeholder="Ej: 2500000"
              onChange={(event) => updateMaximum(event.target.value)}
            />
            <span className="price-dropdown__suffix">COP</span>
          </div>
        </label>
      </div>

      <div className="price-dropdown__slider" aria-label="Rango de precio mensual">
        <div className="price-dropdown__limits">
          <span>{formatCurrency(DEFAULT_SEARCH_FILTERS.minRent)}</span>
          <span>{formatCurrency(DEFAULT_SEARCH_FILTERS.maxRent)}</span>
        </div>
        <div className="price-dropdown__range-track">
          <input
            className="price-dropdown__range price-dropdown__range--min"
            type="range"
            min="0"
            max={PRICE_FILTER_LIMIT}
            step={PRICE_STEP}
            value={minValue}
            aria-label="Precio minimo"
            onChange={(event) => updateMinimum(event.target.value)}
          />
          <input
            className="price-dropdown__range price-dropdown__range--max"
            type="range"
            min="0"
            max={PRICE_FILTER_LIMIT}
            step={PRICE_STEP}
            value={maxValue}
            aria-label="Precio maximo"
            onChange={(event) => updateMaximum(event.target.value)}
          />
        </div>
      </div>

      {hasInvalidPrice ? (
        <p className="price-dropdown__warning">El precio minimo no puede ser mayor al maximo.</p>
      ) : null}

      <footer className="price-dropdown__footer">
        <button type="button" className="price-dropdown__clear" onClick={onClear}>
          Limpiar
        </button>
        <button
          type="button"
          className="price-dropdown__apply"
          disabled={hasInvalidPrice}
          onClick={onApply}
        >
          Aplicar
        </button>
      </footer>
    </div>
  );
}
