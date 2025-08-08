import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import TrigonometryQuiz from './TrigonometryQuiz';
import QuizSelector from './QuizSelector';
import WelcomeScreen from './WelcomeScreen';
import trigonometryProblems from '../data/problems.json';
import sequencesProblems from '../data/sequences-problems.json';
import sequencesIntroProblems from '../data/sequences-intro-problems.json';

const TrigonometryCourse = () => {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'trigonometry' | 'sequences' | 'sequences-intro' | 'quiz'
  
  // Debug: Log mode changes
  useEffect(() => {
    console.log('Mode changed to:', mode);
  }, [mode]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedTrigProblems, setCompletedTrigProblems] = useState(new Set());
  const [completedSeqProblems, setCompletedSeqProblems] = useState(new Set());
  const [completedSeqIntroProblems, setCompletedSeqIntroProblems] = useState(new Set());
  
  // Get current problems set based on mode
  const getCurrentProblems = () => {
    console.log('getCurrentProblems called with mode:', mode);
    if (mode === 'sequences') {
      console.log('Returning sequencesProblems:', sequencesProblems.length, 'problems');
      return sequencesProblems;
    }
    if (mode === 'sequences-intro') {
      console.log('Returning sequencesIntroProblems:', sequencesIntroProblems.length, 'problems');
      return sequencesIntroProblems;
    }
    console.log('Returning trigonometryProblems:', trigonometryProblems.length, 'problems');
    return trigonometryProblems;
  };
  
  const getCurrentCompleted = () => {
    if (mode === 'sequences') return completedSeqProblems;
    if (mode === 'sequences-intro') return completedSeqIntroProblems;
    return completedTrigProblems;
  };
  
  const setCurrentCompleted = (newSet) => {
    if (mode === 'sequences') {
      setCompletedSeqProblems(newSet);
    } else if (mode === 'sequences-intro') {
      setCompletedSeqIntroProblems(newSet);
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
    
    // Load sequences-intro progress
    const savedSeqIntro = localStorage.getItem('completedSeqIntroProblems');
    if (savedSeqIntro) {
      try {
        setCompletedSeqIntroProblems(new Set(JSON.parse(savedSeqIntro)));
      } catch (e) {
        console.error('Error loading sequences-intro progress:', e);
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
  
  // Save sequences-intro progress
  useEffect(() => {
    localStorage.setItem('completedSeqIntroProblems', JSON.stringify([...completedSeqIntroProblems]));
  }, [completedSeqIntroProblems]);

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
    console.log('handleWelcomeSelect called with selectedMode:', selectedMode);
    setMode(selectedMode);
    setCurrentProblem(null);
    console.log('Mode set to:', selectedMode);
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