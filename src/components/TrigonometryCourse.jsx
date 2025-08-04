import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import problemsData from '../data/problems.json';

const TrigonometryCourse = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [problems] = useState(problemsData);

  // Load completed problems from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedProblems');
    if (saved) {
      try {
        setCompletedProblems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  // Save completed problems to localStorage
  useEffect(() => {
    localStorage.setItem('completedProblems', JSON.stringify([...completedProblems]));
  }, [completedProblems]);

  const handleSelectProblem = (problem) => {
    setCurrentProblem(problem);
  };

  const handleBack = () => {
    setCurrentProblem(null);
  };

  const handleComplete = (problemId) => {
    setCompletedProblems(new Set([...completedProblems, problemId]));
  };

  const progress = (completedProblems.size / problems.length) * 100;

  return (
    <div className="course-container">
      <header className="course-header">
        <h1>Kurs Trygonometrii - Definicje Funkcji</h1>
        <div className="course-stats">
          <span>Ukończono: {completedProblems.size} / {problems.length} zadań</span>
          <div className="overall-progress">
            <div className="overall-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="course-content">
        {currentProblem ? (
          <ProblemView
            problem={currentProblem}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        ) : (
          <ProblemList
            problems={problems}
            onSelectProblem={handleSelectProblem}
            completedProblems={completedProblems}
          />
        )}
      </main>
    </div>
  );
};

export default TrigonometryCourse;