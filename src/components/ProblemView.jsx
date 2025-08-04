import React, { useState } from 'react';
import MathRenderer, { MathExpression } from './MathRenderer';

const ProblemView = ({ problem, onBack, onComplete }) => {
  const [revealedSteps, setRevealedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hintShownSteps, setHintShownSteps] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);

  const handleStepClick = (stepIndex) => {
    const step = problem.steps[stepIndex];
    
    // First click: show hint (if available)
    if (!hintShownSteps.has(stepIndex) && step.hint) {
      setHintShownSteps(new Set([...hintShownSteps, stepIndex]));
    }
    // Second click (or first if no hint): show expression and explanation
    else if (!revealedSteps.has(stepIndex)) {
      setRevealedSteps(new Set([...revealedSteps, stepIndex]));
    }
    // Third click: mark as completed
    else if (!completedSteps.has(stepIndex)) {
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

  const StepCheckbox = ({ isCompleted, stepNumber }) => (
    <div className="flex items-center">
      <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
        isCompleted 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-600 hover:border-gray-400'
      }`}>
        {isCompleted && (
          <svg className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
               fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="ml-3 text-sm font-medium text-gray-400">
        Krok {stepNumber}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="p-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
          </svg>
          Zadania
        </button>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* Header */}
          <header>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {problem.topic?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-600 font-mono ml-4">
                  {problem.id}
                </span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white leading-relaxed mb-2">
              <MathRenderer content={problem.statement} />
            </h1>
          </header>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Postęp</span>
              <span>{completedSteps.size} / {problem.steps?.length || 0} kroków</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-8 pb-16">
        {/* Problem Content */}
        <div className="space-y-12 pt-8">
          {/* Steps */}
          <div className="space-y-8 mb-20">
            {problem.steps?.map((step, index) => (
              <article
                key={index}
                onClick={() => handleStepClick(index)}
                className={`relative cursor-pointer transition-all duration-200 ${
                  completedSteps.has(index) ? "opacity-40" : "opacity-100"
                }`}
              >
                {/* Yellow glow when hint is shown */}
                {hintShownSteps.has(index) && !revealedSteps.has(index) && (
                  <div className="absolute -inset-4 bg-yellow-500/10 blur-2xl rounded-2xl"></div>
                )}
                
                <div className={`relative space-y-6 p-6 -m-6 rounded-xl transition-all duration-300 ${
                  hintShownSteps.has(index) && !revealedSteps.has(index) ? "ring-2 ring-yellow-500/30" : ""
                }`}>
                  <div className="flex items-start justify-between">
                    <StepCheckbox 
                      isCompleted={completedSteps.has(index)} 
                      stepNumber={step.step || index + 1}
                    />
                  </div>
                  
                  <div className="pl-10 space-y-4">
                    {/* Show hint if available and clicked once */}
                    {step.hint && hintShownSteps.has(index) && !revealedSteps.has(index) && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/10 blur-xl"></div>
                        <div className="relative p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-500/80 leading-relaxed">
                            <MathRenderer content={step.hint} />
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Expression shown after hint (or first click if no hint) */}
                    {step.expression && (
                      <div className={`transition-all duration-500 ${
                        revealedSteps.has(index) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                      }`}>
                        <div className="text-xl text-white font-medium">
                          <MathExpression content={step.expression} block={true} />
                        </div>
                      </div>
                    )}
                    
                    {/* Explanation shown with expression */}
                    {step.explanation && revealedSteps.has(index) && (
                      <div className="text-sm text-gray-400 leading-relaxed">
                        <MathRenderer content={step.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Solutions */}
          {showSolution && problem.solutions && (
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-2xl"></div>
              <div className="relative p-8 bg-green-500/5 border border-green-500/20 rounded-xl">
                <h3 className="text-lg font-semibold text-green-400 mb-6">Rozwiązanie</h3>
                <div className="space-y-4">
                  {problem.solutions.map((solution, index) => (
                    <div key={index} className="text-white text-lg">
                      <MathExpression content={solution} block={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Parameters */}
          {problem.parameters && (
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Parametry</h3>
              <div className="space-y-2">
                {Object.entries(problem.parameters).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 font-mono">{key}:</span>
                    <MathRenderer content={value} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemView;