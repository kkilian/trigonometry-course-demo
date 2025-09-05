import React from 'react';

const BasicsTopics = ({ onSelectTopic, onBack }) => {
  const topics = [
    {
      id: 'basics-1-arytmetyka',
      number: '1',
      title: 'Arytmetyka i liczby',
      description: 'Rodzaje liczb, działania, ułamki, procenty, przybliżenia'
    },
    {
      id: 'basics-2-logika-zbiory',
      number: '2',
      title: 'Podstawy logiki i zbiorów',
      description: 'Zdania logiczne, operacje na zbiorach, diagramy Venna, przedziały'
    },
    {
      id: 'basics-3-wyrazenia-algebraiczne',
      number: '3',
      title: 'Wyrażenia algebraiczne',
      description: 'Redukowanie wyrazów, wzory skróconego mnożenia, ułamki algebraiczne'
    },
    {
      id: 'basics-4-rownania-nierownosci',
      number: '4',
      title: 'Równania i nierówności elementarne',
      description: 'Równania liniowe, nierówności, układy równań, wartość bezwzględna'
    },
    {
      id: 'basics-5-funkcje-fundament',
      number: '5',
      title: 'Funkcje - fundament',
      description: 'Pojęcie funkcji, funkcja liniowa, wykresy, własności'
    },
    {
      id: 'basics-6-geometria-elementarna',
      number: '6',
      title: 'Geometria elementarna',
      description: 'Figury płaskie, kąty, Pitagoras, pola i obwody, bryły'
    },
    {
      id: 'basics-7-uklad-wspolrzednych',
      number: '7',
      title: 'Układ współrzędnych',
      description: 'Współrzędne punktu, odległość, równanie prostej, nachylenie'
    },
    {
      id: 'basics-8-potegi-pierwiastki',
      number: '8',
      title: 'Podstawy rachunku potęgowego i pierwiastków',
      description: 'Potęgi całkowite i wymierne, pierwiastki, właściwości'
    },
    {
      id: 'basics-9-logarytmy',
      number: '9',
      title: 'Podstawy rachunku logarytmicznego',
      description: 'Definicja logarytmu, podstawowe przekształcenia'
    },
    {
      id: 'basics-10-trygonometria-podstawowa',
      number: '10',
      title: 'Trygonometria podstawowa',
      description: 'Funkcje trygonometryczne w trójkącie, wartości dla kątów specjalnych'
    },
    {
      id: 'basics-11-kombinatoryka-prawdopodobienstwo',
      number: '11',
      title: 'Elementy kombinatoryki i prawdopodobieństwa',
      description: 'Permutacje, wariacje, kombinacje, prawdopodobieństwo klasyczne'
    },
    {
      id: 'basics-12-statystyka',
      number: '12',
      title: 'Podstawy statystyki opisowej',
      description: 'Średnia, mediana, dominanta, rozstęp, wykresy'
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
                
                <p className="text-sm text-stone-500 flex-grow">
                  {topic.description}
                </p>
                
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