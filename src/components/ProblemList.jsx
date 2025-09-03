import React, { useMemo } from 'react';
import MathRenderer from './MathRenderer';

const ProblemList = ({ problems, onSelectProblem, completedProblems = new Set(), title = "Zadania", subtitle, onBack }) => {
  const groupedProblems = useMemo(() => {
    return problems.reduce((acc, problem) => {
      const topic = problem.topic || 'Inne';
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(problem);
      return acc;
    }, {});
  }, [problems]);

  const flatProblems = useMemo(() => {
    const flat = [];
    Object.entries(groupedProblems).forEach(([topic, topicProblems]) => {
      flat.push({ type: 'header', topic, count: topicProblems.length });
      topicProblems.forEach(problem => {
        flat.push({ type: 'problem', ...problem });
      });
    });
    return flat;
  }, [groupedProblems]);

  const renderItem = (item, index) => {
    if (item.type === 'header') {
      return (
        <div className="px-4 md:px-8 py-3 md:py-4" key={`header-${item.topic}`}>
          <h2 className="text-xs font-medium text-stone-600 uppercase tracking-wider">
            {item.topic} ({item.count} zadań)
          </h2>
        </div>
      );
    }
    
    return (
      <div className="px-4 md:px-8" key={`problem-${item.id}`}>
        <button
          onClick={() => onSelectProblem(item)}
          className="w-full text-left p-4 md:p-6 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-stone-900 text-base md:text-lg leading-relaxed font-medium">
                <MathRenderer content={item.statement || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 flex-shrink-0">
              {completedProblems.has(item.id) && (
                <div className="flex items-center gap-1 text-stone-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Ukończone</span>
                </div>
              )}
              <div className="bg-stone-100 px-3 py-1 rounded-full">
                <span className="text-xs md:text-sm text-stone-600">
                  {item.steps?.length || 0} kroków
                </span>
              </div>
              <div className="hidden md:block text-xs text-stone-500 font-mono">
                {item.id}
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
            </svg>
            Powrót
          </button>
        )}
        
        {/* Header */}
        <header className="mb-8 md:mb-20">
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-2 md:mb-4">
            {title}
          </h1>
          <p className="text-stone-600 text-base md:text-lg">
            {subtitle || `${problems.length} zadań`}
          </p>
        </header>

        {/* Problems */}
        <div className="space-y-2 md:space-y-4">
          {flatProblems.map((item, index) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};

export default ProblemList;