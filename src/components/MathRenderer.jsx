import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Memoized parsing function to avoid re-parsing same content
const parseLatexTextMemo = (() => {
  const cache = new Map();
  const maxCacheSize = 100; // Limit cache size to prevent memory leaks
  
  return (text) => {
    // Ensure text is a string
    const stringText = typeof text === 'string' ? text : String(text || '');
    if (cache.has(stringText)) {
      return cache.get(stringText);
    }
    
    // Clear cache if it gets too large
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    const result = parseLatexText(stringText);
    cache.set(stringText, result);
    return result;
  };
})();

// Function to split text into LaTeX and regular text segments
const parseLatexText = (text) => {
  // Ensure text is a string
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: String(text || '') }];
  }

  const segments = [];
  let currentIndex = 0;

  // Handle $...$ delimited math (converted format)
  const mathDelimiterRegex = /\$([^$]+)\$/g;
  let match;

  // Track positions of $...$ blocks
  const mathBlocks = [];
  while ((match = mathDelimiterRegex.exec(text)) !== null) {
    mathBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
      type: 'math'
    });
  }

  // Also detect undelimited LaTeX structures like \begin{array}
  const latexStructureRegex = /(\\begin\{[^}]+\}.*?\\end\{[^}]+\})/gs;
  while ((match = latexStructureRegex.exec(text)) !== null) {
    // Check if this structure is not already inside $...$ delimiters
    const isInsideDelimiters = mathBlocks.some(block =>
      match.index >= block.start && match.index + match[0].length <= block.end
    );

    if (!isInsideDelimiters) {
      mathBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        type: 'block_math' // Use block math for LaTeX structures
      });
    }
  }
  
  // If we found math blocks, process them (sort by position first)
  if (mathBlocks.length > 0) {
    mathBlocks.sort((a, b) => a.start - b.start);

    for (const block of mathBlocks) {
      // Add text content before this math block
      if (currentIndex < block.start) {
        const textContent = text.slice(currentIndex, block.start);
        if (textContent.trim()) {
          segments.push({ type: 'text', content: textContent });
        }
      }

      // Add the math content
      segments.push({ type: block.type, content: block.content });
      currentIndex = block.end;
    }
    
    // Add remaining text content
    if (currentIndex < text.length) {
      const textContent = text.slice(currentIndex);
      if (textContent.trim()) {
        segments.push({ type: 'text', content: textContent });
      }
    }
    
    return segments;
  }
  
  // If no $...$ delimiters found, treat as pure text
  return [{ type: 'text', content: text }];
};

const MathRenderer = ({ content, className = '' }) => {
  // Debug logging for non-string content
  if (content && typeof content !== 'string') {
    console.warn('MathRenderer received non-string content:', typeof content, content);
  }
  
  // Early return for empty content
  if (!content) {
    return <span className={className}></span>;
  }
  
  // Parse content into segments
  const stringContent = typeof content === 'string' ? content : String(content);
  const segments = parseLatexTextMemo(stringContent);
  
  // Render segments
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          // Regular text - apply very light gray color
          return <span key={index} className="text-stone-400">{segment.content}</span>;
        } else if (segment.type === 'block_math') {
          // Block math content - use BlockMath for structures like tables
          try {
            return (
              <div key={index} className="text-black font-bold my-4" style={{ color: 'black' }}>
                <BlockMath
                  math={segment.content}
                  renderError={(error) => {
                    // Fallback to plain text if LaTeX fails
                    console.warn('KaTeX block render error:', error.message, 'for content:', segment.content);
                    return <div className="font-mono text-sm bg-red-50 p-2 border border-red-200 rounded">{segment.content}</div>;
                  }}
                />
              </div>
            );
          } catch (error) {
            // Fallback to plain text if component fails
            console.warn('React-KaTeX block component error:', error.message, 'for content:', segment.content);
            return <div key={index} className="font-mono text-sm bg-red-50 p-2 border border-red-200 rounded">{segment.content}</div>;
          }
        } else {
          // Inline math content - use react-katex with black color and semibold
          try {
            return (
              <span key={index} className="text-black font-bold" style={{ color: 'black' }}>
                <InlineMath
                  math={segment.content}
                  renderError={(error) => {
                    // Fallback to plain text if LaTeX fails
                    console.warn('KaTeX render error:', error.message, 'for content:', segment.content);
                    return <span>{segment.content}</span>;
                  }}
                />
              </span>
            );
          } catch (error) {
            // Fallback to plain text if component fails
            console.warn('React-KaTeX component error:', error.message, 'for content:', segment.content);
            return <span key={index}>{segment.content}</span>;
          }
        }
      })}
    </span>
  );
};

// Component for pure math expressions (no text parsing)
export const MathExpression = ({ content, block = false, className = '' }) => {
  if (!content) {
    return <span className={className}></span>;
  }
  
  const mathContent = typeof content === 'string' ? content : String(content);
  
  try {
    if (block) {
      return (
        <BlockMath
          math={mathContent}
          className={className}
          renderError={(error) => {
            console.warn('KaTeX block render error:', error.message, 'for content:', mathContent);
            return <div className={className}>{mathContent}</div>;
          }}
        />
      );
    } else {
      return (
        <InlineMath
          math={mathContent}
          className={className}
          renderError={(error) => {
            console.warn('KaTeX inline render error:', error.message, 'for content:', mathContent);
            return <span className={className}>{mathContent}</span>;
          }}
        />
      );
    }
  } catch (error) {
    console.warn('React-KaTeX expression error:', error.message, 'for content:', mathContent);
    const Element = block ? 'div' : 'span';
    return <Element className={className}>{mathContent}</Element>;
  }
};

export default MathRenderer;