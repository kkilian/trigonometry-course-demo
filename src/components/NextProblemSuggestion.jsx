import React, { useMemo } from 'react';
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

  // Determine target difficulty based on performance
  const getTargetDifficulty = (currentDifficulty, duration) => {
    if (!duration) return currentDifficulty; // No performance data, same level
    
    // Average solve time heuristics (in seconds)
    const avgTimeByDifficulty = { 1: 60, 2: 180, 3: 420, 4: 600, 5: 900 };
    const expectedTime = avgTimeByDifficulty[currentDifficulty] || 300;
    
    if (duration < expectedTime * 0.7) {
      // Solved quickly, suggest harder
      return Math.min(currentDifficulty + 1, 5);
    } else if (duration > expectedTime * 1.5) {
      // Solved slowly, suggest easier
      return Math.max(currentDifficulty - 1, 1);
    }
    
    return currentDifficulty; // Same difficulty
  };

  // Score problems for best progression match
  const calculateProgressionScore = (similarity, problemDifficulty, targetDifficulty) => {
    const similarityWeight = 0.6;
    const difficultyWeight = 0.4;
    
    // Similarity score (0-1)
    const simScore = similarity;
    
    // Difficulty match score (1 = perfect match, 0 = worst)
    const diffScore = 1 - Math.abs(problemDifficulty - targetDifficulty) / 4;
    
    return similarityWeight * simScore + difficultyWeight * diffScore;
  };
  
  // Calculate suggested next problems (multiple)
  const suggestedProblems = useMemo(() => {
    if (!currentProblem || !problems) return null;

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

      // Smart progression logic
      const currentDifficulty = estimateDifficulty(currentProblem);
      const targetDifficulty = getTargetDifficulty(currentDifficulty, solveDuration);
      
      // Sort by best match for progression and get top 3
      const bestMatches = similar
        .map(problem => ({
          ...problem,
          progressionScore: calculateProgressionScore(
            problem.similarity,
            problem.estimatedDifficulty,
            targetDifficulty
          )
        }))
        .sort((a, b) => b.progressionScore - a.progressionScore)
        .slice(0, 3);

      // Save suggested problems to localStorage for trigonometry module
      if (currentProblem.id && currentProblem.id.includes('tex_problem')) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('trigonometry-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for trigonometry:', suggestedIds);
      }
      
      // Save suggested problems to localStorage for systems of equations module
      if (currentProblem.id && (currentProblem.id.includes('derivative') || currentProblem.id.includes('uklady_rownan'))) {
        const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
        localStorage.setItem('systems-of-equations-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for systems of equations:', suggestedIds);
      }

      return bestMatches;

    } catch (err) {
      console.error('Error calculating next problem suggestion:', err);
      console.error('Full error details:', err.message, err.stack);
      return [];
    }
  }, [currentProblem, completedProblems, solveDuration, problems]);

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

  const handleSuggestionClick = (problem) => {
    if (problem && onSelectProblem) {
      onSelectProblem(problem);
    }
  };

  console.log('NextProblemSuggestion debug:', {
    currentProblem: currentProblem?.id,
    completedCount: completedProblems.size,
    suggestedCount: suggestedProblems.length,
    suggestions: suggestedProblems.map(p => ({ id: p.id, similarity: p.similarity }))
  });

  // Compact mode for header - one button with hover showing 2 suggestions
  if (compact && suggestedProblems && suggestedProblems.length > 0) {
    const primaryProblem = suggestedProblems[0];
    const problemsToShow = suggestedProblems.slice(0, 2);
    
    return (
      <div className="relative group animate-fadeInScale">
        <button
          onClick={() => onSelectProblem && onSelectProblem(primaryProblem)}
          className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-orange-400 text-stone-700 hover:bg-orange-50 rounded-lg transition-all animate-pulse-border"
        >
          <span className="text-xs font-medium">Następne</span>
          <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
          </svg>
        </button>
        
        {/* Hover tooltip with 2 suggested problems */}
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-stone-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-stone-100">
            <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wider">Sugerowane zadania</h4>
          </div>
          <div className="space-y-1">
            {problemsToShow.map((problem, index) => (
              <div
                key={problem.id}
                onClick={() => onSelectProblem && onSelectProblem(problem)}
                className="p-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-4 border-transparent hover:border-orange-400"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    index === 0 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index === 0 ? 'Główne' : 'Alternatywa'}
                  </span>
                  <span className={`text-xs ${getDifficultyColor(problem.estimatedDifficulty)}`}>
                    {getDifficultyLabel(problem.estimatedDifficulty)}
                  </span>
                </div>
                <div className="text-sm text-stone-900 mb-1">
                  <MathRenderer content={problem.statement} />
                </div>
                <div className="text-xs text-stone-500">
                  {problem.steps?.length || 0} kroków
                </div>
              </div>
            ))}
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
              onClick={() => onSelectProblem && onSelectProblem(nextProblem)}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-blue-400 text-stone-700 hover:bg-blue-50 rounded-lg transition-all animate-pulse-border-blue"
            >
              <span className="text-xs font-medium">Następne</span>
              <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 20 20">
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
            onClick={() => onSelectProblem && onSelectProblem(nextProblem)}
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