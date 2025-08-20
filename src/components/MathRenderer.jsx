import React, { useEffect, useRef, useMemo } from 'react';

// Dynamically load KaTeX with error handling
let katex = null;
let katexPromise = null;
let isLoading = false;

const loadKatex = () => {
  if (katex) return Promise.resolve(katex);
  if (katexPromise) return katexPromise;
  
  if (isLoading) {
    return new Promise((resolve) => {
      const checkKatex = () => {
        if (katex) {
          resolve(katex);
        } else {
          setTimeout(checkKatex, 100);
        }
      };
      checkKatex();
    });
  }
  
  isLoading = true;
  katexPromise = new Promise((resolve, reject) => {
    try {
      // Check if KaTeX is already loaded
      if (window.katex) {
        katex = window.katex;
        isLoading = false;
        resolve(katex);
        return;
      }
      
      // Load KaTeX CSS only once
      if (!document.querySelector('link[href*="katex"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
      
      // Load KaTeX JS only once
      if (!document.querySelector('script[src*="katex"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          katex = window.katex;
          isLoading = false;
          resolve(katex);
        };
        script.onerror = () => {
          isLoading = false;
          reject(new Error('Failed to load KaTeX'));
        };
        document.head.appendChild(script);
      } else {
        // Script exists, wait for it to load
        const checkScript = () => {
          if (window.katex) {
            katex = window.katex;
            isLoading = false;
            resolve(katex);
          } else {
            setTimeout(checkScript, 50);
          }
        };
        checkScript();
      }
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
  
  return katexPromise;
};

// Memoized parsing function to avoid re-parsing same content
const parseLatexTextMemo = (() => {
  const cache = new Map();
  const maxCacheSize = 100; // Limit cache size to prevent memory leaks
  
  return (text) => {
    if (cache.has(text)) {
      return cache.get(text);
    }
    
    // Clear cache if it gets too large
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    const result = parseLatexText(text);
    cache.set(text, result);
    return result;
  };
})();

// Function to split text into LaTeX and regular text segments
const parseLatexText = (text) => {
  const segments = [];
  let currentIndex = 0;
  
  // First check for mixed format with \text{} and \(...\) or $...$
  const hasTextCommand = text.includes('\\text{');
  const hasInlineMath = text.includes('\\(') && text.includes('\\)');
  const hasDollarMath = text.includes('$');
  
  if (hasTextCommand && (hasInlineMath || hasDollarMath)) {
    // Mixed format - parse both \text{} and math delimiters
    const mixedRegex = /\\text\{((?:[^{}]|{[^{}]*})*)\}|\\\(([^\\)]*)\\\)|\$([^$]+)\$/g;
    let match;
    const blocks = [];
    
    while ((match = mixedRegex.exec(text)) !== null) {
      if (match[0].startsWith('\\text{')) {
        blocks.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          type: 'text'
        });
      } else if (match[0].startsWith('\\(')) {
        blocks.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[2], // Use match[2] for \(...\) content
          type: 'math'
        });
      } else if (match[0].startsWith('$')) {
        blocks.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[3], // Use match[3] for $...$ content
          type: 'math'
        });
      }
    }
    
    // Sort blocks by position to ensure correct order
    blocks.sort((a, b) => a.start - b.start);
    
    // Process blocks in order
    currentIndex = 0;
    for (const block of blocks) {
      // Add any content before this block
      if (currentIndex < block.start) {
        const content = text.slice(currentIndex, block.start).trim();
        if (content) {
          // Plain text between blocks
          segments.push({ type: 'text', content });
        }
      }
      
      // Add the block content
      segments.push({ type: block.type, content: block.content });
      currentIndex = block.end;
    }
    
    // Add remaining content
    if (currentIndex < text.length) {
      const content = text.slice(currentIndex).trim();
      if (content) {
        segments.push({ type: 'text', content });
      }
    }
    
    return segments;
  }
  
  // Handle $...$ delimited math (for LaTeX format)
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
  
  // If we found $...$ delimiters, process them
  if (mathBlocks.length > 0) {
    for (const block of mathBlocks) {
      // Add text content before this math block
      if (currentIndex < block.start) {
        const textContent = text.slice(currentIndex, block.start);
        if (textContent.trim()) {
          segments.push({ type: 'text', content: textContent });
        }
      }
      
      // Add the math content
      segments.push({ type: 'math', content: block.content });
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
  
  // If no $...$ delimiters, try \text{...} parsing (for trigonometry format)
  const textRegex = /\\text\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  
  // Track positions of \text{} blocks
  const textBlocks = [];
  while ((match = textRegex.exec(text)) !== null) {
    textBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1]
    });
  }
  
  // Split text into segments
  currentIndex = 0;
  for (const block of textBlocks) {
    // Add math content before this text block
    if (currentIndex < block.start) {
      const mathContent = text.slice(currentIndex, block.start);
      if (mathContent.trim()) {
        segments.push({ type: 'math', content: mathContent });
      }
    }
    
    // Add the text content
    segments.push({ type: 'text', content: block.text });
    currentIndex = block.end;
  }
  
  // Add remaining content as math
  if (currentIndex < text.length) {
    const mathContent = text.slice(currentIndex);
    if (mathContent.trim()) {
      segments.push({ type: 'math', content: mathContent });
    }
  }
  
  // If no \text{} blocks found, treat entire content as math
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: 'math', content: text });
  }
  
  return segments;
};

const MathRenderer = ({ content, className = '' }) => {
  const containerRef = useRef(null);
  
  // Memoize parsed segments to avoid re-parsing
  const segments = useMemo(() => {
    if (!content) return [];
    return parseLatexTextMemo(content);
  }, [content]);
  
  useEffect(() => {
    if (!content || segments.length === 0) return;
    
    let isMounted = true;
    
    const renderMath = async () => {
      try {
        const katexLib = await loadKatex();
        if (!isMounted || !containerRef.current) return;
        
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (const segment of segments) {
          if (!isMounted) break;
          
          if (segment.type === 'text') {
            // Regular text
            const textNode = document.createTextNode(segment.content);
            fragment.appendChild(textNode);
          } else {
            // Math content
            const span = document.createElement('span');
            try {
              katexLib.render(segment.content, span, {
                displayMode: false,
                throwOnError: false,
                trust: true,
                maxSize: 10, // Limit size to prevent memory issues
                maxExpand: 100 // Limit macro expansion
              });
              // Make all math bold
              span.style.fontWeight = 'bold';
              span.querySelectorAll('*').forEach(el => {
                el.style.fontWeight = 'bold';
              });
              fragment.appendChild(span);
            } catch (error) {
              // Fallback to plain text if LaTeX fails
              const textNode = document.createTextNode(segment.content);
              fragment.appendChild(textNode);
            }
          }
        }
        
        if (isMounted && containerRef.current) {
          containerRef.current.appendChild(fragment);
        }
      } catch (error) {
        console.error('Math rendering error:', error);
        if (isMounted && containerRef.current) {
          containerRef.current.textContent = content;
        }
      }
    };
    
    renderMath();
    
    return () => {
      isMounted = false;
    };
  }, [content, segments, className]);
  
  return <span ref={containerRef} className={className} />;
};

// Component for pure math expressions (no text parsing)
export const MathExpression = ({ content, block = false, className = '' }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!content) return;
    
    let isMounted = true;
    
    const renderMath = async () => {
      try {
        const katexLib = await loadKatex();
        if (!isMounted || !containerRef.current) return;
        
        katexLib.render(content, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          trust: true,
          maxSize: 10, // Limit size to prevent memory issues
          maxExpand: 100 // Limit macro expansion
        });
        
        // Make all math bold
        if (containerRef.current) {
          containerRef.current.style.fontWeight = 'bold';
          containerRef.current.querySelectorAll('*').forEach(el => {
            el.style.fontWeight = 'bold';
          });
        }
      } catch (error) {
        console.error('Math rendering error:', error);
        if (isMounted && containerRef.current) {
          containerRef.current.textContent = content;
        }
      }
    };
    
    renderMath();
    
    return () => {
      isMounted = false;
    };
  }, [content, block, className]);
  
  const wrapperClass = block ? `block text-center ${className}` : className;
  return <span ref={containerRef} className={wrapperClass} />;
};

export default MathRenderer;