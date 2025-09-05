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
  problems = [] 
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

      return bestMatches;

    } catch (err) {
      console.error('Error calculating next problem suggestion:', err);
      console.error('Full error details:', err.message, err.stack);
      return [];
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
      case 1: return 'text-green-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-red-600';
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

  if (!suggestedProblems || suggestedProblems.length === 0) {
    console.log('No suggested problems found');
    // Fallback - show next sequential problem
    const nextProblem = problems.find(p => !completedProblems.has(p.id) && p.id !== currentProblem.id);
    if (nextProblem) {
      console.log('Using fallback next problem:', nextProblem.id);
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
    return null;
  }

  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">
                {suggestedProblems.length === 1 ? 'Sugerowane następne zadanie' : 'Sugerowane następne zadania'}
              </h3>
              <p className="text-sm text-stone-600">
                Wybrane na podstawie podobieństwa treści i poziomu trudności
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {suggestedProblems.map((suggestedProblem, index) => (
            <div 
              key={suggestedProblem.id}
              onClick={() => handleSuggestionClick(suggestedProblem)}
              className="group cursor-pointer p-4 bg-white hover:bg-stone-50 rounded-lg transition-all duration-200 border border-stone-200 hover:border-yellow-400 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-700">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">{suggestedProblem.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-600">
                    {(suggestedProblem.similarity * 100).toFixed(0)}% podobieństwa
                  </span>
                  <span className={`text-xs font-medium ${getDifficultyColor(suggestedProblem.estimatedDifficulty)}`}>
                    • {getDifficultyLabel(suggestedProblem.estimatedDifficulty)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-stone-900 group-hover:text-stone-700 transition-colors">
                  <MathRenderer content={suggestedProblem.statement} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-stone-500">
                  {suggestedProblem.steps?.length || 0} kroków do rozwiązania
                </div>
                <div className="flex items-center gap-2 text-yellow-600 group-hover:text-orange-600 transition-colors">
                  <span className="text-sm font-medium">Przejdź do zadania</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default NextProblemSuggestion;