import React from 'react';

/**
 * Form progress indicator
 * @param {Object} props - Component props
 * @param {number} props.totalSteps - Total number of steps
 * @param {number} props.currentStep - Current step
 * @param {Array} props.stepLabels - Labels for each step
 * @param {Function} props.onStepClick - Function to handle step click
 */
const FormProgress = ({
  totalSteps,
  currentStep,
  stepLabels = [],
  onStepClick
}) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <li
              key={stepNumber}
              className={`relative ${index !== totalSteps - 1 ? 'pr-8 sm:pr-20' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick && onStepClick(stepNumber)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? 'bg-indigo-600 hover:bg-indigo-800'
                      : isActive
                      ? 'bg-indigo-600'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Step ${stepNumber}${
                    stepLabels[index] ? `: ${stepLabels[index]}` : ''
                  }`}
                  disabled={!onStepClick}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {stepNumber}
                    </span>
                  )}
                </button>
                
                {index !== totalSteps - 1 && (
                  <div
                    className={`absolute top-4 h-0.5 w-full max-w-20 ${
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    style={{ left: '2rem' }}
                  />
                )}
              </div>
              
              {stepLabels[index] && (
                <span
                  className={`absolute mt-2 w-max text-center text-xs font-medium ${
                    isActive || isCompleted ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                >
                  {stepLabels[index]}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default FormProgress; 