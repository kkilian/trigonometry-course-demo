import React, { useState, useEffect } from 'react';
import MathRenderer from '../MathRenderer';
import MultiStepChoice from '../MultiStepChoice';

/**
 * Kompaktowa wersja ProblemView dostosowana do wyświetlania w porównaniach side-by-side
 * Usuwa niepotrzebne elementy jak NextProblemSuggestion, feedback, itp.
 */
const ComparisonProblemView = ({ problem, modelName, className = "" }) => {
  const [revealedSteps, setRevealedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hintShownSteps, setHintShownSteps] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState(new Set());
  const [completedInteractiveChoices, setCompletedInteractiveChoices] = useState(new Set());
  const [showMultiStepSteps, setShowMultiStepSteps] = useState(new Set());

  const handleStepClick = (stepIndex) => {
    const step = problem.steps[stepIndex];

    // First click: show hint (if available)
    if (!hintShownSteps.has(stepIndex) && step.hint) {
      setHintShownSteps(new Set([...hintShownSteps, stepIndex]));
    }
    // Second click after hint: show MultiStepChoice (if available)
    else if (step.interactive_choice && !showMultiStepSteps.has(stepIndex) && hintShownSteps.has(stepIndex) && !completedInteractiveChoices.has(stepIndex)) {
      setShowMultiStepSteps(new Set([...showMultiStepSteps, stepIndex]));
    }
    // If MultiStepChoice is shown but not completed, wait for completion
    else if (step.interactive_choice && showMultiStepSteps.has(stepIndex) && !completedInteractiveChoices.has(stepIndex)) {
      return;
    }
    // Final click: show expression, explanation AND mark as completed
    else if (!revealedSteps.has(stepIndex)) {
      setRevealedSteps(new Set([...revealedSteps, stepIndex]));
      setCompletedSteps(new Set([...completedSteps, stepIndex]));

      // Check if all steps are completed
      if (completedSteps.size + 1 === problem.steps.length) {
        setShowSolution(true);
      }
    }
  };

  const handleInteractiveChoiceComplete = (stepIndex) => {
    setCompletedInteractiveChoices(new Set([...completedInteractiveChoices, stepIndex]));
    setRevealedSteps(new Set([...revealedSteps, stepIndex]));
    setCompletedSteps(new Set([...completedSteps, stepIndex]));

    if (completedSteps.size + 1 === problem.steps.length) {
      setShowSolution(true);
    }
  };

  const progress = (completedSteps.size / (problem.steps?.length || 1)) * 100;

  // Reset states when problem changes
  useEffect(() => {
    setRevealedSteps(new Set());
    setCompletedSteps(new Set());
    setHintShownSteps(new Set());
    setShowSolution(false);
    setExpandedWhy(new Set());
    setCompletedInteractiveChoices(new Set());
    setShowMultiStepSteps(new Set());
  }, [problem.id]);

  if (!problem) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <p className="text-stone-500">Brak zadania do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Header with model name */}
      <div className="bg-stone-50 px-4 py-3 rounded-t-lg border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-stone-800">{modelName}</h3>
          <div className="text-sm text-stone-600">
            {problem.topic}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Problem Statement */}
        <div className="bg-stone-50 p-4 rounded-lg border-l-4 border-stone-400">
          <div className="text-stone-900 text-base leading-relaxed font-medium">
            <MathRenderer content={problem.statement} />
          </div>
        </div>

        {/* Progress Bar */}
        {problem.steps && problem.steps.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-stone-600">
              <span>Postęp</span>
              <span>{completedSteps.size} z {problem.steps.length} kroków</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, #facc15, #f97316)',
                  width: `${progress}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {problem.steps?.map((step, index) => (
            <div key={index} className="border border-stone-200 rounded-lg">
              {/* Step Header - Always visible and clickable */}
              <button
                className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors rounded-t-lg"
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    completedSteps.has(index)
                      ? 'bg-green-500 text-white'
                      : hintShownSteps.has(index)
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}>
                    {completedSteps.has(index) ? '✓' : index + 1}
                  </div>
                  <span className="text-stone-700 font-medium text-sm">
                    Krok {index + 1}
                  </span>
                  <div className="ml-auto">
                    <svg className={`w-4 h-4 transition-transform ${
                      revealedSteps.has(index) ? 'rotate-180' : ''
                    }`} fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10l5 5 5-5"/>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Hint */}
              {hintShownSteps.has(index) && step.hint && (
                <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
                  <div className="text-yellow-800 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs">?</span>
                      </div>
                      <MathRenderer content={step.hint} />
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Choice */}
              {step.interactive_choice && showMultiStepSteps.has(index) && !completedInteractiveChoices.has(index) && (
                <div className="p-4 border-t bg-stone-50">
                  <MultiStepChoice
                    choice={step.interactive_choice}
                    onComplete={() => handleInteractiveChoiceComplete(index)}
                  />
                </div>
              )}

              {/* Step Content */}
              {revealedSteps.has(index) && (
                <div className="px-4 py-3 border-t bg-stone-50">
                  <div className="space-y-2">
                    <div className="text-stone-900 font-medium text-sm">
                      <MathRenderer content={step.expression} />
                    </div>
                    <div className="text-stone-700 text-sm">
                      <MathRenderer content={step.explanation} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Solution */}
        {showSolution && problem.solution && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 text-sm mb-1">Rozwiązanie</h4>
                <div className="text-green-900 text-sm">
                  <MathRenderer content={problem.solution} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonProblemView;