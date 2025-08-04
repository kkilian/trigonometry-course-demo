/**
 * Quiz Analyzer - analizuje wyniki quizu i generuje rekomendacje
 * Uproszczona wersja bez AI - tylko lokalna analiza
 */

// Kategorie wiedzy do analizy
const KNOWLEDGE_CATEGORIES = {
  'wartości_podstawowe': {
    name: 'Wartości podstawowe',
    tags: ['sin', 'cos', 'tan', 'basic_values', 'angles'],
    specificSkills: {
      high: 'obliczanie wartości sin/cos/tan dla kątów 0°, 30°, 45°, 60°, 90°',
      medium: 'wartości funkcji trygonometrycznych dla podstawowych kątów',
      low: 'podstawowe wartości funkcji trygonometrycznych'
    }
  },
  'tożsamości': {
    name: 'Tożsamości trygonometryczne',
    tags: ['identity', 'pythagorean_identity', 'basic_identities'],
    specificSkills: {
      high: 'stosowanie tożsamości sin²α + cos²α = 1 oraz przekształcanie wyrażeń',
      medium: 'podstawowe tożsamości trygonometryczne',
      low: 'tożsamości trygonometryczne'
    }
  },
  'równania': {
    name: 'Równania trygonometryczne',
    tags: ['equations', 'rownania_trygonometryczne'],
    specificSkills: {
      high: 'rozwiązywanie równań typu sin(x) = a, cos(x) = b z uwzględnieniem okresowości',
      medium: 'podstawowe równania trygonometryczne',
      low: 'równania trygonometryczne'
    }
  },
  'funkcje': {
    name: 'Funkcje i wykresy',
    tags: ['functions', 'graphs', 'period', 'amplitude'],
    specificSkills: {
      high: 'określanie okresów, amplitud i przesunięć funkcji trygonometrycznych',
      medium: 'własności funkcji trygonometrycznych',
      low: 'funkcje trygonometryczne'
    }
  },
  'wzory': {
    name: 'Wzory i przekształcenia',
    tags: ['formulas', 'reduction_formulas', 'angle_addition', 'double_angle'],
    specificSkills: {
      high: 'wzory redukcyjne, sin(α±β), cos(α±β), sin(2α), cos(2α)',
      medium: 'wzory na sumę i różnicę kątów',
      low: 'wzory trygonometryczne'
    }
  },
  'zastosowania': {
    name: 'Zastosowania praktyczne',
    tags: ['applications', 'geometry', 'physics', 'real_world'],
    specificSkills: {
      high: 'zastosowanie trygonometrii w zadaniach geometrycznych i fizycznych',
      medium: 'praktyczne zastosowania trygonometrii',
      low: 'zastosowania trygonometrii'
    }
  }
};

/**
 * Analizuje odpowiedzi ucznia i kategoryzuje je
 */
const categorizeAnswers = (answers, questions) => {
  const categoryStats = {};
  
  // Inicjalizacja statystyk dla każdej kategorii
  Object.keys(KNOWLEDGE_CATEGORIES).forEach(catKey => {
    categoryStats[catKey] = {
      correct: 0,
      total: 0,
      percentage: 0,
      questions: []
    };
  });

  // Analiza każdego pytania
  answers.forEach((answer, index) => {
    const question = questions[index];
    
    // Znajdź kategorię dla pytania na podstawie tagów
    Object.entries(KNOWLEDGE_CATEGORIES).forEach(([catKey, category]) => {
      const hasTag = question.tags?.some(tag => 
        category.tags.includes(tag)
      );
      
      if (hasTag) {
        categoryStats[catKey].total++;
        if (answer.isCorrect) {
          categoryStats[catKey].correct++;
        }
        categoryStats[catKey].questions.push({
          id: question.id,
          correct: answer.isCorrect,
          level: question.level
        });
      }
    });
  });

  // Oblicz procenty
  Object.keys(categoryStats).forEach(catKey => {
    const stats = categoryStats[catKey];
    if (stats.total > 0) {
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    }
  });

  return categoryStats;
};

