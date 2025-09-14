import React, { useState, useMemo } from 'react';
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
import basics13 from '../data/basics-13-uklady-rownan.json';
import basicsProcentyProblems from '../data/basics-procenty.json';
import basicsPrzyblizeniaProblems from '../data/basics-przyblizenia.json';
import basicsWartoscBezwzglednaProblems from '../data/basics-wartosc-bezwzgledna.json';

const BasicsReorganized = ({ onSelectTopic, onBack }) => {
  const [selectedSection, setSelectedSection] = useState(null);

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
    'basics-13-uklady-rownan': basics13,
    'basics-procenty': basicsProcentyProblems,
    'basics-przyblizenia': basicsPrzyblizeniaProblems,
    'basics-wartosc-bezwzgledna': basicsWartoscBezwzglednaProblems
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

  // Define the 4 main sections with their subtopics
  const sections = [
    {
      id: 'section-1-arytmetyka',
      title: 'Arytmetyka i Sprawność Rachunkowa',
      subtitle: 'Rdzeń Matematyki',
      description: 'Podstawy działań na liczbach, potęgi, pierwiastki i logarytmy',
      subtopics: [
        {
          id: 'basics-1-arytmetyka',
          number: '1.1',
          title: 'Liczby i Zbiory Liczbowe',
          description: 'Rodzaje liczb, działania, ułamki, kolejność wykonywania działań',
          progress: calculateProgress('basics-1-arytmetyka', '1')
        },
        {
          id: 'basics-8-potegi-pierwiastki',
          number: '1.2', 
          title: 'Potęgi i Pierwiastki',
          description: 'Definicja potęgi, prawa działań na potęgach, pierwiastki arytmetyczne',
          progress: calculateProgress('basics-8-potegi-pierwiastki', '8')
        },
        {
          id: 'basics-9-logarytmy',
          number: '1.3',
          title: 'Logarytmy - Pierwsze Kroki',
          description: 'Definicja logarytmu, podstawowe własności i wzory',
          progress: calculateProgress('basics-9-logarytmy', '9')
        },
        {
          id: 'basics-procenty',
          number: '1.4',
          title: 'Procenty w Praktyce',
          description: 'Obliczanie procentów, podwyżki i obniżki, zastosowania praktyczne',
          progress: calculateProgress('basics-procenty', 'Procenty')
        },
        {
          id: 'basics-przyblizenia',
          number: '1.5',
          title: 'Przybliżenia i Błędy',
          description: 'Zaokrąglania liczb, błędy bezwzględne i względne',
          progress: calculateProgress('basics-przyblizenia', 'Przyblizenia')
        }
      ]
    },
    {
      id: 'section-2-algebra',
      title: 'Fundamenty Algebry',
      subtitle: 'Język Matematyki',
      description: 'Wyrażenia algebraiczne, równania, nierówności i układy równań',
      subtopics: [
        {
          id: 'basics-3-wyrazenia-algebraiczne',
          number: '2.1',
          title: 'Wyrażenia Algebraiczne',
          description: 'Redukcja wyrazów podobnych, wzory skróconego mnożenia',
          progress: calculateProgress('basics-3-wyrazenia-algebraiczne', '3')
        },
        {
          id: 'basics-4-rownania-nierownosci',
          number: '2.2',
          title: 'Równania i Nierówności Liniowe',
          description: 'Równania pierwszego stopnia, nierówności liniowe',
          progress: calculateProgress('basics-4-rownania-nierownosci', '4')
        },
        {
          id: 'basics-13-uklady-rownan',
          number: '2.3',
          title: 'Proste Układy Równań Liniowych',
          description: 'Metoda podstawiania i przeciwnych współczynników',
          progress: calculateProgress('basics-13-uklady-rownan', '13')
        }
      ]
    },
    {
      id: 'section-3-logika',
      title: 'Podstawy Logiki i Teorii Mnogości',
      subtitle: 'Myślenie Matematyczne',
      description: 'Zbiory, przedziały, wartość bezwzględna i elementy logiki',
      subtopics: [
        {
          id: 'basics-2-logika-zbiory',
          number: '3.1',
          title: 'Zbiory i Działania na Zbiorach',
          description: 'Pojęcie zbioru, suma, iloczyn, różnica zbiorów, diagramy Venna',
          progress: calculateProgress('basics-2-logika-zbiory', '2')
        },
        {
          id: 'basics-wartosc-bezwzgledna',
          number: '3.2',
          title: 'Wartość Bezwzględna',
          description: 'Definicja, interpretacja geometryczna, równania i nierówności',
          progress: calculateProgress('basics-wartosc-bezwzgledna', 'WartoscBezwzgledna')
        }
      ]
    },
    {
      id: 'section-4-funkcje-geometria',
      title: 'Elementarne Własności Funkcji i Geometrii',
      subtitle: 'Wizualizacja i Analiza',
      description: 'Układ współrzędnych, podstawy funkcji, geometria i trygonometria',
      subtopics: [
        {
          id: 'basics-7-uklad-wspolrzednych',
          number: '4.1',
          title: 'Układ Współrzędnych',
          description: 'Współrzędne punktu, odległość, równanie prostej',
          progress: calculateProgress('basics-7-uklad-wspolrzednych', '7')
        },
        {
          id: 'basics-5-funkcje-fundament',
          number: '4.2',
          title: 'Pojęcie Funkcji',
          description: 'Definicja funkcji, dziedzina, zbiór wartości, odczytywanie z wykresu',
          progress: calculateProgress('basics-5-funkcje-fundament', '5')
        },
        {
          id: 'basics-6-geometria-elementarna',
          number: '4.3',
          title: 'Podstawy Planimetrii',
          description: 'Figury płaskie, twierdzenie Pitagorasa, pola i obwody',
          progress: calculateProgress('basics-6-geometria-elementarna', '6')
        },
        {
          id: 'basics-10-trygonometria-podstawowa',
          number: '4.4',
          title: 'Podstawy Trygonometrii',
          description: 'Funkcje trygonometryczne w trójkącie, wartości dla kątów specjalnych',
          progress: calculateProgress('basics-10-trygonometria-podstawowa', '10')
        }
      ]
    }
  ];

  // Calculate section progress
  const calculateSectionProgress = (section) => {
    const subtopics = section.subtopics;
    const totalProblems = subtopics.reduce((sum, topic) => sum + topic.progress.total, 0);
    const completedProblems = subtopics.reduce((sum, topic) => sum + topic.progress.completed, 0);
    const percentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
    
    return {
      completed: completedProblems,
      total: totalProblems,
      percentage
    };
  };

  // Check if section is unlocked
  const isSectionUnlocked = (sectionIndex) => {
    if (sectionIndex === 0) return true; // Section 1 always unlocked
    
    // Section 2 unlocked when Section 1 is 80% complete
    if (sectionIndex === 1) {
      const section1Progress = calculateSectionProgress(sections[0]);
      return section1Progress.percentage >= 80;
    }
    
    // Sections 3 and 4 unlocked when Section 1 is 60% complete
    if (sectionIndex >= 2) {
      const section1Progress = calculateSectionProgress(sections[0]);
      return section1Progress.percentage >= 60;
    }
    
    return false;
  };

  // Render section selection view
  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-stone-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
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
              FUNDAMENTY MATEMATYKI
            </h1>
            <p className="text-stone-400 text-base md:text-lg">
              Struktura kursu zaprojektowana dla perfekcyjnego opanowania podstaw
            </p>
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, index) => {
              const sectionProgress = calculateSectionProgress(section);
              const isUnlocked = isSectionUnlocked(index);
              
              return (
                <button
                  key={section.id}
                  onClick={() => isUnlocked && setSelectedSection(section)}
                  disabled={!isUnlocked}
                  className={`text-left p-6 border border-stone-200 rounded-xl transition-all group relative ${
                    isUnlocked 
                      ? 'bg-white hover:border-stone-300 hover:bg-stone-50 cursor-pointer'
                      : 'bg-stone-50 border-stone-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  
                  {/* Lock icon for locked sections */}
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v-3a3 3 0 0 0-6 0v3m0 0v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-stone-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-stone-900 mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-stone-600">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                      {section.description}
                    </p>

                    {/* Subtopics count */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-xs text-stone-500">
                        {section.subtopics.length} podrozdziałów
                      </span>
                      <span className="text-xs text-stone-500">
                        {sectionProgress.total} zadań
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    {sectionProgress.total > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-stone-500">
                            Postęp: {sectionProgress.completed} z {sectionProgress.total} zadań
                          </span>
                          <span className="text-xs text-stone-600 font-medium">
                            {sectionProgress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              sectionProgress.percentage === 100 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${sectionProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlock requirements for locked sections */}
                    {!isUnlocked && index === 1 && (
                      <div className="text-xs text-stone-400 mt-3">
                        Odblokuje się po ukończeniu 80% Sekcji I
                      </div>
                    )}
                    {!isUnlocked && index >= 2 && (
                      <div className="text-xs text-stone-400 mt-3">
                        Odblokuje się po ukończeniu 60% Sekcji I
                      </div>
                    )}
                    
                    {/* Arrow icon */}
                    {isUnlocked && (
                      <div className="flex justify-end mt-4">
                        <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                          <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render subtopics view for selected section
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Header with back button */}
        <div className="mb-8 md:mb-12">
          <button
            onClick={() => setSelectedSection(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
            </svg>
            Powrót do sekcji
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl">{selectedSection.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                {selectedSection.title}
              </h1>
              <p className="text-stone-600 font-medium">
                {selectedSection.subtitle}
              </p>
            </div>
          </div>
          <p className="text-stone-400 text-base">
            {selectedSection.description}
          </p>
        </div>

        {/* Subtopics List */}
        <div className="space-y-4">
          {selectedSection.subtopics.map((subtopic) => (
            <button
              key={subtopic.id}
              onClick={() => onSelectTopic(subtopic.id)}
              className="w-full text-left p-6 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-stone-600">{subtopic.number}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900 mb-2">
                    {subtopic.title}
                  </h3>
                  <p className="text-sm text-stone-500 mb-4">
                    {subtopic.description}
                  </p>
                  
                  {/* Progress bar */}
                  {subtopic.progress.total > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-stone-500">
                          {subtopic.progress.completed} z {subtopic.progress.total} zadań
                        </span>
                        <span className="text-xs text-stone-600 font-medium">
                          {subtopic.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            subtopic.progress.percentage === 100 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : `bg-gradient-to-r ${selectedSection.color}`
                          }`}
                          style={{ width: `${subtopic.progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Arrow icon */}
                <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all flex-shrink-0">
                  <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BasicsReorganized;