import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function FilterDropdown({
  ariaLabel,
  className = '',
  label,
  options,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonId = useId();
  const listId = useId();
  const selectedOption = options.find((option) => option.value === value) || options[0];
  const classes = ['filter-dropdown', className].filter(Boolean).join(' ');

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={classes} ref={rootRef}>
      {label ? <span className="filter-dropdown__label">{label}</span> : null}
      <button
        type="button"
        id={buttonId}
        className="filter-dropdown__button"
        aria-label={ariaLabel || label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label || 'Seleccionar'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="filter-dropdown__menu"
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          tabIndex={-1}
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={active ? 'is-active' : ''}
                role="option"
                aria-selected={active}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {active ? <Check size={15} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
