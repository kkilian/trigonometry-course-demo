import React from 'react';
import powersProblems from '../data/powers-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'powers',
      title: 'Trygonometria',
      description: 'Funkcje trygonometryczne, tożsamości, równania',
      problemCount: powersProblems.length
    },
    {
      id: 'polynomials',
      title: 'Wielomiany',
      description: 'Fundamenty - start od zera',
      problemCount: 0,
      hasSubmenu: true
    },
    {
      id: 'algebraic-fractions-intro',
      title: 'Ułamki algebraiczne - Wprowadzenie',
      description: 'Podstawy ułamków algebraicznych, działania, upraszczanie',
      problemCount: algebraicFractionsIntroProblems.length
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Modules List */}
        <div className="space-y-2 md:space-y-4">
          {/* Category Header */}
          <div className="px-4 md:px-8 py-3 md:py-4">
            <h2 className="text-xs font-medium text-stone-600 uppercase tracking-wider">
              Dostępne kursy ({modules.length})
            </h2>
          </div>
          
          {/* Module Items */}
          {modules.map((module) => (
            <div className="px-4 md:px-8" key={module.id}>
              <button
                onClick={() => onSelectMode(module.id)}
                className="w-full text-left p-4 md:p-6 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-stone-900 text-base md:text-lg leading-relaxed font-medium mb-1">
                      {module.title}
                    </h3>
                    <p className="text-stone-600 text-sm">
                      {module.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 flex-shrink-0">
                    {module.hasSubmenu ? (
                      <div className="bg-yellow-100 px-3 py-1 rounded-full">
                        <span className="text-xs md:text-sm text-yellow-700">
                          4 tematy
                        </span>
                      </div>
                    ) : (
                      <div className="bg-stone-100 px-3 py-1 rounded-full">
                        <span className="text-xs md:text-sm text-stone-600">
                          {module.problemCount} zadań
                        </span>
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                      <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;