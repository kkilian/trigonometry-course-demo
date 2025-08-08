import React from 'react';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'trigonometry',
      title: 'Trygonometria',
      description: '175 zadań krok po kroku',
      color: 'from-blue-600 to-blue-700',
      hoverBg: 'hover:bg-blue-900/20',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 100 100">
          <path 
            d="M 50,25 L 75,65 L 25,65 Z" 
            stroke="currentColor" 
            strokeWidth="3" 
            fill="none"
          />
        </svg>
      )
    },
    {
      id: 'sequences',
      title: 'Ciągi Geometryczne',
      description: '34 zadania z rozwiązaniami',
      color: 'from-green-600 to-green-700',
      hoverBg: 'hover:bg-green-900/20',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 100 100">
          <circle cx="20" cy="50" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="80" cy="50" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <line x1="26" y1="50" x2="44" y2="50" stroke="currentColor" strokeWidth="2.5"/>
          <line x1="56" y1="50" x2="74" y2="50" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      )
    },
    {
      id: 'sequences-intro',
      title: 'Ciągi Wstęp',
      description: '49 zadań wprowadzających',
      color: 'from-teal-600 to-teal-700',
      hoverBg: 'hover:bg-teal-900/20',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 100 100">
          <text x="15" y="40" fontSize="20" fill="currentColor" fontFamily="serif">a</text>
          <text x="25" y="35" fontSize="12" fill="currentColor" fontFamily="serif">1</text>
          <text x="40" y="40" fontSize="20" fill="currentColor" fontFamily="serif">,</text>
          <text x="50" y="40" fontSize="20" fill="currentColor" fontFamily="serif">a</text>
          <text x="60" y="35" fontSize="12" fill="currentColor" fontFamily="serif">2</text>
          <text x="75" y="40" fontSize="20" fill="currentColor" fontFamily="serif">,...</text>
          
          <text x="15" y="65" fontSize="16" fill="currentColor" fontFamily="serif">a</text>
          <text x="25" y="60" fontSize="10" fill="currentColor" fontFamily="serif">n</text>
          <text x="35" y="65" fontSize="16" fill="currentColor" fontFamily="serif">=</text>
        </svg>
      )
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Test wiedzy - 10 pytań',
      color: 'from-purple-600 to-purple-700',
      hoverBg: 'hover:bg-purple-900/20',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 100 100">
          <rect x="30" y="25" width="40" height="50" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <line x1="38" y1="38" x2="52" y2="38" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="48" x2="52" y2="48" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="58" x2="52" y2="58" stroke="currentColor" strokeWidth="2"/>
          <circle cx="60" cy="38" r="1.5" fill="currentColor"/>
          <circle cx="60" cy="48" r="1.5" fill="currentColor"/>
          <circle cx="60" cy="58" r="1.5" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-4">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectMode(module.id)}
              className={`group relative bg-gray-800 border border-gray-700 rounded-lg 
                         px-6 py-5 transition-all duration-200 ${module.hoverBg}
                         hover:border-gray-600 hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-gray-600`}
            >
              <div className="flex items-center gap-5">
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  {module.icon}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-semibold text-gray-100 mb-1">{module.title}</h2>
                  <p className="text-sm text-gray-400">{module.description}</p>
                </div>
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;