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

  return (
    <div className="problem-list">
      {Object.entries(groupedProblems).map(([topic, topicProblems]) => (
        <div key={topic} className="topic-group">
          <h2 className="topic-header">
            {topic} ({topicProblems.length} zadań)
          </h2>
          <div className="problems">
            {topicProblems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className={`problem-item ${completedProblems.has(problem.id) ? 'completed' : ''}`}
              >
                <div className="problem-content">
                  <MathRenderer content={problem.statement || ''} />
                </div>
                <div className="problem-meta">
                  {completedProblems.has(problem.id) && (
                    <span className="completed-badge">✓ Ukończone</span>
                  )}
                  <span className="steps-count">
                    {problem.steps?.length || 0} kroków
                  </span>
                  <span className="arrow">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemList;