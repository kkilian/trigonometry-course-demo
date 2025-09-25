import React, { useMemo, useEffect, useState } from 'react';
import MathRenderer from '../../../components/MathRenderer';
import { getSessionTitle, getSessionStorageKey } from '../config/sessions.config';

/**
 * Generyczny komponent do obsługi wszystkich sesji maturalnych
 * Zastępuje 5 zduplikowanych komponentów (Marzec2025Podstawa, Kwiecien2025Podstawa, itd.)
 */
const MaturaSession = ({
  sessionConfig,
  problems,
  onSelectProblem,
  completedProblems = new Set(),
  onBack
}) => {
  const [suggestedProblems, setSuggestedProblems] = useState([]);
  const [showAllProblems, setShowAllProblems] = useState(() => {
    try {
      const storageKey = getSessionStorageKey(sessionConfig.id, 'view');
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      console.error('Error loading view preference:', e);
      return false;
    }
  });

  // Load suggested problems from localStorage
  useEffect(() => {
    const storageKey = getSessionStorageKey(sessionConfig.id, 'suggested');
    const savedSuggestions = localStorage.getItem(storageKey);
    if (savedSuggestions) {
      try {
        const suggestions = JSON.parse(savedSuggestions);
        // Validate that these problems still exist and aren't completed
        const validSuggestions = suggestions
          .map(id => problems?.find(p => p.id === id))
          .filter(p => p && !completedProblems.has(p.id))
          .slice(0, 2);
        setSuggestedProblems(validSuggestions);
      } catch (e) {
        console.error('Error loading suggested problems:', e);
      }
    }
  }, [problems, completedProblems, sessionConfig.id]);

  // Save view preference to localStorage
  useEffect(() => {
    try {
      const storageKey = getSessionStorageKey(sessionConfig.id, 'view');
      localStorage.setItem(storageKey, JSON.stringify(showAllProblems));
    } catch (e) {
      console.error('Error saving view preference:', e);
    }
  }, [showAllProblems, sessionConfig.id]);

  // Determine which problems to show based on progress
  const problemsToShow = useMemo(() => {
    if (!problems || problems.length === 0) return [];

    // First visit - no completed problems
    if (completedProblems.size === 0) {
      return [problems[0]]; // Show only the first problem
    }

    // Return visit - show suggested problems if available
    if (suggestedProblems.length > 0) {
      return suggestedProblems;
    }

    // Fallback - find next uncompleted problems
    const uncompleted = problems
      .filter(p => !completedProblems.has(p.id))
      .slice(0, 2);

    return uncompleted.length > 0 ? uncompleted : [problems[0]];
  }, [problems, completedProblems, suggestedProblems]);

  const handleStartProblem = (problem) => {
    if (onSelectProblem) {
      onSelectProblem(problem);
    }
  };

  const getHeaderText = () => {
    if (completedProblems.size === 0) {
      return "Zacznij tutaj";
    }
    return "Sugerowane zadania";
  };

  if (!problemsToShow || problemsToShow.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600">Brak dostępnych zadań</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  const sessionTitle = getSessionTitle(sessionConfig.id);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Back Button */}
          {onBack && (
            <div className="mb-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
                </svg>
                Powrót
              </button>
            </div>
          )}

          {/* Header */}
          <header>
            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
              {sessionTitle}
            </h1>
            {/* Progress Bar */}
            {problems && problems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-stone-600">
                  <span>Postęp</span>
                  <span>{completedProblems.size} z {problems.length} zadań</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, #facc15, #f97316)',
                      width: `${problems.length > 0 ? (completedProblems.size / problems.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAllProblems(false)}
                className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !showAllProblems
                    ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
                }`}
              >
                Sugerowane zadania
              </button>
              <button
                onClick={() => setShowAllProblems(true)}
                className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
                  showAllProblems
                    ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
                }`}
              >
                Wszystkie zadania ({problems.length})
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="space-y-8">
          {showAllProblems ? (
            // All problems list view
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Wszystkie zadania</h3>
                <p className="text-stone-600 text-sm">
                  Wybierz dowolne zadanie z pełnej listy ({problems.length} zadań)
                </p>
              </div>
              <div className="space-y-3 px-4 md:px-8">
                {problems.map((problem, index) => {
                  // Extract display number from problem ID
                  const displayNumber = problem.id.match(/#\d+-\w+-([\d.]+)-/)?.[1] ||
                                       problem.id.match(/#\d+-\w+-(\d+)/)?.[1] ||
                                       (index + 1);
                  const points = problem.id.match(/(\d+p)$/)?.[1] || '2p';

                  return (
                    <button
                      key={problem.id}
                      onClick={() => handleStartProblem(problem)}
                      className={`w-full text-left p-4 md:p-6 rounded-lg transition-all group relative ${
                        completedProblems.has(problem.id)
                          ? 'bg-green-50 border border-green-200 hover:border-green-300'
                          : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-stone-700 font-semibold text-sm md:text-base">
                              #{displayNumber}
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {problem.topic || 'Zadanie'}
                            </span>
                            {completedProblems.has(problem.id) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Ukończone
                              </span>
                            )}
                          </div>
                          <div className="text-stone-900 text-sm md:text-base leading-relaxed">
                            <MathRenderer content={problem.statement || ''} />
                            {problem.quiz && (
                              <>
                                <div className="border-t border-stone-300/70 my-2"></div>
                                <div className="text-stone-700">
                                  <MathRenderer content={problem.quiz || ''} />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
                          <div className="bg-stone-100 px-2 py-1 rounded-full">
                            <span className="text-xs text-stone-600">
                              {problem.steps?.length || 0} kroków
                            </span>
                          </div>
                          <div className="bg-yellow-100 px-2 py-1 rounded-full">
                            <span className="text-xs text-yellow-700 font-medium">
                              0-{points}
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                            <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Suggested problems view
            <>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  {getHeaderText()}
                </h3>
                <p className="text-stone-600">
                  {completedProblems.size === 0
                    ? 'Rozpocznij od pierwszego zadania'
                    : 'Kontynuuj z rekomendowanymi zadaniami'}
                </p>
              </div>

              <div className="space-y-6 px-4 md:px-8">
                {problemsToShow.map((problem, index) => {
                  const displayNumber = problem.id.match(/#\d+-\w+-([\d.]+)-/)?.[1] ||
                                       problem.id.match(/#\d+-\w+-(\d+)/)?.[1] ||
                                       (index + 1);
                  const points = problem.id.match(/(\d+p)$/)?.[1] || '2p';

                  return (
                    <button
                      key={problem.id}
                      onClick={() => handleStartProblem(problem)}
                      className={`w-full text-left p-6 md:p-8 rounded-xl transition-all group hover:scale-[1.01] ${
                        completedProblems.has(problem.id)
                          ? 'bg-green-50 border-2 border-green-200 hover:border-green-300'
                          : 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {problem.topic || 'Zadanie'}
                            </span>
                          </div>
                          <div className="text-stone-900 text-base md:text-lg leading-relaxed font-medium">
                            <MathRenderer content={problem.statement || ''} />
                            {problem.quiz && (
                              <>
                                <div className="border-t border-stone-300/70 my-3"></div>
                                <div className="text-stone-700">
                                  <MathRenderer content={problem.quiz || ''} />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 flex-shrink-0">
                          {completedProblems.has(problem.id) && (
                            <div className="flex items-center gap-1 text-stone-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">Ukończone</span>
                            </div>
                          )}
                          <div className="bg-stone-100 px-3 py-1 rounded-full">
                            <span className="text-xs md:text-sm text-stone-600">
                              {problem.steps?.length || 0} kroków
                            </span>
                          </div>
                          <div className="bg-yellow-100 px-3 py-1 rounded-full">
                            <span className="text-xs md:text-sm text-yellow-700 font-medium">
                              0-{points}
                            </span>
                          </div>
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Button to show all problems */}
              <div className="text-center pt-8">
                <button
                  onClick={() => setShowAllProblems(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-full transition-colors"
                >
                  Zobacz wszystkie zadania
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaturaSession;