import React, { useState } from 'react';
import MathRenderer from './MathRenderer';

const QuizAnswer = ({ quizText, correctAnswer, explanation, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Parse quiz text into options
  const options = quizText.split('\n').map(line => {
    const match = line.match(/^([A-D])\.\s*(.+)$/);
    if (match) {
      return { id: match[1], text: match[2] };
    }
    return null;
  }).filter(Boolean);

  const handleSelect = (optionId) => {
    if (!isChecked) {
      setSelectedAnswer(optionId);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer) {
      const correct = selectedAnswer === correctAnswer;
      setIsCorrect(correct);
      setIsChecked(true);

      if (onComplete && correct) {
        onComplete();
      }
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setIsChecked(false);
    setIsCorrect(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const showCorrect = isChecked && option.id === correctAnswer;
          const showIncorrect = isChecked && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isChecked}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected && !isChecked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 bg-white'}
                ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                ${!isChecked ? 'hover:border-stone-400 cursor-pointer' : 'cursor-default'}
                disabled:opacity-100
              `}
            >
              <div className="flex items-start gap-3">
                {/* Option letter */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${isSelected && !isChecked ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700'}
                  ${showCorrect ? 'bg-green-500 text-white' : ''}
                  ${showIncorrect ? 'bg-red-500 text-white' : ''}
                `}>
                  {option.id}
                </div>

                {/* Option text */}
                <div className="flex-1 pt-1">
                  <MathRenderer content={option.text} />
                </div>

                {/* Check/X icon */}
                {showCorrect && (
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {showIncorrect && (
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Check button */}
      {!isChecked && (
        <button
          onClick={handleCheck}
          disabled={!selectedAnswer}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200
            ${selectedAnswer
              ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }
          `}
        >
          Sprawdź odpowiedź
        </button>
      )}

      {/* Feedback */}
      {isChecked && (
        <div className={`
          p-4 rounded-lg border-2 mb-4
          ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}
        `}>
          <div className="flex items-center gap-3 mb-2">
            {isCorrect ? (
              <>
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-green-700 text-lg">Poprawna odpowiedź!</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-red-700 text-lg">Niepoprawna odpowiedź</span>
              </>
            )}
          </div>

          {/* Explanation */}
          {explanation && (
            <div className={`mt-3 pt-3 border-t ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
              <p className="text-sm font-semibold text-stone-700 mb-1">Wyjaśnienie:</p>
              <div className="text-stone-800">
                <MathRenderer content={explanation} />
              </div>
            </div>
          )}

          {/* Try again button for incorrect answers */}
          {!isCorrect && (
            <button
              onClick={handleTryAgain}
              className="mt-4 w-full py-2 px-4 bg-stone-600 hover:bg-stone-700 text-white rounded-lg font-semibold transition-colors"
            >
              Spróbuj ponownie
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizAnswer;