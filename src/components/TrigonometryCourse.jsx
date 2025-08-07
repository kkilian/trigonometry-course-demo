import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import TrigonometryQuiz from './TrigonometryQuiz';
import QuizSelector from './QuizSelector';
import LaTeXChecker from './LaTeXChecker';
import problemsData from '../data/problems.json';

const TrigonometryCourse = () => {
  const [mode, setMode] = useState('course'); // 'course' | 'quiz' | 'checker'
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

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentProblem(null); // Reset current problem when switching modes
  };

  const handleQuizBack = () => {
    setMode('course');
  };

  const handleCheckerBack = () => {
    setMode('course');
  };

  // Render checker mode
  if (mode === 'checker') {
    return <LaTeXChecker onBack={handleCheckerBack} />;
  }

  // Render quiz mode
  if (mode === 'quiz') {
    return (
      <>
        <QuizSelector currentMode={mode} onModeChange={handleModeChange} />
        <TrigonometryQuiz onBack={handleQuizBack} />
      </>
    );
  }

  // Render course mode
  return (
    <>
      <QuizSelector currentMode={mode} onModeChange={handleModeChange} />
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
    </>
  );
};

export default TrigonometryCourse;