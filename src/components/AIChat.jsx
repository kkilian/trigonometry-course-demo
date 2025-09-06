import React, { useState, useRef, useEffect, useMemo } from 'react';
import MathRenderer from './MathRenderer';
import ChatSuggestions from './ChatSuggestions';

// Import all problem datasets
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

const AIChat = ({ onBack, onSelectProblem }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Cześć! Jestem MADRE AI – Twoją kochającą matką matematyczką. Kocham dzieci i z radością pomogę Ci zrozumieć matematykę, wyjaśnię wszystko ciepło i krok po kroku. O co chciałbyś zapytać?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Combine all problems into single array
  const allProblems = useMemo(() => {
    const problems = [
      ...powersProblems,
      ...algebraicFractionsIntroProblems,
      ...polynomialDefinitionProblems,
      ...polynomialOperationsProblems,
      ...polynomialFormulasProblems,
      ...polynomialSubstitutionProblems,
      ...basics1Problems,
      ...basics2Problems,
      ...basics3Problems,
      ...basics4Problems,
      ...basics5Problems,
      ...basics6Problems,
      ...basics7Problems,
      ...basics8Problems,
      ...basics9Problems,
      ...basics10Problems,
      ...basics11Problems,
      ...basics12Problems,
      ...basics13Problems
    ];
    return problems;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Show suggestions when there are at least 2 messages in conversation
    if (messages.length >= 2) {
      setShowSuggestions(true);
    }
  }, [messages]);

  const callClaude = async (userMessage) => {
    console.log('Sending request to Claude with model: claude-3-5-haiku-20241022');
    
    try {
      // Convert messages to Claude format
      const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      
      conversationMessages.push({ role: 'user', content: userMessage });

      const requestBody = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        system: 'Jestes kochajaca, słodka, uczynna matką matematyczką ciepłą i dobrze tlumaczaca matematyke, kochasz dzieci. Odpowiadaj po polsku. Używaj LaTeX dla wzorów matematycznych w formacie $...$ dla inline lub $...$ dla display. Wyjaśniaj koncepcje krok po kroku. Bądź cierpliwy, przyjazny, słodki i uczynny.',
        messages: conversationMessages
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('http://localhost:3003/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Full API error response:', errorData);
        console.error('Response headers:', [...response.headers.entries()]);
        
        // Check if it's an authentication error
        if (response.status === 401) {
          throw new Error(`Błąd autoryzacji (401). Szczegóły: ${JSON.stringify(errorData)}`);
        }
        // Check if model doesn't exist
        if (errorData.error?.type === 'not_found_error') {
          throw new Error(`Model ${requestBody.model} nie został znaleziony. Sprawdź nazwę modelu.`);
        }
        
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data.content[0].text;
    } catch (error) {
      console.error('Full error details:', error);
      
      // Check for network errors
      if (error.message.includes('Failed to fetch')) {
        return 'Błąd połączenia z serwerem. Sprawdź połączenie internetowe lub spróbuj ponownie.';
      }
      
      return `Błąd: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Call Claude API
    const aiResponseContent = await callClaude(currentInput);
    
    const aiResponse = {
      id: messages.length + 2,
      role: 'assistant',
      content: aiResponseContent
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
    
    // Show suggestions after AI responds
    setShowSuggestions(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="mb-4">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
              </svg>
              Powrót
            </button>
          </div>
          <header>
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600 tracking-tight">
              MEGA MADRE AI
            </h1>
            <p className="text-stone-600 text-sm md:text-base mt-2">
              Asystent matematyczny z sztuczną inteligencją
            </p>
          </header>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-white border border-stone-200 text-stone-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-stone-600">Asystent</span>
                    </div>
                  )}
                  <div className="text-sm md:text-base leading-relaxed">
                    {/* Check if content has LaTeX */}
                    {message.content.includes('$') ? (
                      <MathRenderer content={message.content} />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-4 rounded-lg bg-white border border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-600">Pisze...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area with suggestions */}
      <div className="sticky bottom-0 bg-white border-t border-stone-200">
        {/* Problem suggestions based on conversation - placed above input */}
        {showSuggestions && messages.length >= 2 && (
          <div className="max-w-4xl mx-auto px-4 pt-2 pb-1">
            <ChatSuggestions
              messages={messages}
              allProblems={allProblems}
              onSelectProblem={(problem) => {
                setShowSuggestions(false);
                if (onSelectProblem) {
                  onSelectProblem(problem);
                  // Note: Don't call onBack() here - let TrigonometryCourse handle the navigation
                }
              }}
              onDismiss={() => setShowSuggestions(false)}
            />
          </div>
        )}
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Zadaj pytanie matematyczne..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={inputValue.trim() === '' || isTyping}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                inputValue.trim() === '' || isTyping
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transform hover:scale-105'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;