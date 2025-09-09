import React, { useMemo } from 'react';
import basics1 from '../data/basics-1-arytmetyka.json';
import basics2 from '../data/basics-2-logika-zbiory.json';
import basics3 from '../data/basics-3-wyrazenia-algebraiczne.json';
import basics4 from '../data/basics-4-rownania-nierownosci.json';
import basics5 from '../data/basics-5-funkcje-fundament.json';
import basics6 from '../data/basics-6-geometria-elementarna.json';
import basics7 from '../data/basics-7-uklad-wspolrzednych.json';
import basics8 from '../data/basics-8-potegi-pierwiastki.json';
import basics9 from '../data/basics-9-logarytmy.json';
import basics10 from '../data/basics-10-trygonometria-podstawowa.json';
import basics11 from '../data/basics-11-kombinatoryka-prawdopodobienstwo.json';
import basics12 from '../data/basics-12-statystyka.json';
import basics13 from '../data/basics-13-uklady-rownan.json';

const BasicsTopics = ({ onSelectTopic, onBack }) => {
  // Map topic data for progress calculation
  const topicData = useMemo(() => ({
    'basics-1-arytmetyka': basics1,
    'basics-2-logika-zbiory': basics2,
    'basics-3-wyrazenia-algebraiczne': basics3,
    'basics-4-rownania-nierownosci': basics4,
    'basics-5-funkcje-fundament': basics5,
    'basics-6-geometria-elementarna': basics6,
    'basics-7-uklad-wspolrzednych': basics7,
    'basics-8-potegi-pierwiastki': basics8,
    'basics-9-logarytmy': basics9,
    'basics-10-trygonometria-podstawowa': basics10,
    'basics-11-kombinatoryka-prawdopodobienstwo': basics11,
    'basics-12-statystyka': basics12,
    'basics-13-uklady-rownan': basics13
  }), []);
  
  // Calculate progress for each topic
  const calculateProgress = (topicId, topicNumber) => {
    const problems = topicData[topicId];
    if (!problems) return { completed: 0, total: 0, percentage: 0 };
    
    const total = problems.length;
    const saved = localStorage.getItem(`completedBasics${topicNumber}Problems`);
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
      id: 'basics-1-arytmetyka',
      number: '1',
      title: 'Arytmetyka i liczby',
      description: 'Rodzaje liczb, działania, ułamki, procenty, przybliżenia',
      progress: calculateProgress('basics-1-arytmetyka', '1')
    },
    {
      id: 'basics-2-logika-zbiory',
      number: '2',
      title: 'Podstawy logiki i zbiorów',
      description: 'Zdania logiczne, operacje na zbiorach, diagramy Venna, przedziały',
      progress: calculateProgress('basics-2-logika-zbiory', '2')
    },
    {
      id: 'basics-3-wyrazenia-algebraiczne',
      number: '3',
      title: 'Wyrażenia algebraiczne',
      description: 'Redukowanie wyrazów, wzory skróconego mnożenia, ułamki algebraiczne',
      progress: calculateProgress('basics-3-wyrazenia-algebraiczne', '3')
    },
    {
      id: 'basics-4-rownania-nierownosci',
      number: '4',
      title: 'Równania i nierówności elementarne',
      description: 'Równania liniowe, nierówności, układy równań, wartość bezwzględna',
      progress: calculateProgress('basics-4-rownania-nierownosci', '4')
    },
    {
      id: 'basics-5-funkcje-fundament',
      number: '5',
      title: 'Funkcje - fundament',
      description: 'Pojęcie funkcji, funkcja liniowa, wykresy, własności',
      progress: calculateProgress('basics-5-funkcje-fundament', '5')
    },
    {
      id: 'basics-6-geometria-elementarna',
      number: '6',
      title: 'Geometria elementarna',
      description: 'Figury płaskie, kąty, Pitagoras, pola i obwody, bryły',
      progress: calculateProgress('basics-6-geometria-elementarna', '6')
    },
    {
      id: 'basics-7-uklad-wspolrzednych',
      number: '7',
      title: 'Układ współrzędnych',
      description: 'Współrzędne punktu, odległość, równanie prostej, nachylenie',
      progress: calculateProgress('basics-7-uklad-wspolrzednych', '7')
    },
    {
      id: 'basics-8-potegi-pierwiastki',
      number: '8',
      title: 'Podstawy rachunku potęgowego i pierwiastków',
      description: 'Potęgi całkowite i wymierne, pierwiastki, właściwości',
      progress: calculateProgress('basics-8-potegi-pierwiastki', '8')
    },
    {
      id: 'basics-9-logarytmy',
      number: '9',
      title: 'Podstawy rachunku logarytmicznego',
      description: 'Definicja logarytmu, podstawowe przekształcenia',
      progress: calculateProgress('basics-9-logarytmy', '9')
    },
    {
      id: 'basics-10-trygonometria-podstawowa',
      number: '10',
      title: 'Trygonometria podstawowa',
      description: 'Funkcje trygonometryczne w trójkącie, wartości dla kątów specjalnych',
      progress: calculateProgress('basics-10-trygonometria-podstawowa', '10')
    },
    {
      id: 'basics-11-kombinatoryka-prawdopodobienstwo',
      number: '11',
      title: 'Elementy kombinatoryki i prawdopodobieństwa',
      description: 'Permutacje, wariacje, kombinacje, prawdopodobieństwo klasyczne',
      progress: calculateProgress('basics-11-kombinatoryka-prawdopodobienstwo', '11')
    },
    {
      id: 'basics-12-statystyka',
      number: '12',
      title: 'Podstawy statystyki opisowej',
      description: 'Średnia, mediana, dominanta, rozstęp, wykresy',
      progress: calculateProgress('basics-12-statystyka', '12')
    },
    {
      id: 'basics-13-uklady-rownan',
      number: '13',
      title: 'Układy równań',
      description: 'Rozwiązywanie układów równań, metody eliminacji, macierze',
      progress: calculateProgress('basics-13-uklady-rownan', '13')
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