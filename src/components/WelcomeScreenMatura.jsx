import React from 'react';
import MaturaWybierzScreen from './MaturaWybierzScreen';

const WelcomeScreenMatura = ({ onSelectSession, onBack }) => {
  return (
    <MaturaWybierzScreen
      onSelectSession={onSelectSession}
      onBack={onBack}
    />
  );
};

export default WelcomeScreenMatura;