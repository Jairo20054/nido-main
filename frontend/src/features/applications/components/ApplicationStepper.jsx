import React from 'react';
import { APPLICATION_STEPS } from '../applicationConfig';

export function ApplicationStepper({ currentStep }) {
  const currentIndex = APPLICATION_STEPS.findIndex((step) => step.key === currentStep);

  return (
    <div className="application-stepper" aria-label="Progreso de arriendo">
      {APPLICATION_STEPS.map((step, index) => {
        const status =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';

        return (
          <div
            key={step.key}
            className={`application-stepper__item application-stepper__item--${status}`}
          >
            <span className="application-stepper__dot">{index + 1}</span>
            <span className="application-stepper__text">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
