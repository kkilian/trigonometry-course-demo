import React, { useMemo, useCallback } from 'react';
import { preprocessMathText } from '../utils/similarity/textProcessor.js';
import { TFIDFProcessor } from '../utils/similarity/tfidf.js';
import { SimilarityCalculator } from '../utils/similarity/cosineSimilarity.js';
import MathRenderer from './MathRenderer';
// Import removed - problems now passed as prop

const NextProblemSuggestion = ({ 
  currentProblem, 
  completedProblems, 
  onSelectProblem, 
  solveDuration = null,
  problems = [],
  compact = false
}) => {

  // Choice tracking system for implicit confidence detection
  const trackChoice = (problemId, suggestionType, currentDifficulty) => {
    const storageKey = 'learning-patterns-choices';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const choice = {
      timestamp: Date.now(),
      problemId,
      suggestionType, // 'comfort', 'current', 'challenge'
      currentDifficulty,
      sessionId: Date.now().toString(36) // Simple session tracking
    };
    
    // Keep last 50 choices to prevent localStorage bloat
    const updated = [choice, ...existing].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    console.log('Tracked choice:', choice);
  };
  
  const getChoiceHistory = useCallback(() => {
    const storageKey = 'learning-patterns-choices';
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }, []);
  
  // Debug function to analyze recent choices
  const analyzeRecentChoices = () => {
    const history = getChoiceHistory().slice(0, 10); // Last 10 choices
    if (history.length === 0) return null;
    
    const choiceCounts = history.reduce((acc, choice) => {
      acc[choice.suggestionType] = (acc[choice.suggestionType] || 0) + 1;
      return acc;
    }, {});
    
    const totalChoices = history.length;
    const preferences = Object.entries(choiceCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalChoices) * 100)
    }));
    
    console.log('Recent choice analysis:', { history, preferences });
    return { history, preferences, totalChoices };
  };

  // Use manual difficulty from JSON or fallback to steps count
  const estimateDifficulty = (problem) => {
    // First check if manual difficulty is defined
    if (problem.difficulty !== undefined && problem.difficulty !== null) {
      return problem.difficulty;
    }
    
    // Fallback to steps count estimation
    const stepsCount = problem.steps?.length || 0;
    if (stepsCount <= 3) return 1; // Easy
    if (stepsCount <= 6) return 2; // Medium
    if (stepsCount <= 9) return 3; // Hard
    if (stepsCount <= 12) return 4; // Very hard
    return 5; // Expert
  };

  // Adaptive logic engine - analyzes choice patterns and adjusts difficulty suggestions
  const getAdaptiveDifficultyOffset = useCallback(() => {
    const recentChoices = getChoiceHistory().slice(0, 8); // Last 8 choices
    if (recentChoices.length < 3) return 0; // Not enough data
    
    const choiceCounts = recentChoices.reduce((acc, choice) => {
      acc[choice.suggestionType] = (acc[choice.suggestionType] || 0) + 1;
      return acc;
    }, {});
    
    const total = recentChoices.length;
    const comfortRate = (choiceCounts.comfort || 0) / total;
    const challengeRate = (choiceCounts.challenge || 0) / total;
    const currentRate = (choiceCounts.current || 0) / total;
    
    console.log('Choice pattern analysis:', { comfortRate, currentRate, challengeRate });
    
    // Adaptive logic
    if (comfortRate > 0.6) {
      // User mostly chooses easy - suggest easier overall
      console.log('Pattern: Risk-averse learner, reducing overall difficulty');
      return -0.5;
    } else if (challengeRate > 0.5) {
      // User mostly chooses hard - increase overall difficulty slightly
      console.log('Pattern: Challenge-seeking learner, increasing overall difficulty');
      return +0.5;
    } else if (currentRate > 0.6) {
      // User mostly chooses current level - perfect balance
      console.log('Pattern: Balanced learner, maintaining difficulty');
      return 0;
    } else if (comfortRate > 0.4 && challengeRate < 0.2) {
      // Conservative pattern - slightly easier
      console.log('Pattern: Conservative learner, slight difficulty reduction');
      return -0.3;
    }
    
    return 0; // Default - no adjustment
  }, [getChoiceHistory]);

  // Calculate suggested next problems (multiple)
  const suggestedProblems = useMemo(() => {
    if (!currentProblem || !problems) return null;

    // Generate 3-level difficulty suggestions with adaptive adjustments (moved inside useMemo)
    const getThreeLevelSuggestions = (currentDifficulty) => {
      const adaptiveOffset = getAdaptiveDifficultyOffset();
      const adjustedBase = Math.max(1, Math.min(5, currentDifficulty + adaptiveOffset));
      
      const comfort = Math.max(1, Math.round(adjustedBase - 1));
      const current = Math.max(1, Math.min(5, Math.round(adjustedBase)));
      const challenge = Math.min(5, Math.round(adjustedBase + 1));
      
      console.log('Adaptive difficulty calculation:', { 
        originalDifficulty: currentDifficulty, 
        adaptiveOffset, 
        adjustedBase,
        finalLevels: { comfort, current, challenge }
      });
      
      return {
        comfort: { level: comfort, label: "Powtórka", color: "green", description: "Utrwal podstawy" },
        current: { level: current, label: "Dalej", color: "yellow", description: "Twój poziom" },
        challenge: { level: challenge, label: "Wyzwanie", color: "orange", description: "Sprawdź się" }
      };
    };

    try {
      // Find current problem index
      const currentIndex = problems.findIndex(p => p.id === currentProblem.id);
      if (currentIndex === -1) return null;

      // Preprocess all problem statements
      const documents = problems.map(problem => 
        preprocessMathText(problem.statement)
      );

      // Create TF-IDF vectors
      const tfidf = new TFIDFProcessor();
      const vectors = tfidf.fitTransform(documents);

      // Calculate similarities
      const calculator = new SimilarityCalculator('cosine');
      calculator.setVectors(vectors);

      // Get similar problems
      const similar = calculator.getMostSimilar(currentIndex, 20)
        .filter(({ index, similarity }) => {
          const problem = problems[index];
          // Filter out completed problems and low similarity
          return similarity > 0.1 && 
                 !completedProblems.has(problem.id) && 
                 index !== currentIndex;
        })
        .map(({ index, similarity }) => ({
          ...problems[index],
          similarity,
          estimatedDifficulty: estimateDifficulty(problems[index])
        }));

      if (similar.length === 0) return [];

      // Generate 3-level difficulty system
      const currentDifficulty = estimateDifficulty(currentProblem);
      const difficultyLevels = getThreeLevelSuggestions(currentDifficulty);
      
      // Group problems by difficulty level and find best match for each level
      const suggestionsByLevel = {};
      
      Object.entries(difficultyLevels).forEach(([key, config]) => {
        // First try exact match
        let problemsAtLevel = similar.filter(p => p.estimatedDifficulty === config.level);
        
        // If no exact match, find closest difficulty
        if (problemsAtLevel.length === 0) {
          // Sort by distance from target difficulty, then take closest ones
          const sortedByDistance = similar
            .map(p => ({
              ...p,
              distance: Math.abs(p.estimatedDifficulty - config.level)
            }))
            .sort((a, b) => a.distance - b.distance);
          
          // Take problems within 1 level distance
          problemsAtLevel = sortedByDistance.filter(p => p.distance <= 1);
          
          // If still nothing, take any available problems
          if (problemsAtLevel.length === 0 && sortedByDistance.length > 0) {
            problemsAtLevel = sortedByDistance.slice(0, 3);
          }
        }
        
        if (problemsAtLevel.length > 0) {
          // Sort by similarity and take the best one
          const bestAtLevel = problemsAtLevel
            .sort((a, b) => b.similarity - a.similarity)[0];
          
          suggestionsByLevel[key] = {
            ...bestAtLevel,
            levelConfig: config,
            suggestionType: key
          };
        }
      });
      
      // Ensure we always have 3 suggestions if possible
      const availableKeys = Object.keys(suggestionsByLevel);
      const missingKeys = ['comfort', 'current', 'challenge'].filter(k => !availableKeys.includes(k));
      
      // Fill missing suggestions with best available problems
      if (missingKeys.length > 0 && similar.length > availableKeys.length) {
        const usedProblemIds = new Set(Object.values(suggestionsByLevel).map(s => s.id));
        const unusedProblems = similar.filter(p => !usedProblemIds.has(p.id));
        
        missingKeys.forEach((key, index) => {
          if (unusedProblems[index]) {
            suggestionsByLevel[key] = {
              ...unusedProblems[index],
              levelConfig: difficultyLevels[key],
              suggestionType: key
            };
          }
        });
      }
      
      // Convert to array format for backward compatibility
      const bestMatches = Object.values(suggestionsByLevel);

      // Save suggested problems to localStorage for kombinatoryka module
      if (currentProblem.id && (currentProblem.id.includes('combinatorics') || currentProblem.id.includes('kombinatoryka'))) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('kombinatoryka-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for kombinatoryka:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for systems of equations module
      if (currentProblem.id && (currentProblem.id.includes('derivative') || currentProblem.id.includes('uklady_rownan'))) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('systems-of-equations-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for systems of equations:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for homographic functions module
      if (currentProblem.id && currentProblem.id.includes('homographic')) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('homographic-functions-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for homographic functions:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for elementary fractions module
      if (currentProblem.id && currentProblem.id.includes('fraction_')) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('elementary-fractions-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for elementary fractions:', suggestedIds);
      }

      return bestMatches;

    } catch (err) {
      console.error('Error calculating next problem suggestion:', err);
      console.error('Full error details:', err.message, err.stack);
      return [];
    }
  }, [currentProblem, completedProblems, problems, getAdaptiveDifficultyOffset]);

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Łatwe';
      case 2: return 'Średnie';
      case 3: return 'Trudne';
      case 4: return 'Bardzo trudne';
      case 5: return 'Eksperckie';
      default: return '';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-green-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-red-600';
      case 4: return 'text-purple-600';
      case 5: return 'text-violet-800';
      default: return 'text-stone-600';
    }
  };

  const handleSuggestionClick = (problem, suggestionType = null) => {
    if (problem && onSelectProblem) {
      // Track the choice for implicit confidence detection
      if (suggestionType && currentProblem) {
        const currentDifficulty = estimateDifficulty(currentProblem);
        trackChoice(problem.id, suggestionType, currentDifficulty);
      }
      
      onSelectProblem(problem);
    }
  };

  // Enhanced debug logging and analytics
  const logAnalytics = () => {
    const choiceAnalysis = analyzeRecentChoices();
    const adaptiveOffset = getAdaptiveDifficultyOffset();
    
    console.group('🧠 NextProblemSuggestion Analytics');
    console.log('📋 Current state:', {
      currentProblem: currentProblem?.id,
      currentDifficulty: currentProblem ? estimateDifficulty(currentProblem) : null,
      completedCount: completedProblems.size,
      suggestedCount: suggestedProblems?.length || 0
    });
    
    if (choiceAnalysis) {
      console.log('📊 Choice patterns:', choiceAnalysis.preferences);
      console.log('🎯 Adaptive adjustment:', adaptiveOffset);
    }
    
    if (suggestedProblems && suggestedProblems.length > 0) {
      console.log('✨ Generated suggestions:', 
        suggestedProblems.map(p => ({ 
          type: p.suggestionType, 
          difficulty: p.estimatedDifficulty,
          targetDifficulty: p.levelConfig?.level,
          isExactMatch: p.estimatedDifficulty === p.levelConfig?.level,
          id: p.id.substring(0, 12) + '...', 
          similarity: Math.round(p.similarity * 100) + '%'
        }))
      );
      
      const exactMatches = suggestedProblems.filter(p => p.estimatedDifficulty === p.levelConfig?.level).length;
      if (exactMatches < 3) {
        console.warn(`⚠️ Using fallback: Only ${exactMatches}/3 exact difficulty matches found`);
      }
    }
    console.groupEnd();
  };
  
  // Export learning data for analysis
  const exportLearningData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      choiceHistory: getChoiceHistory(),
      choiceAnalysis: analyzeRecentChoices(),
      adaptiveOffset: getAdaptiveDifficultyOffset(),
      currentSession: {
        currentProblem: currentProblem?.id,
        currentDifficulty: currentProblem ? estimateDifficulty(currentProblem) : null,
        completedCount: completedProblems.size,
        availableProblems: problems.length
      }
    };
    
    console.log('📦 Learning data export:', data);
    
    // Save to localStorage for manual inspection
    localStorage.setItem('learning-data-export', JSON.stringify(data, null, 2));
    
    return data;
  };
  
  // Call analytics logging
  logAnalytics();
  
  // Make export function available on window for debugging
  if (typeof window !== 'undefined') {
    window.exportLearningData = exportLearningData;
  }

  // Compact mode for header - one button with hover showing 3 difficulty levels
  if (compact && suggestedProblems && suggestedProblems.length > 0) {
    const primaryProblem = suggestedProblems.find(p => p.suggestionType === 'current') || suggestedProblems[0];
    
    return (
      <div className="relative group animate-fadeInScale">
        <button
          onClick={() => handleSuggestionClick(primaryProblem, primaryProblem.suggestionType)}
          className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-orange-400 text-stone-700 hover:bg-orange-50 rounded-lg transition-all animate-pulse-border shadow-lg shadow-orange-200/50"
        >
          <span className="text-xs font-medium">Następne</span>
          <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
          </svg>
        </button>
        
        {/* Hover tooltip with 3 difficulty levels */}
        <div className="absolute top-full right-0 mt-2 w-[420px] bg-white border border-stone-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-stone-100">
            <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wider">Wybierz poziom trudności</h4>
          </div>
          <div className="space-y-1">
            {['comfort', 'current', 'challenge'].map((type) => {
              const problem = suggestedProblems.find(p => p.suggestionType === type);
              if (!problem) return null;
              
              const config = problem.levelConfig;
              const getHoverBorderColor = () => {
                switch(config.color) {
                  case 'green': return 'hover:border-green-400 hover:shadow-green-100';
                  case 'yellow': return 'hover:border-yellow-400 hover:shadow-yellow-100';
                  case 'orange': return 'hover:border-orange-400 hover:shadow-orange-100';
                  default: return 'hover:border-gray-400 hover:shadow-gray-100';
                }
              };
              
              const getLabelColor = () => {
                switch(config.color) {
                  case 'green': return 'text-green-700';
                  case 'yellow': return 'text-yellow-700';
                  case 'orange': return 'text-orange-700';
                  default: return 'text-gray-700';
                }
              };

              return (
                <div
                  key={problem.id}
                  onClick={() => handleSuggestionClick(problem, type)}
                  className={`p-3 cursor-pointer transition-all duration-200 border border-stone-200 rounded-lg bg-white hover:shadow-sm ${getHoverBorderColor()}`}
                >
                  <div className="mb-2">
                    <span className={`text-xs font-medium ${getLabelColor()}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="text-sm text-stone-900 mb-1">
                    <MathRenderer content={problem.statement} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-stone-500">
                      {problem.steps?.length || 0} kroków
                    </div>
                    <div className="text-xs text-stone-400">
                      {config.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!suggestedProblems || suggestedProblems.length === 0) {
    console.log('No suggested problems found');
    // Fallback - show next sequential problem
    const nextProblem = problems.find(p => !completedProblems.has(p.id) && p.id !== currentProblem.id);
    if (nextProblem) {
      console.log('Using fallback next problem:', nextProblem.id);
      
      // Compact mode fallback
      if (compact) {
        return (
          <div className="relative group animate-fadeInScale">
            <button
              onClick={() => handleSuggestionClick(nextProblem, 'fallback')}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-orange-400 text-stone-700 hover:bg-orange-50 rounded-lg transition-all animate-pulse-border shadow-lg shadow-orange-200/50"
            >
              <span className="text-xs font-medium">Następne</span>
              <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
              </svg>
            </button>
            
            {/* Hover tooltip with problem preview */}
            <div className="absolute top-full right-0 mt-2 w-96 p-4 bg-white border border-stone-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-sm text-stone-900">
                <MathRenderer content={nextProblem.statement} />
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="mt-8 bg-stone-200/50 border border-stone-300 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Następne zadanie</h3>
          <div 
            onClick={() => handleSuggestionClick(nextProblem, 'fallback')}
            className="cursor-pointer p-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-all"
          >
            <div className="text-stone-900">
              <MathRenderer content={nextProblem.statement} />
            </div>
          </div>
        </div>
      );
    }
    return compact ? null : null;
  }

  // Only compact mode is needed now
  return null;
};

export default NextProblemSuggestion;