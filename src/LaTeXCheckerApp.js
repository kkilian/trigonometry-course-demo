import React from 'react';
import LaTeXChecker from './components/LaTeXChecker';
import trigonometryProblems from './data/problems.json';
import sequencesProblems from './data/sequences-problems.json';
import './App.css';

function LaTeXCheckerApp() {
  const allProblems = [...trigonometryProblems, ...sequencesProblems];
  
  const handleBack = () => {
    if (window.confirm('Czy na pewno chcesz zamknąć LaTeX Checker?')) {
      window.close();
      // Fallback if window.close() doesn't work
      window.location.href = 'about:blank';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <LaTeXChecker 
        onBack={handleBack}
        problems={allProblems}
        title={`LaTeX Checker - Wszystkie zadania (${allProblems.length})`}
      />
    </div>
  );
}

export default LaTeXCheckerApp;