import React, { useState, useEffect } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit, problemId }) => {
  const [rating, setRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(3);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const emojis = ['😟', '😕', '😐', '🙂', '😊'];
  const labels = ['Bardzo trudne', 'Trudne', 'Średnie', 'Łatwe', 'Bardzo łatwe'];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({
      problemId,
      rating,
      timestamp: Date.now()
    });
    setIsSubmitting(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Jak ci poszło? 
            </h3>
            <p className="text-sm text-gray-400">
              Twoja opinia pomoże nam ulepszyć kurs
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rating Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setRating(index + 1)}
                className={`text-3xl transition-all transform ${
                  rating === index + 1 
                    ? 'scale-125' 
                    : 'scale-100 opacity-50 hover:opacity-75'
                }`}
                aria-label={labels[index]}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(rating - 1) * 25}%` }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-400">{labels[rating - 1]}</span>
          </div>
        </div>


        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Pomiń
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Prześlij'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

// Add CSS animations to your global styles or App.css:
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.2s ease-out;
// }
//
// @keyframes slideUp {
//   from { 
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to { 
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
// .animate-slideUp {
//   animation: slideUp 0.3s ease-out;
// }