import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * QuestionsForm renders a dynamic form based on questions JSON.
 * Supports types: text, select, checkboxes, radio, number, file (UI only).
 * Handles validation, inline errors, and calls onChange with answers.
 *
 * Props:
 * - questions: array of question objects
 * - initialAnswers: object with initial answers
 * - onChange: function called with updated answers
 * - onSubmit: function called when form is submitted
 */
const QuestionsForm = ({ questions, initialAnswers = {}, onChange, onSubmit }) => {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update answers when initialAnswers change (for draft restoration)
  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  // Validate field and update errors
  const validateField = (question, value) => {
    const { id, required, type, min, max } = question;
    let error = null;

    if (required && (!value || (Array.isArray(value) && value.length === 0))) {
      error = 'Este campo es obligatorio';
    } else if (type === 'number' && value) {
      const numValue = Number(value);
      if (min !== undefined && numValue < min) {
        error = `El valor mínimo es ${min}`;
      } else if (max !== undefined && numValue > max) {
        error = `El valor máximo es ${max}`;
      }
    }

    setErrors(prev => ({ ...prev, [id]: error }));
    return !error;
  };

  // Handle input changes
  const handleChange = (question, value) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    onChange(newAnswers);

    // Validate if field was touched
    if (touched[question.id]) {
      validateField(question, value);
    }
  };

  // Handle field blur (mark as touched)
  const handleBlur = (question) => {
    setTouched(prev => ({ ...prev, [question.id]: true }));
    validateField(question, answers[question.id]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    questions.forEach(q => {
      allTouched[q.id] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    let hasErrors = false;
    questions.forEach(question => {
      if (!validateField(question, answers[question.id])) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      onSubmit(answers);
    }
  };

  // Render different input types
  const renderInput = (question) => {
    const { id, type, label, required, placeholder, hint, options, min, max, accept } = question;
    const value = answers[id] || '';
    const error = errors[id];
    const isTouched = touched[id];

    const baseProps = {
      id,
      name: id,
      value: type === 'checkboxes' ? undefined : value,
      onChange: (e) => {
        let newValue;
        if (type === 'checkboxes') {
          const checkboxValue = e.target.value;
          const currentValues = Array.isArray(value) ? value : [];
          if (e.target.checked) {
            newValue = [...currentValues, checkboxValue];
          } else {
            newValue = currentValues.filter(v => v !== checkboxValue);
          }
        } else if (type === 'file') {
          newValue = e.target.files[0]?.name || ''; // Just store filename for UI
        } else {
          newValue = e.target.value;
        }
        handleChange(question, newValue);
      },
      onBlur: () => handleBlur(question),
      className: `question-input ${error && isTouched ? 'error' : ''}`,
      'aria-describedby': hint ? `${id}-hint` : undefined,
      'aria-invalid': error && isTouched ? 'true' : undefined
    };

    switch (type) {
      case 'text':
        return (
          <input
            {...baseProps}
            type="text"
            placeholder={placeholder}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            {...baseProps}
            type="number"
            min={min}
            max={max}
            required={required}
          />
        );

      case 'select':
        return (
          <select {...baseProps} required={required}>
            <option value="">Selecciona una opción</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map(option => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(question, e.target.value)}
                  onBlur={() => handleBlur(question)}
                  required={required}
                />
                <span className="radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="checkboxes-group">
            {options.map(option => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  name={id}
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const checkboxValue = option.value;
                    const currentValues = Array.isArray(value) ? value : [];
                    let newValue;
                    if (e.target.checked) {
                      newValue = [...currentValues, checkboxValue];
                    } else {
                      newValue = currentValues.filter(v => v !== checkboxValue);
                    }
                    handleChange(question, newValue);
                  }}
                  onBlur={() => handleBlur(question)}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="file-input-wrapper">
            <input
              {...baseProps}
              type="file"
              accept={accept}
              style={{ display: 'none' }}
              id={`${id}-file`}
            />
            <label htmlFor={`${id}-file`} className="file-input-label">
              <span className="file-input-text">
                {value || 'Seleccionar archivo'}
              </span>
              <span className="file-input-button">Examinar</span>
            </label>
          </div>
        );

      default:
        return <input {...baseProps} type="text" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="questions-form" noValidate>
      {questions.map(question => (
        <div key={question.id} className="question-group">
          <label htmlFor={question.id} className="question-label">
            {question.label}
            {question.required && <span className="required">*</span>}
          </label>

          {question.hint && (
            <div id={`${question.id}-hint`} className="question-hint">
              {question.hint}
            </div>
          )}

          {renderInput(question)}

          {errors[question.id] && touched[question.id] && (
            <div className="question-error" role="alert">
              {errors[question.id]}
            </div>
          )}
        </div>
      ))}

      <button type="submit" className="submit-button">
        Enviar información
      </button>
    </form>
  );
};

QuestionsForm.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select', 'checkboxes', 'radio', 'number', 'file']).isRequired,
      label: PropTypes.string.isRequired,
      required: PropTypes.bool,
      hint: PropTypes.string,
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      min: PropTypes.number,
      max: PropTypes.number,
      accept: PropTypes.string
    })
  ).isRequired,
  initialAnswers: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default QuestionsForm;
