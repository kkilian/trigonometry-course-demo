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


  // Calculate suggested next problems (multiple)
  const suggestedProblems = useMemo(() => {
    if (!currentProblem || !problems) return null;

    // Simple 3-level difficulty system based on similarity + difficulty
    const currentDifficulty = estimateDifficulty(currentProblem);

    const difficultyLevels = {
      easy: { label: "Łatwe", color: "green", description: "Podstawy" },
      same: { label: "Podobne", color: "yellow", description: "Twój poziom" },
      hard: { label: "Trudne", color: "orange", description: "Wyzwanie" }
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

      // Simple selection: pick best similar problems from each difficulty category
      const usedProblemIds = new Set();
      const suggestions = {};

      // EASY: Find most similar problem with difficulty 1 or 2
      const easySuggestion = similar.find(p =>
        (p.estimatedDifficulty === 1 || p.estimatedDifficulty === 2) &&
        !usedProblemIds.has(p.id)
      );

      if (easySuggestion) {
        suggestions.easy = {
          ...easySuggestion,
          levelConfig: difficultyLevels.easy,
          suggestionType: 'easy'
        };
        usedProblemIds.add(easySuggestion.id);
      }

      // SAME: Find most similar problem with same difficulty
      const sameSuggestion = similar.find(p =>
        p.estimatedDifficulty === currentDifficulty &&
        !usedProblemIds.has(p.id)
      );

      if (sameSuggestion) {
        suggestions.same = {
          ...sameSuggestion,
          levelConfig: difficultyLevels.same,
          suggestionType: 'same'
        };
        usedProblemIds.add(sameSuggestion.id);
      }

      // HARD: Find most similar problem with higher difficulty
      const hardSuggestion = similar.find(p =>
        p.estimatedDifficulty > currentDifficulty &&
        !usedProblemIds.has(p.id)
      );

      if (hardSuggestion) {
        suggestions.hard = {
          ...hardSuggestion,
          levelConfig: difficultyLevels.hard,
          suggestionType: 'hard'
        };
        usedProblemIds.add(hardSuggestion.id);
      }

      // Fallback: Fill missing categories with any available similar problems
      const missingCategories = ['easy', 'same', 'hard'].filter(category => !suggestions[category]);
      const remainingProblems = similar.filter(p => !usedProblemIds.has(p.id));

      missingCategories.forEach((category, index) => {
        if (remainingProblems[index]) {
          suggestions[category] = {
            ...remainingProblems[index],
            levelConfig: difficultyLevels[category],
            suggestionType: category
          };
        }
      });

      const bestMatches = Object.values(suggestions);

      // Save suggested problems to localStorage for kombinatoryka module
      if (currentProblem.module === 'kombinatoryka') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('kombinatoryka-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for kombinatoryka:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for systems of equations module
      if (currentProblem.module === 'systems-of-equations') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('systems-of-equations-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for systems of equations:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for homographic functions module
      if (currentProblem.module === 'homographic-functions') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('homographic-functions-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for homographic functions:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for elementary fractions module
      if (currentProblem.module === 'elementary-fractions') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('elementary-fractions-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for elementary fractions:', suggestedIds);
      }

      // Save suggested problems to localStorage for kombinatoryka-rozszerzenie module
      if (currentProblem.module === 'kombinatoryka-rozszerzenie') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('kombinatoryka-rozszerzenie-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for kombinatoryka-rozszerzenie:', suggestedIds);
      }

      // Save suggested problems to localStorage for rational equations word problems module
      if (currentProblem.module === 'rational-equations-word-problems') {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('rational-equations-word-problems-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for rational-equations-word-problems:', suggestedIds);
      }

      // Save suggested problems to localStorage for matura module
      if (currentProblem.id && (currentProblem.id.includes('#2025-marzec') || currentProblem.id.includes('#2025-kwiecien'))) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('matura-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for matura:', suggestedIds);
      }


      return bestMatches;

    } catch (err) {
      console.error('Error calculating next problem suggestion:', err);
      console.error('Full error details:', err.message, err.stack);
      return [];
    }
  }, [currentProblem, completedProblems, problems]);

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
      // Track choice for learning patterns
      if (suggestionType) {
        const choices = JSON.parse(localStorage.getItem('learning-patterns-choices') || '[]');
        choices.push({
          timestamp: Date.now(),
          problemId: problem.id,
          suggestionType: suggestionType, // 'easy', 'same', or 'hard'
          currentDifficulty: problem.estimatedDifficulty || problem.difficulty || (problem.steps?.length || 0),
          sessionId: sessionStorage.getItem('sessionId') || 'default'
        });
        // Keep only last 50 choices
        if (choices.length > 50) {
          choices.shift();
        }
        localStorage.setItem('learning-patterns-choices', JSON.stringify(choices));
        console.log(`Tracked choice: ${suggestionType} for problem ${problem.id}`);
      }
      onSelectProblem(problem);
    }
  };


  // Compact mode for header - one button with hover showing 3 difficulty levels
  if (compact && suggestedProblems && suggestedProblems.length > 0) {
    const primaryProblem = suggestedProblems.find(p => p.suggestionType === 'same') || suggestedProblems[0];
    
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
            {['easy', 'same', 'hard'].map((type) => {
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