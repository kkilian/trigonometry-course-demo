import React from 'react';
import SolutionReviewer from './components/SolutionReviewer';
import powersProblems from './data/kombinatoryka-problems.json';
import './App.css';

function SolutionReviewerApp() {
  const allProblems = [...powersProblems];
  
  const handleBack = () => {
    if (window.confirm('Czy na pewno chcesz zamknąć Solution Reviewer?')) {
      window.close();
      // Fallback if window.close() doesn't work
      window.location.href = 'about:blank';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <SolutionReviewer 
        onBack={handleBack}
        problems={allProblems}
        title={`Solution Reviewer - Wszystkie zadania (${allProblems.length})`}
      />
    </div>
  );
}

export default SolutionReviewerApp;