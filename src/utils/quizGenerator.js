import quizQuestions from '../data/quiz-questions.json';

/**
 * Generuje quiz składający się z 10 pytań
 * @param {Object} options - opcje generowania quizu
 * @param {number} options.questionsPerLevel - liczba pytań z każdego poziomu
 * @param {boolean} options.shuffle - czy mieszać pytania (domyślnie true)
 * @returns {Object} wygenerowany quiz
 */
export const generateQuiz = (options = {}) => {
  const {
    questionsPerLevel = 3,  // 3 pytania z poziomów 1 i 2, 4 z poziomu 3 = 10 pytań
    shuffle = true
  } = options;

  // Grupowanie pytań według poziomów
  const questionsByLevel = {
    1: quizQuestions.questions.filter(q => q.level === 1),
    2: quizQuestions.questions.filter(q => q.level === 2),
    3: quizQuestions.questions.filter(q => q.level === 3)
  };

  // Funkcja do losowego wyboru pytań z danego poziomu
  const selectRandomQuestions = (questions, count) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questions.length));
  };

  // Wybieranie pytań z każdego poziomu (3 + 3 + 4 = 10)
  const selectedQuestions = [
    ...selectRandomQuestions(questionsByLevel[1], questionsPerLevel),
    ...selectRandomQuestions(questionsByLevel[2], questionsPerLevel),
    ...selectRandomQuestions(questionsByLevel[3], questionsPerLevel + 1)  // +1 dla poziomu 3
  ];

  // Opcjonalne mieszanie wszystkich pytań
  const finalQuestions = shuffle 
    ? selectedQuestions.sort(() => 0.5 - Math.random())
    : selectedQuestions;

  return {
    id: `quiz_${Date.now()}`,
    title: quizQuestions.title,
    subject: quizQuestions.subject,
    questions: finalQuestions,
    metadata: {
      totalQuestions: finalQuestions.length,
      questionsPerLevel: {
        level1: selectedQuestions.filter(q => q.level === 1).length,
        level2: selectedQuestions.filter(q => q.level === 2).length,
        level3: selectedQuestions.filter(q => q.level === 3).length
      },
      generatedAt: new Date().toISOString(),
      shuffled: shuffle
    }
  };
};

/**
 * Generuje quiz z określonym rozkładem pytań
 * @param {Object} distribution - rozkład pytań {level1: count, level2: count, level3: count}
 * @returns {Object} wygenerowany quiz
 */
export const generateCustomQuiz = (distribution) => {
  const questionsByLevel = {
    1: quizQuestions.questions.filter(q => q.level === 1),
    2: quizQuestions.questions.filter(q => q.level === 2),
    3: quizQuestions.questions.filter(q => q.level === 3)
  };

  const selectRandomQuestions = (questions, count) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questions.length));
  };

  const selectedQuestions = [
    ...selectRandomQuestions(questionsByLevel[1], distribution.level1 || 0),
    ...selectRandomQuestions(questionsByLevel[2], distribution.level2 || 0),
    ...selectRandomQuestions(questionsByLevel[3], distribution.level3 || 0)
  ];

  // Mieszanie pytań
  const finalQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

  return {
    id: `custom_quiz_${Date.now()}`,
    title: `${quizQuestions.title} - Quiz Niestandardowy`,
    subject: quizQuestions.subject,
    questions: finalQuestions,
    metadata: {
      totalQuestions: finalQuestions.length,
      questionsPerLevel: {
        level1: distribution.level1 || 0,
        level2: distribution.level2 || 0,
        level3: distribution.level3 || 0
      },
      generatedAt: new Date().toISOString(),
      custom: true
    }
  };
};

/**
 * Pobiera wszystkie dostępne pytania według poziomów
 * @returns {Object} pytania pogrupowane według poziomów
 */
export const getQuestionsByLevel = () => {
  return {
    level1: quizQuestions.questions.filter(q => q.level === 1),
    level2: quizQuestions.questions.filter(q => q.level === 2),
    level3: quizQuestions.questions.filter(q => q.level === 3)
  };
};

/**
 * Pobiera statystyki dostępnych pytań
 * @returns {Object} statystyki pytań
 */
export const getQuizStatistics = () => {
  const questionsByLevel = getQuestionsByLevel();
  
  return {
    total: quizQuestions.questions.length,
    byLevel: {
      level1: questionsByLevel.level1.length,
      level2: questionsByLevel.level2.length,
      level3: questionsByLevel.level3.length
    },
    tags: [...new Set(quizQuestions.questions.flatMap(q => q.tags))],
    scoring: quizQuestions.scoring
  };
};