import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import WelcomeScreen from './WelcomeScreen';
import PolynomialTopics from './PolynomialTopics';
import BasicsTopics from './BasicsTopics';
import AIChat from './AIChat';
import powersProblems from '../data/powers-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import polynomialDefinitionProblems from '../data/polynomial-definition-problems.json';
import polynomialOperationsProblems from '../data/polynomial-operations-problems.json';
import polynomialFormulasProblems from '../data/polynomial-formulas-problems.json';
import polynomialSubstitutionProblems from '../data/polynomial-substitution-problems.json';
import basics1Problems from '../data/basics-1-arytmetyka.json';
import basics2Problems from '../data/basics-2-logika-zbiory.json';
import basics3Problems from '../data/basics-3-wyrazenia-algebraiczne.json';
import basics4Problems from '../data/basics-4-rownania-nierownosci.json';
import basics5Problems from '../data/basics-5-funkcje-fundament.json';
import basics6Problems from '../data/basics-6-geometria-elementarna.json';
import basics7Problems from '../data/basics-7-uklad-wspolrzednych.json';
import basics8Problems from '../data/basics-8-potegi-pierwiastki.json';
import basics9Problems from '../data/basics-9-logarytmy.json';
import basics10Problems from '../data/basics-10-trygonometria-podstawowa.json';
import basics11Problems from '../data/basics-11-kombinatoryka-prawdopodobienstwo.json';
import basics12Problems from '../data/basics-12-statystyka.json';
import basics13Problems from '../data/basics-13-uklady-rownan.json';
import systemsOfEquationsProblems from '../data/basics-13-uklady-rownan.json';

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
  
  // Basics completed states
  const [completedBasics1Problems, setCompletedBasics1Problems] = useState(new Set());
  const [completedBasics2Problems, setCompletedBasics2Problems] = useState(new Set());
  const [completedBasics3Problems, setCompletedBasics3Problems] = useState(new Set());
  const [completedBasics4Problems, setCompletedBasics4Problems] = useState(new Set());
  const [completedBasics5Problems, setCompletedBasics5Problems] = useState(new Set());
  const [completedBasics6Problems, setCompletedBasics6Problems] = useState(new Set());
  const [completedBasics7Problems, setCompletedBasics7Problems] = useState(new Set());
  const [completedBasics8Problems, setCompletedBasics8Problems] = useState(new Set());
  const [completedBasics9Problems, setCompletedBasics9Problems] = useState(new Set());
  const [completedBasics10Problems, setCompletedBasics10Problems] = useState(new Set());
  const [completedBasics11Problems, setCompletedBasics11Problems] = useState(new Set());
  const [completedBasics12Problems, setCompletedBasics12Problems] = useState(new Set());
  const [completedBasics13Problems, setCompletedBasics13Problems] = useState(new Set());
  const [completedSystemsOfEquationsProblems, setCompletedSystemsOfEquationsProblems] = useState(new Set());
  
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
    // Basics topics
    if (mode === 'basics-1-arytmetyka') return basics1Problems;
    if (mode === 'basics-2-logika-zbiory') return basics2Problems;
    if (mode === 'basics-3-wyrazenia-algebraiczne') return basics3Problems;
    if (mode === 'basics-4-rownania-nierownosci') return basics4Problems;
    if (mode === 'basics-5-funkcje-fundament') return basics5Problems;
    if (mode === 'basics-6-geometria-elementarna') return basics6Problems;
    if (mode === 'basics-7-uklad-wspolrzednych') return basics7Problems;
    if (mode === 'basics-8-potegi-pierwiastki') return basics8Problems;
    if (mode === 'basics-9-logarytmy') return basics9Problems;
    if (mode === 'basics-10-trygonometria-podstawowa') return basics10Problems;
    if (mode === 'basics-11-kombinatoryka-prawdopodobienstwo') return basics11Problems;
    if (mode === 'basics-12-statystyka') return basics12Problems;
    if (mode === 'basics-13-uklady-rownan') return basics13Problems;
    if (mode === 'systems-of-equations') return systemsOfEquationsProblems;
    return [];
  };
  
  const getCurrentCompleted = () => {
    if (mode === 'algebraic-fractions-intro') return completedAlgebraicFractionsIntroProblems;
    if (mode === 'polynomial-definition') return completedPolynomialDefinitionProblems;
    if (mode === 'polynomial-operations') return completedPolynomialOperationsProblems;
    if (mode === 'polynomial-formulas') return completedPolynomialFormulasProblems;
    if (mode === 'polynomial-substitution') return completedPolynomialSubstitutionProblems;
    // Basics topics
    if (mode === 'basics-1-arytmetyka') return completedBasics1Problems;
    if (mode === 'basics-2-logika-zbiory') return completedBasics2Problems;
    if (mode === 'basics-3-wyrazenia-algebraiczne') return completedBasics3Problems;
    if (mode === 'basics-4-rownania-nierownosci') return completedBasics4Problems;
    if (mode === 'basics-5-funkcje-fundament') return completedBasics5Problems;
    if (mode === 'basics-6-geometria-elementarna') return completedBasics6Problems;
    if (mode === 'basics-7-uklad-wspolrzednych') return completedBasics7Problems;
    if (mode === 'basics-8-potegi-pierwiastki') return completedBasics8Problems;
    if (mode === 'basics-9-logarytmy') return completedBasics9Problems;
    if (mode === 'basics-10-trygonometria-podstawowa') return completedBasics10Problems;
    if (mode === 'basics-11-kombinatoryka-prawdopodobienstwo') return completedBasics11Problems;
    if (mode === 'basics-12-statystyka') return completedBasics12Problems;
    if (mode === 'basics-13-uklady-rownan') return completedBasics13Problems;
    if (mode === 'systems-of-equations') return completedSystemsOfEquationsProblems;
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
    } else if (mode === 'basics-1-arytmetyka') {
      setCompletedBasics1Problems(newSet);
    } else if (mode === 'basics-2-logika-zbiory') {
      setCompletedBasics2Problems(newSet);
    } else if (mode === 'basics-3-wyrazenia-algebraiczne') {
      setCompletedBasics3Problems(newSet);
    } else if (mode === 'basics-4-rownania-nierownosci') {
      setCompletedBasics4Problems(newSet);
    } else if (mode === 'basics-5-funkcje-fundament') {
      setCompletedBasics5Problems(newSet);
    } else if (mode === 'basics-6-geometria-elementarna') {
      setCompletedBasics6Problems(newSet);
    } else if (mode === 'basics-7-uklad-wspolrzednych') {
      setCompletedBasics7Problems(newSet);
    } else if (mode === 'basics-8-potegi-pierwiastki') {
      setCompletedBasics8Problems(newSet);
    } else if (mode === 'basics-9-logarytmy') {
      setCompletedBasics9Problems(newSet);
    } else if (mode === 'basics-10-trygonometria-podstawowa') {
      setCompletedBasics10Problems(newSet);
    } else if (mode === 'basics-11-kombinatoryka-prawdopodobienstwo') {
      setCompletedBasics11Problems(newSet);
    } else if (mode === 'basics-12-statystyka') {
      setCompletedBasics12Problems(newSet);
    } else if (mode === 'basics-13-uklady-rownan') {
      setCompletedBasics13Problems(newSet);
    } else if (mode === 'systems-of-equations') {
      setCompletedSystemsOfEquationsProblems(newSet);
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
    // Basics topics
    if (mode === 'basics-1-arytmetyka') {
      return {
        title: 'Arytmetyka i liczby',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-2-logika-zbiory') {
      return {
        title: 'Podstawy logiki i zbiorów',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-3-wyrazenia-algebraiczne') {
      return {
        title: 'Wyrażenia algebraiczne',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-4-rownania-nierownosci') {
      return {
        title: 'Równania i nierówności elementarne',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-5-funkcje-fundament') {
      return {
        title: 'Funkcje - fundament',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-6-geometria-elementarna') {
      return {
        title: 'Geometria elementarna',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-7-uklad-wspolrzednych') {
      return {
        title: 'Układ współrzędnych',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-8-potegi-pierwiastki') {
      return {
        title: 'Podstawy rachunku potęgowego i pierwiastków',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-9-logarytmy') {
      return {
        title: 'Podstawy rachunku logarytmicznego',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-10-trygonometria-podstawowa') {
      return {
        title: 'Trygonometria podstawowa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-11-kombinatoryka-prawdopodobienstwo') {
      return {
        title: 'Elementy kombinatoryki i prawdopodobieństwa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-12-statystyka') {
      return {
        title: 'Podstawy statystyki opisowej',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'basics-13-uklady-rownan') {
      return {
        title: 'Układy równań',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'systems-of-equations') {
      return {
        title: 'Układy równań',
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

    // Load systems-of-equations progress
    const savedSystemsOfEquations = localStorage.getItem('completedSystemsOfEquationsProblems');
    if (savedSystemsOfEquations) {
      try {
        setCompletedSystemsOfEquationsProblems(new Set(JSON.parse(savedSystemsOfEquations)));
      } catch (e) {
        console.error('Error loading systems-of-equations progress:', e);
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

  // Save systems-of-equations progress
  useEffect(() => {
    localStorage.setItem('completedSystemsOfEquationsProblems', JSON.stringify([...completedSystemsOfEquationsProblems]));
  }, [completedSystemsOfEquationsProblems]);

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
  
  const handleBasicsTopicSelect = (topicId) => {
    setMode(topicId);
    setCurrentProblem(null);
  };

  const handleBackToBasicsTopics = () => {
    setMode('basics');
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
  
  // Render basics topics menu
  if (mode === 'basics') {
    return (
      <BasicsTopics 
        onSelectTopic={handleBasicsTopicSelect}
        onBack={handleBackToWelcome}
      />
    );
  }

  // Render AI Chat
  if (mode === 'ai-chat') {
    return (
      <AIChat 
        onBack={handleBackToWelcome}
        onSelectProblem={(problem) => {
          // Set the current problem to display
          setCurrentProblem(problem);
          
          // Determine which mode to switch to based on problem ID pattern
          if (problem.id?.includes('basics_order') || problem.id?.includes('basics_1') || problem.id?.includes('arytm')) {
            setMode('basics-1-arytmetyka');
          } else if (problem.id?.includes('basics_logic') || problem.id?.includes('basics_2') || problem.id?.includes('zbiory')) {
            setMode('basics-2-logika-zbiory');
          } else if (problem.id?.includes('basics_algebra') || problem.id?.includes('basics_3') || problem.id?.includes('wyraz')) {
            setMode('basics-3-wyrazenia-algebraiczne');
          } else if (problem.id?.includes('basics_equation') || problem.id?.includes('basics_4') || problem.id?.includes('rownan')) {
            setMode('basics-4-rownania-nierownosci');
          } else if (problem.id?.includes('basics_function') || problem.id?.includes('basics_5') || problem.id?.includes('funkcj')) {
            setMode('basics-5-funkcje-fundament');
          } else if (problem.id?.includes('basics_geometry') || problem.id?.includes('basics_6') || problem.id?.includes('geometr')) {
            setMode('basics-6-geometria-elementarna');
          } else if (problem.id?.includes('basics_coordinate') || problem.id?.includes('basics_7') || problem.id?.includes('uklad')) {
            setMode('basics-7-uklad-wspolrzednych');
          } else if (problem.id?.includes('basics_power') || problem.id?.includes('basics_8') || problem.id?.includes('poteg')) {
            setMode('basics-8-potegi-pierwiastki');
          } else if (problem.id?.includes('basics_log') || problem.id?.includes('basics_9')) {
            setMode('basics-9-logarytmy');
          } else if (problem.id?.includes('basics_trig') || problem.id?.includes('basics_10') || problem.id?.includes('trygonom')) {
            setMode('basics-10-trygonometria-podstawowa');
          } else if (problem.id?.includes('basics_comb') || problem.id?.includes('basics_11') || problem.id?.includes('kombin')) {
            setMode('basics-11-kombinatoryka-prawdopodobienstwo');
          } else if (problem.id?.includes('basics_stat') || problem.id?.includes('basics_12')) {
            setMode('basics-12-statystyka');
          } else if (problem.id?.includes('basics_system') || problem.id?.includes('basics_13') || problem.id?.includes('uklad_rownan')) {
            setMode('basics-13-uklady-rownan');
          } else if (problem.id?.includes('polynomial_definition')) {
            setMode('polynomial-definition');
          } else if (problem.id?.includes('polynomial_operations')) {
            setMode('polynomial-operations');
          } else if (problem.id?.includes('polynomial_formulas')) {
            setMode('polynomial-formulas');
          } else if (problem.id?.includes('polynomial_substitution')) {
            setMode('polynomial-substitution');
          } else if (problem.id?.includes('powers_')) {
            setMode('powers');
          } else if (problem.id?.includes('algebraic_fractions')) {
            setMode('algebraic-fractions-intro');
          } else {
            // Default fallback - try to detect from first part of ID
            console.log('Could not detect mode for problem:', problem.id);
            setMode('basics-1-arytmetyka');
          }
        }}
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
          problems={problems}
        />
      ) : (
        <ProblemList
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          title={sectionInfo.title}
          subtitle={sectionInfo.subtitle}
          onBack={
            mode.startsWith('polynomial-') ? handleBackToPolynomialTopics : 
            mode.startsWith('basics-') ? handleBackToBasicsTopics :
            handleBackToWelcome
          }
        />
      )}
    </>
  );
};

export default TrigonometryCourse;