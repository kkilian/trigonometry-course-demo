import React, { useState, useEffect, useCallback } from 'react';
import MathRenderer from './MathRenderer';
import defaultProblemsData from '../data/problems.json';

const LaTeXChecker = ({ onBack, problems: propProblems, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [problematicIds, setProblematicIds] = useState(new Set());
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [finished, setFinished] = useState(false);
  const problems = propProblems || defaultProblemsData;

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('latexCheckerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentIndex(state.currentIndex || 0);
        setProblematicIds(new Set(state.problematicIds || []));
        setDeletedIds(new Set(state.deletedIds || []));
        setReviewedIds(new Set(state.reviewedIds || []));
      } catch (e) {
        console.error('Error loading checker state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      currentIndex,
      problematicIds: [...problematicIds],
      deletedIds: [...deletedIds],
      reviewedIds: [...reviewedIds]
    };
    localStorage.setItem('latexCheckerState', JSON.stringify(state));
  }, [currentIndex, problematicIds, deletedIds, reviewedIds]);

  const currentProblem = problems[currentIndex];
  const progress = ((reviewedIds.size / problems.length) * 100).toFixed(1);

  const markAsOk = useCallback(() => {
    const newReviewed = new Set(reviewedIds);
    newReviewed.add(currentProblem.id);
    setReviewedIds(newReviewed);

    // Remove from problematic and deleted if it was there
    const newProblematic = new Set(problematicIds);
    newProblematic.delete(currentProblem.id);
    setProblematicIds(newProblematic);
    
    const newDeleted = new Set(deletedIds);
    newDeleted.delete(currentProblem.id);
    setDeletedIds(newDeleted);

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, currentProblem, problematicIds, deletedIds, problems.length, reviewedIds]);

  const markAsProblematic = useCallback(() => {
    const newReviewed = new Set(reviewedIds);
    newReviewed.add(currentProblem.id);
    setReviewedIds(newReviewed);

    const newProblematic = new Set(problematicIds);
    newProblematic.add(currentProblem.id);
    setProblematicIds(newProblematic);
    
    // Remove from deleted if it was there
    const newDeleted = new Set(deletedIds);
    newDeleted.delete(currentProblem.id);
    setDeletedIds(newDeleted);

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, currentProblem, problematicIds, deletedIds, problems.length, reviewedIds]);

  const markAsDeleted = useCallback(() => {
    const newReviewed = new Set(reviewedIds);
    newReviewed.add(currentProblem.id);
    setReviewedIds(newReviewed);

    const newDeleted = new Set(deletedIds);
    newDeleted.add(currentProblem.id);
    setDeletedIds(newDeleted);
    
    // Remove from problematic if it was there
    const newProblematic = new Set(problematicIds);
    newProblematic.delete(currentProblem.id);
    setProblematicIds(newProblematic);

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, currentProblem, problematicIds, deletedIds, problems.length, reviewedIds]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFinished(false);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFinished(false);
    }
  }, [currentIndex, problems.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (finished) return;
      
      switch (e.key) {
        case '1':
          e.preventDefault();
          markAsOk();
          break;
        case '2':
          e.preventDefault();
          markAsProblematic();
          break;
        case '3':
          e.preventDefault();
          markAsDeleted();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [finished, markAsOk, markAsProblematic, markAsDeleted, goToPrevious, goToNext]);

  const copyProblematicToClipboard = () => {
    const problemsList = [...problematicIds].join('\n');
    navigator.clipboard.writeText(problemsList).then(() => {
      alert('Lista problematycznych ID skopiowana do schowka!');
    });
  };
  
  const copyDeletedToClipboard = () => {
    const deletedList = [...deletedIds].join('\n');
    navigator.clipboard.writeText(deletedList).then(() => {
      alert('Lista ID do usunięcia skopiowana do schowka!');
    });
  };

  const resetChecker = () => {
    setCurrentIndex(0);
    setProblematicIds(new Set());
    setDeletedIds(new Set());
    setReviewedIds(new Set());
    setFinished(false);
    localStorage.removeItem('latexCheckerState');
  };

  const continueChecking = () => {
    // Find first unreviewed problem
    const unreviewed = problems.findIndex(p => !reviewedIds.has(p.id));
    if (unreviewed !== -1) {
      setCurrentIndex(unreviewed);
      setFinished(false);
    }
  };

  // Summary view
  if (finished) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Podsumowanie sprawdzania</h1>
          
          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <p className="text-gray-400 mb-2">Sprawdzone zadania</p>
                <p className="text-3xl font-bold text-white">{reviewedIds.size} / {problems.length}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Błędny LaTeX</p>
                <p className="text-3xl font-bold text-orange-500">{problematicIds.size}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Do usunięcia</p>
                <p className="text-3xl font-bold text-red-500">{deletedIds.size}</p>
              </div>
            </div>

            {problematicIds.size > 0 && (
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-4">Zadania z błędnym LaTeX:</h3>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 max-h-64 overflow-y-auto mb-4">
                  {[...problematicIds].map(id => (
                    <div key={id} className="py-1">{id}</div>
                  ))}
                </div>
                <button
                  onClick={copyProblematicToClipboard}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Kopiuj listę błędnych ID
                </button>
              </div>
            )}
            
            {deletedIds.size > 0 && (
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Zadania do usunięcia:</h3>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 max-h-64 overflow-y-auto mb-4">
                  {[...deletedIds].map(id => (
                    <div key={id} className="py-1">{id}</div>
                  ))}
                </div>
                <button
                  onClick={copyDeletedToClipboard}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Kopiuj listę ID do usunięcia
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetChecker}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Rozpocznij od nowa
            </button>
            {reviewedIds.size < problems.length && (
              <button
                onClick={continueChecking}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Kontynuuj sprawdzanie
              </button>
            )}
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Powrót do kursu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main checker view
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{title || 'LaTeX Checker'}</h1>
              <p className="text-gray-400 mt-1">Sprawdzanie poprawności renderowania</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Zakończ
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Postęp: {reviewedIds.size} / {problems.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Problem info */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Zadanie {currentIndex + 1} z {problems.length}</span>
              <span className="ml-4 text-sm font-mono text-gray-600">{currentProblem.id}</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentProblem.topic}
            </div>
          </div>

          {/* Statement display */}
          <div className="bg-gray-900 rounded-2xl p-12 mb-8 min-h-[300px] flex items-center justify-center">
            <div className="text-2xl md:text-3xl text-white text-center leading-relaxed">
              <MathRenderer content={currentProblem.statement || ''} />
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-4 mb-8 justify-center">
            {reviewedIds.has(currentProblem.id) && (
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                deletedIds.has(currentProblem.id)
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : problematicIds.has(currentProblem.id) 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {deletedIds.has(currentProblem.id) 
                  ? '✗ Do usunięcia' 
                  : problematicIds.has(currentProblem.id) 
                  ? '⚠ Błędny LaTeX' 
                  : '✓ OK'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={markAsOk}
              className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <div className="text-2xl mb-2">✓</div>
              <div className="font-semibold">OK</div>
              <div className="text-sm opacity-75 mt-1">Naciśnij 1</div>
            </button>
            
            <button
              onClick={markAsProblematic}
              className="p-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="text-2xl mb-2">⚠</div>
              <div className="font-semibold">LaTeX źle</div>
              <div className="text-sm opacity-75 mt-1">Naciśnij 2</div>
            </button>
            
            <button
              onClick={markAsDeleted}
              className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="text-2xl mb-2">🗑</div>
              <div className="font-semibold">Usuń zadanie</div>
              <div className="text-sm opacity-75 mt-1">Naciśnij 3</div>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentIndex === 0 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              ← Poprzednie (←)
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentIndex === problems.length - 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentIndex === problems.length - 1
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Pomiń (→)
            </button>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="mt-8 text-center text-sm text-gray-600">
            Skróty klawiszowe: 1 = OK | 2 = LaTeX źle | 3 = Usuń | ← = Wstecz | → = Pomiń
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaTeXChecker;