import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { preprocessMathText } from '../utils/similarity/textProcessor.js';
import { TFIDFProcessor } from '../utils/similarity/tfidf.js';
import { SimilarityCalculator } from '../utils/similarity/cosineSimilarity.js';
import MathRenderer from './MathRenderer';

const NextProblemSuggestionMultiStep = ({
  currentProblem,
  completedProblems,
  onSelectProblem,
  solveDuration = null,
  problems = [],
  compact = false,
  // NEW - MultiStep specific props
  onTrackMultiStepChoice,
  showPerformanceIndicators = true,
  showReasoningDetails = false
}) => {

  // ===== ENHANCED CHOICE TRACKING SYSTEM =====

  // Enhanced choice tracking with multistep performance data
  const trackEnhancedChoice = (problemId, suggestionType, currentDifficulty, multistepData = null) => {
    const storageKey = 'learning-patterns-choices-multistep';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const choice = {
      timestamp: Date.now(),
      problemId,
      suggestionType, // 'comfort', 'current', 'challenge', 'fallback'
      currentDifficulty,
      sessionId: Date.now().toString(36),

      // NEW - MultiStep Performance Data (if available)
      multistepScore: multistepData ? {
        totalSteps: multistepData.totalSteps || 0,
        correctSteps: multistepData.correctSteps || 0,
        scorePercentage: multistepData.scorePercentage || 0,
        stepDetails: multistepData.stepDetails || []
      } : null,

      // Performance indicators
      completionTime: multistepData?.completionTime || null,
      attemptsCount: multistepData?.attemptsCount || 1,
      hintsUsed: multistepData?.hintsUsed || 0,
      completed: multistepData?.completed || false
    };

    // Keep last 50 choices to prevent localStorage bloat
    const updated = [choice, ...existing].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    console.log('Tracked enhanced choice:', choice);

    // Call external callback if provided
    if (onTrackMultiStepChoice) {
      onTrackMultiStepChoice(choice);
    }
  };

  const getEnhancedChoiceHistory = useCallback(() => {
    const storageKey = 'learning-patterns-choices-multistep';
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }, []);

  // ===== MULTISTEP PERFORMANCE ANALYSIS =====

  // Analyze multistep performance from recent history
  const analyzeMultistepPerformance = useCallback(() => {
    const history = getEnhancedChoiceHistory().slice(0, 12); // Last 12 problems

    // Filter only completed problems with multistep data
    const completedWithMultiStep = history.filter(entry =>
      entry.completed && entry.multistepScore && entry.multistepScore.totalSteps > 0
    );

    if (completedWithMultiStep.length === 0) {
      return {
        avgMultistepScore: null,
        consistencyScore: null,
        timeEfficiency: null,
        hintDependency: null,
        completionRate: null,
        dataQuality: 'no_data',
        sampleSize: 0
      };
    }

    // Calculate average multistep score
    const avgMultistepScore = completedWithMultiStep.reduce((sum, entry) =>
      sum + entry.multistepScore.scorePercentage, 0
    ) / completedWithMultiStep.length;

    // Calculate consistency (how much scores vary)
    const scores = completedWithMultiStep.map(e => e.multistepScore.scorePercentage);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgMultistepScore, 2), 0) / scores.length;
    const consistencyScore = Math.max(0, 1 - (variance / 1000)); // Normalized to 0-1

    // Calculate time efficiency (average time per step)
    const avgTimePerStep = completedWithMultiStep.reduce((sum, entry) => {
      if (!entry.completionTime || !entry.multistepScore.totalSteps) return sum;
      return sum + (entry.completionTime / entry.multistepScore.totalSteps);
    }, 0) / completedWithMultiStep.filter(e => e.completionTime && e.multistepScore.totalSteps).length;

    const timeEfficiency = avgTimePerStep ? Math.max(0, Math.min(1, 120000 / avgTimePerStep)) : null; // 2min per step = 1.0

    // Calculate hint dependency
    const avgHintsUsed = completedWithMultiStep.reduce((sum, entry) => sum + (entry.hintsUsed || 0), 0) / completedWithMultiStep.length;
    const hintDependency = Math.min(1, avgHintsUsed / 3); // 3+ hints per problem = 1.0

    // Calculate completion rate from recent attempts
    const recentAttempts = history.slice(0, 8);
    const completionRate = recentAttempts.length > 0 ?
      recentAttempts.filter(e => e.completed).length / recentAttempts.length : null;

    return {
      avgMultistepScore: Math.round(avgMultistepScore),
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      timeEfficiency: timeEfficiency ? Math.round(timeEfficiency * 100) / 100 : null,
      hintDependency: Math.round(hintDependency * 100) / 100,
      completionRate: completionRate ? Math.round(completionRate * 100) / 100 : null,
      dataQuality: completedWithMultiStep.length >= 3 ? 'good' : 'limited',
      sampleSize: completedWithMultiStep.length,
      trend: calculatePerformanceTrend(completedWithMultiStep)
    };
  }, [getEnhancedChoiceHistory]);

  // Calculate performance trend over time
  const calculatePerformanceTrend = (completedProblems) => {
    if (completedProblems.length < 3) return 'insufficient_data';

    const recent = completedProblems.slice(0, 3).map(p => p.multistepScore.scorePercentage);
    const older = completedProblems.slice(3, 6).map(p => p.multistepScore.scorePercentage);

    if (older.length === 0) return 'insufficient_data';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
  };

  // ===== CHOICE PATTERN ANALYSIS (from original system) =====

  const analyzeChoicePatterns = useCallback(() => {
    const history = getEnhancedChoiceHistory().slice(0, 10); // Last 10 choices
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

    console.log('Choice pattern analysis:', { history, preferences });
    return {
      history,
      preferences,
      totalChoices,
      comfortRate: (choiceCounts.comfort || 0) / totalChoices,
      currentRate: (choiceCounts.current || 0) / totalChoices,
      challengeRate: (choiceCounts.challenge || 0) / totalChoices
    };
  }, [getEnhancedChoiceHistory]);

  // ===== HYBRID LEARNER PROFILES =====

  const detectHybridProfile = useCallback(() => {
    const choiceAnalysis = analyzeChoicePatterns();
    const performanceAnalysis = analyzeMultistepPerformance();

    // If insufficient data, return default
    if (!choiceAnalysis || choiceAnalysis.totalChoices < 3) {
      return {
        profile: 'New Learner',
        confidence: 0.1,
        description: 'Insufficient data for profiling',
        color: 'gray'
      };
    }

    const { comfortRate, currentRate, challengeRate } = choiceAnalysis;
    const avgScore = performanceAnalysis.avgMultistepScore;
    const hasPerformanceData = avgScore !== null;

    // Profile 1: Overconfident Challenger
    if (challengeRate > 0.5 && hasPerformanceData && avgScore < 40) {
      return {
        profile: 'Overconfident Challenger',
        confidence: 0.8,
        description: 'Wybiera trudne zadania, ale słabo je rozwiązuje',
        adaptiveOffset: -0.7,
        color: 'red',
        reasoning: `challengeRate: ${Math.round(challengeRate*100)}%, avgScore: ${avgScore}%`
      };
    }

    // Profile 2: Modest High-Performer
    if (comfortRate > 0.6 && hasPerformanceData && avgScore > 80) {
      return {
        profile: 'Modest High-Performer',
        confidence: 0.9,
        description: 'Wybiera łatwe zadania, ale radzi sobie świetnie',
        adaptiveOffset: +0.3,
        color: 'blue',
        reasoning: `comfortRate: ${Math.round(comfortRate*100)}%, avgScore: ${avgScore}%`
      };
    }

    // Profile 3: Balanced Achiever
    if (currentRate > 0.6 && hasPerformanceData && avgScore >= 60 && avgScore <= 80) {
      return {
        profile: 'Balanced Achiever',
        confidence: 0.9,
        description: 'Idealny balans wyboru i wykonania',
        adaptiveOffset: 0,
        color: 'green',
        reasoning: `currentRate: ${Math.round(currentRate*100)}%, avgScore: ${avgScore}%`
      };
    }

    // Profile 4: Struggling Avoider
    if (comfortRate > 0.5 && hasPerformanceData && avgScore < 50) {
      return {
        profile: 'Struggling Avoider',
        confidence: 0.8,
        description: 'Unika trudności i ma problemy z rozwiązywaniem',
        adaptiveOffset: -0.8,
        color: 'orange',
        reasoning: `comfortRate: ${Math.round(comfortRate*100)}%, avgScore: ${avgScore}%`
      };
    }

    // Fallback profiles for choice-only data
    if (challengeRate > 0.5) {
      return {
        profile: 'Challenge Seeker',
        confidence: 0.6,
        description: 'Preferuje trudne wyzwania',
        adaptiveOffset: +0.5,
        color: 'purple',
        reasoning: `challengeRate: ${Math.round(challengeRate*100)}% (no performance data)`
      };
    }

    if (comfortRate > 0.6) {
      return {
        profile: 'Comfort Seeker',
        confidence: 0.6,
        description: 'Preferuje łatwiejsze zadania',
        adaptiveOffset: -0.5,
        color: 'yellow',
        reasoning: `comfortRate: ${Math.round(comfortRate*100)}% (no performance data)`
      };
    }

    // Default balanced profile
    return {
      profile: 'Balanced Learner',
      confidence: 0.4,
      description: 'Zrównoważony wzorzec wyboru',
      adaptiveOffset: 0,
      color: 'gray',
      reasoning: 'Balanced choice pattern'
    };

  }, [analyzeChoicePatterns, analyzeMultistepPerformance]);

  // ===== DUAL-METRIC ADAPTIVE LOGIC ENGINE =====

  const getDualMetricAdaptiveOffset = useCallback(() => {
    const choiceAnalysis = analyzeChoicePatterns();
    const performanceAnalysis = analyzeMultistepPerformance();
    const hybridProfile = detectHybridProfile();

    // If we have a specific hybrid profile offset, use it
    if (hybridProfile.adaptiveOffset !== undefined) {
      return {
        finalOffset: hybridProfile.adaptiveOffset,
        choiceContribution: null,
        performanceContribution: null,
        method: 'hybrid_profile',
        profile: hybridProfile.profile
      };
    }

    // Fallback to weighted combination approach
    let choiceOffset = 0;
    let performanceOffset = 0;

    // Choice-based offset (original logic)
    if (choiceAnalysis && choiceAnalysis.totalChoices >= 3) {
      const { comfortRate, challengeRate, currentRate } = choiceAnalysis;

      if (comfortRate > 0.6) {
        choiceOffset = -0.5;
      } else if (challengeRate > 0.5) {
        choiceOffset = +0.5;
      } else if (currentRate > 0.6) {
        choiceOffset = 0;
      } else if (comfortRate > 0.4 && challengeRate < 0.2) {
        choiceOffset = -0.3;
      }
    }

    // Performance-based offset
    if (performanceAnalysis.avgMultistepScore !== null && performanceAnalysis.sampleSize >= 3) {
      const avgScore = performanceAnalysis.avgMultistepScore;
      const consistency = performanceAnalysis.consistencyScore || 0;
      const trend = performanceAnalysis.trend;

      if (avgScore > 85) {
        performanceOffset += 0.3; // Push high performers
      } else if (avgScore < 40) {
        performanceOffset -= 0.4; // Support struggling learners
      }

      // Consistency bonus/penalty
      if (consistency > 0.8) {
        performanceOffset += 0.2;
      } else if (consistency < 0.3) {
        performanceOffset -= 0.3;
      }

      // Trend adjustment
      if (trend === 'improving') {
        performanceOffset += 0.1;
      } else if (trend === 'declining') {
        performanceOffset -= 0.2;
      }

      // Time efficiency factor
      if (performanceAnalysis.timeEfficiency && performanceAnalysis.timeEfficiency < 0.5) {
        performanceOffset -= 0.2;
      }

      // Hint dependency penalty
      if (performanceAnalysis.hintDependency > 0.7) {
        performanceOffset -= 0.25;
      }
    }

    // Weighted combination (60% choice, 40% performance)
    const choiceWeight = performanceAnalysis.sampleSize >= 3 ? 0.6 : 1.0;
    const performanceWeight = performanceAnalysis.sampleSize >= 3 ? 0.4 : 0.0;

    const finalOffset = Math.max(-1.0, Math.min(1.0,
      (choiceOffset * choiceWeight) + (performanceOffset * performanceWeight)
    ));

    return {
      finalOffset,
      choiceContribution: choiceOffset * choiceWeight,
      performanceContribution: performanceOffset * performanceWeight,
      method: 'weighted_combination',
      choiceWeight,
      performanceWeight
    };

  }, [analyzeChoicePatterns, analyzeMultistepPerformance, detectHybridProfile]);

  // ===== DIFFICULTY ESTIMATION (from original) =====

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

  // ===== ENHANCED SUGGESTION GENERATION =====

  const generateEnhancedSuggestions = useMemo(() => {
    if (!currentProblem || !problems || problems.length === 0) return null;

    try {
      // Get adaptive offset from dual-metric system
      const adaptiveData = getDualMetricAdaptiveOffset();
      const adaptiveOffset = adaptiveData.finalOffset;

      // Generate 3-level difficulty suggestions with adaptive adjustments
      const currentDifficulty = estimateDifficulty(currentProblem);
      const adjustedBase = Math.max(1, Math.min(5, currentDifficulty + adaptiveOffset));

      const difficultyLevels = {
        comfort: {
          level: Math.max(1, Math.round(adjustedBase - 1)),
          label: "Powtórka",
          color: "green",
          description: "Utrwal podstawy"
        },
        current: {
          level: Math.max(1, Math.min(5, Math.round(adjustedBase))),
          label: "Dalej",
          color: "yellow",
          description: "Twój poziom"
        },
        challenge: {
          level: Math.min(5, Math.round(adjustedBase + 1)),
          label: "Wyzwanie",
          color: "orange",
          description: "Sprawdź się"
        }
      };

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

      // Enhanced suggestion generation with performance prediction
      const suggestionsByLevel = {};
      const usedProblemIds = new Set();
      const performanceAnalysis = analyzeMultistepPerformance();

      Object.entries(difficultyLevels).forEach(([key, config]) => {
        // Filter out already used problems
        const availableProblems = similar.filter(p => !usedProblemIds.has(p.id));

        // First try exact match
        let problemsAtLevel = availableProblems.filter(p => p.estimatedDifficulty === config.level);

        // Enhanced fallback logic
        if (problemsAtLevel.length === 0) {
          const sortedByDistance = availableProblems
            .map(p => ({
              ...p,
              distance: Math.abs(p.estimatedDifficulty - config.level)
            }))
            .sort((a, b) => a.distance - b.distance);

          problemsAtLevel = sortedByDistance.filter(p => p.distance <= 1);

          if (problemsAtLevel.length === 0 && sortedByDistance.length > 0) {
            problemsAtLevel = sortedByDistance.slice(0, 3);
          }
        }

        if (problemsAtLevel.length > 0) {
          const bestAtLevel = problemsAtLevel
            .sort((a, b) => b.similarity - a.similarity)[0];

          // Calculate expected performance metrics
          const expectedMetrics = calculateExpectedPerformance(bestAtLevel, performanceAnalysis, config);

          suggestionsByLevel[key] = {
            ...bestAtLevel,
            levelConfig: config,
            suggestionType: key,
            expectedMetrics,
            adaptiveReasoning: {
              adaptiveOffset,
              method: adaptiveData.method,
              profile: adaptiveData.profile || 'Unknown'
            }
          };

          usedProblemIds.add(bestAtLevel.id);
        }
      });

      // Fill missing suggestions
      const availableKeys = Object.keys(suggestionsByLevel);
      const missingKeys = ['comfort', 'current', 'challenge'].filter(k => !availableKeys.includes(k));

      if (missingKeys.length > 0 && similar.length > availableKeys.length) {
        const unusedProblems = similar.filter(p => !usedProblemIds.has(p.id));

        missingKeys.forEach((key, index) => {
          if (unusedProblems[index]) {
            const expectedMetrics = calculateExpectedPerformance(unusedProblems[index], performanceAnalysis, difficultyLevels[key]);

            suggestionsByLevel[key] = {
              ...unusedProblems[index],
              levelConfig: difficultyLevels[key],
              suggestionType: key,
              expectedMetrics,
              adaptiveReasoning: {
                adaptiveOffset,
                method: adaptiveData.method + '_fallback'
              }
            };
            usedProblemIds.add(unusedProblems[index].id);
          }
        });
      }

      const finalSuggestions = Object.values(suggestionsByLevel);

      // Save suggested problems to localStorage (as per original system)
      if (currentProblem.id && (currentProblem.id.includes('combinatorics') || currentProblem.id.includes('kombinatoryka'))) {
        const suggestedIds = finalSuggestions.slice(0, 2).map(p => p.id);
        localStorage.setItem('kombinatoryka-suggested-problems', JSON.stringify(suggestedIds));
        console.log('Saved suggested problems for kombinatoryka:', suggestedIds);
      }

      return finalSuggestions;

    } catch (err) {
      console.error('Error in enhanced suggestion generation:', err);
      return [];
    }
  }, [currentProblem, completedProblems, problems, getDualMetricAdaptiveOffset, analyzeMultistepPerformance]);

  // ===== PERFORMANCE PREDICTION =====

  const calculateExpectedPerformance = (problem, performanceAnalysis, levelConfig) => {
    // Default metrics for new users or insufficient data
    const defaults = {
      fit: 75,
      estimatedTime: Math.max(5, (problem.steps?.length || 3) * 3), // 3 min per step
      successRate: 70,
      reasoning: 'Based on problem complexity'
    };

    if (!performanceAnalysis.avgMultistepScore || performanceAnalysis.sampleSize < 3) {
      return defaults;
    }

    const avgScore = performanceAnalysis.avgMultistepScore;
    const consistency = performanceAnalysis.consistencyScore || 0.5;
    const timeEfficiency = performanceAnalysis.timeEfficiency || 0.5;

    // Calculate fit based on difficulty match and user performance
    const difficultyDifference = Math.abs(problem.estimatedDifficulty - levelConfig.level);
    const baseFit = Math.max(50, 100 - (difficultyDifference * 15));
    const performanceFit = avgScore > 70 ? Math.min(100, baseFit + 10) : Math.max(40, baseFit - 10);

    // Estimate success rate based on historical performance and problem difficulty
    let successRate = avgScore;
    if (levelConfig.level < problem.estimatedDifficulty) {
      successRate = Math.max(40, successRate - 15); // Harder than expected
    } else if (levelConfig.level > problem.estimatedDifficulty) {
      successRate = Math.min(95, successRate + 10); // Easier than expected
    }

    // Estimate time based on user's time efficiency and problem complexity
    const baseTimePerStep = timeEfficiency > 0.7 ? 2 : timeEfficiency > 0.4 ? 4 : 6; // minutes
    const estimatedTime = Math.max(3, (problem.steps?.length || 3) * baseTimePerStep);

    return {
      fit: Math.round(performanceFit),
      estimatedTime: Math.round(estimatedTime),
      successRate: Math.round(successRate),
      reasoning: `Based on ${performanceAnalysis.sampleSize} completed problems`
    };
  };

  // ===== DATA VALIDATION =====

  const validateMultiStepData = (data) => {
    if (!data || typeof data !== 'object') return false;

    const validationRules = [
      // Rule 1: Score percentages are logical
      () => data.multistepScore?.scorePercentage >= 0 && data.multistepScore?.scorePercentage <= 100,

      // Rule 2: Time spent is reasonable (10s to 60min)
      () => !data.completionTime || (data.completionTime > 10000 && data.completionTime < 3600000),

      // Rule 3: Step details are consistent
      () => !data.multistepScore?.stepDetails || data.multistepScore.stepDetails.length <= data.multistepScore.totalSteps,

      // Rule 4: Problem ID exists
      () => typeof data.problemId === 'string' && data.problemId.length > 0
    ];

    return validationRules.every(rule => {
      try {
        return rule();
      } catch (e) {
        console.warn('Validation rule failed for data:', data.problemId, e);
        return false;
      }
    });
  };

  // ===== ENHANCED DEBUG LOGGING & ANALYTICS =====

  const logEnhancedAnalytics = () => {
    const choiceAnalysis = analyzeChoicePatterns();
    const performanceAnalysis = analyzeMultistepPerformance();
    const hybridProfile = detectHybridProfile();
    const adaptiveData = getDualMetricAdaptiveOffset();

    console.group('🧠 NextProblemSuggestionMultiStep Analytics v2.0');

    console.log('📋 Current State:', {
      currentProblem: currentProblem?.id,
      currentDifficulty: currentProblem ? estimateDifficulty(currentProblem) : null,
      completedCount: completedProblems.size,
      suggestedCount: generateEnhancedSuggestions?.length || 0
    });

    if (choiceAnalysis) {
      console.log('📊 Choice Patterns:', choiceAnalysis.preferences);
    }

    if (performanceAnalysis.sampleSize > 0) {
      console.log('🎯 Performance Analysis:', {
        avgScore: performanceAnalysis.avgMultistepScore + '%',
        consistency: performanceAnalysis.consistencyScore,
        trend: performanceAnalysis.trend,
        sampleSize: performanceAnalysis.sampleSize,
        dataQuality: performanceAnalysis.dataQuality
      });
    }

    console.log('👤 Hybrid Profile:', {
      profile: hybridProfile.profile,
      confidence: hybridProfile.confidence,
      adaptiveOffset: hybridProfile.adaptiveOffset,
      reasoning: hybridProfile.reasoning
    });

    console.log('⚖️ Adaptive Offset Calculation:', {
      finalOffset: adaptiveData.finalOffset,
      method: adaptiveData.method,
      choiceContribution: adaptiveData.choiceContribution,
      performanceContribution: adaptiveData.performanceContribution
    });

    if (generateEnhancedSuggestions && generateEnhancedSuggestions.length > 0) {
      console.log('✨ Enhanced Suggestions:', generateEnhancedSuggestions.map(s => ({
        type: s.suggestionType,
        difficulty: s.estimatedDifficulty,
        targetDifficulty: s.levelConfig?.level,
        isExactMatch: s.estimatedDifficulty === s.levelConfig?.level,
        similarity: Math.round(s.similarity * 100) + '%',
        expectedFit: s.expectedMetrics?.fit + '%',
        expectedTime: s.expectedMetrics?.estimatedTime + ' min',
        expectedSuccess: s.expectedMetrics?.successRate + '%'
      })));
    }

    console.groupEnd();
  };

  // ===== EXPORT FUNCTION =====

  const exportLearningDataMultiStep = () => {
    const data = {
      timestamp: new Date().toISOString(),
      version: '2.0_multistep',
      choiceHistory: getEnhancedChoiceHistory(),
      choiceAnalysis: analyzeChoicePatterns(),
      performanceAnalysis: analyzeMultistepPerformance(),
      hybridProfile: detectHybridProfile(),
      adaptiveData: getDualMetricAdaptiveOffset(),
      currentSession: {
        currentProblem: currentProblem?.id,
        currentDifficulty: currentProblem ? estimateDifficulty(currentProblem) : null,
        completedCount: completedProblems.size,
        availableProblems: problems.length
      }
    };

    console.log('📦 Enhanced Learning Data Export:', data);
    localStorage.setItem('learning-data-export-multistep', JSON.stringify(data, null, 2));
    return data;
  };

  // Run analytics
  if (typeof window !== 'undefined') {
    logEnhancedAnalytics();
    window.exportLearningDataMultiStep = exportLearningDataMultiStep;
  }

  // ===== EVENT HANDLERS =====

  const handleEnhancedSuggestionClick = (problem, suggestionType = null, multistepData = null) => {
    if (problem && onSelectProblem) {
      // Track the enhanced choice
      if (suggestionType && currentProblem) {
        const currentDifficulty = estimateDifficulty(currentProblem);
        trackEnhancedChoice(problem.id, suggestionType, currentDifficulty, multistepData);
      }

      onSelectProblem(problem);
    }
  };

  // Continue with UI implementation...

  return (
    <div className="next-problem-suggestion-multistep">
      <div className="text-sm text-gray-600 mb-2">NextProblemSuggestionMultiStep v2.0</div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 space-y-1 mb-4 p-2 bg-gray-50 rounded">
        <div>Choice History: {getEnhancedChoiceHistory().length} entries</div>
        <div>Performance Data: {analyzeMultistepPerformance().sampleSize} problems</div>
        <div>Profile: {detectHybridProfile().profile}</div>
        <div>Adaptive Offset: {getDualMetricAdaptiveOffset().finalOffset?.toFixed(2)}</div>
        <div>Suggestions: {generateEnhancedSuggestions?.length || 0}</div>
      </div>

      {/* Basic Implementation - will be enhanced with full UI */}
      {generateEnhancedSuggestions && generateEnhancedSuggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800">Enhanced Suggestions</h3>
          {generateEnhancedSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleEnhancedSuggestionClick(suggestion, suggestion.suggestionType)}
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  suggestion.levelConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                  suggestion.levelConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  suggestion.levelConfig.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {suggestion.levelConfig.label}
                </span>
                <div className="text-xs text-gray-500">
                  {suggestion.expectedMetrics.fit}% fit
                </div>
              </div>

              <div className="text-sm text-gray-900 mb-2">
                <MathRenderer content={suggestion.statement} />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>~{suggestion.expectedMetrics.estimatedTime} min</span>
                <span>{suggestion.expectedMetrics.successRate}% success</span>
                <span>{suggestion.steps?.length || 0} steps</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextProblemSuggestionMultiStep;