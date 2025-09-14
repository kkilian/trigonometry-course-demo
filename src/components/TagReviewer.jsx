import React, { useState, useEffect, useCallback } from 'react';
import MathRenderer from './MathRenderer';
import taggedProblems from '../data/kombinatoryka-problems.json';
import originalProblems from '../data/kombinatoryka-problems.json';

const categories = [
  { value: "przeliczanie_jednostek", label: "Przeliczanie jednostek" },
  { value: "trojkaty_prostokatne", label: "Trójkąty prostokątne" },
  { value: "uklad_wspolrzednych", label: "Układ współrzędnych" },
  { value: "cwiartki_ukladu", label: "Ćwiartki układu" },
  { value: "upraszczanie_wyrazen", label: "Upraszczanie wyrażeń" },
  { value: "rownania_trygonometryczne", label: "Równania trygonometryczne" },
  { value: "dowody_tozsamosci", label: "Dowody tożsamości" },
  { value: "ciagi_liczbowe", label: "Ciągi liczbowe" }
];

const stepOperations = [
  { value: "przypomnienie_wzoru", label: "Przypomnienie wzoru" },
  { value: "podstawienie_wartosci", label: "Podstawienie wartości" },
  { value: "przeksztalcenie_algebraiczne", label: "Przekształcenie algebraiczne" },
  { value: "skracanie_ulamka", label: "Skracanie ułamka" },
  { value: "obliczenie_wartosci", label: "Obliczenie wartości" },
  { value: "uproszczenie_wyrazenia", label: "Uproszczenie wyrażenia" },
  { value: "analiza_przypadkow", label: "Analiza przypadków" },
  { value: "identyfikacja_elementu", label: "Identyfikacja elementu" },
  { value: "sprawdzenie_warunku", label: "Sprawdzenie warunku" },
  { value: "znalezienie_wzorca", label: "Znalezienie wzorca" },
  { value: "twierdzenie_pitagorasa", label: "Twierdzenie Pitagorasa" },
  { value: "tozsamosc_trygonometryczna", label: "Tożsamość trygonometryczna" },
  { value: "wzor_redukcyjny", label: "Wzór redukcyjny" },
  { value: "definicja_funkcji", label: "Definicja funkcji" },
  { value: "rozklad_wyrazenia", label: "Rozkład wyrażenia" },
  { value: "weryfikacja_wyniku", label: "Weryfikacja wyniku" },
  { value: "interpretacja_geometryczna", label: "Interpretacja geometryczna" }
];

const StarRating = ({ rating, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          className={`text-2xl transition-colors ${!readonly && 'cursor-pointer'}`}
        >
          <span className={
            star <= (hover || rating) 
              ? "text-yellow-400" 
              : "text-gray-700"
          }>
            {star <= (hover || rating) ? '★' : '☆'}
          </span>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-400">
        ({rating}/5)
      </span>
    </div>
  );
};

