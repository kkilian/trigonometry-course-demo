import React from 'react';

const KombinatorykTopics = ({ onSelectTopic, onBack }) => {
  const topics = [
    {
      id: 'kombinatoryka',
      title: 'Podstawa',
      description: 'Permutacje, wariacje, kombinacje - poziom podstawowy',
      borderColor: 'hover:border-green-500',
      iconBg: 'group-hover:bg-green-100',
      iconColor: 'group-hover:text-green-700'
    },
    {
      id: 'kombinatoryka-rozszerzenie',
      title: 'Rozszerzenie',
      description: 'Zaawansowane zagadnienia kombinatoryczne, rozkłady prawdopodobieństwa',
      borderColor: 'hover:border-red-500',
      iconBg: 'group-hover:bg-red-100',
      iconColor: 'group-hover:text-red-700'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Header with back button */}
        <div className="mb-8 md:mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
            </svg>
            Powrót
          </button>

          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-2 md:mb-4">
            Kombinatoryka
          </h1>
          <p className="text-stone-400 text-base md:text-lg">
            Wybierz poziom trudności
          </p>
        </div>

        {/* Topics Grid - Minimalistic */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={`text-left p-6 md:p-8 bg-white border-2 border-stone-200 ${topic.borderColor} rounded-xl transition-all group hover:bg-stone-50`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold text-stone-900 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-stone-600 text-sm md:text-base">
                    {topic.description}
                  </p>
                </div>

                {/* Arrow icon */}
                <div className="flex justify-end md:justify-start">
                  <div className={`w-8 h-8 rounded-full bg-stone-100 ${topic.iconBg} flex items-center justify-center transition-all`}>
                    <svg className={`w-4 h-4 text-stone-600 ${topic.iconColor} transition-colors`} fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KombinatorykTopics;