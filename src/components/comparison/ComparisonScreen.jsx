import React from 'react';
import MathRenderer from '../MathRenderer';

/**
 * Ekran z listą zadań dostępnych do porównania
 * Wyświetla tylko zadania które istnieją w obu plikach JSON (test1.json i test2.json)
 */
const ComparisonScreen = ({ problems1, problems2, onSelectProblem, onBack }) => {
  // Find common problems (same ID in both datasets)
  const commonProblems = problems1?.filter(p1 =>
    problems2?.some(p2 => p2.id === p1.id)
  ) || [];

  if (commonProblems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
                </svg>
                Powrót
              </button>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight">
              Porównanie Rozwiązań
            </h1>
            <p className="text-stone-600 mt-4">
              Brak zadań dostępnych do porównania. Upewnij się, że oba modele mają zadania z tymi samymi ID.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectProblem = (index) => {
    if (onSelectProblem) {
      onSelectProblem(index);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
              </svg>
              Powrót
            </button>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight">
            Porównanie Rozwiązań
          </h1>
          <p className="text-stone-600 mt-4">
            Wybierz zadanie aby porównać rozwiązania z różnych modeli AI side-by-side
          </p>
          <div className="text-sm text-stone-500 mt-2">
            Dostępne zadania: {commonProblems.length}
          </div>
        </div>

        {/* Info boxes */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Model 1</h3>
                <p className="text-sm text-blue-800">
                  Podejście klasyczne z naciskiem na systematyczne kroki i standardowe wzory
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-1">Model 2</h3>
                <p className="text-sm text-green-800">
                  Podejście alternatywne z fokusem na intuicję geometryczną i eleganckie metody
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Problems list */}
        <div className="space-y-4">
          {commonProblems.map((problem, index) => (
            <button
              key={problem.id}
              onClick={() => handleSelectProblem(index)}
              className="w-full text-left p-6 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:bg-stone-50 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-stone-700 font-semibold">
                      Zadanie {index + 1}
                    </span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {problem.topic}
                    </span>
                  </div>

                  <div className="text-stone-900 text-base leading-relaxed">
                    <MathRenderer content={problem.statement} />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-xs text-stone-500 mb-1">Kroki</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-700 font-medium">
                        {problems1.find(p => p.id === problem.id)?.steps?.length || 0}
                      </div>
                      <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-700 font-medium">
                        {problems2.find(p => p.id === problem.id)?.steps?.length || 0}
                      </div>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-stone-500">
          <p>
            Zadania są dopasowywane na podstawie identycznych ID.
            Porównaj różne podejścia do rozwiązywania tych samych problemów.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonScreen;