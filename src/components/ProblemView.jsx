import React, { useState, useEffect, useRef } from 'react';
import MathRenderer from './MathRenderer';
import NextProblemSuggestion from './NextProblemSuggestion';
import MultiStepChoice from './MultiStepChoice';

const ProblemView = ({ problem, onBack, onComplete, onSelectProblem, onSkip, completedProblems = new Set(), problems = [] }) => {
  const [revealedSteps, setRevealedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hintShownSteps, setHintShownSteps] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState(new Set());
  const [showStatementExplanation, setShowStatementExplanation] = useState(false);
  const [completedInteractiveChoices, setCompletedInteractiveChoices] = useState(new Set());
  const [showMultiStepSteps, setShowMultiStepSteps] = useState(new Set());
  const [hasSeenSkipHint, setHasSeenSkipHint] = useState(
    localStorage.getItem('hasSeenSkipHint') === 'true'
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState(false);
  const startTimeRef = useRef(Date.now());
  const solveDurationRef = useRef(null);

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
      return; // The MultiStepChoice component will handle the interaction
    }
    // Final click: show expression, explanation AND mark as completed
    else if (!revealedSteps.has(stepIndex)) {
      setRevealedSteps(new Set([...revealedSteps, stepIndex]));
      setCompletedSteps(new Set([...completedSteps, stepIndex]));
      
      // Check if all steps are completed
      if (completedSteps.size + 1 === problem.steps.length) {
        setShowSolution(true);
        // Track solve duration
        solveDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Smooth scroll to top to show next problem button
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
        // Removed feedback modal
        if (onComplete) {
          onComplete(problem.id);
        }
      }
    }
  };

  const handleInteractiveChoiceComplete = (stepIndex) => {
    setCompletedInteractiveChoices(new Set([...completedInteractiveChoices, stepIndex]));
    // After completing interactive choice, automatically reveal the step
    setRevealedSteps(new Set([...revealedSteps, stepIndex]));
    setCompletedSteps(new Set([...completedSteps, stepIndex]));
    
    // Check if all steps are completed
    if (completedSteps.size + 1 === problem.steps.length) {
      setShowSolution(true);
      // Track solve duration
      solveDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
      // Smooth scroll to top to show next problem button
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
      // Removed feedback modal
      if (onComplete) {
        onComplete(problem.id);
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
    setExpandedWhy(new Set());
    setShowStatementExplanation(false);
    setCompletedInteractiveChoices(new Set());
    setShowMultiStepSteps(new Set());
    setEnlargedImage(false);
    solveDurationRef.current = null;
    // Scroll to top when opening a new problem
    window.scrollTo(0, 0);
  }, [problem.id]);

  // Handle scroll events for header animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrolled = scrollPosition > 80; // Header starts shrinking after 80px
      const progress = Math.min(scrollPosition / 200, 1); // Full animation at 200px

      setIsScrolled(scrolled);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatically mark skip hint as seen after 10 seconds
  useEffect(() => {
    if (!hasSeenSkipHint && onSkip) {
      const timer = setTimeout(() => {
        localStorage.setItem('hasSeenSkipHint', 'true');
        setHasSeenSkipHint(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenSkipHint, onSkip]);

  const toggleWhy = (stepIndex) => {
    const newExpanded = new Set(expandedWhy);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedWhy(newExpanded);
  };
  
  const toggleStatementExplanation = () => {
    setShowStatementExplanation(!showStatementExplanation);
  };

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
      <div className={`sticky top-0 z-40 border-b border-stone-200 transition-all duration-300 ${
        isScrolled
          ? 'shadow-md bg-stone-100/95 backdrop-blur-sm'
          : 'bg-stone-100'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 md:px-8 transition-all duration-300 ${
          isScrolled ? 'py-2 md:py-3' : 'py-4 md:py-6'
        }`}>
          {/* Back Button and Skip Button */}
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'mb-2' : 'mb-4'
          }`}>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
              </svg>
              Zadania
            </button>
            {onSkip && !showSolution && (
              <div className="relative">
                <button
                  onClick={() => {
                    if (!hasSeenSkipHint) {
                      localStorage.setItem('hasSeenSkipHint', 'true');
                      setHasSeenSkipHint(true);
                    }
                    onSkip();
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors group ${
                    !hasSeenSkipHint
                      ? 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border-2 border-orange-400 animate-pulse-border'
                      : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                  }`}
                  title={!hasSeenSkipHint ? "Utknąłeś? Możesz pominąć to zadanie!" : undefined}
                >
                  Pomiń zadanie
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l6 6-6 6" />
                  </svg>
                </button>
                {/* Tooltip on first hover */}
                {!hasSeenSkipHint && (
                  <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="bg-orange-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-orange-500 rotate-45"></div>
                      System wybierze następne zadanie dla Ciebie!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Header */}
          <header>
            <div className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? 'mb-1' : 'mb-2'
            }`}>
              <div>
                <span className={`font-medium text-stone-600 uppercase tracking-wider transition-all duration-300 ${
                  isScrolled ? 'text-[10px]' : 'text-xs'
                }`}>
                  {problem.topic?.replace(/_/g, ' ')}
                </span>
                {!isScrolled && (
                  <span className="text-xs text-stone-500 font-mono ml-2 md:ml-4 hidden md:inline">
                    {problem.id}
                  </span>
                )}
              </div>
            </div>

            {/* Statement with image always on the side */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h1 className={`font-bold text-stone-900 leading-relaxed transition-all duration-300 flex-1 ${
                    isScrolled
                      ? 'text-base md:text-lg mb-1'
                      : 'text-xl md:text-3xl mb-2'
                  }`}>
                    <MathRenderer content={problem.statement} />
                  </h1>
                  {problem.quiz && (
                    <div className="mt-3">
                      <div className="border-t border-stone-300 mb-3"></div>
                      <div className={`text-stone-700 ${
                        isScrolled ? 'text-sm md:text-base' : 'text-base md:text-xl'
                      }`}>
                        {problem.quiz.split('\n').map((option, idx) => (
                          <div key={idx} className="mb-1">
                            <MathRenderer content={option} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {isScrolled && (
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="p-1 rounded-full hover:bg-stone-200 transition-colors text-stone-500 hover:text-stone-700"
                      title="Przewiń do góry"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7 7 7M5 18l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Image on the right side with click to enlarge */}
              {problem.image && (
                <div className="flex-shrink-0">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setEnlargedImage(true)}
                    title="Kliknij aby powiększyć"
                  >
                    <img
                      src={problem.image}
                      alt={`Rysunek do zadania ${problem.id || 'maturalnego'}`}
                      className="rounded-lg border border-stone-200 shadow-sm bg-white p-1 transition-transform group-hover:scale-105"
                      style={{
                        width: isScrolled ? '150px' : '200px',
                        height: 'auto',
                        maxHeight: isScrolled ? '120px' : '200px',
                        objectFit: 'contain'
                      }}
                    />
                    {/* Magnifying glass overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                    <p className="text-center text-xs text-stone-500 mt-1 group-hover:text-stone-700">
                      Kliknij aby powiększyć
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statement explanation button and content - hide when scrolled */}
            {problem.statement_explanation && !isScrolled && (
              <div className="mt-4">
                <button
                  onClick={toggleStatementExplanation}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <span>Wyjaśnij polecenie</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showStatementExplanation ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showStatementExplanation && (
                  <div className="mt-3 pl-4 border-l-2 border-stone-300">
                    <p className="text-sm text-stone-700 leading-relaxed">
                      <MathRenderer content={problem.statement_explanation} />
                    </p>
                  </div>
                )}
              </div>
            )}
          </header>

          {/* Compact progress bar when scrolled */}
          {isScrolled && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-stone-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, #facc15, #f97316)',
                      width: `${progress}%`
                    }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium">
                  {completedSteps.size}/{problem.steps?.length || 0}
                </span>
              </div>
            </div>
          )}

          {/* Progress and Next Problem */}
          <div className="mt-6 flex items-start justify-between gap-4">
            {!isScrolled && (
              <div className="flex-1">
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
            )}
            
            {/* Compact Next Problem Suggestion */}
            {showSolution && problems.length > 0 && (
              <div>
                <NextProblemSuggestion 
                  currentProblem={problem}
                  completedProblems={completedProblems}
                  onSelectProblem={onSelectProblem}
                  solveDuration={solveDurationRef.current}
                  problems={problems}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {/* Problem Content */}
        <div className="space-y-8 md:space-y-12 pt-6 md:pt-8">
          {/* Completed View - Two Column Layout */}
          {showSolution ? (
            <div className="space-y-4">
              {/* Steps with side-by-side hints */}
              {problem.steps?.map((step, index) => (
                <div key={index} className="grid md:grid-cols-[1fr,400px] gap-6 items-start">
                  {/* Left side - Step */}
                  <div className="relative pl-8">
                    {/* Step number circle */}
                    <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-stone-700 text-white text-xs flex items-center justify-center font-bold z-10">
                      {index + 1}
                    </div>
                    
                    {/* Connecting line */}
                    {index < problem.steps.length - 1 && (
                      <div className="absolute left-3 top-8 -bottom-4 w-0.5 bg-stone-300"></div>
                    )}
                    
                    {/* Step content */}
                    <div className="bg-white border border-stone-200 p-4 space-y-3 rounded-lg">
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
                      
                      {/* Why button and expandable content */}
                      {step.why && (
                        <div className="mt-4 border-t border-stone-100 pt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWhy(index);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <span>Dlaczego?</span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${expandedWhy.has(index) ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {expandedWhy.has(index) && (
                            <div className="mt-3 pl-4 border-l-2 border-stone-300">
                              <p className="text-sm text-stone-700 leading-relaxed">
                                <MathRenderer content={step.why} />
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Hint */}
                  {step.hint ? (
                    <div className="relative mt-4 md:mt-0">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        {/* Step number badge */}
                        <div className="absolute left-3 -top-3 w-7 h-7 rounded-full bg-white border-2 border-yellow-400 text-yellow-700 text-sm flex items-center justify-center font-bold shadow-md">
                          {index + 1}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-yellow-700">Wskazówka</p>
                          <p className="text-base text-yellow-800">
                            <MathRenderer content={step.hint} />
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty space for steps without hints */
                    <div className="hidden md:block"></div>
                  )}
                </div>
              ))}
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
                      
                      {/* Show MultiStepChoice after second click */}
                      {step.interactive_choice && showMultiStepSteps.has(index) && !completedInteractiveChoices.has(index) && (
                        <MultiStepChoice 
                          interactiveChoice={step.interactive_choice}
                          onComplete={() => handleInteractiveChoiceComplete(index)}
                        />
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
                      
                      {/* Why button and expandable content - shown after step is revealed */}
                      {step.why && revealedSteps.has(index) && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWhy(index);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <span>Dlaczego?</span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${expandedWhy.has(index) ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {expandedWhy.has(index) && (
                            <div className="mt-3 pl-4 border-l-2 border-stone-300">
                              <p className="text-sm text-stone-700 leading-relaxed">
                                <MathRenderer content={step.why} />
                              </p>
                            </div>
                          )}
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
            <div className="relative mt-6">
              <div className="absolute inset-0 bg-stone-200/20 blur-xl rounded-xl"></div>
              <div className="relative p-4 md:p-5 bg-white border border-stone-200 rounded-lg">
                <h3 className="text-sm md:text-base font-semibold text-stone-700 mb-3">Odpowiedź końcowa</h3>
                <div className="space-y-2">
                  {problem.solutions.map((solution, index) => (
                    <div key={index} className="text-stone-900 text-base md:text-lg font-medium text-center">
                      <MathRenderer content={solution} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Problem Suggestions - Show when problem is completed */}
          {showSolution && (
            <NextProblemSuggestion
              currentProblem={problem}
              completedProblems={completedProblems}
              onSelectProblem={onSelectProblem}
              solveDuration={solveDurationRef.current}
              problems={problems}
            />
          )}

        </div>
      </div>

      {/* Image Enlargement Modal */}
      {enlargedImage && problem.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setEnlargedImage(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={problem.image}
              alt={`Powiększony rysunek do zadania ${problem.id || 'maturalnego'}`}
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={() => setEnlargedImage(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-stone-100 transition-colors"
              aria-label="Zamknij powiększony obraz"
            >
              <svg className="w-6 h-6 text-stone-700" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemView;