import React from 'react';

const isEmpty = (value) => value === '' || value === null || value === undefined;

const toNumber = (value, fallback) => {
  if (isEmpty(value)) return fallback;
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function NumberStepper({
  allowEmpty = false,
  disabled = false,
  error,
  help,
  id,
  label,
  max = Number.MAX_SAFE_INTEGER,
  min = 0,
  onChange,
  required = false,
  step = 1,
  value,
}) {
  const describedBy = [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const numericValue = toNumber(value, min);
  const displayValue = isEmpty(value) ? '' : String(value);
  const isAtMin = disabled || isEmpty(value) || numericValue <= min;
  const isAtMax = disabled || numericValue >= max;

  const updateValue = (nextValue) => {
    onChange(clamp(nextValue, min, max));
  };

  const stepFromEmpty = () => {
    onChange(min);
  };

  const handleInputChange = (event) => {
    if (event.target.value === '') {
      onChange(allowEmpty ? '' : min);
      return;
    }

    updateValue(Number(event.target.value));
  };

  return (
    <div className={`field-group number-stepper-field ${error ? 'number-stepper-field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="number-stepper" data-disabled={disabled ? 'true' : undefined}>
        <button
          type="button"
          aria-label={`Disminuir ${label}`}
          disabled={isAtMin}
          onClick={() => updateValue(numericValue - step)}
        >
          -
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          disabled={disabled}
          onChange={handleInputChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          disabled={isAtMax}
          onClick={() => (isEmpty(value) ? stepFromEmpty() : updateValue(numericValue + step))}
        >
          +
        </button>
      </div>
      {help ? (
        <small className="field-help" id={`${id}-help`}>
          {help}
        </small>
      ) : null}
      {error ? (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      ) : null}
    </div>
  );
}
