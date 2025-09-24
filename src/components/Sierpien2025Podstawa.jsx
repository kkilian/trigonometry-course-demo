import React from 'react';

const Sierpien2025Podstawa = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Back Button */}
          {onBack && (
            <div className="mb-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
                </svg>
                Powrót
              </button>
            </div>
          )}

          {/* Header */}
          <header>
            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
              Matura - Sierpień 2025 Podstawa
            </h1>
            <p className="text-stone-600">Sesja egzaminacyjna będzie dostępna wkrótce</p>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
          <svg className="w-16 h-16 text-stone-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Wkrótce dostępne</h2>
          <p className="text-stone-600 mb-6">
            Zadania z sesji sierpniowej będą dodane po oficjalnym terminie egzaminu.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Wróć do wyboru sesji
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sierpien2025Podstawa;