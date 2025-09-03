import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import WelcomeScreen from './WelcomeScreen';
import PolynomialTopics from './PolynomialTopics';
import powersProblems from '../data/powers-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import polynomialDefinitionProblems from '../data/polynomial-definition-problems.json';
import polynomialOperationsProblems from '../data/polynomial-operations-problems.json';
import polynomialFormulasProblems from '../data/polynomial-formulas-problems.json';
import polynomialSubstitutionProblems from '../data/polynomial-substitution-problems.json';

const TrigonometryCourse = () => {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'powers' | 'polynomials' | 'algebraic-fractions-intro' | 'polynomial-definition' | etc
  
  // Debug: Log mode changes and problems count
  useEffect(() => {
    console.log('Mode changed to:', mode);
    if (mode === 'algebraic-fractions-intro') {
      console.log('Algebraic fractions problems loaded:', algebraicFractionsIntroProblems.length);
    }
  }, [mode]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedPowersProblems, setCompletedPowersProblems] = useState(new Set());
  const [completedAlgebraicFractionsIntroProblems, setCompletedAlgebraicFractionsIntroProblems] = useState(new Set());
  const [completedPolynomialDefinitionProblems, setCompletedPolynomialDefinitionProblems] = useState(new Set());
  const [completedPolynomialOperationsProblems, setCompletedPolynomialOperationsProblems] = useState(new Set());
  const [completedPolynomialFormulasProblems, setCompletedPolynomialFormulasProblems] = useState(new Set());
  const [completedPolynomialSubstitutionProblems, setCompletedPolynomialSubstitutionProblems] = useState(new Set());
  
  // Get current problems set based on mode
  const getCurrentProblems = () => {
    console.log('getCurrentProblems called with mode:', mode);
    if (mode === 'powers') {
      console.log('Returning powersProblems:', powersProblems.length, 'problems');
      return powersProblems;
    }
    if (mode === 'algebraic-fractions-intro') {
      console.log('Returning algebraicFractionsIntroProblems:', algebraicFractionsIntroProblems.length, 'problems');
      return algebraicFractionsIntroProblems;
    }
    if (mode === 'polynomial-definition') {
      return polynomialDefinitionProblems;
    }
    if (mode === 'polynomial-operations') {
      return polynomialOperationsProblems;
    }
    if (mode === 'polynomial-formulas') {
      return polynomialFormulasProblems;
    }
    if (mode === 'polynomial-substitution') {
      return polynomialSubstitutionProblems;
    }
    return [];
  };
  
  const getCurrentCompleted = () => {
    if (mode === 'algebraic-fractions-intro') return completedAlgebraicFractionsIntroProblems;
    if (mode === 'polynomial-definition') return completedPolynomialDefinitionProblems;
    if (mode === 'polynomial-operations') return completedPolynomialOperationsProblems;
    if (mode === 'polynomial-formulas') return completedPolynomialFormulasProblems;
    if (mode === 'polynomial-substitution') return completedPolynomialSubstitutionProblems;
    return completedPowersProblems;
  };
  
  const setCurrentCompleted = (newSet) => {
    if (mode === 'algebraic-fractions-intro') {
      setCompletedAlgebraicFractionsIntroProblems(newSet);
    } else if (mode === 'polynomial-definition') {
      setCompletedPolynomialDefinitionProblems(newSet);
    } else if (mode === 'polynomial-operations') {
      setCompletedPolynomialOperationsProblems(newSet);
    } else if (mode === 'polynomial-formulas') {
      setCompletedPolynomialFormulasProblems(newSet);
    } else if (mode === 'polynomial-substitution') {
      setCompletedPolynomialSubstitutionProblems(newSet);
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
    if (mode === 'algebraic-fractions-intro') {
      return {
        title: 'Ułamki algebraiczne - Wprowadzenie',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'polynomial-definition') {
      return {
        title: 'Co to jest wielomian?',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'polynomial-operations') {
      return {
        title: 'Podstawowe działania',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'polynomial-formulas') {
      return {
        title: 'Wzory skróconego mnożenia',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'polynomial-substitution') {
      return {
        title: 'Podstawianie wartości',
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
    
    // Load algebraic-fractions-intro progress
    const savedAlgebraicFractionsIntro = localStorage.getItem('completedAlgebraicFractionsIntroProblems');
    if (savedAlgebraicFractionsIntro) {
      try {
        setCompletedAlgebraicFractionsIntroProblems(new Set(JSON.parse(savedAlgebraicFractionsIntro)));
      } catch (e) {
        console.error('Error loading algebraic-fractions-intro progress:', e);
      }
    }
  }, []);

  // Save powers progress
  useEffect(() => {
    localStorage.setItem('completedPowersProblems', JSON.stringify([...completedPowersProblems]));
  }, [completedPowersProblems]);

  // Save algebraic-fractions-intro progress
  useEffect(() => {
    localStorage.setItem('completedAlgebraicFractionsIntroProblems', JSON.stringify([...completedAlgebraicFractionsIntroProblems]));
  }, [completedAlgebraicFractionsIntroProblems]);

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

  const handlePolynomialTopicSelect = (topicId) => {
    setMode(topicId);
    setCurrentProblem(null);
  };

  const handleBackToPolynomialTopics = () => {
    setMode('polynomials');
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

  // Render polynomial topics menu
  if (mode === 'polynomials') {
    return (
      <PolynomialTopics 
        onSelectTopic={handlePolynomialTopicSelect}
        onBack={handleBackToWelcome}
      />
    );
  }

  // Render course mode (powers, polynomial topics, etc)
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
          onBack={
            mode.startsWith('polynomial-') ? handleBackToPolynomialTopics : handleBackToWelcome
          }
        />
      )}
    </>
  );
};

export default TrigonometryCourse;