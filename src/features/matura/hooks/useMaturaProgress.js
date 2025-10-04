import { useState, useEffect, useCallback } from 'react';
import { getSessionStorageKey } from '../config/sessions.config';

/**
 * Hook do zarządzania postępem w sesjach maturalnych
 * Zastępuje rozproszone stany w TrigonometryCourse
 */
const useMaturaProgress = (sessionId) => {
  // SOTA: Inicjalizacja localStorage w useState - natychmiastowe ładowanie
  const [completedProblems, setCompletedProblems] = useState(() => {
    if (!sessionId) return new Set();

    const progressKey = getSessionStorageKey(sessionId, 'progress');
    try {
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        return new Set(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading matura progress:', error);
    }
    return new Set();
  });

  const [suggestedProblems, setSuggestedProblems] = useState(() => {
    if (!sessionId) return [];

    const suggestedKey = getSessionStorageKey(sessionId, 'suggested');
    try {
      const savedSuggested = localStorage.getItem(suggestedKey);
      if (savedSuggested) {
        return JSON.parse(savedSuggested);
      }
    } catch (error) {
      console.error('Error loading suggested problems:', error);
    }
    return [];
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!sessionId) return;

    const progressKey = getSessionStorageKey(sessionId, 'progress');
    try {
      localStorage.setItem(progressKey, JSON.stringify([...completedProblems]));
    } catch (error) {
      console.error('Error saving matura progress:', error);
    }
  }, [sessionId, completedProblems]);

  // Save suggested problems to localStorage
  useEffect(() => {
    if (!sessionId || suggestedProblems.length === 0) return;

    const suggestedKey = getSessionStorageKey(sessionId, 'suggested');
    try {
      localStorage.setItem(suggestedKey, JSON.stringify(suggestedProblems));
    } catch (error) {
      console.error('Error saving suggested problems:', error);
    }
  }, [sessionId, suggestedProblems]);

  // Mark problem as completed
  const markProblemCompleted = useCallback((problemId) => {
    setCompletedProblems(prev => new Set([...prev, problemId]));
  }, []);

  // Mark problem as not completed
  const markProblemIncomplete = useCallback((problemId) => {
    setCompletedProblems(prev => {
      const newSet = new Set(prev);
      newSet.delete(problemId);
      return newSet;
    });
  }, []);

  // Toggle problem completion
  const toggleProblemCompletion = useCallback((problemId) => {
    setCompletedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  }, []);

  // Set suggested problems
  const updateSuggestedProblems = useCallback((problemIds) => {
    setSuggestedProblems(problemIds);
  }, []);

  // Clear all progress
  const clearProgress = useCallback(() => {
    setCompletedProblems(new Set());
    setSuggestedProblems([]);

    if (sessionId) {
      const progressKey = getSessionStorageKey(sessionId, 'progress');
      const suggestedKey = getSessionStorageKey(sessionId, 'suggested');

      try {
        localStorage.removeItem(progressKey);
        localStorage.removeItem(suggestedKey);
      } catch (error) {
        console.error('Error clearing progress:', error);
      }
    }
  }, [sessionId]);

  // Get progress statistics
  const getProgressStats = useCallback((totalProblems) => {
    const completed = completedProblems.size;
    const percentage = totalProblems > 0 ? (completed / totalProblems) * 100 : 0;

    return {
      completed,
      total: totalProblems,
      percentage: Math.round(percentage),
      remaining: totalProblems - completed
    };
  }, [completedProblems]);

  // Check if problem is completed
  const isProblemCompleted = useCallback((problemId) => {
    return completedProblems.has(problemId);
  }, [completedProblems]);

  return {
    completedProblems,
    suggestedProblems,
    markProblemCompleted,
    markProblemIncomplete,
    toggleProblemCompletion,
    updateSuggestedProblems,
    clearProgress,
    getProgressStats,
    isProblemCompleted
  };
};

export default useMaturaProgress;