import React, { useMemo, useEffect, useState } from 'react';
import MathRenderer from './MathRenderer';

const MaturaStartHere = ({
  problems,
  onSelectProblem,
  completedProblems = new Set(),
  onBack
}) => {
  const [suggestedProblems, setSuggestedProblems] = useState([]);
  const [showAllProblems, setShowAllProblems] = useState(false);

  // Problems already have ID in correct format, just extract points for display
  const transformedProblems = useMemo(() => {
    if (!problems) return [];

    return problems.map(problem => {
      // Extract points from ID format: #2025-marzec-1-2p -> 0-2p
      const match = problem.id.match(/#\d+-\w+-[\d.]+-([\d]+p)/);
      const points = match ? `0-${match[1]}` : '0-2p';

      return {
        ...problem,
        topic: problem.id, // Use ID directly as topic
        pointsDisplay: points
      };
    });
  }, [problems]);

  // Load suggested problems from localStorage
  useEffect(() => {
    const savedSuggestions = localStorage.getItem('matura-suggested-problems');
    if (savedSuggestions) {
      try {
        const suggestions = JSON.parse(savedSuggestions);
        // Validate that these problems still exist and aren't completed
        const validSuggestions = suggestions
          .map(id => transformedProblems?.find(p => p.id === id))
          .filter(p => p && !completedProblems.has(p.id))
          .slice(0, 2);
        setSuggestedProblems(validSuggestions);
      } catch (e) {
        console.error('Error loading suggested problems:', e);
      }
    }
  }, [transformedProblems, completedProblems]);

  // Determine which problems to show based on progress
  const problemsToShow = useMemo(() => {
    if (!transformedProblems || transformedProblems.length === 0) return [];

    // First visit - no completed problems
    if (completedProblems.size === 0) {
      return [transformedProblems[0]]; // Show only the first problem
    }

    // Return visit - show suggested problems if available
    if (suggestedProblems.length > 0) {
      return suggestedProblems;
    }

    // Fallback - find next uncompleted problems
    const uncompleted = transformedProblems
      .filter(p => !completedProblems.has(p.id))
      .slice(0, 2);

    return uncompleted.length > 0 ? uncompleted : [transformedProblems[0]];
  }, [transformedProblems, completedProblems, suggestedProblems]);

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
              Matura - Marzec 2025
            </h1>
            {/* Progress Bar */}
            {transformedProblems && transformedProblems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-stone-600">
                  <span>Postęp</span>
                  <span>{completedProblems.size} z {transformedProblems.length} zadań</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, #facc15, #f97316)',
                      width: `${transformedProblems.length > 0 ? (completedProblems.size / transformedProblems.length) * 100 : 0}%`
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
                Wszystkie zadania ({transformedProblems.length})
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
                  Wybierz dowolne zadanie z pełnej listy ({transformedProblems.length} zadań)
                </p>
              </div>
              <div className="space-y-3 px-4 md:px-8">
                {transformedProblems.map((problem, index) => (
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
                          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          {problem.topic && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {problem.topic}
                            </span>
                          )}
                          {completedProblems.has(problem.id) && (
                            <div className="flex items-center gap-1 text-green-700">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium">Ukończone</span>
                            </div>
                          )}
                        </div>
                        <div className="text-stone-900 text-sm md:text-base leading-relaxed">
                          <MathRenderer content={problem.statement || ''} />
                          {problem.image && (
                            <div className="flex items-center gap-1 mt-2 text-blue-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 4h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                              </svg>
                              <span className="text-xs font-medium">Z rysunkiem</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
                        <div className="bg-stone-100 px-2 py-1 rounded-full">
                          <span className="text-xs text-stone-600">
                            {problem.steps?.length || 0} kroków
                          </span>
                        </div>
                        <div className="bg-stone-100 px-2 py-1 rounded-full">
                          <span className="text-xs text-stone-600">
                            {problem.pointsDisplay || '0-2p'}
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                          <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Suggested problems view (existing logic)
            <>
              {problemsToShow.length === 1 ? (
                // First visit - single problem card
                <div className="px-4 md:px-8">
                  {/* Informacja dla nowych użytkowników */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-2">Zacznij tutaj</h3>
                    <p className="text-stone-600 text-sm">
                      Zacznij od tego zadania, a resztę dobierzemy specjalnie dla Ciebie
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartProblem(problemsToShow[0])}
                    className={`w-full text-left p-6 md:p-10 rounded-xl transition-all group relative ${
                      completedProblems.has(problemsToShow[0].id)
                        ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300 shadow-lg shadow-orange-200/40'
                        : 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 animate-pulse-border'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-stone-900 text-lg md:text-2xl leading-relaxed font-medium">
                          <MathRenderer content={problemsToShow[0].statement || ''} />
                          {problemsToShow[0].image && (
                            <div className="flex items-center gap-2 mt-3 text-blue-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 4h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                              </svg>
                              <span className="text-sm font-medium">Zadanie z rysunkiem</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 flex-shrink-0">
                        {completedProblems.has(problemsToShow[0].id) && (
                          <div className="flex items-center gap-2 text-stone-700">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Ukończone</span>
                          </div>
                        )}
                        <div className="bg-stone-100 px-4 py-2 rounded-full">
                          <span className="text-sm md:text-base text-stone-600">
                            {problemsToShow[0].steps?.length || 0} kroków
                          </span>
                        </div>
                        <div className="bg-stone-100 px-4 py-2 rounded-full">
                          <span className="text-sm md:text-base text-stone-600">
                            {problemsToShow[0].pointsDisplay || '0-2p'}
                          </span>
                        </div>
                        <div className="hidden md:block text-sm text-stone-500 font-mono">
                          {problemsToShow[0].id}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                          <svg className="w-5 h-5 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                // Return visit - two suggested problems
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-2">{getHeaderText()}</h3>
                    <p className="text-stone-600 text-sm">Możesz też zacząć od jednego z tych zadań</p>
                  </div>
                  <div className="space-y-4 px-4 md:px-8">
                    {problemsToShow.map((problem, index) => (
                      <button
                        key={problem.id}
                        onClick={() => handleStartProblem(problem)}
                        className={`w-full text-left p-6 md:p-8 rounded-xl transition-all group relative ${
                          completedProblems.has(problem.id)
                            ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300 shadow-lg shadow-orange-200/40'
                            : index === 0
                              ? 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 animate-pulse-border'
                              : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {problem.topic || 'Zadanie'}
                              </span>
                            </div>
                            <div className="text-stone-900 text-base md:text-lg leading-relaxed font-medium">
                              <MathRenderer content={problem.statement || ''} />
                              {problem.image && (
                                <div className="flex items-center gap-1 mt-2 text-blue-600">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 4h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                  </svg>
                                  <span className="text-xs font-medium">Z rysunkiem</span>
                                </div>
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
                            <div className="bg-stone-100 px-3 py-1 rounded-full">
                              <span className="text-xs md:text-sm text-stone-600">
                                {problem.pointsDisplay || '0-2p'}
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                              <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default MaturaStartHere;