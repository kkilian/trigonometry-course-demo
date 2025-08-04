import React, { useState } from 'react';
import MathRenderer from './MathRenderer';

const ProblemView = ({ problem, onBack, onComplete }) => {
  const [revealedSteps, setRevealedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);

  const handleStepClick = (stepIndex) => {
    if (!revealedSteps.has(stepIndex)) {
      setRevealedSteps(new Set([...revealedSteps, stepIndex]));
    } else if (!completedSteps.has(stepIndex)) {
      setCompletedSteps(new Set([...completedSteps, stepIndex]));
      
      // Check if all steps are completed
      if (completedSteps.size + 1 === problem.steps.length) {
        setShowSolution(true);
        if (onComplete) {
          onComplete(problem.id);
        }
      }
    }
  };

  const progress = (completedSteps.size / (problem.steps?.length || 1)) * 100;

  return (
    <div className="problem-view">
      <div className="header">
        <button onClick={onBack} className="back-button">
          ← Powrót do listy
        </button>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="problem-statement">
        <h2>Zadanie</h2>
        <div className="statement-content">
          <MathRenderer content={problem.statement} />
        </div>
      </div>

      <div className="steps-section">
        <h3>Kroki rozwiązania</h3>
        <div className="steps">
          {problem.steps?.map((step, index) => (
            <div
              key={index}
              className={`step ${revealedSteps.has(index) ? 'revealed' : ''} ${
                completedSteps.has(index) ? 'completed' : ''
              }`}
              onClick={() => handleStepClick(index)}
            >
              <div className="step-header">
                <span className="step-number">Krok {step.step || index + 1}</span>
                {completedSteps.has(index) && (
                  <span className="completed-icon">✓</span>
                )}
              </div>

              {!revealedSteps.has(index) ? (
                <div className="step-hint">
                  {step.hint ? (
                    <MathRenderer content={step.hint} />
                  ) : (
                    <span className="click-to-reveal">Kliknij aby odkryć krok</span>
                  )}
                </div>
              ) : (
                <div className="step-content">
                  {step.hint && (
                    <div className="hint">
                      <strong>Wskazówka:</strong>
                      <MathRenderer content={step.hint} />
                    </div>
                  )}
                  {step.expression && (
                    <div className="expression">
                      <MathRenderer content={step.expression} />
                    </div>
                  )}
                  {step.explanation && (
                    <div className="explanation">
                      <MathRenderer content={step.explanation} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showSolution && problem.solutions && (
        <div className="solution-section">
          <h3>Rozwiązanie</h3>
          {problem.solutions.map((solution, index) => (
            <div key={index} className="solution">
              <MathRenderer content={solution} />
            </div>
          ))}
        </div>
      )}

      {problem.parameters && (
        <div className="parameters-section">
          <h3>Parametry</h3>
          <div className="parameters">
            {Object.entries(problem.parameters).map(([key, value]) => (
              <div key={key} className="parameter">
                <strong>{key}:</strong>
                <MathRenderer content={value} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemView;