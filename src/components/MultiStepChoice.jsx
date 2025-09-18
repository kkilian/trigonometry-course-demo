import React, { useState } from 'react';
import MathRenderer from './MathRenderer';

const MultiStepChoice = ({ interactiveChoice, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleOptionSelect = (optionId) => {
    if (isComplete) return; // Don't allow changes after completion
    
    setSelectedOption(optionId);
    setShowFeedback(true);
    
    const selectedOptionData = interactiveChoice.options.find(opt => opt.id === optionId);
    
    // If correct answer, mark as complete after a short delay
    if (selectedOptionData?.is_correct) {
      setTimeout(() => {
        setIsComplete(true);
        onComplete && onComplete();
      }, 1000); // Show success feedback for 1 second
    }
  };

  const getOptionClass = (optionId) => {
    if (!showFeedback) {
      return selectedOption === optionId
        ? 'bg-stone-200 border-stone-400'
        : 'bg-stone-50 border-stone-200 hover:bg-stone-100';
    }
    
    const option = interactiveChoice.options.find(opt => opt.id === optionId);
    
    // Only show colors for the selected option
    if (selectedOption === optionId) {
      if (option.is_correct) {
        return 'bg-green-50 border-green-300 ring-2 ring-green-400/30';
      } else {
        return 'bg-red-50 border-red-300';
      }
    }
    
    return 'bg-stone-50 border-stone-200';
  };

  const selectedOptionData = selectedOption 
    ? interactiveChoice.options.find(opt => opt.id === selectedOption)
    : null;

  if (isComplete) {
    return null; // Component disappears when complete, allowing normal step content to show
  }

  return (
    <div className="relative">
      <div className="relative p-4 md:p-6 bg-stone-50 border border-stone-200 rounded-lg shadow-sm">
        {/* Prompt */}
        <div className="mb-4">
          <div className="text-stone-600 text-sm font-medium mb-2">Wybierz następny poprawny krok</div>
          <div className="text-stone-800 text-base">
            <MathRenderer content={interactiveChoice.prompt} />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {interactiveChoice.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showFeedback && selectedOptionData?.is_correct}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${getOptionClass(option.id)} ${
                showFeedback && selectedOptionData?.is_correct ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center">
                <div className="text-stone-800 text-sm flex-1">
                  <MathRenderer content={option.text} />
                </div>
                {/* Show checkmark/X after feedback */}
                {showFeedback && selectedOption === option.id && (
                  <span className={`text-sm font-semibold ml-2 ${
                    option.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {option.is_correct ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && selectedOptionData && (
          <div className="border-t border-stone-200 pt-3">
            <div className={`text-sm leading-relaxed ${
              selectedOptionData.is_correct ? 'text-green-700' : 'text-red-700'
            }`}>
              <MathRenderer content={selectedOptionData.feedback} />
            </div>
            
            {/* Show explanation after correct answer */}
            {selectedOptionData.is_correct && interactiveChoice.explanation_after && (
              <div className="mt-3 p-3 bg-white/50 rounded border border-stone-300">
                <div className="text-stone-600 text-xs font-semibold mb-1">Wyjaśnienie:</div>
                <div className="text-stone-700 text-sm leading-relaxed">
                  <MathRenderer content={interactiveChoice.explanation_after} />
                </div>
              </div>
            )}
            
            {/* Show "Try again" button for incorrect answers */}
            {!selectedOptionData.is_correct && (
              <button
                onClick={() => {
                  setSelectedOption(null);
                  setShowFeedback(false);
                }}
                className="mt-3 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
              >
                Spróbuj ponownie
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepChoice;