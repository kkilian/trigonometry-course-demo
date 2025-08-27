import React from 'react';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'trigonometry',
      title: 'LISTA ZADAŃ',
      description: '175 zadań krok po kroku'
    },
    {
      id: 'adaptive-learning',
      title: 'Ucz się adaptacyjnie',
      description: 'Personalizowane uczenie z AI'
    },
    {
      id: 'wielomiany',
      title: 'WIELOMIANY',
      description: 'Zadania z wielomianami',
      highlight: 'red'
    },
    {
      id: 'powers',
      title: 'POTĘGI I PIERWIASTKI',
      description: 'Zadania z potęgami',
      highlight: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Demo Badge */}
        <div className="text-center mb-8">
          <span className="text-gray-400 text-sm tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            @Demo
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          {/* First row - two tiles */}
          <div className="flex gap-6 justify-center">
            {modules.slice(0, 2).map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectMode(module.id)}
                className={`group relative bg-gray-950 border rounded-3xl 
                           px-8 py-12 w-80 h-80 transition-all duration-200 
                           focus:outline-none focus:ring-2 focus:ring-gray-600
                           flex flex-col items-center justify-center ${
                             module.highlight === 'red' 
                               ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                               : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.3)]'
                           }`}
              >
                <div className="text-center">
                  <h2 className={`text-xl font-semibold mb-3 ${module.highlight === 'red' ? 'text-red-100' : 'text-gray-100'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{module.title}</h2>
                  <p className={`text-sm ${module.highlight === 'red' ? 'text-red-300' : 'text-gray-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{module.description}</p>
                </div>
              </button>
            ))}
          </div>
          {/* Second row - two tiles (wielomiany and powers) */}
          <div className="flex gap-6 justify-center">
            {modules.slice(2).map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectMode(module.id)}
                className={`group relative bg-gray-950 border rounded-3xl 
                           px-8 py-12 w-80 h-80 transition-all duration-200 
                           focus:outline-none focus:ring-2 focus:ring-gray-600
                           flex flex-col items-center justify-center ${
                             module.highlight === 'red' 
                               ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                               : module.highlight === 'blue'
                               ? 'border-blue-600 hover:border-blue-500 hover:bg-blue-900/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                               : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.3)]'
                           }`}
              >
                <div className="text-center">
                  <h2 className={`text-xl font-semibold mb-3 ${module.highlight === 'red' ? 'text-red-100' : module.highlight === 'blue' ? 'text-blue-100' : 'text-gray-100'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{module.title}</h2>
                  <p className={`text-sm ${module.highlight === 'red' ? 'text-red-300' : module.highlight === 'blue' ? 'text-blue-300' : 'text-gray-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{module.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;