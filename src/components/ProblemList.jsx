import React, { useMemo } from 'react';
import MathRenderer from './MathRenderer';

const ProblemList = ({ problems, onSelectProblem, completedProblems = new Set() }) => {
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
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {item.topic} ({item.count} zadań)
          </h2>
        </div>
      );
    }
    
    return (
      <div className="px-4 md:px-8" key={`problem-${item.id}`}>
        <button
          onClick={() => onSelectProblem(item)}
          className="w-full text-left p-4 md:p-6 bg-gray-950 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 rounded-xl transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-gray-100 text-sm md:text-base leading-relaxed">
                <MathRenderer content={item.statement || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 flex-shrink-0">
              {completedProblems.has(item.id) && (
                <div className="flex items-center gap-1 text-green-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Ukończone</span>
                </div>
              )}
              <div className="bg-gray-900 px-3 py-1 rounded-full">
                <span className="text-xs md:text-sm text-gray-400">
                  {item.steps?.length || 0} kroków
                </span>
              </div>
              <div className="hidden md:block text-xs text-gray-600 font-mono">
                {item.id}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-900 group-hover:bg-yellow-500/10 flex items-center justify-center transition-all">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 20 20">
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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Header */}
        <header className="mb-8 md:mb-20">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2 md:mb-4">
            Trygonometria
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            {problems.length} zadań
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