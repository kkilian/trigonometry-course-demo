import React, { useState, useEffect } from 'react';
import MathRenderer from './MathRenderer';

const TheoryView = ({ theory, onBack }) => {
  const [revealedSections, setRevealedSections] = useState(new Set());
  const [completedSections, setCompletedSections] = useState(new Set());
  const [hintShownSections, setHintShownSections] = useState(new Set());
  const [allCompleted, setAllCompleted] = useState(false);

  const handleSectionClick = (sectionIndex) => {
    const section = theory.sections[sectionIndex];
    
    // First click: show hint (if available)
    if (!hintShownSections.has(sectionIndex) && section.hint) {
      setHintShownSections(new Set([...hintShownSections, sectionIndex]));
    }
    // Second click (or first if no hint): show content and explanation, mark as completed
    else if (!revealedSections.has(sectionIndex)) {
      setRevealedSections(new Set([...revealedSections, sectionIndex]));
      setCompletedSections(new Set([...completedSections, sectionIndex]));
      
      // Check if all sections are completed
      if (completedSections.size + 1 === theory.sections.length) {
        setAllCompleted(true);
      }
    }
  };

  const progress = (completedSections.size / (theory.sections?.length || 1)) * 100;

  // Reset states when theory changes
  useEffect(() => {
    setRevealedSections(new Set());
    setCompletedSections(new Set());
    setHintShownSections(new Set());
    setAllCompleted(false);
  }, [theory.id]);

  const SectionCheckbox = ({ isCompleted, sectionNumber }) => (
    <div className="flex items-center">
      <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
        isCompleted 
          ? 'bg-purple-500 border-purple-500' 
          : 'border-gray-600 hover:border-gray-400'
      }`}>
        {isCompleted && (
          <svg className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
               fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="ml-3 text-sm font-medium text-gray-400">
        Sekcja {sectionNumber}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="p-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
          </svg>
          Menu główne
        </button>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Header */}
          <header>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-purple-500 uppercase tracking-wider">
                  TEORIA
                </span>
                <span className="text-xs text-gray-600 font-mono ml-2 md:ml-4 hidden md:inline">
                  {theory.id}
                </span>
              </div>
            </div>
            
            <h1 className="text-xl md:text-3xl font-bold text-white leading-relaxed mb-2">
              {theory.title}
            </h1>
            
            <p className="text-base text-gray-400">
              {theory.description}
            </p>
          </header>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Postęp nauki</span>
              <span>{completedSections.size} / {theory.sections?.length || 0} sekcji</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        {/* Theory Content */}
        <div className="space-y-8 md:space-y-12 pt-6 md:pt-8">
          
          {/* Completed View - All sections revealed */}
          {allCompleted ? (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Teoria ukończona!</span>
                </div>
              </div>

              <div className="space-y-6">
                {theory.sections?.map((section, index) => (
                  <div key={index} className="relative">
                    {/* Section number badge */}
                    <div className="absolute -left-12 top-4 w-8 h-8 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    
                    {/* Section content */}
                    <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-purple-300">
                        {section.title}
                      </h3>
                      
                      {/* Hint box */}
                      {section.hint && (
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                          <p className="text-base text-purple-300/90 italic">
                            <MathRenderer content={section.hint} />
                          </p>
                        </div>
                      )}
                      
                      {/* Main content */}
                      <div className="text-lg text-white">
                        <MathRenderer content={section.content} />
                      </div>
                      
                      {/* Explanation */}
                      {section.explanation && (
                        <div className="text-base text-gray-400 pl-4 border-l-2 border-purple-500/30">
                          <MathRenderer content={section.explanation} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary message */}
              <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">
                  Gratulacje! 🎉
                </h3>
                <p className="text-gray-300">
                  Ukończyłeś całą teorię dotyczącą macierzy i wyznaczników. Teraz możesz przejść do rozwiązywania zadań praktycznych!
                </p>
              </div>
            </div>
          ) : (
            /* Interactive Sections View */
            <div className="space-y-6 md:space-y-8 mb-12 md:mb-20">
              {theory.sections?.map((section, index) => (
                <article
                  key={index}
                  onClick={() => handleSectionClick(index)}
                  className="relative cursor-pointer transition-all duration-200"
                >
                  {/* Purple glow when hint is shown */}
                  {hintShownSections.has(index) && !revealedSections.has(index) && (
                    <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-2xl"></div>
                  )}
                  
                  <div className={`relative space-y-4 md:space-y-6 p-4 md:p-6 -m-4 md:-m-6 rounded-xl transition-all duration-300 ${
                    hintShownSections.has(index) && !revealedSections.has(index) ? "ring-2 ring-purple-500/30" : ""
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <SectionCheckbox 
                          isCompleted={completedSections.has(index)} 
                          sectionNumber={index + 1}
                        />
                        <h3 className={`text-lg font-semibold transition-colors ${
                          completedSections.has(index) ? 'text-purple-300' : 'text-gray-300'
                        }`}>
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="pl-8 md:pl-10 space-y-3 md:space-y-4">
                      {/* Show hint if clicked once */}
                      {section.hint && hintShownSections.has(index) && !revealedSections.has(index) && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-500/10 blur-xl"></div>
                          <div className="relative p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                            <p className="text-base md:text-lg text-purple-400/90 leading-relaxed italic">
                              <MathRenderer content={section.hint} />
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Content shown after hint (or first click if no hint) */}
                      {section.content && (
                        <div className={`transition-all duration-500 ${
                          revealedSections.has(index) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        }`}>
                          <div className="text-lg md:text-xl text-white">
                            <MathRenderer content={section.content} />
                          </div>
                        </div>
                      )}
                      
                      {/* Explanation shown with content */}
                      {section.explanation && revealedSections.has(index) && (
                        <div className="text-base md:text-lg text-gray-400 leading-relaxed pl-4 border-l-2 border-purple-500/30">
                          <MathRenderer content={section.explanation} />
                        </div>
                      )}
                      
                      {/* Click instruction */}
                      {!revealedSections.has(index) && (
                        <div className="text-xs text-gray-500 italic">
                          {!hintShownSections.has(index) && section.hint 
                            ? "Kliknij, aby odkryć wskazówkę..." 
                            : "Kliknij, aby odkryć treść..."}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryView;