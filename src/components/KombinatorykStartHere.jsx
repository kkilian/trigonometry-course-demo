import React, { useMemo, useEffect, useState } from 'react';
import MathRenderer from './MathRenderer';

const KombinatorykStartHere = ({
  problems,
  onSelectProblem,
  completedProblems = new Set(),
  onBack
}) => {
  const [suggestedProblems, setSuggestedProblems] = useState([]);
  const [showAllProblems, setShowAllProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('kombinatoryka-show-all-problems');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      console.error('Error loading view preference:', e);
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load suggested problems from localStorage
  useEffect(() => {
    const savedSuggestions = localStorage.getItem('kombinatoryka-suggested-problems');
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
  }, [problems, completedProblems]);

  // Save view preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kombinatoryka-show-all-problems', JSON.stringify(showAllProblems));
    } catch (e) {
      console.error('Error saving view preference:', e);
    }
  }, [showAllProblems]);

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

  // Filter problems based on search query
  const filteredProblems = useMemo(() => {
    let result = problems;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = problems.filter(problem => {
        const statement = problem.statement?.toLowerCase() || '';
        return statement.includes(query);
      });
      console.log('Search query:', query, 'Found:', result.length, 'out of', problems.length);
    } else {
      console.log('No search query, returning all problems:', problems.length);
    }

    // Remove duplicates based on problem ID
    const seen = new Set();
    const deduplicated = result.filter(problem => {
      if (seen.has(problem.id)) {
        return false;
      }
      seen.add(problem.id);
      return true;
    });

    if (deduplicated.length !== result.length) {
      console.log('Removed duplicates:', result.length, '->', deduplicated.length);
    }

    return deduplicated;
  }, [problems, searchQuery]);

  const handleStartProblem = (problem) => {
    if (onSelectProblem) {
      onSelectProblem(problem);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
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
              Kombinatoryka - podstawy
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

            {/* Toggle Buttons with Search - SOTA FUNCTIONALITY */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAllProblems(false);
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !showAllProblems
                    ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
                }`}
              >
                Sugerowane zadania
              </button>
              <button
                onClick={() => {
                  setShowAllProblems(true);
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
                  showAllProblems && !showSearch
                    ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
                }`}
              >
                Wszystkie zadania ({problems.length})
              </button>

              {/* Search Button/Input - transformuje się po kliknięciu */}
              {showAllProblems && !showSearch && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="px-8 py-2.5 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 bg-transparent text-stone-500 border border-transparent hover:text-stone-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Szukaj
                </button>
              )}

              {/* Search Input - pojawia się w miejscu przycisku */}
              {showAllProblems && showSearch && (
                <div className="relative animate-fade-in">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      console.log('Input changed to:', e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Szukaj w treści zadań..."
                    className="w-80 px-4 py-2.5 pr-10 text-sm border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    autoFocus
                  />
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone-100 transition-colors"
                    title="Zamknij wyszukiwanie"
                  >
                    <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
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
                  {searchQuery ? (
                    <>
                      Znaleziono <span className="font-semibold text-orange-600">{filteredProblems.length}</span> z {problems.length} zadań
                    </>
                  ) : (
                    `Wybierz dowolne zadanie z pełnej listy (${problems.length} zadań)`
                  )}
                </p>
              </div>

              {filteredProblems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-stone-600 mb-2">Nie znaleziono zadań</p>
                  <p className="text-stone-500 text-sm">Spróbuj innego zapytania</p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Wyczyść wyszukiwanie
                  </button>
                </div>
              ) : (
                <div className="space-y-3 px-4 md:px-8">
                  {filteredProblems.map((problem, index) => (
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
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
                          <div className="bg-stone-100 px-2 py-1 rounded-full">
                            <span className="text-xs text-stone-600">
                              {problem.steps?.length || 0} kroków
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
              )}
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

export default KombinatorykStartHere;