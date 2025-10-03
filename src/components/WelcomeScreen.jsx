import React from 'react';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import systemsOfEquationsProblems from '../data/basics-13-uklady-rownan.json';
import homographicFunctionsProblems from '../data/homographic-functions-problems.json';
import rationalEquationsWordProblems from '../data/rational-equations-word-problems-problems.json';
import statystykaProblems from '../data/statystyka-problems.json';
import maturaMarzec2025PodstawaProblems from '../data/matura/podstawa/marzec2025podstawa/maturamarzec2025podstawa_multistep.json';
import test1Problems from '../data/test1.json';
import test2Problems from '../data/test2.json';
import basicsFunkcjaKwadratowaProblems from '../data/basics-funkcja-kwadratowa.json';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'matura-2025-topics',
      title: 'Matura 2025 - Poziom podstawowy',
      description: 'Wszystkie sesje egzaminacyjne 2025 - poziom podstawowy',
      problemCount: maturaMarzec2025PodstawaProblems.length,
      hasSubmenu: true,
      topicsCount: 5,
      isNew: true
    },
    {
      id: 'basics-funkcja-kwadratowa',
      title: 'Funkcja kwadratowa - przypomnienie',
      description: 'Postać funkcji, wykres paraboli, miejsca zerowe, wierzchołek, przekształcenia',
      problemCount: basicsFunkcjaKwadratowaProblems.length
    },
    {
      id: 'homographic-functions',
      title: 'Funkcje homograficzne',
      description: 'Wykres, asymptoty, przekształcenia funkcji wymiernych',
      problemCount: homographicFunctionsProblems.length
    },
    {
      id: 'kombinatoryka-menu',
      title: 'Kombinatoryka',
      description: 'Od podstaw do zaawansowanych zagadnień',
      problemCount: 0,
      hasSubmenu: true,
      topicsCount: 2,
      disabled: false
    }
  ];

  // No sorting - keep original order
  const sortedModules = [...modules];

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Logo */}
        <div className="flex justify-start mb-8 md:mb-12">
          <svg
            className="h-20 md:h-24 w-auto cursor-pointer"
            viewBox="0 0 220 268"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => window.location.reload()}
            style={{
              shapeRendering: 'crispEdges'
            }}
          >
            <path
              d="M68.8545 29.3545C71.5076 24.4905 78.4924 24.4905 81.1455 29.3545L127.669 114.648C130.213 119.313 126.837 125 121.523 125H28.4766C23.1633 125 19.787 119.313 22.3311 114.648L68.8545 29.3545Z"
              stroke="#FF6B00"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M151.146 112.646C148.492 117.51 141.508 117.51 138.854 112.646L92.3311 27.3516C89.787 22.687 93.1633 17 98.4766 17L191.523 17C196.837 17 200.213 22.687 197.669 27.3516L151.146 112.646Z"
              stroke="#FF6B00"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M138.854 147.354C141.508 142.49 148.492 142.49 151.146 147.354L197.669 232.648C200.213 237.313 196.837 243 191.523 243H98.4766C93.1633 243 89.787 237.313 92.3311 232.648L138.854 147.354Z"
              stroke="#FF6B00"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M81.1455 230.646C78.4924 235.51 71.5076 235.51 68.8545 230.646L22.3311 145.352C19.787 140.687 23.1633 135 28.4766 135H121.523C126.837 135 130.213 140.687 127.669 145.352L81.1455 230.646Z"
              stroke="#FF6B00"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Modules List */}
        <div className="space-y-2 md:space-y-4">
          {/* Category Header */}
          <div className="px-4 md:px-8 py-3 md:py-4">
            <h2 className="text-xs font-medium text-stone-600 uppercase tracking-wider">
              Dostępne kursy ({modules.filter(m => !m.disabled).length})
            </h2>
          </div>

          {/* Module Items */}
          {sortedModules.filter(module => !module.disabled).map((module, index) => (
            <React.Fragment key={module.id}>
              {/* Separator after Matura 2025 */}
              {module.id === 'basics-funkcja-kwadratowa' && (
                <div className="px-4 md:px-8 py-3">
                  <div className="border-t border-stone-300"></div>
                </div>
              )}
              <div className="px-4 md:px-8">
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
                    : module.hasGlow
                    ? 'bg-white border border-orange-400 hover:border-orange-500 hover:bg-orange-50/30 group shadow-lg shadow-orange-400/40'
                    : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 group'
                }`}
                style={module.hasGlow ? {
                  boxShadow: '0 0 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)'
                } : {}}
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
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;