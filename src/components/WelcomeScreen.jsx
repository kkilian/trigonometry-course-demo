import React from 'react';
import combinatoricsProblems from '../data/kombinatoryka-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import systemsOfEquationsProblems from '../data/basics-13-uklady-rownan.json';
import homographicFunctionsProblems from '../data/homographic-functions-problems.json';
import elementaryFractionsProblems from '../data/elementary-fractions-problems.json';
import kombinatorykaProblems from '../data/kombinatoryka-problems.json';
import statystykaProblems from '../data/statystyka-problems.json';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'basics',
      title: 'BASICS - Fundamenty matematyki (stara struktura)',
      description: 'Arytmetyka, algebra, geometria, funkcje - start od zera',
      problemCount: 0,
      hasSubmenu: true,
      topicsCount: 13,
      disabled: false
    },
    {
      id: 'basics-reorganized',
      title: 'FUNDAMENTY MATEMATYKI (nowa struktura)',
      description: '4 sekcje tematyczne z systemem blokowania postępu',
      problemCount: 0,
      hasSubmenu: true,
      topicsCount: 16,
      disabled: true
    },
    {
      id: 'powers',
      title: 'Kombinatoryka - podstawy',
      description: 'Permutacje, wariacje, kombinacje - poziom podstawowy',
      problemCount: combinatoricsProblems.length,
      disabled: false
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
      problemCount: algebraicFractionsIntroProblems.length,
      disabled: true
    },
    {
      id: 'homographic-functions',
      title: 'Funkcje Homograficzne',
      description: 'Funkcje postaci f(x) = (ax+b)/(cx+d), ich właściwości i wykresy',
      problemCount: homographicFunctionsProblems.length
    },
    {
      id: 'elementary-fractions',
      title: 'Ułamki - szkoła podstawowa',
      description: 'Podstawy ułamków zwykłych - dodawanie, odejmowanie, mnożenie i dzielenie',
      problemCount: elementaryFractionsProblems.length,
      isNew: true
    },
    {
      id: 'systems-of-equations',
      title: '@testtesttest',
      description: '@test',
      problemCount: systemsOfEquationsProblems.length
    },
    {
      id: 'kombinatoryka',
      title: 'Kombinatoryka i Prawdopodobieństwo',
      description: 'Permutacje, wariacje, kombinacje, prawdopodobieństwo klasyczne',
      problemCount: kombinatorykaProblems.length,
      disabled: true
    },
    {
      id: 'statystyka',
      title: 'Statystyka',
      description: 'Średnia, mediana, dominanta, rozstęp, wykresy',
      problemCount: statystykaProblems.length,
      disabled: true
    },
    {
      id: 'ai-chat',
      title: 'AI',
      description: 'Asystent AI do nauki matematyki',
      isAI: true,
      disabled: true
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
                  if (module.isPremium || (module.isAI && module.disabled)) {
                    alert('Ta funkcja jest dostępna w wersji Premium');
                  } else if (!module.disabled) {
                    onSelectMode(module.id);
                  }
                }}
                disabled={module.disabled}
                className={`w-full text-left p-4 md:p-6 rounded-xl transition-all relative ${
                  module.disabled
                    ? 'bg-white/40 backdrop-blur-sm border border-stone-300/50 cursor-not-allowed opacity-60'
                    : module.isNew
                    ? 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 group animate-pulse-border-green'
                    : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 group'
                }`}
              >
                {(module.isPremium || module.isAI) && (
                  <div className="absolute top-1 right-4 md:top-2 md:right-6">
                    <span className={`text-xs font-semibold uppercase tracking-wider border px-2 py-1 rounded ${
                      module.disabled 
                        ? 'text-stone-400/70 border-stone-400/50 bg-white/20' 
                        : module.isAI
                        ? 'text-stone-500 border-stone-300'
                        : 'text-stone-500 border-stone-300'
                    }`}>
                      {module.isAI ? 'AI' : 'Premium'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base md:text-lg leading-relaxed font-medium mb-1 ${
                      module.disabled ? 'text-stone-400' : 'text-stone-900'
                    }`}>
                      {module.title}
                    </h3>
                    <p className={`text-sm ${
                      module.disabled ? 'text-stone-400' : 'text-stone-600'
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
                    ) : module.isAI ? (
                      <div className={`px-3 py-1 rounded-full ${
                        module.disabled ? 'bg-stone-100/50 backdrop-blur-sm' : 'bg-stone-100'
                      }`}>
                        <span className={`text-xs md:text-sm ${
                          module.disabled ? 'text-stone-400/70' : 'text-stone-600'
                        }`}>
                          Asystent
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
                        : 'bg-stone-100 group-hover:bg-stone-200'
                    }`}>
                      <svg className={`w-4 h-4 transition-colors ${
                        module.disabled 
                          ? 'text-stone-400/70' 
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