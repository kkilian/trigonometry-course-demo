import React, { useState } from 'react';
import MaturaSelector from './components/MaturaSelector';
import MaturaRouter from './components/MaturaRouter';
import ProblemView from '../../components/ProblemView';

/**
 * Integration component for the new Matura architecture
 * This replaces the old if/else logic in TrigonometryCourse
 */
const MaturaIntegration = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('selector'); // 'selector' | 'session' | 'problem'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [problemCallbacks, setProblemCallbacks] = useState(null);

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setCurrentView('session');
  };

  const handleSelectProblem = (problem, callbacks) => {
    setCurrentProblem(problem);
    setProblemCallbacks(callbacks); // callbacks zawiera: { markCompleted, isCompleted }
    setCurrentView('problem');
  };

  const handleBackFromSession = () => {
    setCurrentView('selector');
    setSelectedSessionId(null);
  };

  const handleBackFromProblem = () => {
    setCurrentView('session');
    setCurrentProblem(null);
  };

  const handleProblemComplete = () => {
    if (problemCallbacks?.markCompleted) {
      problemCallbacks.markCompleted();
    }
    handleBackFromProblem();
  };

  // Render based on current view
  if (currentView === 'problem' && currentProblem) {
    return (
      <ProblemView
        problem={currentProblem}
        onBack={handleBackFromProblem}
        onComplete={handleProblemComplete}
        completedProblems={problemCallbacks?.completedProblems || new Set()}
      />
    );
  }

  if (currentView === 'session' && selectedSessionId) {
    return (
      <MaturaRouter
        sessionId={selectedSessionId}
        onSelectProblem={handleSelectProblem}
        onBack={handleBackFromSession}
      />
    );
  }

  // Default: Show selector
  return (
    <MaturaSelector
      onSelectSession={handleSelectSession}
      onBack={onBack}
    />
  );
};

export default MaturaIntegration;