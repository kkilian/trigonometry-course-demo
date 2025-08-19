import React, { useMemo } from 'react';
import { preprocessMathText } from '../utils/similarity/textProcessor.js';
import { TFIDFProcessor } from '../utils/similarity/tfidf.js';
import { SimilarityCalculator } from '../utils/similarity/cosineSimilarity.js';
import MathRenderer from './MathRenderer';
import problems from '../data/problems.json';

const NextProblemSuggestion = ({ 
  currentProblem, 
  completedProblems, 
  onSelectProblem, 
  solveDuration = null 
}) => {

  // Simple difficulty estimation based on steps count
  const estimateDifficulty = (problem) => {
    const stepsCount = problem.steps?.length || 0;
    if (stepsCount <= 3) return 1; // Easy
    if (stepsCount <= 6) return 2; // Medium
    return 3; // Hard
  };

  // Determine target difficulty based on performance
  const getTargetDifficulty = (currentDifficulty, duration) => {
    if (!duration) return currentDifficulty; // No performance data, same level
    
    // Average solve time heuristics (in seconds)
    const avgTimeByDifficulty = { 1: 120, 2: 300, 3: 600 };
    const expectedTime = avgTimeByDifficulty[currentDifficulty] || 300;
    
    if (duration < expectedTime * 0.7) {
      // Solved quickly, suggest harder
      return Math.min(currentDifficulty + 1, 3);
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
    const diffScore = 1 - Math.abs(problemDifficulty - targetDifficulty) / 2;
    
    return similarityWeight * simScore + difficultyWeight * diffScore;
  };
  
  // Calculate suggested next problem
  const suggestedProblem = useMemo(() => {
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

      if (similar.length === 0) return null;

      // Smart progression logic
      const currentDifficulty = estimateDifficulty(currentProblem);
      const targetDifficulty = getTargetDifficulty(currentDifficulty, solveDuration);
      
      // Sort by best match for progression
      const bestMatch = similar
        .map(problem => ({
          ...problem,
          progressionScore: calculateProgressionScore(
            problem.similarity,
            problem.estimatedDifficulty,
            targetDifficulty
          )
        }))
        .sort((a, b) => b.progressionScore - a.progressionScore)[0];

      return bestMatch;

    } catch (err) {
      console.error('Error calculating next problem suggestion:', err);
      console.error('Full error details:', err.message, err.stack);
      return null;
    }
  }, [currentProblem, completedProblems, solveDuration]);

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Łatwe';
      case 2: return 'Średnie';
      case 3: return 'Trudne';
      default: return '';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleSuggestionClick = () => {
    if (suggestedProblem && onSelectProblem) {
      onSelectProblem(suggestedProblem);
    }
  };

  console.log('NextProblemSuggestion debug:', {
    currentProblem: currentProblem?.id,
    completedCount: completedProblems.size,
    suggestedProblem: suggestedProblem?.id,
    similarity: suggestedProblem?.similarity
  });

  if (!suggestedProblem) {
    console.log('No suggested problem found');
    // Fallback - show next sequential problem
    const nextProblem = problems.find(p => !completedProblems.has(p.id) && p.id !== currentProblem.id);
    if (nextProblem) {
      console.log('Using fallback next problem:', nextProblem.id);
      return (
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Następne zadanie (fallback)</h3>
          <div 
            onClick={() => onSelectProblem && onSelectProblem(nextProblem)}
            className="cursor-pointer p-4 bg-gray-800/30 hover:bg-gray-800/60 rounded-lg"
          >
            <div className="text-white">
              <MathRenderer content={nextProblem.statement} />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Sugerowane następne zadanie</h3>
            <p className="text-sm text-gray-400">
              {(suggestedProblem.similarity * 100).toFixed(0)}% podobieństwa • 
              <span className={`ml-1 ${getDifficultyColor(suggestedProblem.estimatedDifficulty)}`}>
                {getDifficultyLabel(suggestedProblem.estimatedDifficulty)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div 
        onClick={handleSuggestionClick}
        className="group cursor-pointer p-4 bg-gray-800/30 hover:bg-gray-800/60 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/30"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-mono">{suggestedProblem.id}</span>
        </div>

        <div className="mb-4">
          <div className="text-white group-hover:text-blue-200 transition-colors">
            <MathRenderer content={suggestedProblem.statement} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {suggestedProblem.steps?.length || 0} kroków
          </div>
          <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
            <span className="text-sm font-medium">Rozwiąż zadanie</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Wybrane na podstawie podobieństwa treści i progresji trudności
        </p>
      </div>
    </div>
  );
};

export default NextProblemSuggestion;