const TagReviewer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedProblems, setReviewedProblems] = useState({});
  const [editedTags, setEditedTags] = useState({});
  const [finished, setFinished] = useState(false);

  // Get full problem data by merging tagged with original
  const getFullProblem = (taggedProblem) => {
    const original = originalProblems.find(p => p.id === taggedProblem.id);
    return {
      ...original,
      ...taggedProblem,
      fullSteps: original?.steps || []
    };
  };

  const currentProblem = taggedProblems[currentIndex];
  const fullProblem = currentProblem ? getFullProblem(currentProblem) : null;
  const currentTags = editedTags[currentProblem?.id] || currentProblem?.tags || {};
  const currentStepOps = editedTags[currentProblem?.id]?.stepOperations || 
                         currentProblem?.steps?.map(s => s.operation) || [];

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem('tagReviewerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentIndex(state.currentIndex || 0);
        setReviewedProblems(state.reviewedProblems || {});
        setEditedTags(state.editedTags || {});
      } catch (e) {
        console.error('Error loading state:', e);
      }
    }
  }, []);

  // Save state
  useEffect(() => {
    const state = {
      currentIndex,
      reviewedProblems,
      editedTags
    };
    localStorage.setItem('tagReviewerState', JSON.stringify(state));
  }, [currentIndex, reviewedProblems, editedTags]);

  const handleTagChange = (field, value) => {
    setEditedTags(prev => ({
      ...prev,
      [currentProblem.id]: {
        ...currentTags,
        stepOperations: currentStepOps,
        [field]: value
      }
    }));
  };

  const handleStepOperationChange = (stepIndex, operation) => {
    const newOps = [...currentStepOps];
    newOps[stepIndex] = operation;
    setEditedTags(prev => ({
      ...prev,
      [currentProblem.id]: {
        ...currentTags,
        stepOperations: newOps
      }
    }));
  };

  const markAsApproved = useCallback(() => {
    setReviewedProblems(prev => ({
      ...prev,
      [currentProblem.id]: 'approved'
    }));

    if (currentIndex < taggedProblems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, currentProblem]);

  const markAsNeedsRevision = useCallback(() => {
    setReviewedProblems(prev => ({
      ...prev,
      [currentProblem.id]: 'needs-revision'
    }));

    if (currentIndex < taggedProblems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, currentProblem]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < taggedProblems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const exportReviewedTags = () => {
    const exportData = taggedProblems.map(problem => {
      const finalTags = editedTags[problem.id] || problem.tags;
      const stepOps = editedTags[problem.id]?.stepOperations || 
                     problem.steps.map(s => s.operation);
      
      return {
        ...problem,
        tags: finalTags,
        steps: problem.steps.map((step, idx) => ({
          ...step,
          operation: stepOps[idx]
        })),
        reviewStatus: reviewedProblems[problem.id] || 'not-reviewed'
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviewed-tags.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = taggedProblems.length;
    const reviewed = Object.keys(reviewedProblems).length;
    const approved = Object.values(reviewedProblems).filter(v => v === 'approved').length;
    const needsRevision = Object.values(reviewedProblems).filter(v => v === 'needs-revision').length;
    return { total, reviewed, approved, needsRevision };
  };

  const stats = getStats();
  const progress = ((stats.reviewed / stats.total) * 100).toFixed(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault();
        markAsApproved();
      }
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        markAsNeedsRevision();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, markAsApproved, markAsNeedsRevision, goToPrevious, goToNext]);

  if (finished) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Review Complete! 🎉</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
              <div className="text-gray-400">Approved</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">{stats.needsRevision}</div>
              <div className="text-gray-400">Need Revision</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-400">
                {stats.total - stats.reviewed}
              </div>
              <div className="text-gray-400">Not Reviewed</div>
            </div>
          </div>

          <button
            onClick={exportReviewedTags}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Export Reviewed Tags
          </button>
        </div>
      </div>
    );
  }

  if (!fullProblem) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Tag Reviewer</h1>
            <button
              onClick={exportReviewedTags}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Export Current State
            </button>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Problem {currentIndex + 1} of {stats.total}</span>
            <span className="text-green-400">{stats.approved} approved</span>
            <span className="text-yellow-400">{stats.needsRevision} need revision</span>
            <span className="text-blue-400">{progress}% complete</span>
          </div>
          
          <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Problem Display */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">
                Problem ID: {fullProblem.id}
              </div>
              <div className="text-lg mb-4">
                <MathRenderer content={fullProblem.statement} />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Steps:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fullProblem.fullSteps.map((step, idx) => (
                  <div key={idx} className="bg-gray-800 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Step {step.step}</div>
                    <div className="text-sm">
                      <MathRenderer content={step.expression} />
                    </div>
                    {step.explanation && (
                      <div className="text-xs text-gray-400 mt-1">
                        <MathRenderer content={step.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Tag Editor */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            
            {/* Review Status */}
            {reviewedProblems[currentProblem.id] && (
              <div className={`mb-4 p-2 rounded ${
                reviewedProblems[currentProblem.id] === 'approved' 
                  ? 'bg-green-900/20 text-green-400' 
                  : 'bg-yellow-900/20 text-yellow-400'
              }`}>
                Status: {reviewedProblems[currentProblem.id] === 'approved' ? '✅ Approved' : '⚠️ Needs Revision'}
              </div>
            )}

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={currentTags.category || ''}
                  onChange={(e) => handleTagChange('category', e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                >
                  <option value="">Select...</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Difficulty (1-5 stars)
                </label>
                <StarRating 
                  rating={currentTags.difficulty || 0}
                  onChange={(value) => handleTagChange('difficulty', value)}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {currentTags.difficulty === 1 && "⭐ Bezpośrednie podstawienie"}
                  {currentTags.difficulty === 2 && "⭐⭐ 2-3 kroki przekształceń"}
                  {currentTags.difficulty === 3 && "⭐⭐⭐ Kilka kroków + wybór metody"}
                  {currentTags.difficulty === 4 && "⭐⭐⭐⭐ Analiza przypadków"}
                  {currentTags.difficulty === 5 && "⭐⭐⭐⭐⭐ Dowody, zadania z parametrem"}
                </div>
              </div>

              {/* Main Concept */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Main Concept</label>
                <input
                  type="text"
                  value={currentTags.mainConcept || ''}
                  onChange={(e) => handleTagChange('mainConcept', e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="e.g., radiany_na_stopnie"
                />
              </div>

              {/* Step Operations */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Step Operations</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fullProblem.fullSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12">Step {step.step}:</span>
                      <select
                        value={currentStepOps[idx] || ''}
                        onChange={(e) => handleStepOperationChange(idx, e.target.value)}
                        className="flex-1 p-1 text-sm bg-gray-800 border border-gray-700 rounded"
                      >
                        <option value="">Select...</option>
                        {stepOperations.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={markAsApproved}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
                >
                  ✅ Approve (Ctrl+A)
                </button>
                <button
                  onClick={markAsNeedsRevision}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium transition-colors"
                >
                  ⚠️ Needs Revision (Ctrl+R)
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === taggedProblems.length - 1}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Keyboard shortcuts: ← → to navigate, Ctrl+A to approve, Ctrl+R for revision
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagReviewer;