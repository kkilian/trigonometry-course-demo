import React from 'react';

const QuizSelector = ({ currentMode, onModeChange, onBackToWelcome }) => {
  return (
    <div className="bg-gray-900/50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex flex-col gap-3">
          {/* Subject selector */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Back to Welcome button */}
              <button
                onClick={onBackToWelcome}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
                title="Powrót do menu głównego"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              
              <h2 className="text-lg md:text-xl font-bold text-white">
                {currentMode === 'sequences' ? 'Ciągi Geometryczne' :
                 currentMode === 'sequences-intro' ? 'Ciągi Wstęp' :
                 currentMode === 'quiz' ? 'Quiz' :
                 'Trygonometria'}
              </h2>
            </div>
            
            <div className="text-xs md:text-sm text-gray-400 hidden md:block">
              {currentMode === 'trigonometry' 
                ? 'Ucz się trygonometrii krok po kroku'
                : currentMode === 'sequences'
                ? 'Poznaj ciągi geometryczne'
                : currentMode === 'sequences-intro'
                ? 'Naucz się podstaw ciągów'
                : 'Sprawdź swoją wiedzę w teście'
              }
            </div>
          </div>
          
          {/* Mode buttons */}
          <div className="flex gap-2 w-full overflow-x-auto">
            <button
              onClick={() => onModeChange('trigonometry')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap ${
                currentMode === 'trigonometry'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17 3a2.828 2.828 0 114 0 2.828 2.828 0 01-4 0z M9 3l3.894 3.894M16 7l1 6-6 1-4-4z" />
                </svg>
                <span className="hidden md:inline">Trygonometria (175)</span>
                <span className="md:hidden">Tryg.</span>
              </div>
            </button>
            
            <button
              onClick={() => onModeChange('sequences')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap ${
                currentMode === 'sequences'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 12h6m-6 4h6m2 5H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z M5 9h.01M5 13h.01M5 17h.01" />
                </svg>
                <span className="hidden md:inline">Ciągi (34)</span>
                <span className="md:hidden">Ciągi</span>
              </div>
            </button>
            
            <button
              onClick={() => onModeChange('sequences-intro')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap ${
                currentMode === 'sequences-intro'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden md:inline">Wstęp (49)</span>
                <span className="md:hidden">Wstęp</span>
              </div>
            </button>
            
            <button
              onClick={() => onModeChange('quiz')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap ${
                currentMode === 'quiz'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden md:inline">Quiz</span>
                <span className="md:hidden">Quiz</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSelector;