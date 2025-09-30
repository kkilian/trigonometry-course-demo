import React, { useMemo } from 'react';
import basicsFunkcjaKwadratowa from '../data/basics-funkcja-kwadratowa.json';

const BasicsTopics = ({ onSelectTopic, onBack }) => {
  // Map topic data for progress calculation
  const topicData = useMemo(() => ({
    'basics-funkcja-kwadratowa': basicsFunkcjaKwadratowa
  }), []);
  
  // Calculate progress for each topic
  const calculateProgress = (topicId) => {
    const problems = topicData[topicId];
    if (!problems) return { completed: 0, total: 0, percentage: 0 };

    const total = problems.length;
    const storageKey = `completed${topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Problems`;
    const saved = localStorage.getItem(storageKey);
    let completed = 0;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        completed = parsed.length;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };
  const topics = [
    {
      id: 'basics-funkcja-kwadratowa',
      number: '1',
      title: 'Funkcja kwadratowa - przypomnienie',
      description: 'Postać funkcji, wykres paraboli, miejsca zerowe, wierzchołek, przekształcenia',
      progress: calculateProgress('basics-funkcja-kwadratowa')
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
            BASICS - Fundamenty matematyki
          </h1>
          <p className="text-stone-400 text-base md:text-lg">
            Wybierz temat do nauki
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className="text-left p-6 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-all group"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-stone-600">{topic.number}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">
                    {topic.title}
                  </h3>
                </div>
                
                <p className="text-sm text-stone-500">
                  {topic.description}
                </p>
                
                {/* Progress bar */}
                {topic.progress.total > 0 && (
                  <div className="mt-3 flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">
                        {topic.progress.completed} z {topic.progress.total} zadań
                      </span>
                      <span className="text-xs text-stone-600 font-medium">
                        {topic.progress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          topic.progress.percentage === 100 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${topic.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Arrow icon */}
                <div className="flex justify-end mt-4">
                  <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                    <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
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

export default BasicsTopics;