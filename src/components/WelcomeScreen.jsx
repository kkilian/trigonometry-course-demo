import React from 'react';

const WelcomeScreen = ({ onSelectMode }) => {
  const modules = [
    {
      id: 'powers',
      title: 'TRYGONOMETRIA',
      icon: '∑ sin θ',
      highlight: 'blue'
    },
    {
      id: 'polynomials-intro',
      title: 'WIELOMIANY WSTĘP',
      icon: 'f(x) = xⁿ',
      highlight: 'red'
    }
  ];

  // Proporcje oparte na liczbie e (e ≈ 2.718)
  const moduleHeight = 280;
  const moduleWidth = Math.round(moduleHeight * Math.E); // 280 * 2.718 ≈ 761

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Demo Badge */}
        <div className="text-center mb-8">
          <span className="text-gray-400 text-sm tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            @Demo
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectMode(module.id)}
              className={`group relative bg-gray-950 border rounded-3xl 
                         transition-all duration-200 
                         focus:outline-none focus:ring-2 focus:ring-gray-600
                         flex flex-col items-center justify-center ${
                           module.highlight === 'blue'
                           ? 'border-blue-600 hover:border-blue-500 hover:bg-blue-900/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                           : module.highlight === 'red'
                           ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                           : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.3)]'
                         }`}
              style={{ width: `${moduleWidth}px`, height: `${moduleHeight}px` }}
            >
              <div className="text-center flex flex-col items-center gap-4">
                <div className={`text-4xl ${
                  module.highlight === 'blue' ? 'text-blue-400'
                  : module.highlight === 'red' ? 'text-red-400'
                  : 'text-gray-400'
                }`}>{module.icon}</div>
                <h2 className={`text-2xl font-bold ${
                  module.highlight === 'blue' ? 'text-blue-100'
                  : module.highlight === 'red' ? 'text-red-100'
                  : 'text-gray-100'
                }`} style={{ fontFamily: 'Inter, sans-serif' }}>{module.title}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;