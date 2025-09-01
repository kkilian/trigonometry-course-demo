import React, { useState, useEffect } from 'react';
import MathRenderer from './MathRenderer';

// Component for individual step with feedback
const StepWithFeedback = ({ step, index, stepFeedback, updateFeedback, problemId }) => {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [tempComment, setTempComment] = useState(stepFeedback?.comments || '');
  
  // Update tempComment when stepFeedback changes
  useEffect(() => {
    setTempComment(stepFeedback?.comments || '');
  }, [stepFeedback?.comments]);
  
  const handleSaveComment = () => {
    updateFeedback(problemId, 'step', index, {
      rating: stepFeedback?.rating || 'needs_improvement',
      comments: tempComment
    });
    setIsEditingComment(false);
  };

  const handleQuickRating = (rating) => {
    updateFeedback(problemId, 'step', index, {
      rating: rating,
      comments: stepFeedback?.comments || ''
    });
  };
  
  return (
    <div className="space-y-2">
      {/* Step content */}
      <div
        className={`bg-gray-900 rounded-xl p-6 transition-all ${
          stepFeedback ? 'border-l-4 ' + (
            stepFeedback.rating === 'good' ? 'border-green-500' :
            stepFeedback.rating === 'needs_improvement' ? 'border-yellow-500' :
            stepFeedback.rating === 'poor' ? 'border-red-500' : ''
          ) : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <span className="text-sm text-gray-400">Krok {index + 1}</span>
          </div>
        </div>
        
        {step.hint && (
          <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              <MathRenderer content={step.hint} />
            </p>
          </div>
        )}
        
        {step.expression && (
          <div className="mb-3 text-white">
            <MathRenderer content={step.expression} />
          </div>
        )}
        
        {step.explanation && (
          <div className="text-sm text-gray-400">
            <MathRenderer content={step.explanation} />
          </div>
        )}
      </div>
      
      {/* Feedback section - directly under the step */}
      <div className="bg-gray-800/50 rounded-lg p-4 ml-12 border-l-2 border-gray-700">
        {/* Quick rating buttons */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Ocena:</span>
          <button
            onClick={() => handleQuickRating('good')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              stepFeedback?.rating === 'good'
                ? 'bg-green-500/20 text-green-400 border border-green-500'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            ✓ OK
          </button>
          <button
            onClick={() => handleQuickRating('needs_improvement')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              stepFeedback?.rating === 'needs_improvement'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            ⚠ Problem
          </button>
          <button
            onClick={() => handleQuickRating('poor')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              stepFeedback?.rating === 'poor'
                ? 'bg-red-500/20 text-red-400 border border-red-500'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            ✗ Błąd
          </button>
        </div>

        {/* Comment section */}
        {isEditingComment ? (
          <div className="space-y-2">
            <textarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditingComment(false);
                  setTempComment(stepFeedback?.comments || '');
                }
              }}
              className="w-full p-2 bg-gray-900 text-white text-sm rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
              rows="3"
              placeholder="Dodaj uwagę do tego kroku..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveComment}
                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition"
              >
                Zapisz
              </button>
              <button
                onClick={() => {
                  setIsEditingComment(false);
                  setTempComment(stepFeedback?.comments || '');
                }}
                className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition"
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <div>
            {stepFeedback?.comments ? (
              <div 
                onClick={() => {
                  setIsEditingComment(true);
                  setTempComment(stepFeedback.comments);
                }}
                className="cursor-pointer hover:bg-gray-700/50 rounded p-2 transition"
              >
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-500">💬</span>
                  {stepFeedback.comments}
                </p>
                <p className="text-xs text-gray-500 mt-1">Kliknij aby edytować</p>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingComment(true)}
                className="text-sm text-gray-500 hover:text-yellow-400 transition flex items-center gap-2"
              >
                <span>📝</span> Dodaj uwagę
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SolutionReviewer = ({ onBack, problems: propProblems, title }) => {
  const [showList, setShowList] = useState(true);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [feedback, setFeedback] = useState({});
  const [reviewedProblems, setReviewedProblems] = useState(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  
  const problems = propProblems || [];
  const currentProblem = problems[currentProblemIndex];

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('solutionReviewerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentProblemIndex(state.currentProblemIndex || 0);
        setFeedback(state.feedback || {});
        setReviewedProblems(new Set(state.reviewedProblems || []));
      } catch (e) {
        console.error('Error loading reviewer state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      currentProblemIndex,
      feedback,
      reviewedProblems: [...reviewedProblems]
    };
    localStorage.setItem('solutionReviewerState', JSON.stringify(state));
  }, [currentProblemIndex, feedback, reviewedProblems]);

  const updateFeedback = (problemId, type, index, data) => {
    setFeedback(prev => {
      const newFeedback = { ...prev };
      if (!newFeedback[problemId]) {
        newFeedback[problemId] = { problem: null, steps: {} };
      }
      
      if (type === 'problem') {
        newFeedback[problemId].problem = {
          ...data,
          timestamp: new Date().toISOString(),
          reviewer: localStorage.getItem('reviewerName') || 'Anonymous'
        };
      } else if (type === 'step') {
        newFeedback[problemId].steps[index] = {
          ...data,
          timestamp: new Date().toISOString(),
          reviewer: localStorage.getItem('reviewerName') || 'Anonymous'
        };
      }
      
      return newFeedback;
    });
  };

  const markProblemAsReviewed = () => {
    setReviewedProblems(prev => new Set([...prev, currentProblem.id]));
  };

  const goToNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const exportFeedback = (onlyWithFeedback = true) => {
    let exportData;
    
    if (onlyWithFeedback) {
      // Export only problems that have feedback
      exportData = problems
        .filter(problem => feedback[problem.id] !== undefined)
        .map(problem => ({
          ...problem,
          feedback: feedback[problem.id]
        }));
    } else {
      // Export all problems
      exportData = problems.map(problem => ({
        ...problem,
        feedback: feedback[problem.id] || null
      }));
    }
    
    if (exportData.length === 0) {
      alert('Brak zadań z feedbackiem do eksportu');
      return;
    }
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = onlyWithFeedback ? `feedback-only-${exportData.length}-problems` : 'all-problems';
    link.download = `problems-${suffix}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const getProblemsWithFeedbackCount = () => {
    return problems.filter(problem => feedback[problem.id] !== undefined).length;
  };

  const resetReviewer = () => {
    if (window.confirm('Czy na pewno chcesz zresetować wszystkie recenzje?')) {
      setCurrentProblemIndex(0);
      setFeedback({});
      setReviewedProblems(new Set());
      setShowList(true);
      localStorage.removeItem('solutionReviewerState');
    }
  };

  const selectProblem = (index) => {
    setCurrentProblemIndex(index);
    setShowList(false);
  };

  const backToList = () => {
    setShowList(true);
  };

  const progress = (reviewedProblems.size / problems.length * 100).toFixed(1);
  const problemFeedback = feedback[currentProblem?.id];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentProblemIndex > 0) {
          setCurrentProblemIndex(currentProblemIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentProblemIndex < problems.length - 1) {
          setCurrentProblemIndex(currentProblemIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentProblemIndex, problems.length]);

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <p>Brak zadań do recenzji</p>
      </div>
    );
  }

  // Problem List View
  const ProblemListView = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Wybierz zadanie do recenzji</h2>
      <div className="grid gap-4">
        {problems.map((problem, index) => {
          const problemFeedback = feedback[problem.id];
          const hasStepFeedback = problemFeedback?.steps && Object.keys(problemFeedback.steps).length > 0;
          const isReviewed = reviewedProblems.has(problem.id);
          
          return (
            <div
              key={problem.id}
              onClick={() => selectProblem(index)}
              className="bg-gray-900 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-all border-2 border-transparent hover:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <span className="text-xs font-mono text-gray-600">{problem.id}</span>
                    {problem.topic && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        {problem.topic}
                      </span>
                    )}
                  </div>
                  <div className="text-lg text-white mb-2">
                    <MathRenderer content={problem.statement} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Kroki: {problem.steps?.length || 0}</span>
                    {hasStepFeedback && (
                      <span className="text-yellow-400">
                        ⚠ Feedback dla {Object.keys(problemFeedback.steps).length} kroków
                      </span>
                    )}
                    {problemFeedback?.problem && (
                      <span className={`${
                        problemFeedback.problem.rating === 'good' ? 'text-green-400' :
                        problemFeedback.problem.rating === 'needs_improvement' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        Zadanie: {
                          problemFeedback.problem.rating === 'good' ? 'Dobrze' :
                          problemFeedback.problem.rating === 'needs_improvement' ? 'Do poprawy' :
                          'Źle'
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {isReviewed ? (
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      ✓ Zrecenzowane
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                      Do recenzji
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{title || 'Solution Reviewer'}</h1>
              <p className="text-gray-400 mt-1">Ocena jakości rozwiązań generowanych przez AI</p>
            </div>
            <div className="flex gap-4">
              {showList && (
                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Eksportuj JSON
                </button>
              )}
              <button
                onClick={resetReviewer}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Zakończ
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Postęp: {reviewedProblems.size} / {problems.length} zadań</span>
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
      {showList ? (
        <ProblemListView />
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          {/* Back to list button */}
          <div className="mb-6">
            <button
              onClick={backToList}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l-7 7 7 7" />
              </svg>
              Powrót do listy zadań
            </button>
          </div>

          {/* Problem navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousProblem}
              disabled={currentProblemIndex === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentProblemIndex === 0 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              ← Poprzednie zadanie
            </button>
            
            <div className="text-center">
              <span className="text-sm text-gray-500">Zadanie {currentProblemIndex + 1} z {problems.length}</span>
              <span className="ml-4 text-sm font-mono text-gray-600">{currentProblem.id}</span>
              {reviewedProblems.has(currentProblem.id) && (
                <span className="ml-4 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">✓ Zrecenzowane</span>
              )}
            </div>
            
            <button
              onClick={goToNextProblem}
              disabled={currentProblemIndex === problems.length - 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentProblemIndex === problems.length - 1
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Następne zadanie →
            </button>
          </div>

        {/* Problem content */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Problem statement */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Treść zadania</h2>
              <span className="text-sm text-gray-500">{currentProblem.topic}</span>
            </div>
            <div className="text-xl text-white">
              <MathRenderer content={currentProblem.statement} />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Kroki rozwiązania</h3>
            {currentProblem.steps?.map((step, index) => {
              const stepFeedback = problemFeedback?.steps?.[index];
              
              return (
                <StepWithFeedback
                  key={index}
                  step={step}
                  index={index}
                  stepFeedback={stepFeedback}
                  updateFeedback={updateFeedback}
                  problemId={currentProblem.id}
                />
              );
            })}
          </div>

          {/* Solution */}
          {currentProblem.solutions && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Odpowiedź końcowa</h3>
              {currentProblem.solutions.map((solution, index) => (
                <div key={index} className="text-white">
                  <MathRenderer content={solution} />
                </div>
              ))}
            </div>
          )}

          {/* Problem feedback form */}
          <div className="bg-gray-900 rounded-xl p-6">
            <FeedbackForm
              title="Feedback dla całego zadania"
              currentFeedback={problemFeedback?.problem}
              onSubmit={(data) => {
                updateFeedback(currentProblem.id, 'problem', null, data);
                markProblemAsReviewed();
                goToNextProblem();
              }}
              isPrimary={true}
            />
          </div>
        </div>
      </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Eksport danych</h3>
            <p className="text-gray-400 mb-6">
              Wybierz sposób eksportu zadań do pliku JSON.
            </p>
            
            {/* Statistics */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Wszystkie zadania:</span>
                  <span className="text-gray-300">{problems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Zadania z feedbackiem:</span>
                  <span className="text-green-400 font-semibold">{getProblemsWithFeedbackCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Zadania oznaczone jako zrecenzowane:</span>
                  <span className="text-gray-300">{reviewedProblems.size}</span>
                </div>
              </div>
            </div>

            {/* Export options */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  exportFeedback(true);
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
              >
                <div className="font-semibold">📦 Eksportuj tylko z feedbackiem</div>
                <div className="text-sm text-green-200 mt-1">
                  Eksportuje {getProblemsWithFeedbackCount()} {getProblemsWithFeedbackCount() === 1 ? 'zadanie' : 'zadań'} które mają ocenę lub komentarz
                </div>
              </button>
              
              <button
                onClick={() => {
                  exportFeedback(false);
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-left"
              >
                <div className="font-semibold">📋 Eksportuj wszystkie</div>
                <div className="text-sm text-gray-400 mt-1">
                  Eksportuje wszystkie {problems.length} zadań (z feedbackiem lub bez)
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Feedback form component
const FeedbackForm = ({ title, currentFeedback, onSubmit, onCancel, isPrimary = false }) => {
  const [rating, setRating] = useState(currentFeedback?.rating || '');
  const [comments, setComments] = useState(currentFeedback?.comments || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating) {
      onSubmit({ rating, comments });
      if (!isPrimary) {
        setRating('');
        setComments('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
      
      <div className="space-y-4">
        {/* Rating selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Ocena</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setRating('good')}
              className={`p-3 rounded-lg border transition-all ${
                rating === 'good' 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              ✓ Dobrze
            </button>
            <button
              type="button"
              onClick={() => setRating('needs_improvement')}
              className={`p-3 rounded-lg border transition-all ${
                rating === 'needs_improvement' 
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              ⚠ Wymaga poprawy
            </button>
            <button
              type="button"
              onClick={() => setRating('poor')}
              className={`p-3 rounded-lg border transition-all ${
                rating === 'poor' 
                  ? 'bg-red-500/20 border-red-500 text-red-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              ✗ Źle
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Komentarz (opcjonalny)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            rows="4"
            placeholder="Dodaj szczegółowy feedback..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!rating}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              rating 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isPrimary ? 'Zapisz i następne' : 'Zapisz feedback'}
          </button>
          {!isPrimary && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Anuluj
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default SolutionReviewer;