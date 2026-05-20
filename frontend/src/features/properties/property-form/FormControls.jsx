import React from 'react';

const optionValue = (option) => (typeof option === 'string' ? option : option.value);
const optionLabel = (option) => (typeof option === 'string' ? option : option.label);

export function FormField({ children, className = '', error, help, id, label, required = false }) {
  return (
    <div className={`field-group property-field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {help ? <small className="field-help">{help}</small> : null}
      {error ? (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      ) : null}
    </div>
  );
}

export function TextField({
  className,
  error,
  help,
  id,
  label,
  multiline = false,
  onChange,
  required,
  rows = 4,
  value,
  ...props
}) {
  const sharedProps = {
    id,
    value,
    onChange: (event) => onChange(event.target.value),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    ...props,
  };

  return (
    <FormField className={className} error={error} help={help} id={id} label={label} required={required}>
      {multiline ? <textarea rows={rows} {...sharedProps} /> : <input {...sharedProps} />}
    </FormField>
  );
}

export function SelectField({
  className,
  disabled = false,
  error,
  help,
  id,
  label,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  required,
  value,
}) {
  return (
    <FormField className={className} error={error} help={help} id={id} label={label} required={required}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={optionValue(option)} value={optionValue(option)}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function ToggleField({ checked, description, disabled = false, id, label, onChange }) {
  return (
    <label className={`form-toggle ${disabled ? 'form-toggle--disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="form-toggle__control" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

export function CheckboxGroup({ error, label, onToggle, options, selectedValues }) {
  return (
    <div className="field-group property-field">
      <span className="property-field__label">{label}</span>
      <div className="chip-group">
        {options.map((option) => {
          const value = optionValue(option);
          const active = selectedValues.includes(value);

          return (
            <button
              key={value}
              className={`select-chip ${active ? 'select-chip--active' : ''}`}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(value)}
            >
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  );
}
