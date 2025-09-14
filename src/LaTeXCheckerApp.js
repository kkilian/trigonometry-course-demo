import React, { useState } from 'react';
import LaTeXChecker from './components/LaTeXChecker';
import powersProblems from './data/kombinatoryka-problems.json';
import './App.css';

function LaTeXCheckerApp() {
  const [selectedFile, setSelectedFile] = useState('');
  const [checkerKey, setCheckerKey] = useState(0); // Key to force re-render of LaTeXChecker
  
  const fileOptions = [
    { 
      id: 'powers', 
      name: 'Potęgi i pierwiastki', 
      data: powersProblems,
      count: powersProblems.length 
    }
  ];
  
  const handleFileSelect = (fileId) => {
    setSelectedFile(fileId);
    // Force re-render of LaTeXChecker with new data
    setCheckerKey(prev => prev + 1);
  };
  
  const handleBack = () => {
    if (selectedFile) {
      // Go back to file selection
      setSelectedFile('');
    } else {
      // Exit the app
      if (window.confirm('Czy na pewno chcesz zamknąć LaTeX Checker?')) {
        window.close();
        // Fallback if window.close() doesn't work
        window.location.href = 'about:blank';
      }
    }
  };

  // If no file is selected, show selection menu
  if (!selectedFile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">LaTeX Checker</h1>
            <p className="text-gray-400">Wybierz plik do sprawdzenia renderowania LaTeX</p>
          </div>
          
          <div className="space-y-3">
            {fileOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleFileSelect(option.id)}
                className="w-full p-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 
                          rounded-xl transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.count} {option.count === 1 ? 'zadanie' : 'zadań'}
                    </p>
                  </div>
                  <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get selected file data
  const selectedOption = fileOptions.find(opt => opt.id === selectedFile);
  if (!selectedOption) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Błąd: Nie znaleziono wybranego pliku
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <LaTeXChecker 
        key={checkerKey} // Force re-render when file changes
        onBack={handleBack}
        problems={selectedOption.data}
        title={`LaTeX Checker - ${selectedOption.name} (${selectedOption.count})`}
        storageKey={`latexChecker_${selectedFile}_state`} // File-specific storage
      />
    </div>
  );
}

export default LaTeXCheckerApp;