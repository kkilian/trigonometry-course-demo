import React from 'react';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'trigonometry',
      title: 'LISTA ZADAŃ',
      description: '175 zadań krok po kroku'
    },
    {
      id: 'wielomiany',
      title: 'WIELOMIANY',
      description: 'Zadania z wielomianami',
      highlight: 'red'
    },
    {
      id: 'adaptive-learning',
      title: 'Ucz się adaptacyjnie',
      description: 'Personalizowane uczenie z AI'
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
        
        <div className="flex gap-6 justify-center flex-wrap">
          {modules.map((module) => (
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
      </div>
    </div>
  );
};

export default WelcomeScreen;