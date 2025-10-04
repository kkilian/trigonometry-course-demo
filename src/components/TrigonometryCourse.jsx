import React, { useState, useEffect } from 'react';
import ProblemList from './ProblemList';
import ProblemView from './ProblemView';
import WelcomeScreen from './WelcomeScreen';
import PolynomialTopics from './PolynomialTopics';
import BasicsTopics from './BasicsTopics';
import BasicsReorganized from './BasicsReorganized';
import KombinatorykTopics from './KombinatorykTopics';
import KombinatorykStartHere from './KombinatorykStartHere';
import KombinatorykRozszerzenieStartHere from './KombinatorykRozszerzenieStartHere';
import SystemsOfEquationsStartHere from './SystemsOfEquationsStartHere';
import HomographicFunctionsStartHere from './HomographicFunctionsStartHere';
import RationalEquationsWordProblemsStartHere from './RationalEquationsWordProblemsStartHere';
import BasicsFunkcjaKwadratowaStartHere from './BasicsFunkcjaKwadratowaStartHere';
import MaturaIntegration from '../features/matura/MaturaIntegration';
import ComparisonScreen from './comparison/ComparisonScreen';
import ComparisonView from './comparison/ComparisonView';
import powersProblems from '../data/kombinatoryka-problems.json';
import algebraicFractionsIntroProblems from '../data/algebraic-fractions-intro-problems.json';
import polynomialDefinitionProblems from '../data/polynomial-definition-problems.json';
import polynomialOperationsProblems from '../data/polynomial-operations-problems.json';
import polynomialFormulasProblems from '../data/polynomial-formulas-problems.json';
import polynomialSubstitutionProblems from '../data/polynomial-substitution-problems.json';
import basicsFunkcjaKwadratowaProblems from '../data/basics-funkcja-kwadratowa.json';
import systemsOfEquationsProblems from '../data/basics-13-uklady-rownan.json';
import homographicFunctionsProblems from '../data/homographic-functions-problems.json';
import basicsProcentyProblems from '../data/basics-procenty.json';
import basicsPrzyblizeniaProblems from '../data/basics-przyblizenia.json';
import basicsWartoscBezwzglednaProblems from '../data/basics-wartosc-bezwzgledna.json';
import kombinatorykaProblems from '../data/kombinatoryka-problems.json';
import kombinatorykaRozszerzenieProblems from '../data/kombinatoryka-rozszerzenie-problems.json';
import rationalEquationsWordProblems from '../data/rational-equations-word-problems-problems.json';
import statystykaProblems from '../data/statystyka-problems.json';
import test1Problems from '../data/test1.json';
import test2Problems from '../data/test2.json';

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
  const [completedBasicsFunkcjaKwadratowaProblems, setCompletedBasicsFunkcjaKwadratowaProblems] = useState(new Set());
  const [completedSystemsOfEquationsProblems, setCompletedSystemsOfEquationsProblems] = useState(new Set());
  const [completedHomographicFunctionsProblems, setCompletedHomographicFunctionsProblems] = useState(new Set());
  const [completedRationalEquationsWordProblems, setCompletedRationalEquationsWordProblems] = useState(new Set());
  const [completedKombinatorykRozszerzenieProblems, setCompletedKombinatorykRozszerzenieProblems] = useState(() => {
    const saved = localStorage.getItem('completedKombinatorykRozszerzenieProblems');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading kombinatoryka-rozszerzenie progress:', e);
      }
    }
    return new Set();
  });

  // Comparison states
  const [comparisonMode, setComparisonMode] = useState('list'); // 'list' | 'view'
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState(null);
  
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
    if (mode === 'basics-funkcja-kwadratowa') return basicsFunkcjaKwadratowaProblems;
    if (mode === 'basics-procenty') return basicsProcentyProblems;
    if (mode === 'basics-przyblizenia') return basicsPrzyblizeniaProblems;
    if (mode === 'basics-wartosc-bezwzgledna') return basicsWartoscBezwzglednaProblems;
    if (mode === 'systems-of-equations') return systemsOfEquationsProblems;
    if (mode === 'homographic-functions') return homographicFunctionsProblems;
    if (mode === 'kombinatoryka') return kombinatorykaProblems;
    if (mode === 'kombinatoryka-rozszerzenie') return kombinatorykaRozszerzenieProblems;
    if (mode === 'rational-equations-word-problems') return rationalEquationsWordProblems;
    if (mode === 'statystyka') return statystykaProblems;
    return [];
  };
  
  const getCurrentCompleted = () => {
    if (mode === 'algebraic-fractions-intro') return completedAlgebraicFractionsIntroProblems;
    if (mode === 'polynomial-definition') return completedPolynomialDefinitionProblems;
    if (mode === 'polynomial-operations') return completedPolynomialOperationsProblems;
    if (mode === 'polynomial-formulas') return completedPolynomialFormulasProblems;
    if (mode === 'polynomial-substitution') return completedPolynomialSubstitutionProblems;
    // Basics topics
    if (mode === 'basics-funkcja-kwadratowa') return completedBasicsFunkcjaKwadratowaProblems;
    if (mode === 'systems-of-equations') return completedSystemsOfEquationsProblems;
    if (mode === 'homographic-functions') return completedHomographicFunctionsProblems;
    if (mode === 'rational-equations-word-problems') return completedRationalEquationsWordProblems;
    if (mode === 'kombinatoryka') return completedPowersProblems; // kombinatoryka uses the same as powers
    if (mode === 'kombinatoryka-rozszerzenie') return completedKombinatorykRozszerzenieProblems;
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
    } else if (mode === 'basics-funkcja-kwadratowa') {
      setCompletedBasicsFunkcjaKwadratowaProblems(newSet);
    } else if (mode === 'systems-of-equations') {
      setCompletedSystemsOfEquationsProblems(newSet);
    } else if (mode === 'homographic-functions') {
      setCompletedHomographicFunctionsProblems(newSet);
    } else if (mode === 'rational-equations-word-problems') {
      setCompletedRationalEquationsWordProblems(newSet);
    } else if (mode === 'kombinatoryka') {
      setCompletedPowersProblems(newSet); // kombinatoryka uses the same as powers
    } else if (mode === 'kombinatoryka-rozszerzenie') {
      setCompletedKombinatorykRozszerzenieProblems(newSet);
    } else {
      setCompletedPowersProblems(newSet);
    }
  };
  
  const problems = getCurrentProblems();
  
  // Get section title and subtitle based on mode
  const getSectionInfo = () => {
    if (mode === 'powers') {
      return {
        title: 'Kombinatoryka - podstawy',
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
    if (mode === 'basics-funkcja-kwadratowa') {
      return {
        title: 'Funkcja kwadratowa - przypomnienie',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'systems-of-equations') {
      return {
        title: 'Układy równań',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'homographic-functions') {
      return {
        title: 'Funkcje Homograficzne',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'kombinatoryka') {
      return {
        title: 'Kombinatoryka i Prawdopodobieństwo',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'kombinatoryka-rozszerzenie') {
      return {
        title: 'Kombinatoryka - Rozszerzenie',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'rational-equations-word-problems') {
      return {
        title: 'Zadania tekstowe prowadzące do równań wymiernych',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'statystyka') {
      return {
        title: 'Statystyka',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'matura-marzec-2025-podstawa') {
      return {
        title: 'Matura - Marzec 2025 Podstawa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'matura-kwiecien-2025-podstawa') {
      return {
        title: 'Matura - Kwiecień 2025 Podstawa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'matura-maj-2025-podstawa') {
      return {
        title: 'Matura - Maj 2025 Podstawa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'matura-czerwiec-2025-podstawa') {
      return {
        title: 'Matura - Czerwiec 2025 Podstawa',
        subtitle: `${problems.length} zadań krok po kroku`
      };
    }
    if (mode === 'matura-sierpien-2025-podstawa') {
      return {
        title: 'Matura - Sierpień 2025 Podstawa',
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

    // Load basics-funkcja-kwadratowa progress
    const savedBasicsFunkcjaKwadratowa = localStorage.getItem('completedBasicsFunkcjaKwadratowaProblems');
    if (savedBasicsFunkcjaKwadratowa) {
      try {
        setCompletedBasicsFunkcjaKwadratowaProblems(new Set(JSON.parse(savedBasicsFunkcjaKwadratowa)));
      } catch (e) {
        console.error('Error loading basics-funkcja-kwadratowa progress:', e);
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

    // Load homographic-functions progress
    const savedHomographicFunctions = localStorage.getItem('completedHomographicFunctionsProblems');
    if (savedHomographicFunctions) {
      try {
        setCompletedHomographicFunctionsProblems(new Set(JSON.parse(savedHomographicFunctions)));
      } catch (e) {
        console.error('Error loading homographic-functions progress:', e);
      }
    }

    // Load rational-equations-word-problems progress
    const savedRationalEquationsWordProblems = localStorage.getItem('completedRationalEquationsWordProblems');
    if (savedRationalEquationsWordProblems) {
      try {
        setCompletedRationalEquationsWordProblems(new Set(JSON.parse(savedRationalEquationsWordProblems)));
      } catch (e) {
        console.error('Error loading rational-equations-word-problems progress:', e);
      }
    }


    // kombinatoryka-rozszerzenie progress is now loaded in the state initializer


  }, []);

  // Save powers progress
  useEffect(() => {
    localStorage.setItem('completedPowersProblems', JSON.stringify([...completedPowersProblems]));
  }, [completedPowersProblems]);

  // Save algebraic-fractions-intro progress
  useEffect(() => {
    localStorage.setItem('completedAlgebraicFractionsIntroProblems', JSON.stringify([...completedAlgebraicFractionsIntroProblems]));
  }, [completedAlgebraicFractionsIntroProblems]);

  // Save basics-funkcja-kwadratowa progress
  useEffect(() => {
    localStorage.setItem('completedBasicsFunkcjaKwadratowaProblems', JSON.stringify([...completedBasicsFunkcjaKwadratowaProblems]));
  }, [completedBasicsFunkcjaKwadratowaProblems]);

  // Save systems-of-equations progress
  useEffect(() => {
    localStorage.setItem('completedSystemsOfEquationsProblems', JSON.stringify([...completedSystemsOfEquationsProblems]));
  }, [completedSystemsOfEquationsProblems]);

  // Save homographic-functions progress
  useEffect(() => {
    localStorage.setItem('completedHomographicFunctionsProblems', JSON.stringify([...completedHomographicFunctionsProblems]));
  }, [completedHomographicFunctionsProblems]);

  // Save rational-equations-word-problems progress
  useEffect(() => {
    localStorage.setItem('completedRationalEquationsWordProblems', JSON.stringify([...completedRationalEquationsWordProblems]));
  }, [completedRationalEquationsWordProblems]);


  // Save kombinatoryka-rozszerzenie progress
  useEffect(() => {
    localStorage.setItem('completedKombinatorykRozszerzenieProblems', JSON.stringify([...completedKombinatorykRozszerzenieProblems]));
  }, [completedKombinatorykRozszerzenieProblems]);



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

  const handleSkip = () => {
    // Track skipped problem
    const skippedProblems = JSON.parse(localStorage.getItem('skipped-problems') || '[]');
    const skipRecord = {
      problemId: currentProblem.id,
      timestamp: Date.now(),
      mode: mode
    };
    skippedProblems.push(skipRecord);

    // Keep only last 100 skipped problems
    if (skippedProblems.length > 100) {
      skippedProblems.shift();
    }
    localStorage.setItem('skipped-problems', JSON.stringify(skippedProblems));

    // Track as a "skip" choice for learning patterns (future AI adaptation)
    const choices = JSON.parse(localStorage.getItem('learning-patterns-choices') || '[]');
    choices.push({
      timestamp: Date.now(),
      problemId: currentProblem.id,
      suggestionType: 'skip',
      currentDifficulty: currentProblem.difficulty || (currentProblem.steps?.length || 0),
      sessionId: sessionStorage.getItem('sessionId') || 'default'
    });
    // Keep only last 50 choices
    if (choices.length > 50) {
      choices.shift();
    }
    localStorage.setItem('learning-patterns-choices', JSON.stringify(choices));

    // Get current problems and completed set
    const currentProblems = getCurrentProblems();
    const currentCompleted = getCurrentCompleted();

    // Get AI suggestions for next problem
    const suggestedProblems = getSuggestedProblemsForModule();

    if (suggestedProblems && suggestedProblems.length > 0) {
      // Select next problem from suggestions
      // Priority: 1. "same" difficulty, 2. first available
      const sameDifficultyProblem = currentProblems.find(p =>
        suggestedProblems.includes(p.id) &&
        !currentCompleted.has(p.id)
      );

      const nextProblem = sameDifficultyProblem ||
        currentProblems.find(p => suggestedProblems.includes(p.id) && !currentCompleted.has(p.id));

      if (nextProblem) {
        setCurrentProblem(nextProblem);
        return;
      }
    }

    // Fallback: find any unfinished problem
    const unfinishedProblems = currentProblems.filter(p => !currentCompleted.has(p.id));
    if (unfinishedProblems.length > 0) {
      // Pick random unfinished problem
      const randomIndex = Math.floor(Math.random() * unfinishedProblems.length);
      setCurrentProblem(unfinishedProblems[randomIndex]);
    } else {
      // No more problems - go back
      setCurrentProblem(null);
    }
  };

  const getSuggestedProblemsForModule = () => {
    // Get suggestions from localStorage based on current mode
    let storageKey = '';
    if (mode === 'powers' || mode === 'kombinatoryka') {
      storageKey = 'kombinatoryka-suggested-problems';
    } else if (mode === 'homographic-functions') {
      storageKey = 'homographic-functions-suggested-problems';
    } else if (mode === 'systems-of-equations') {
      storageKey = 'systems-of-equations-suggested-problems';
    } else if (mode === 'basics-funkcja-kwadratowa') {
      storageKey = 'basics-funkcja-kwadratowa-suggested-problems';
    } else if (mode === 'rational-equations-word-problems') {
      storageKey = 'rational-equations-word-problems-suggested-problems';
    } else if (mode === 'kombinatoryka-rozszerzenie') {
      storageKey = 'kombinatoryka-rozszerzenie-suggested-problems';
    }

    if (storageKey) {
      const suggested = localStorage.getItem(storageKey);
      if (suggested) {
        try {
          return JSON.parse(suggested);
        } catch (e) {
          console.error('Error parsing suggested problems:', e);
        }
      }
    }
    return null;
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

  const handleKombinatorykTopicSelect = (topicId) => {
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
    // Check if we came from reorganized basics
    const wasFromReorganized = mode.startsWith('basics-') &&
      localStorage.getItem('lastBasicsMode') === 'basics-reorganized';
    setMode(wasFromReorganized ? 'basics-reorganized' : 'basics');
    setCurrentProblem(null);
  };

  const handleBackToKombinatorykTopics = () => {
    setMode('kombinatoryka-menu');
    setCurrentProblem(null);
  };

  const handleBackToWelcome = () => {
    setMode('welcome');
    setCurrentProblem(null);
    // Reset comparison states
    setComparisonMode('list');
    setSelectedComparisonIndex(null);
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
    localStorage.setItem('lastBasicsMode', 'basics');
    return (
      <BasicsTopics 
        onSelectTopic={handleBasicsTopicSelect}
        onBack={handleBackToWelcome}
      />
    );
  }

  // Render reorganized basics topics menu
  if (mode === 'basics-reorganized') {
    localStorage.setItem('lastBasicsMode', 'basics-reorganized');
    return (
      <BasicsReorganized
        onSelectTopic={handleBasicsTopicSelect}
        onBack={handleBackToWelcome}
      />
    );
  }

  // Render kombinatoryka topics menu
  if (mode === 'kombinatoryka-menu') {
    return (
      <KombinatorykTopics
        onSelectTopic={handleKombinatorykTopicSelect}
        onBack={handleBackToWelcome}
      />
    );
  }

  // Render matura 2025 topics menu
  if (mode === 'matura-2025-topics' || mode === 'matura-integration') {
    return (
      <MaturaIntegration
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
          onSkip={handleSkip}
          completedProblems={getCurrentCompleted()}
          problems={problems}
        />
      ) : mode === 'powers' ? (
        // Special handling for trigonometry - show start here screen instead of problem list
        <KombinatorykStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'systems-of-equations' ? (
        // Special handling for systems of equations - show start here screen instead of problem list
        <SystemsOfEquationsStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'homographic-functions' ? (
        // Special handling for homographic functions - show start here screen instead of problem list
        <HomographicFunctionsStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'kombinatoryka' ? (
        // Special handling for kombinatoryka - show start here screen instead of problem list
        <KombinatorykStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'basics-funkcja-kwadratowa' ? (
        // Special handling for basics funkcja kwadratowa - show start here screen instead of problem list
        <BasicsFunkcjaKwadratowaStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'rational-equations-word-problems' ? (
        // Special handling for rational equations word problems - show start here screen instead of problem list
        <RationalEquationsWordProblemsStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
        />
      ) : mode === 'comparison' ? (
        // Comparison mode - show comparison screen or view
        comparisonMode === 'list' ? (
          <ComparisonScreen
            problems1={test1Problems}
            problems2={test2Problems}
            onSelectProblem={(index) => {
              setSelectedComparisonIndex(index);
              setComparisonMode('view');
            }}
            onBack={handleBackToWelcome}
          />
        ) : (
          <ComparisonView
            problem1={test1Problems[selectedComparisonIndex]}
            problem2={test2Problems[selectedComparisonIndex]}
            currentIndex={selectedComparisonIndex}
            problems={test1Problems.filter(p1 => test2Problems.some(p2 => p2.id === p1.id))}
            onSelectProblem={(index) => {
              setSelectedComparisonIndex(index);
            }}
            onBack={() => {
              setComparisonMode('list');
              setSelectedComparisonIndex(null);
            }}
          />
        )
      ) : mode === 'kombinatoryka-rozszerzenie' ? (
        // Special handling for kombinatoryka-rozszerzenie - show start here screen instead of problem list
        <KombinatorykRozszerzenieStartHere
          problems={problems}
          onSelectProblem={handleSelectProblem}
          completedProblems={getCurrentCompleted()}
          onBack={handleBackToWelcome}
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
            (mode === 'kombinatoryka' || mode === 'kombinatoryka-rozszerzenie') ? handleBackToKombinatorykTopics :
            handleBackToWelcome
          }
        />
      )}
    </>
  );
};

export default TrigonometryCourse;