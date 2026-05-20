import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function StepProgress({ currentStepIndex, onStepChange, steps }) {
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="property-step-progress" aria-label="Progreso del formulario">
      <div className="property-step-progress__summary">
        <span>
          Paso {currentStepIndex + 1} de {steps.length}
        </span>
        <strong>{steps[currentStepIndex].label}</strong>
      </div>
      <div className="property-step-progress__bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="stepper">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`stepper__item ${index === currentStepIndex ? 'stepper__item--active' : ''} ${
              index < currentStepIndex ? 'stepper__item--done' : ''
            }`}
            type="button"
            onClick={() => onStepChange(index)}
          >
            <span>{index < currentStepIndex ? <CheckCircle2 size={14} /> : index + 1}</span>
            <strong>{step.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
