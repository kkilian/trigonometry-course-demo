import React, { useState, useEffect } from 'react';
import ComparisonProblemView from './ComparisonProblemView';

/**
 * Główny komponent do porównywania rozwiązań side-by-side
 * Desktop: dwie kolumny obok siebie
 * Mobile: przełączanie między modelami
 */
const ComparisonView = ({ problem1, problem2, onBack, onSelectProblem, problems, currentIndex }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileModel, setActiveMobileModel] = useState(1);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Scroll to top when component mounts or problem changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [problem1?.id, problem2?.id]);

  if (!problem1 || !problem2) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Nie można załadować zadań do porównania</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
            >
              Powrót
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasNextProblem = currentIndex !== null && problems && currentIndex < problems.length - 1;
  const hasPrevProblem = currentIndex !== null && currentIndex > 0;

  const handleNextProblem = () => {
    if (hasNextProblem && onSelectProblem) {
      onSelectProblem(currentIndex + 1);
    }
  };

  const handlePrevProblem = () => {
    if (hasPrevProblem && onSelectProblem) {
      onSelectProblem(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
                </svg>
                Powrót do listy
              </button>
            )}

            {/* Title */}
            <div className="flex-1 text-center">
              <h1 className="text-xl md:text-2xl font-bold text-stone-900">
                Porównanie Rozwiązań
              </h1>
              {currentIndex !== null && problems && (
                <p className="text-sm text-stone-600 mt-1">
                  Zadanie {currentIndex + 1} z {problems.length}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevProblem}
                disabled={!hasPrevProblem}
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
              >
                ← Poprzednie
              </button>
              <button
                onClick={handleNextProblem}
                disabled={!hasNextProblem}
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
              >
                Następne →
              </button>
            </div>
          </div>

          {/* Mobile model selector */}
          {isMobile && (
            <div className="mt-4">
              <div className="flex bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveMobileModel(1)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeMobileModel === 1
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Model 1
                </button>
                <button
                  onClick={() => setActiveMobileModel(2)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeMobileModel === 2
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Model 2
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {isMobile ? (
          /* Mobile: Single column with switcher */
          <div className="space-y-4">
            <ComparisonProblemView
              problem={activeMobileModel === 1 ? problem1 : problem2}
              modelName={activeMobileModel === 1 ? "Model 1" : "Model 2"}
              className="border border-stone-200"
            />
          </div>
        ) : (
          /* Desktop: Side-by-side columns */
          <div className="grid md:grid-cols-2 gap-6">
            <ComparisonProblemView
              problem={problem1}
              modelName="Model 1"
              className="border border-stone-200"
            />
            <ComparisonProblemView
              problem={problem2}
              modelName="Model 2"
              className="border border-stone-200"
            />
          </div>
        )}

        {/* Bottom navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handlePrevProblem}
            disabled={!hasPrevProblem}
            className="px-6 py-3 bg-stone-200 hover:bg-stone-300 disabled:bg-stone-100 disabled:cursor-not-allowed text-stone-700 disabled:text-stone-400 font-medium rounded-lg transition-colors"
          >
            ← Poprzednie zadanie
          </button>
          <button
            onClick={handleNextProblem}
            disabled={!hasNextProblem}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-stone-100 disabled:cursor-not-allowed text-white disabled:text-stone-400 font-medium rounded-lg transition-colors"
          >
            Następne zadanie →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;