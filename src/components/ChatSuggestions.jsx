import React, { useMemo, useState } from 'react';
import MathRenderer from './MathRenderer';
import { preprocessMathText } from '../utils/similarity/textProcessor.js';
import { TFIDFProcessor } from '../utils/similarity/tfidf.js';
import { SimilarityCalculator } from '../utils/similarity/cosineSimilarity.js';

const ChatSuggestions = ({ 
  messages = [], 
  allProblems = [],
  onSelectProblem,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Extract conversation context from last 3-5 messages
  const conversationContext = useMemo(() => {
    if (!messages || messages.length === 0) return '';
    
    // Take last 5 messages (both user and assistant)
    const recentMessages = messages.slice(-5);
    
    // Combine messages into single text
    const contextText = recentMessages
      .map(msg => msg.content)
      .join(' ');
    
    return contextText;
  }, [messages]);

  // Analyze conversation and find relevant problems
  const suggestedProblems = useMemo(() => {
    if (!conversationContext || !allProblems || allProblems.length === 0) {
      return [];
    }

    try {
      // Preprocess conversation context to tokens
      const conversationTokens = preprocessMathText(conversationContext);
      
      // Create documents array: conversation tokens + all problem tokens
      const documents = [
        conversationTokens, // Index 0 is our conversation
        ...allProblems.map(p => preprocessMathText(p.statement))
      ];

      // Create TF-IDF vectors
      const tfidf = new TFIDFProcessor();
      const vectors = tfidf.fitTransform(documents);

      // Calculate similarities
      const calculator = new SimilarityCalculator('cosine');
      calculator.setVectors(vectors);

      // Get problems similar to conversation (index 0)
      const similar = calculator.getMostSimilar(0, allProblems.length)
        .filter(({ similarity }) => similarity > 0.05) // Lowered threshold for testing
        .slice(0, 3) // Top 3 suggestions
        .map(({ index, similarity }) => ({
          ...allProblems[index - 1], // -1 because conversation is at index 0
          similarity
        }));

      return similar;
    } catch (err) {
      console.error('Error calculating chat suggestions:', err);
      return [];
    }
  }, [conversationContext, allProblems]);

  // Identify topic from conversation keywords
  const identifiedTopic = useMemo(() => {
    const topicKeywords = {
      'Trygonometria': ['sinus', 'cosinus', 'tangens', 'kąt', 'trójkąt', 'sin', 'cos', 'tan', 'tg', 'ctg'],
      'Wielomiany': ['wielomian', 'stopień', 'współczynnik', 'pierwiastek', 'dzielenie'],
      'Logarytmy': ['logarytm', 'log', 'ln', 'podstawa', 'wykładnik'],
      'Potęgi': ['potęga', 'wykładnik', 'podstawa', 'pierwiastek', '²', '³'],
      'Równania': ['równanie', 'rozwiąż', 'niewiadoma', 'x', 'y'],
      'Funkcje': ['funkcja', 'dziedzina', 'zbiór wartości', 'wykres', 'f(x)'],
      'Geometria': ['figura', 'pole', 'obwód', 'okrąg', 'prostokąt', 'trójkąt'],
      'Ciągi': ['ciąg', 'wyraz', 'suma', 'różnica', 'iloraz', 'arytmetyczny', 'geometryczny'],
      'Statystyka': ['średnia', 'mediana', 'odchylenie', 'wariancja'],
      'Kombinatoryka': ['permutacja', 'kombinacja', 'wariacja', 'silnia']
    };

    const lowerContext = conversationContext.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matchCount = keywords.filter(kw => lowerContext.includes(kw)).length;
      if (matchCount >= 2) return topic;
    }
    
    return null;
  }, [conversationContext]);

  // Don't show if dismissed or no suggestions
  if (isDismissed || suggestedProblems.length === 0) {
    return null;
  }

  const handleSelectProblem = (problem) => {
    if (onSelectProblem) {
      onSelectProblem(problem);
    }
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="animate-fadeInScale">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 font-medium">Sugerowane zadania:</span>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Zamknij sugestie"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        {suggestedProblems.slice(0, 2).map((problem, index) => (
          <button
            key={problem.id}
            onClick={() => handleSelectProblem(problem)}
            className="w-full text-left p-3 bg-white border border-stone-200 hover:border-pink-300 hover:bg-pink-50 rounded-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                index === 0 ? 'bg-pink-500' : 'bg-pink-400'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-stone-900 group-hover:text-pink-700 text-sm leading-relaxed transition-colors">
                  <MathRenderer content={problem.statement || ''} />
                </div>
                {problem.steps && (
                  <div className="mt-1 text-xs text-stone-500">
                    {problem.steps.length} kroków
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-stone-400 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;