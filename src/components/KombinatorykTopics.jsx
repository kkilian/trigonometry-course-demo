import React from 'react';

const KombinatorykTopics = ({ onSelectTopic, onBack }) => {
  const topics = [
    {
      id: 'kombinatoryka',
      title: 'Podstawa',
      description: 'Permutacje, wariacje, kombinacje'
    },
    {
      id: 'kombinatoryka-rozszerzenie',
      title: 'Rozszerzenie',
      description: 'Zaawansowane zagadnienia'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:text-stone-900 mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
            </svg>
            Powrót
          </button>

          <h1 className="text-5xl font-bold text-stone-900 mb-4">
            Kombinatoryka
          </h1>
          <p className="text-stone-400 text-lg">
            Wybierz poziom
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className="text-left p-8 bg-white border-2 border-stone-200 hover:border-stone-400 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-stone-600">
                    {topic.description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KombinatorykTopics;