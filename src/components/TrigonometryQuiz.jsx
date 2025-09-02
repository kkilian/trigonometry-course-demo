import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../utils/quizGenerator';
import MathRenderer from './MathRenderer';
import StudentReport from './StudentReport';

const TrigonometryQuiz = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);

  useEffect(() => {
    // Generuj quiz przy pierwszym załadowaniu
    const newQuiz = generateQuiz({
      shuffle: true  // domyślnie 10 pytań (3+3+4 z różnych poziomów)
    });
    setQuestions(newQuiz.questions);
    setQuizStartTime(Date.now());
  }, []);

  const handleSelectAnswer = (optionKey) => {
    if (!showResult) {
      setSelectedAnswer(optionKey);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
      setShowResult(true);
      setAnswers([...answers, { 
        questionId: questions[currentQuestion].id, 
        selected: selectedAnswer, 
        correct: questions[currentQuestion].correctAnswer,
        isCorrect 
      }]);
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    const newQuiz = generateQuiz({
      shuffle: true
    });
    setQuestions(newQuiz.questions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizStartTime(Date.now());
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 p-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            ← Powrót
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-8">
          <p>Ładowanie quizu...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isComplete = answers.length === questions.length;
  
  // Jeśli quiz jest zakończony, pokaż raport
  if (isComplete) {
    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    const quizData = {
      questions,
      answers,
      timeSpent
    };
    
    return (
      <StudentReport 
        quizData={quizData}
        onStartLearning={() => {
          // Przekieruj do kursu
          onBack();
        }}
        onRetakeQuiz={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
          </svg>
          Powrót do kursu
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Quiz Trygonometryczny</h1>
            <div className="text-lg text-stone-600">
              Pytanie {currentQuestion + 1} z {questions.length}
            </div>
          </div>
          
          <div className="bg-stone-200 rounded-lg p-2 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded transition-all duration-500" 
                 style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {!isComplete ? (
          <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
            <div className="mb-6">
              {/* Poziom pytania */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  question.level === 1 ? 'bg-stone-200 text-stone-700' :
                  question.level === 2 ? 'bg-stone-300 text-stone-800' : 'bg-stone-400 text-stone-900'
                }`}>
                  Poziom {question.level === 1 ? 'Podstawowy' : 
                          question.level === 2 ? 'Średni' : 'Zaawansowany'}
                </span>
              </div>

              <h2 className="text-xl mb-4">
                <MathRenderer content={question.content} />
              </h2>
            </div>

            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`w-full rounded-lg transition-colors ${
                    showResult
                      ? key === question.correctAnswer
                        ? 'relative'
                        : key === selectedAnswer
                        ? 'bg-stone-200 border border-stone-400'
                        : 'bg-stone-50 border border-stone-200'
                      : selectedAnswer === key
                      ? 'bg-stone-200 border border-stone-400'
                      : 'bg-stone-50 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {/* Poprawna odpowiedź z żółtym efektem i wyjaśnieniem */}
                  {showResult && key === question.correctAnswer ? (
                    <div className="relative">
                      <div className="absolute -inset-4 bg-yellow-500/10 blur-2xl rounded-2xl animate-pulse"></div>
                      <div className="relative p-4 bg-yellow-50 border border-yellow-300 rounded-lg ring-2 ring-yellow-400/30 animate-pulse shadow-lg shadow-yellow-300/20">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="font-semibold text-yellow-700">
                            {key}.
                          </span>
                          <div className="text-yellow-700 flex-1">
                            <MathRenderer content={value} />
                          </div>
                          <span className="text-green-600 text-sm font-semibold">✓ Poprawna</span>
                        </div>
                        <div className="border-t border-yellow-200 pt-3">
                          <div className="text-yellow-700 text-sm font-semibold mb-1">Wyjaśnienie:</div>
                          <div className="text-yellow-600 leading-relaxed text-sm">
                            <MathRenderer content={question.explanation} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectAnswer(key)}
                      disabled={showResult}
                      className="w-full text-left p-4 rounded-lg flex items-start gap-3"
                    >
                      <span className="font-semibold">
                        {key}.
                      </span>
                      <div className="flex-1">
                        <MathRenderer content={value} />
                      </div>
                      {showResult && key === selectedAnswer && key !== question.correctAnswer && (
                        <span className="text-stone-500 text-sm">✗ Błędna</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              {!showResult ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedAnswer === null
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-700 hover:bg-stone-800 text-white'
                  }`}
                >
                  Sprawdź odpowiedź
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-semibold ${
                    selectedAnswer === question.correctAnswer ? 'text-stone-700' : 'text-stone-500'
                  }`}>
                    {selectedAnswer === question.correctAnswer ? 'Dobrze!' : 'Źle!'}
                  </span>
                  {!isLastQuestion ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-stone-700 hover:bg-stone-800 text-white rounded-lg font-semibold transition-colors"
                    >
                      Następne pytanie
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-stone-700 hover:bg-stone-800 text-white rounded-lg font-semibold transition-colors"
                    >
                      Zakończ quiz
                    </button>
                  )}
                </div>
              )}
              
              <div className="text-lg text-stone-600">
                Wynik: {score}/{answers.length}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrigonometryQuiz;