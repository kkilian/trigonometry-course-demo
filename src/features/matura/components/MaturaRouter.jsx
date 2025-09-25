import React from 'react';
import MaturaSession from './MaturaSession';
import useMaturaData from '../hooks/useMaturaData';
import useMaturaProgress from '../hooks/useMaturaProgress';
import { getSessionById } from '../config/sessions.config';

/**
 * Dynamic router component for Matura sessions
 * Eliminates the need for if/else statements in TrigonometryCourse
 */
const MaturaRouter = ({ sessionId, onSelectProblem, onBack }) => {
  // Get session configuration
  const sessionConfig = getSessionById(sessionId);

  // Load data dynamically
  const { data: problems, loading, error } = useMaturaData(sessionId);

  // Manage progress
  const {
    completedProblems,
    markProblemCompleted,
    isProblemCompleted
  } = useMaturaProgress(sessionId);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-stone-600">Ładowanie sesji maturalnej...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Błąd ładowania sesji: {error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  // Handle no session config
  if (!sessionConfig) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Sesja nie została znaleziona</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  // Handle problem selection with completion tracking
  const handleSelectProblem = (problem) => {
    if (onSelectProblem) {
      onSelectProblem(problem, {
        markCompleted: () => markProblemCompleted(problem.id),
        isCompleted: isProblemCompleted(problem.id)
      });
    }
  };

  return (
    <MaturaSession
      sessionConfig={sessionConfig}
      problems={problems}
      onSelectProblem={handleSelectProblem}
      completedProblems={completedProblems}
      onBack={onBack}
    />
  );
};

export default MaturaRouter;