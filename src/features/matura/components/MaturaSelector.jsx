import React, { useState } from 'react';
import { MATURA_LEVELS, getSessionsByLevel } from '../config/sessions.config';

/**
 * Komponent do wyboru sesji maturalnej
 * Zastępuje MaturaWybierzScreen z dynamiczną konfiguracją
 */
const MaturaSelector = ({ onSelectSession, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState(MATURA_LEVELS.PODSTAWA);

  // Get sessions for selected level
  const sessions = getSessionsByLevel(selectedLevel);

  const handleSessionSelect = (sessionId) => {
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Header with back button */}
        <div className="mb-8 md:mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
              </svg>
              Powrót
            </button>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">
            Matura 2025
          </h1>

          {/* Level Selector */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setSelectedLevel(MATURA_LEVELS.PODSTAWA)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedLevel === MATURA_LEVELS.PODSTAWA
                  ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                  : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
              }`}
            >
              Poziom podstawowy
            </button>
            <button
              onClick={() => setSelectedLevel(MATURA_LEVELS.ROZSZERZENIE)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedLevel === MATURA_LEVELS.ROZSZERZENIE
                  ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
                  : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
              }`}
            >
              Poziom rozszerzony
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSessionSelect(session.id)}
              disabled={session.status !== 'available'}
              className={`text-left p-6 md:p-8 bg-white border-2 border-stone-200 ${
                session.status === 'available'
                  ? `${session.color.border} hover:bg-stone-50 cursor-pointer`
                  : 'cursor-not-allowed opacity-60'
              } rounded-xl transition-all group`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-stone-900">
                        {session.title}
                      </h3>
                      {session.status === 'soon' && (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          Wkrótce
                        </span>
                      )}
                      {session.status === 'available' && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Dostępne
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow icon */}
                  <div className="flex justify-end">
                    <div className={`w-8 h-8 rounded-full bg-stone-100 ${
                      session.status === 'available' ? session.color.iconBg : ''
                    } flex items-center justify-center transition-all`}>
                      <svg className={`w-4 h-4 text-stone-600 ${
                        session.status === 'available' ? session.color.iconColor : ''
                      } transition-colors`} fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    {session.status === 'available' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{session.problemCount} zadań dostępnych</span>
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

        {/* Empty state for no sessions */}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-600 text-lg">
              Brak dostępnych sesji dla wybranego poziomu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaturaSelector;