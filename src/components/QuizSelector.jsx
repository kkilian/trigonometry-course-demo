import React from 'react';

const QuizSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="bg-gray-900/50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Trygonometria</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onModeChange('course')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentMode === 'course'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Kurs (194 zadania)
                </div>
              </button>
              <button
                onClick={() => onModeChange('quiz')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentMode === 'quiz'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Quiz (10 pytań)
                </div>
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {currentMode === 'course' 
              ? 'Ucz się krok po kroku z rozwiązaniami'
              : 'Sprawdź swoją wiedzę w teście'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSelector;