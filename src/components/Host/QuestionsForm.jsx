import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import questionsMap from './questionsMap';
import { saveDraft, loadDraft, clearDraft } from '../../utils/localDraft';
import './HostModal.css';

/**
 * QuestionsForm
 * Renders a dynamic form based on questionsMap for the selected type.
 * Supports types: text, select, checkboxes, radio, number, file (UI only).
 * Auto-saves answers to localStorage every 5 seconds and on change.
 * Validates required fields and shows inline error messages.
 * Calls onSubmit with answers on form submission.
 */
const QuestionsForm = ({ selectionId, onComplete, onCancel }) => {
  const questions = questionsMap[selectionId] || [];
  const [answers, setAnswers] = useState(() => loadDraft(selectionId) || {});
  const [errors, setErrors] = useState({});
  const [savingStatus, setSavingStatus] = useState('Guardado automáticamente');
  const saveTimeout = useRef(null);

  // Auto-save answers every 5 seconds
  useEffect(() => {
    setSavingStatus('Guardando...');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveDraft(selectionId, answers);
      setSavingStatus('Guardado automáticamente');
    }, 5000);
    return () => clearTimeout(saveTimeout.current);
  }, [answers, selectionId]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveDraft(selectionId, answers);
    };
  }, [answers, selectionId]);

  const validate = () => {
    const newErrors = {};
    questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = 'Este campo es obligatorio';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id, optionValue) => {
    const current = answers[id] || [];
    if (current.includes(optionValue)) {
      handleChange(
        id,
        current.filter((v) => v !== optionValue)
      );
    } else {
      handleChange(id, [...current, optionValue]);
    }
  };

  const handleFileChange = (id, event) => {
    const file = event.target.files[0];
    handleChange(id, file ? file.name : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      clearDraft(selectionId);
      onComplete({ selectionId, answers });
    }
  };

  return (
    <form className="questions-form" onSubmit={handleSubmit} noValidate>
      {questions.map((q) => (
        <div key={q.id} className="form-group">
          <label htmlFor={q.id}>
            {q.label} {q.required && <span aria-label="required">*</span>}
          </label>
          {q.hint && <small className="hint">{q.hint}</small>}

          {q.type === 'text' && (
            <input
              type="text"
              id={q.id}
              name={q.id}
              value={answers[q.id] || ''}
              placeholder={q.placeholder || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            />
          )}

          {q.type === 'number' && (
            <input
              type="number"
              id={q.id}
              name={q.id}
              value={answers[q.id] || ''}
              placeholder={q.placeholder || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              min={q.min}
              max={q.max}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            />
          )}

          {q.type === 'select' && (
            <select
              id={q.id}
              name={q.id}
              value={answers[q.id] || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            >
              <option value="" disabled>
                Selecciona...
              </option>
              {q.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {q.type === 'checkboxes' && (
            <fieldset
              id={q.id}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            >
              {q.options.map((opt) => (
                <label key={opt.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={q.id}
                    value={opt.value}
                    checked={(answers[q.id] || []).includes(opt.value)}
                    onChange={() => handleCheckboxChange(q.id, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </fieldset>
          )}

          {q.type === 'radio' && (
            <fieldset
              id={q.id}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            >
              {q.options.map((opt) => (
                <label key={opt.value} className="radio-label">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleChange(q.id, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </fieldset>
          )}

          {q.type === 'file' && (
            <input
              type="file"
              id={q.id}
              name={q.id}
              accept={q.accept || '*'}
              onChange={(e) => handleFileChange(q.id, e)}
              aria-required={q.required}
              aria-invalid={!!errors[q.id]}
              tabIndex="0"
            />
          )}

          {errors[q.id] && <div className="error-message">{errors[q.id]}</div>}
        </div>
      ))}

      <div className="form-footer">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancelar
        </button>
        <button type="submit" className="submit-button">
          Enviar
        </button>
      </div>
      <div className="saving-status" aria-live="polite">
        {savingStatus}
      </div>
    </form>
  );
};

QuestionsForm.propTypes = {
  selectionId: PropTypes.oneOf(['rentals', 'marketplace', 'services']).isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default QuestionsForm;
