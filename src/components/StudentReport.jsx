import React, { useEffect, useState } from 'react';
import { analyzeQuiz } from '../utils/quizAnalyzer';
import MathRenderer from './MathRenderer';

const StudentReport = ({ quizData, onStartLearning, onRetakeQuiz }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        // Użyj lokalnej analizy
        const results = analyzeQuiz(quizData);
        setAnalysis(results);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [quizData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Analizuję Twoje odpowiedzi...</p>
          <p className="text-sm text-gray-400 mt-2">To może potrwać kilka sekund</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { results, motivationalMessage, recommendations, strongestCategories, incorrectAnswers } = analysis;
  const percentage = results.percentage;

  // Określ kolor na podstawie wyniku
  const getScoreColor = (percent) => {
    if (percent >= 80) return 'text-green-400';
    if (percent >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header z wynikiem */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Raport z Quizu</h1>
          
          <div className="mb-6">
            <div className={`text-7xl font-bold mb-2 ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            <div className="text-2xl text-gray-400">
              {results.score} / {results.total} poprawnych odpowiedzi
            </div>
          </div>

          {/* Motywująca wiadomość */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="text-3xl mb-2">{motivationalMessage.emoji}</div>
            <h2 className="text-xl font-semibold mb-2">{motivationalMessage.title}</h2>
            <p className="text-gray-300">{motivationalMessage.message}</p>
          </div>

          {/* Czas */}
          <div className="text-gray-400">
            Czas rozwiązywania: {results.timeSpent} minut
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Wyniki według poziomów */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Wyniki według poziomów</h3>
            <div className="space-y-4">
              {Object.entries(results.byLevel).map(([level, stats]) => (
                <div key={level}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">
                      Poziom {level === '1' ? 'Podstawowy' : level === '2' ? 'Średni' : 'Zaawansowany'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${
                        level === '1' ? 'bg-green-500' : 
                        level === '2' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {stats.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mocne strony */}
          {strongestCategories.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Twoje mocne strony</h3>
              <div className="space-y-3">
                {strongestCategories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{cat.name}</span>
                    <span className="text-green-400 font-semibold">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rekomendacje */}
        {recommendations.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Rekomendacje do nauki</h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-200">{rec.category}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-900/50 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-blue-900/50 text-blue-400'
                    }`}>
                      Priorytet: {rec.priority === 'high' ? 'Wysoki' : 
                                rec.priority === 'medium' ? 'Średni' : 'Niski'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{rec.skill}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Twój wynik: {rec.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Błędne odpowiedzi */}
        {incorrectAnswers.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Przegląd błędnych odpowiedzi</h3>
            <div className="space-y-4">
              {incorrectAnswers.map((item, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="mb-2">
                    <MathRenderer content={item.question.content} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-900/20 border border-red-800 rounded p-2">
                      <span className="text-red-400 font-semibold">Twoja odpowiedź: </span>
                      <MathRenderer content={item.question.options[item.selected]} />
                    </div>
                    <div className="bg-green-900/20 border border-green-800 rounded p-2">
                      <span className="text-green-400 font-semibold">Poprawna: </span>
                      <MathRenderer content={item.question.options[item.correct]} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Akcje */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onStartLearning}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Przejdź do nauki
          </button>
          <button
            onClick={onRetakeQuiz}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Powtórz quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;