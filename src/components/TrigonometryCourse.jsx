import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import TrigonometryQuiz from './TrigonometryQuiz';
import QuizSelector from './QuizSelector';
import WelcomeScreen from './WelcomeScreen';
import trigonometryProblems from '../data/problems.json';
import sequencesProblems from '../data/sequences-problems.json';

const TrigonometryCourse = () => {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'trigonometry' | 'sequences' | 'quiz'
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedTrigProblems, setCompletedTrigProblems] = useState(new Set());
  const [completedSeqProblems, setCompletedSeqProblems] = useState(new Set());
  
  // Get current problems set based on mode
  const getCurrentProblems = () => {
    return mode === 'sequences' ? sequencesProblems : trigonometryProblems;
  };
  
  const getCurrentCompleted = () => {
    return mode === 'sequences' ? completedSeqProblems : completedTrigProblems;
  };
  
  const setCurrentCompleted = (newSet) => {
    if (mode === 'sequences') {
      setCompletedSeqProblems(newSet);
    } else {
      setCompletedTrigProblems(newSet);
    }
  };
  
  const problems = getCurrentProblems();

  // Load completed problems from localStorage
  useEffect(() => {
    // Load trigonometry progress
    const savedTrig = localStorage.getItem('completedTrigProblems');
    if (savedTrig) {
      try {
        setCompletedTrigProblems(new Set(JSON.parse(savedTrig)));
      } catch (e) {
        console.error('Error loading trigonometry progress:', e);
      }
    }
    
    // Load sequences progress
    const savedSeq = localStorage.getItem('completedSeqProblems');
    if (savedSeq) {
      try {
        setCompletedSeqProblems(new Set(JSON.parse(savedSeq)));
      } catch (e) {
        console.error('Error loading sequences progress:', e);
      }
    }
    
    // Migrate old data if exists
    const oldSaved = localStorage.getItem('completedProblems');
    if (oldSaved && !savedTrig) {
      try {
        setCompletedTrigProblems(new Set(JSON.parse(oldSaved)));
        localStorage.removeItem('completedProblems');
      } catch (e) {
        console.error('Error migrating old progress:', e);
      }
    }
  }, []);

  // Save trigonometry progress
  useEffect(() => {
    localStorage.setItem('completedTrigProblems', JSON.stringify([...completedTrigProblems]));
  }, [completedTrigProblems]);
  
  // Save sequences progress
  useEffect(() => {
    localStorage.setItem('completedSeqProblems', JSON.stringify([...completedSeqProblems]));
  }, [completedSeqProblems]);

  const handleSelectProblem = (problem) => {
    setCurrentProblem(problem);
  };

  const handleBack = () => {
    setCurrentProblem(null);
  };

  const handleComplete = (problemId) => {
    const currentCompleted = getCurrentCompleted();
    setCurrentCompleted(new Set([...currentCompleted, problemId]));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentProblem(null); // Reset current problem when switching modes
  };

  const handleQuizBack = () => {
    setMode('welcome');
  };

  const handleWelcomeSelect = (selectedMode) => {
    setMode(selectedMode);
    setCurrentProblem(null);
  };

  const handleBackToWelcome = () => {
    setMode('welcome');
    setCurrentProblem(null);
  };

  // Render welcome screen
  if (mode === 'welcome') {
    return <WelcomeScreen onSelectMode={handleWelcomeSelect} />;
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

  // Render course mode (trigonometry or sequences)
  return (
    <>
      <QuizSelector 
        currentMode={mode} 
        onModeChange={handleModeChange}
        onBackToWelcome={handleBackToWelcome}
      />
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
          completedProblems={getCurrentCompleted()}
        />
      )}
    </>
  );
};

export default TrigonometryCourse;