/**
 * Generuje wiadomość motywacyjną na podstawie wyniku
 */
const getMotivationalMessage = (percentage, level) => {
  if (percentage >= 90) {
    return {
      title: 'Świetna robota! 🌟',
      message: 'Twoja wiedza z trygonometrii jest na bardzo wysokim poziomie. Możesz przejść do bardziej zaawansowanych zagadnień.',
      emoji: '🏆'
    };
  } else if (percentage >= 70) {
    return {
      title: 'Dobry wynik! 👍',
      message: 'Masz solidne podstawy z trygonometrii. Warto popracować nad obszarami, które sprawiają Ci trudność.',
      emoji: '✨'
    };
  } else if (percentage >= 50) {
    return {
      title: 'Nieźle, ale może być lepiej 💪',
      message: 'Znasz podstawy, ale warto poświęcić więcej czasu na ćwiczenia. Skup się na kategoriach z najniższymi wynikami.',
      emoji: '📚'
    };
  } else {
    return {
      title: 'Potrzebujesz więcej praktyki 📖',
      message: 'Nie martw się! Każdy zaczynał od podstaw. Systematyczna nauka przyniesie efekty.',
      emoji: '🎯'
    };
  }
};

/**
 * Generuje rekomendacje na podstawie wyników
 */
const generateRecommendations = (categoryStats) => {
  const recommendations = [];
  
  Object.entries(categoryStats).forEach(([catKey, stats]) => {
    if (stats.total > 0 && stats.percentage < 70) {
      const category = KNOWLEDGE_CATEGORIES[catKey];
      const skillLevel = stats.percentage < 30 ? 'low' : stats.percentage < 60 ? 'medium' : 'high';
      
      recommendations.push({
        category: category.name,
        percentage: stats.percentage,
        skill: category.specificSkills[skillLevel],
        priority: stats.percentage < 30 ? 'high' : stats.percentage < 60 ? 'medium' : 'low'
      });
    }
  });
  
  // Sortuj według priorytetu
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return recommendations.slice(0, 3); // Zwróć top 3 rekomendacje
};

/**
 * Główna funkcja analizująca quiz
 */
export const analyzeQuiz = (quizData) => {
  const { questions, answers, timeSpent } = quizData;
  
  // Podstawowe statystyki
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Analiza według poziomów
  const levelStats = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 }
  };
  
  answers.forEach((answer, index) => {
    const level = questions[index].level;
    levelStats[level].total++;
    if (answer.isCorrect) {
      levelStats[level].correct++;
    }
  });
  
  // Oblicz procenty dla poziomów
  Object.keys(levelStats).forEach(level => {
    const stats = levelStats[level];
    stats.percentage = stats.total > 0 
      ? Math.round((stats.correct / stats.total) * 100) 
      : 0;
  });
  
  // Analiza według kategorii
  const categoryStats = categorizeAnswers(answers, questions);
  
  // Generuj wiadomość motywacyjną
  const averageLevel = Math.round(
    (levelStats[1].percentage + levelStats[2].percentage + levelStats[3].percentage) / 3
  );
  const motivationalMessage = getMotivationalMessage(percentage, averageLevel);
  
  // Generuj rekomendacje
  const recommendations = generateRecommendations(categoryStats);
  
  // Analiza błędów
  const incorrectAnswers = answers
    .map((answer, index) => ({
      ...answer,
      question: questions[index]
    }))
    .filter(item => !item.isCorrect);
  
  return {
    results: {
      score: correctAnswers,
      total: totalQuestions,
      percentage,
      timeSpent: Math.floor(timeSpent / 60), // w minutach
      byLevel: levelStats,
      byCategory: categoryStats
    },
    motivationalMessage,
    recommendations,
    incorrectAnswers: incorrectAnswers.slice(0, 5), // Top 5 błędów
    strongestCategories: Object.entries(categoryStats)
      .filter(([_, stats]) => stats.percentage >= 70 && stats.total > 0)
      .map(([catKey, stats]) => ({
        name: KNOWLEDGE_CATEGORIES[catKey].name,
        percentage: stats.percentage
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
  };
};