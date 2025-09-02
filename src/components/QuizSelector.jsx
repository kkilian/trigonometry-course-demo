import React from 'react';

const QuizSelector = ({ currentMode, onModeChange, onBackToWelcome }) => {
  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex flex-col gap-3">
          {/* Subject selector */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Back to Welcome button */}
              <button
                onClick={onBackToWelcome}
                className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-all"
                title="Powrót do menu głównego"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              
              <h2 className="text-lg md:text-xl font-bold text-stone-900">
                {currentMode === 'sequences' ? 'Ciągi Geometryczne' :
                 currentMode === 'sequences-intro' ? 'Ciągi Wstęp' :
                 currentMode === 'quiz' ? 'Quiz' :
                 'Trygonometria'}
              </h2>
            </div>
            
            <div className="text-xs md:text-sm text-stone-600 md:block">
              Ucz się trygonometrii krok po kroku
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default QuizSelector;