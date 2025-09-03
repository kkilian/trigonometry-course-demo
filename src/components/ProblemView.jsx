import React, { useState, useEffect, useRef } from 'react';
import MathRenderer from './MathRenderer';
import NextProblemSuggestion from './NextProblemSuggestion';

const ProblemView = ({ problem, onBack, onComplete, onSelectProblem, completedProblems = new Set() }) => {
  const [revealedSteps, setRevealedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hintShownSteps, setHintShownSteps] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const startTimeRef = useRef(Date.now());
  const solveDurationRef = useRef(null);

  const handleStepClick = (stepIndex) => {
    const step = problem.steps[stepIndex];
    
    // First click: show hint (if available)
    if (!hintShownSteps.has(stepIndex) && step.hint) {
      setHintShownSteps(new Set([...hintShownSteps, stepIndex]));
    }
    // Second click (or first if no hint): show expression, explanation AND mark as completed
    else if (!revealedSteps.has(stepIndex)) {
      setRevealedSteps(new Set([...revealedSteps, stepIndex]));
      setCompletedSteps(new Set([...completedSteps, stepIndex]));
      
      // Check if all steps are completed
      if (completedSteps.size + 1 === problem.steps.length) {
        setShowSolution(true);
        // Track solve duration
        solveDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Removed feedback modal
        if (onComplete) {
          onComplete(problem.id);
        }
      }
    }
  };

  const progress = (completedSteps.size / (problem.steps?.length || 1)) * 100;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset timer when problem changes
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [problem.id]);

  // Reset all UI states when problem changes
  useEffect(() => {
    setRevealedSteps(new Set());
    setCompletedSteps(new Set());
    setHintShownSteps(new Set());
    setShowSolution(false);
    solveDurationRef.current = null;
    // Scroll to top when opening a new problem
    window.scrollTo(0, 0);
  }, [problem.id]);

  const StepCheckbox = ({ isCompleted, stepNumber }) => (
    <div className="flex items-center">
      <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
        isCompleted 
          ? 'bg-stone-700 border-stone-700' 
          : 'border-stone-400 hover:border-stone-500'
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
      <span className="ml-3 text-sm font-medium text-stone-600">
        Krok {stepNumber}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-40 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Back Button */}
          <div className="mb-4">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
              </svg>
              Zadania
            </button>
          </div>
          
          {/* Header */}
          <header>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
                  {problem.topic?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-stone-500 font-mono ml-2 md:ml-4 hidden md:inline">
                  {problem.id}
                </span>
              </div>
            </div>
            
            <h1 className="text-xl md:text-3xl font-bold text-stone-900 leading-relaxed mb-2">
              <MathRenderer content={problem.statement} />
            </h1>
          </header>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-stone-600 mb-2">
              <span>Postęp</span>
              <span>{completedSteps.size} / {problem.steps?.length || 0} kroków</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {/* Problem Content */}
        <div className="space-y-8 md:space-y-12 pt-6 md:pt-8">
          {/* Completed View - Two Column Layout */}
          {showSolution ? (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 text-stone-700 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Zadanie ukończone!</span>
                </div>
              </div>

              {/* Headers */}
              <div className="grid md:grid-cols-[1fr,400px] gap-8 mb-6">
                <h3 className="text-lg font-semibold text-stone-900">Kroki rozwiązania</h3>
                <h3 className="text-lg font-semibold text-yellow-700 hidden md:block">Wskazówki</h3>
              </div>

              {/* Steps with aligned hints */}
              <div className="space-y-4">
                {problem.steps?.map((step, index) => (
                  <div key={index} className="grid md:grid-cols-[1fr,400px] gap-8 items-start">
                    {/* Left side - Step */}
                    <div className="relative pl-8">
                      {/* Step number circle */}
                      <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-stone-700 text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Connecting line */}
                      {index < problem.steps.length - 1 && (
                        <div className="absolute left-3 top-8 -bottom-4 w-0.5 bg-stone-300"></div>
                      )}
                      
                      {/* Step content */}
                      <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
                        {step.expression && (
                          <div className="text-xl md:text-2xl text-stone-900 text-center font-medium">
                            <MathRenderer content={step.expression} />
                          </div>
                        )}
                        {step.explanation && (
                          <div className="text-base md:text-lg text-stone-600">
                            <MathRenderer content={step.explanation} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Hint */}
                    <div className="relative">
                      {step.hint ? (
                        <>
                          {/* Mobile hint label */}
                          <h4 className="text-sm font-semibold text-yellow-700 mb-2 md:hidden">Wskazówka</h4>
                          <div className="relative">
                            {/* Step reference */}
                            <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            
                            {/* Hint content */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 pl-6">
                              <p className="text-base md:text-lg text-yellow-800">
                                <MathRenderer content={step.hint} />
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Empty space for steps without hints */
                        <div className="hidden md:block"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Interactive Steps View (original) */
            <div className="space-y-6 md:space-y-8 mb-12 md:mb-20">
              {problem.steps?.map((step, index) => (
                <article
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className="relative cursor-pointer transition-all duration-200"
                >
                  {/* Yellow glow when hint is shown */}
                  {hintShownSteps.has(index) && !revealedSteps.has(index) && (
                    <div className="absolute -inset-4 bg-yellow-500/10 blur-2xl rounded-2xl"></div>
                  )}
                  
                  <div className={`relative space-y-4 md:space-y-6 p-4 md:p-6 -m-4 md:-m-6 rounded-xl transition-all duration-300 ${
                    hintShownSteps.has(index) && !revealedSteps.has(index) ? "ring-2 ring-yellow-500/30" : ""
                  }`}>
                    <div className="flex items-start justify-between">
                      <StepCheckbox 
                        isCompleted={completedSteps.has(index)} 
                        stepNumber={step.step || index + 1}
                      />
                    </div>
                    
                    <div className="pl-8 md:pl-10 space-y-3 md:space-y-4">
                      {/* Show hint if available and clicked once */}
                      {step.hint && hintShownSteps.has(index) && !revealedSteps.has(index) && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-500/10 blur-xl"></div>
                          <div className="relative p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-base md:text-lg text-yellow-800 leading-relaxed">
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
                          <div className="text-xl md:text-2xl text-stone-900 font-medium text-center">
                            <MathRenderer content={step.expression} />
                          </div>
                        </div>
                      )}
                      
                      {/* Explanation shown with expression */}
                      {step.explanation && revealedSteps.has(index) && (
                        <div className="text-base md:text-lg text-stone-600 leading-relaxed">
                          <MathRenderer content={step.explanation} />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Solutions - Only show in completed view */}
          {showSolution && problem.solutions && (
            <div className="relative mt-8">
              <div className="absolute inset-0 bg-stone-200/20 blur-2xl rounded-2xl"></div>
              <div className="relative p-6 md:p-8 bg-white border border-stone-200 rounded-xl">
                <h3 className="text-base md:text-lg font-semibold text-stone-700 mb-4 md:mb-6">Odpowiedź końcowa</h3>
                <div className="space-y-3 md:space-y-4">
                  {problem.solutions.map((solution, index) => (
                    <div key={index} className="text-stone-900 text-xl md:text-2xl font-medium text-center">
                      <MathRenderer content={solution} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Problem Suggestion - Only show when problem is completed */}
          {false && showSolution && (
            <NextProblemSuggestion 
              currentProblem={problem}
              completedProblems={completedProblems}
              onSelectProblem={onSelectProblem}
              solveDuration={solveDurationRef.current}
            />
          )}

          {/* Parameters */}
          {problem.parameters && Object.keys(problem.parameters).length > 0 && (
            <div className="p-6 bg-white border border-stone-200 rounded-xl">
              <h3 className="text-sm font-medium text-stone-600 mb-4">Parametry</h3>
              <div className="space-y-2">
                {Object.entries(problem.parameters).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="text-stone-600 font-mono">{key}:</span>
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