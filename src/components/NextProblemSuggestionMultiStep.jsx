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

  // ===== UI UTILITIES =====

  const getProfileColorClass = (profile) => {
    switch (profile.color) {
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceRingColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMicroTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  // ===== COMPACT MODE UI =====

  if (compact && generateEnhancedSuggestions && generateEnhancedSuggestions.length > 0) {
    const primaryProblem = generateEnhancedSuggestions.find(p => p.suggestionType === 'current') || generateEnhancedSuggestions[0];
    const performanceAnalysis = analyzeMultistepPerformance();
    const hybridProfile = detectHybridProfile();

    return (
      <div className="relative group animate-fadeInScale">
        <button
          onClick={() => handleEnhancedSuggestionClick(primaryProblem, primaryProblem.suggestionType)}
          className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-orange-400 text-stone-700 hover:bg-orange-50 rounded-lg transition-all animate-pulse-border shadow-lg shadow-orange-200/50"
        >
          <span className="text-xs font-medium">Następne</span>

          {/* Performance Ring Indicator */}
          {performanceAnalysis.avgMultistepScore !== null && (
            <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              getPerformanceRingColor(performanceAnalysis.avgMultistepScore)
            }`} style={{
              borderColor: 'currentColor',
              backgroundColor: 'rgba(255,255,255,0.9)'
            }}>
              <span className="text-[8px] font-bold">
                {Math.round(performanceAnalysis.avgMultistepScore)}
              </span>
            </div>
          )}

          <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
          </svg>
        </button>

        {/* Enhanced Hover Tooltip */}
        <div className="absolute top-full right-0 mt-2 w-[500px] bg-white border border-stone-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

          {/* Tooltip Header */}
          <div className="p-3 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wider">
                Wybierz poziom trudności
              </h4>
              <div className="text-xs text-stone-500">
                {getMicroTrendIcon(performanceAnalysis.trend)} {performanceAnalysis.trend || 'brak danych'}
              </div>
            </div>

            {/* Learner Profile Badge */}
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getProfileColorClass(hybridProfile)}`}>
              👤 {hybridProfile.profile}
              {hybridProfile.confidence && (
                <span className="ml-1 opacity-75">({Math.round(hybridProfile.confidence * 100)}%)</span>
              )}
            </div>
          </div>

          {/* Suggestions Grid */}
          <div className="space-y-1">
            {['comfort', 'current', 'challenge'].map((type) => {
              const problem = generateEnhancedSuggestions.find(p => p.suggestionType === type);
              if (!problem) return null;

              const config = problem.levelConfig;
              const metrics = problem.expectedMetrics;

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
                  case 'green': return 'text-green-700 bg-green-100';
                  case 'yellow': return 'text-yellow-700 bg-yellow-100';
                  case 'orange': return 'text-orange-700 bg-orange-100';
                  default: return 'text-gray-700 bg-gray-100';
                }
              };

              return (
                <div
                  key={problem.id}
                  onClick={() => handleEnhancedSuggestionClick(problem, type)}
                  className={`p-3 cursor-pointer transition-all duration-200 border border-stone-200 rounded-lg bg-white hover:shadow-sm ${getHoverBorderColor()}`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getLabelColor()}`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className={`font-medium ${getPerformanceRingColor(metrics.fit)}`}>
                        {metrics.fit}% dopasowanie
                      </span>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="text-sm text-stone-900 mb-2">
                    <MathRenderer content={problem.statement} />
                  </div>

                  {/* Enhanced Metrics Row */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-stone-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>~{metrics.estimatedTime}min</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>{metrics.successRate}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>{problem.steps?.length || 0} kroków</span>
                    </div>
                    <div className="text-stone-400">
                      {config.description}
                    </div>
                  </div>

                  {/* Adaptive Reasoning (when enabled) */}
                  {showReasoningDetails && problem.adaptiveReasoning && (
                    <details className="mt-2">
                      <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">
                        Dlaczego ten wybór? 🤔
                      </summary>
                      <div className="text-xs text-stone-600 mt-1 p-2 bg-stone-50 rounded">
                        <p><strong>Metoda:</strong> {problem.adaptiveReasoning.method}</p>
                        <p><strong>Profil:</strong> {problem.adaptiveReasoning.profile}</p>
                        <p><strong>Offset:</strong> {problem.adaptiveReasoning.adaptiveOffset?.toFixed(2)}</p>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>

          {/* Performance Analytics Footer */}
          {performanceAnalysis.sampleSize > 0 && (
            <div className="p-3 border-t border-stone-100 bg-stone-50">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-medium text-stone-700">Średni wynik</div>
                  <div className={`text-lg font-bold ${getPerformanceRingColor(performanceAnalysis.avgMultistepScore)}`}>
                    {performanceAnalysis.avgMultistepScore}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-stone-700">Konsystencja</div>
                  <div className="text-lg font-bold text-stone-600">
                    {Math.round((performanceAnalysis.consistencyScore || 0) * 100)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-stone-700">Próbka</div>
                  <div className="text-lg font-bold text-stone-600">
                    {performanceAnalysis.sampleSize}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== FALLBACK COMPACT MODE =====

  if (compact && (!generateEnhancedSuggestions || generateEnhancedSuggestions.length === 0)) {
    // Fallback - show next sequential problem (like original system)
    const nextProblem = problems.find(p => !completedProblems.has(p.id) && p.id !== currentProblem?.id);
    if (nextProblem) {
      return (
        <div className="relative group animate-fadeInScale">
          <button
            onClick={() => handleEnhancedSuggestionClick(nextProblem, 'fallback')}
            className="flex items-center gap-2 px-3 py-1.5 bg-transparent border-2 border-orange-400 text-stone-700 hover:bg-orange-50 rounded-lg transition-all animate-pulse-border shadow-lg shadow-orange-200/50"
          >
            <span className="text-xs font-medium">Następne</span>
            <div className="text-xs text-orange-600 opacity-75">(fallback)</div>
            <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
            </svg>
          </button>

          {/* Hover tooltip with problem preview */}
          <div className="absolute top-full right-0 mt-2 w-96 p-4 bg-white border border-stone-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="text-sm text-stone-900">
              <MathRenderer content={nextProblem.statement} />
            </div>
            <div className="mt-2 text-xs text-stone-500">
              Brak danych do inteligentnych sugestii - używam kolejnego zadania
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // ===== FULL MODE UI =====

  return (
    <div className="next-problem-suggestion-multistep">

      {/* Development Header */}
      {showReasoningDetails && (
        <>
          <div className="text-sm text-gray-600 mb-2">NextProblemSuggestionMultiStep v2.0</div>
          <div className="text-xs text-gray-500 space-y-1 mb-4 p-2 bg-gray-50 rounded">
            <div>Choice History: {getEnhancedChoiceHistory().length} entries</div>
            <div>Performance Data: {analyzeMultistepPerformance().sampleSize} problems</div>
            <div>Profile: {detectHybridProfile().profile}</div>
            <div>Adaptive Offset: {getDualMetricAdaptiveOffset().finalOffset?.toFixed(2)}</div>
            <div>Suggestions: {generateEnhancedSuggestions?.length || 0}</div>
          </div>
        </>
      )}

      {/* Enhanced Full Mode Suggestions */}
      {generateEnhancedSuggestions && generateEnhancedSuggestions.length > 0 ? (
        <div className="space-y-4">

          {/* Header with Profile */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-800">Sugerowane zadania</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getProfileColorClass(detectHybridProfile())}`}>
              {detectHybridProfile().profile}
            </div>
          </div>

          {/* Suggestions Grid */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {generateEnhancedSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleEnhancedSuggestionClick(suggestion, suggestion.suggestionType)}
                className="text-left p-4 border-2 border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-md transition-all group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    suggestion.levelConfig.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
                    suggestion.levelConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    suggestion.levelConfig.color === 'orange' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {suggestion.levelConfig.label}
                  </span>
                  <div className="text-xs text-stone-500 font-medium">
                    {suggestion.expectedMetrics.fit}% dopasowanie
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-stone-900 mb-3 leading-relaxed">
                  <MathRenderer content={suggestion.statement} />
                </div>

                {/* Enhanced Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mb-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>~{suggestion.expectedMetrics.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>{suggestion.expectedMetrics.successRate}% sukces</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>{suggestion.steps?.length || 0} kroków</span>
                  </div>
                  <div className="text-stone-500">
                    {suggestion.levelConfig.description}
                  </div>
                </div>

                {/* Action Indicator */}
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                    <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // No suggestions available
        <div className="text-center py-8 text-stone-600">
          <div className="text-sm">Brak dostępnych sugestii</div>
          <div className="text-xs text-stone-500 mt-1">
            Spróbuj rozwiązać więcej zadań aby otrzymać spersonalizowane rekomendacje
          </div>
        </div>
      )}
    </div>
  );
};

export default NextProblemSuggestionMultiStep;