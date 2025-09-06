import React from 'react';
import powersProblems from '../data/powers-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import systemsOfEquationsProblems from '../data/basics-13-uklady-rownan.json';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'basics',
      title: 'BASICS - Fundamenty matematyki',
      description: 'Arytmetyka, algebra, geometria, funkcje - start od zera',
      problemCount: 0,
      hasSubmenu: true,
      topicsCount: 13
    },
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
      hasSubmenu: true,
      isPremium: true,
      disabled: true
    },
    {
      id: 'algebraic-fractions-intro',
      title: 'Ułamki algebraiczne - Wprowadzenie',
      description: 'Podstawy ułamków algebraicznych, działania, upraszczanie',
      problemCount: algebraicFractionsIntroProblems.length
    },
    {
      id: 'systems-of-equations',
      title: 'Układy równań',
      description: 'Rozwiązywanie układów równań liniowych różnymi metodami',
      problemCount: systemsOfEquationsProblems.length
    },
    {
      id: 'ai-chat',
      title: 'MEGA MADRE AI',
      description: 'Rozmawiaj z AI o matematyce - zadawaj pytania, otrzymuj wyjaśnienia',
      isAI: true
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Modules List */}
        <div className="space-y-2 md:space-y-4">
          {/* Category Header */}
          <div className="px-4 md:px-8 py-3 md:py-4">
            <h2 className="text-xs font-medium text-stone-600 uppercase tracking-wider">
              Dostępne kursy ({modules.filter(m => !m.isAI).length}) + AI Asystent
            </h2>
          </div>
          
          {/* Module Items */}
          {modules.map((module) => (
            <div className="px-4 md:px-8" key={module.id}>
              <button
                onClick={() => {
                  if (module.isPremium) {
                    alert('Ta funkcja jest dostępna w wersji Premium');
                  } else if (!module.disabled) {
                    onSelectMode(module.id);
                  }
                }}
                disabled={module.disabled}
                className={`w-full text-left p-4 md:p-6 rounded-xl transition-all relative ${
                  module.disabled 
                    ? 'bg-white/40 backdrop-blur-sm border border-stone-300/50 cursor-not-allowed opacity-60' 
                    : module.isAI
                    ? 'bg-white border-4 border-pink-500 hover:border-pink-600 cursor-pointer animate-pulse-border-pink group'
                    : module.isPremium
                    ? 'bg-white border-2 border-stone-400 hover:border-stone-500 hover:bg-stone-50 group cursor-pointer'
                    : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 group'
                }`}
              >
                {module.isPremium && (
                  <div className="absolute top-1 right-4 md:top-2 md:right-6">
                    <span className={`text-xs font-semibold uppercase tracking-wider border px-2 py-1 rounded ${
                      module.disabled 
                        ? 'text-stone-400/70 border-stone-400/50 bg-white/20' 
                        : 'text-stone-500 border-stone-300'
                    }`}>
                      Premium
                    </span>
                  </div>
                )}
                {module.isAI && (
                  <div className="absolute top-2 right-4 md:top-3 md:right-6">
                    <span className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold uppercase tracking-wider px-2 py-1 rounded animate-pulse">
                      AI
                    </span>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base md:text-lg leading-relaxed font-medium mb-1 ${
                      module.disabled ? 'text-stone-400' : module.isAI ? 'text-pink-600 font-bold' : 'text-stone-900'
                    }`}>
                      {module.title}
                    </h3>
                    <p className={`text-sm ${
                      module.disabled ? 'text-stone-400' : module.isAI ? 'text-stone-600' : 'text-stone-600'
                    }`}>
                      {module.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 flex-shrink-0 md:mt-2">
                    {module.hasSubmenu ? (
                      <div className={`px-3 py-1 rounded-full ${
                        module.disabled ? 'bg-stone-100/50 backdrop-blur-sm' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-xs md:text-sm ${
                          module.disabled ? 'text-stone-400/70' : 'text-yellow-700'
                        }`}>
                          {module.topicsCount || 4} {module.topicsCount === 1 ? 'temat' : module.topicsCount > 4 ? 'tematów' : 'tematy'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-stone-100 px-3 py-1 rounded-full">
                        <span className="text-xs md:text-sm text-stone-600">
                          {module.problemCount} zadań
                        </span>
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      module.disabled 
                        ? 'bg-stone-100/50 backdrop-blur-sm' 
                        : module.isAI
                        ? 'bg-pink-100 group-hover:bg-pink-200'
                        : 'bg-stone-100 group-hover:bg-stone-200'
                    }`}>
                      <svg className={`w-4 h-4 transition-colors ${
                        module.disabled 
                          ? 'text-stone-400/70' 
                          : module.isAI
                          ? 'text-pink-600 group-hover:text-pink-700'
                          : 'text-stone-600 group-hover:text-stone-700'
                      }`} fill="none" viewBox="0 0 20 20">
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