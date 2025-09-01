import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import WelcomeScreen from './WelcomeScreen';
import powersProblems from '../data/powers-problems.json';
import polynomialsIntroProblems from '../data/polynomials-intro-problems.json';

const TrigonometryCourse = () => {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'powers' | 'polynomials-intro'
  
  // Debug: Log mode changes
  useEffect(() => {
    console.log('Mode changed to:', mode);
  }, [mode]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedPowersProblems, setCompletedPowersProblems] = useState(new Set());
  const [completedPolynomialsIntroProblems, setCompletedPolynomialsIntroProblems] = useState(new Set());
  
  // Get current problems set based on mode
  const getCurrentProblems = () => {
    console.log('getCurrentProblems called with mode:', mode);
    if (mode === 'powers') {
      console.log('Returning powersProblems:', powersProblems.length, 'problems');
      return powersProblems;
    }
    if (mode === 'polynomials-intro') {
      console.log('Returning polynomialsIntroProblems:', polynomialsIntroProblems.length, 'problems');
      return polynomialsIntroProblems;
    }
    return [];
  };
  
  const getCurrentCompleted = () => {
    if (mode === 'polynomials-intro') return completedPolynomialsIntroProblems;
    return completedPowersProblems;
  };
  
  const setCurrentCompleted = (newSet) => {
    if (mode === 'polynomials-intro') {
      setCompletedPolynomialsIntroProblems(newSet);
    } else {
      setCompletedPowersProblems(newSet);
    }
  };
  
  const problems = getCurrentProblems();
  
  // Get section title and subtitle based on mode
  const getSectionInfo = () => {
    if (mode === 'powers') {
      return {
        title: 'Trygonometria',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'polynomials-intro') {
      return {
        title: 'Wielomiany Wstęp',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    return {
      title: '',
      subtitle: ''
    };
  };
  
  const sectionInfo = getSectionInfo();

  // Load completed problems from localStorage
  useEffect(() => {
    // Load powers progress
    const savedPowers = localStorage.getItem('completedPowersProblems');
    if (savedPowers) {
      try {
        setCompletedPowersProblems(new Set(JSON.parse(savedPowers)));
      } catch (e) {
        console.error('Error loading powers progress:', e);
      }
    }
    
    // Load polynomials-intro progress
    const savedPolynomialsIntro = localStorage.getItem('completedPolynomialsIntroProblems');
    if (savedPolynomialsIntro) {
      try {
        setCompletedPolynomialsIntroProblems(new Set(JSON.parse(savedPolynomialsIntro)));
      } catch (e) {
        console.error('Error loading polynomials-intro progress:', e);
      }
    }
  }, []);

  // Save powers progress
  useEffect(() => {
    localStorage.setItem('completedPowersProblems', JSON.stringify([...completedPowersProblems]));
  }, [completedPowersProblems]);

  // Save polynomials-intro progress
  useEffect(() => {
    localStorage.setItem('completedPolynomialsIntroProblems', JSON.stringify([...completedPolynomialsIntroProblems]));
  }, [completedPolynomialsIntroProblems]);

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


  const handleWelcomeSelect = (selectedMode) => {
    console.log('handleWelcomeSelect called with selectedMode:', selectedMode);
    setMode(selectedMode);
    setCurrentProblem(null);
    console.log('Mode set to:', selectedMode);
  };


  // Render welcome screen
  if (mode === 'welcome') {
    return <WelcomeScreen onSelectMode={handleWelcomeSelect} />;
  }


  // Render course mode (powers)
  return (
    <>
      {currentProblem ? (
        <ProblemView
          problem={currentProblem}
          onBack={handleBack}
          onComplete={handleComplete}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
        />
      ) : (
        <ProblemList
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          title={sectionInfo.title}
          subtitle={sectionInfo.subtitle}
        />
      )}
    </>
  );
};

export default TrigonometryCourse;