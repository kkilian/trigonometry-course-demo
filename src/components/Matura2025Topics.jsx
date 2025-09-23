import React from 'react';

const Matura2025Topics = ({ onSelectTopic, onBack }) => {
  const topics = [
    {
      id: 'matura-marzec-2025-podstawa',
      title: 'Marzec 2025',
      description: 'Egzamin próbny - poziom podstawowy',
      status: 'available',
      borderColor: 'hover:border-blue-500',
      iconBg: 'group-hover:bg-blue-100',
      iconColor: 'group-hover:text-blue-700',
      problemCount: 32
    },
    {
      id: 'matura-kwiecien-2025-podstawa',
      title: 'Kwiecień 2025',
      description: 'Egzamin dodatkowy - poziom podstawowy',
      status: 'available',
      borderColor: 'hover:border-purple-500',
      iconBg: 'group-hover:bg-purple-100',
      iconColor: 'group-hover:text-purple-700',
      problemCount: 30
    },
    {
      id: 'matura-maj-2025-podstawa',
      title: 'Maj 2025',
      description: 'Egzamin główny - poziom podstawowy',
      status: 'soon',
      borderColor: 'hover:border-green-500',
      iconBg: 'group-hover:bg-green-100',
      iconColor: 'group-hover:text-green-700',
      problemCount: 0
    },
    {
      id: 'matura-czerwiec-2025-podstawa',
      title: 'Czerwiec 2025',
      description: 'Egzamin poprawkowy - poziom podstawowy',
      status: 'soon',
      borderColor: 'hover:border-orange-500',
      iconBg: 'group-hover:bg-orange-100',
      iconColor: 'group-hover:text-orange-700',
      problemCount: 0
    },
    {
      id: 'matura-sierpien-2025-podstawa',
      title: 'Sierpień 2025',
      description: 'Egzamin poprawkowy II - poziom podstawowy',
      status: 'soon',
      borderColor: 'hover:border-red-500',
      iconBg: 'group-hover:bg-red-100',
      iconColor: 'group-hover:text-red-700',
      problemCount: 0
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
            Matura 2025 - Poziom podstawowy
          </h1>
          <p className="text-stone-400 text-base md:text-lg">
            Zadania z poziomu podstawowego
          </p>
        </div>

        {/* Topics Grid - Minimalistic */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => topic.status === 'available' ? onSelectTopic(topic.id) : null}
              disabled={topic.status !== 'available'}
              className={`text-left p-6 md:p-8 bg-white border-2 border-stone-200 ${
                topic.status === 'available'
                  ? `${topic.borderColor} hover:bg-stone-50 cursor-pointer`
                  : 'cursor-not-allowed opacity-60'
              } rounded-xl transition-all group`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-stone-900">
                        {topic.title}
                      </h3>
                      {topic.status === 'soon' && (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          Wkrótce
                        </span>
                      )}
                      {topic.status === 'available' && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Dostępne
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600 text-sm md:text-base">
                      {topic.description}
                    </p>
                  </div>

                  {/* Arrow icon */}
                  <div className="flex justify-end">
                    <div className={`w-8 h-8 rounded-full bg-stone-100 ${
                      topic.status === 'available' ? topic.iconBg : ''
                    } flex items-center justify-center transition-all`}>
                      <svg className={`w-4 h-4 text-stone-600 ${
                        topic.status === 'available' ? topic.iconColor : ''
                      } transition-colors`} fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    {topic.status === 'available' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{topic.problemCount} zadań dostępnych</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Wkrótce dostępne</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Informacja o dostępności</h4>
              <p className="text-sm text-blue-700">
                Obecnie dostępne są zadania z dwóch sesji egzaminacyjnych: marzec 2025 (32 zadania) i kwiecień 2025 (30 zadań).
                Kolejne sesje egzaminacyjne będą dodawane systematycznie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matura2025Topics;