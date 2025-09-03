import React from 'react';
import MathRenderer from './MathRenderer';

const PolynomialTopics = ({ onSelectTopic, onBack }) => {
  const topics = [
    {
      id: 'polynomial-definition',
      title: '1. Co to jest wielomian?',
      description: 'Definicja formalna, stopień wielomianu, współczynniki',
      subtopics: [
        'Definicja formalna: $W(x) = a_nx^n + \\dots + a_1x + a_0$',
        'Stopień wielomianu',
        'Współczynnik wiodący, wyraz wolny',
        'Przykłady i kontrprzykłady'
      ]
    },
    {
      id: 'polynomial-operations',
      title: '2. Podstawowe działania',
      description: 'Dodawanie, odejmowanie, mnożenie wielomianów',
      subtopics: [
        'Dodawanie i odejmowanie',
        'Mnożenie jednomianu przez wielomian',
        'Mnożenie wielomianu przez wielomian'
      ]
    },
    {
      id: 'polynomial-formulas',
      title: '3. Wzory skróconego mnożenia jako narzędzie',
      description: 'Kluczowe wzory i ich zastosowania',
      subtopics: [
        '$(a+b)^2$, $(a-b)^2$, $(a+b)(a-b)$',
        '$(a+b+c)^2$',
        '$(a+b)^3$, $(a-b)^3$, $(a+b)(a^2-ab+b^2)$',
        'Zastosowanie do rozkładu i upraszczania'
      ]
    },
    {
      id: 'polynomial-substitution',
      title: '4. Podstawianie wartości',
      description: 'Obliczanie wartości wielomianu, schemat Hornera',
      subtopics: [
        'Obliczanie wartości wielomianu',
        'Intuicja schematu Hornera',
        'Schemat Hornera krok po kroku'
      ]
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
            Wielomiany - Fundamenty
          </h1>
          <p className="text-stone-400 text-base md:text-lg">
            Start od zera - wybierz temat
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className="text-left p-6 md:p-8 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-all group"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-2">
                  {topic.title}
                </h3>
                <p className="text-stone-600 text-sm md:text-base mb-4">
                  {topic.description}
                </p>
                
                {/* Subtopics list */}
                <div className="flex-grow">
                  <ul className="space-y-1 text-xs md:text-sm text-stone-400">
                    {topic.subtopics.map((subtopic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-stone-300 mt-1">•</span>
                        <span className="text-stone-400">
                          <MathRenderer content={subtopic} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Arrow icon */}
                <div className="flex justify-end mt-4">
                  <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                    <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
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

export default PolynomialTopics;