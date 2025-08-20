/**
 * Text Processor for Mathematical Content
 * Handles LaTeX preprocessing, tokenization, and normalization
 */

/**
 * Polish mathematical term mappings
 */
const MATH_TERM_MAPPINGS = {
  // Angle units
  '°': 'stopnie',
  'stopni': 'stopnie',
  'stopnia': 'stopnie',
  'stopień': 'stopnie',
  'rad': 'radiany',
  'radian': 'radiany',
  'radianów': 'radiany',
  'radianie': 'radiany',
  
  // Greek letters
  'π': 'pi',
  'alpha': 'alfa',
  'β': 'beta',
  'γ': 'gamma',
  'δ': 'delta',
  'θ': 'theta',
  'λ': 'lambda',
  'μ': 'mi',
  'φ': 'phi',
  'ψ': 'psi',
  'ω': 'omega',
  
  // Functions
  'sin': 'sinus',
  'cos': 'cosinus',
  'tan': 'tangens',
  'tg': 'tangens',
  'ctg': 'cotangens',
  'cot': 'cotangens',
  'sec': 'secans',
  'csc': 'cosecans',
  'arcsin': 'arcussinus',
  'arccos': 'arcuscosinus',
  'arctan': 'arcustangens',
  'arctg': 'arcustangens',
  
  // Operations
  'oblicz': 'oblicz',
  'wyraź': 'wyraz',
  'wyrażenie': 'wyrazenie',
  'upraw': 'uprość',
  'uprość': 'uprość',
  'rozwiąż': 'rozwiaz',
  'znajdź': 'znajdz',
  'określ': 'okresl',
  'sprawdź': 'sprawdz',
  'udowodnij': 'udowodnij',
  'uzasadnij': 'uzasadnij',
  'wykaż': 'wykaz',
  'zapisz': 'zapisz',
  
  // Mathematical concepts
  'równanie': 'rownanie',
  'tożsamość': 'tozsamosc',
  'wzór': 'wzor',
  'funkcja': 'funkcja',
  'trójkąt': 'trojkat',
  'przeciwprostokątna': 'przeciwprostokatna',
  'przyprostokątna': 'przyprostokatna',
  'wysokość': 'wysokosc',
  'podstawa': 'podstawa',
  'kąt': 'kat',
  'ćwiartka': 'cwiartka',
  'ćwiartki': 'cwiartka',
  'współrzędne': 'wspolrzedne',
  'układ': 'uklad',
  'ciąg': 'ciag',
  'wyraz': 'wyraz',
  'suma': 'suma',
  'iloczyn': 'iloczyn',
  'różnica': 'roznica',
  'iloraz': 'iloraz'
};

/**
 * Common Polish stopwords to filter out
 */
const POLISH_STOPWORDS = new Set([
  'i', 'w', 'z', 'na', 'do', 'o', 'od', 'po', 'za', 'ze', 'że', 'to', 'ta', 'te', 'tej', 'tym', 'tych',
  'jest', 'są', 'było', 'będzie', 'ma', 'mają', 'może', 'można', 'oraz', 'lub', 'albo', 'gdy', 'jeśli',
  'dla', 'przez', 'bez', 'pod', 'nad', 'przed', 'między', 'przy', 'według', 'około', 'podczas',
  'gdzie', 'jak', 'czy', 'co', 'który', 'która', 'które', 'jakie', 'jaki', 'jaką',
  'się', 'go', 'jej', 'jego', 'ich', 'im', 'mu', 'ją', 'je', 'nas', 'was', 'nim', 'nią', 'nimi',
  'jeden', 'jedna', 'jedno', 'dwa', 'dwaj', 'dwie', 'trzy', 'trzej', 'cztery', 'pięć', 'sześć',
  'bardzo', 'tylko', 'już', 'jeszcze', 'także', 'również', 'więc', 'czyli', 'więcej', 'mniej',
  'każdy', 'każda', 'każde', 'wszystkie', 'wszystkich', 'wszystkim', 'żaden', 'żadna', 'żadne'
]);

/**
 * Clean LaTeX commands from mathematical text
 * @param {string} text - Raw text with LaTeX
 * @returns {string} Cleaned text
 */
export function cleanLatex(text) {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove common LaTeX commands but preserve content
  cleaned = cleaned.replace(/\\text\{([^}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\textbf\{([^}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\textit\{([^}]*)\}/g, '$1');
  
  // Handle fractions
  cleaned = cleaned.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
  
  // Handle square roots
  cleaned = cleaned.replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)');
  cleaned = cleaned.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, 'root$1($2)');
  
  // Handle powers and subscripts
  cleaned = cleaned.replace(/\^(\{[^}]*\}|\w)/g, '^$1');
  cleaned = cleaned.replace(/_(\{[^}]*\}|\w)/g, '_$1');
  
  // Remove remaining braces
  cleaned = cleaned.replace(/[{}]/g, '');
  
  // Handle common mathematical symbols
  cleaned = cleaned.replace(/\\pi/g, 'π');
  cleaned = cleaned.replace(/\\alpha/g, 'α');
  cleaned = cleaned.replace(/\\beta/g, 'β');
  cleaned = cleaned.replace(/\\gamma/g, 'γ');
  cleaned = cleaned.replace(/\\delta/g, 'δ');
  cleaned = cleaned.replace(/\\theta/g, 'θ');
  cleaned = cleaned.replace(/\\lambda/g, 'λ');
  cleaned = cleaned.replace(/\\mu/g, 'μ');
  cleaned = cleaned.replace(/\\phi/g, 'φ');
  cleaned = cleaned.replace(/\\psi/g, 'ψ');
  cleaned = cleaned.replace(/\\omega/g, 'ω');
  
  // Handle trigonometric functions
  cleaned = cleaned.replace(/\\sin/g, 'sin');
  cleaned = cleaned.replace(/\\cos/g, 'cos');
  cleaned = cleaned.replace(/\\tan/g, 'tan');
  cleaned = cleaned.replace(/\\tg/g, 'tg');
  cleaned = cleaned.replace(/\\ctg/g, 'ctg');
  cleaned = cleaned.replace(/\\cot/g, 'cot');
  
  // Remove remaining backslashes
  cleaned = cleaned.replace(/\\/g, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Normalize mathematical terms using mapping dictionary
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
export function normalizeMathTerms(text) {
  if (!text) return '';
  
  let normalized = text.toLowerCase();
  
  // Apply term mappings
  for (const [original, normalized_term] of Object.entries(MATH_TERM_MAPPINGS)) {
    const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    normalized = normalized.replace(regex, normalized_term);
  }
  
  return normalized;
}

/**
 * Extract mathematical entities (numbers, variables, operators)
 * @param {string} text - Input text
 * @returns {Array} Array of mathematical entities
 */
export function extractMathEntities(text) {
  const entities = [];
  
  // Numbers (including decimals and fractions)
  const numbers = text.match(/\d+(?:[.,]\d+)?(?:\/\d+)?/g) || [];
  entities.push(...numbers.map(n => ({ type: 'number', value: n })));
  
  // Variables (single letters, often with subscripts/superscripts)
  const variables = text.match(/[a-zA-Z](?:[_^][0-9a-zA-Z]*)?/g) || [];
  entities.push(...variables.map(v => ({ type: 'variable', value: v })));
  
  // Operators
  const operators = text.match(/[+\-*/=<>≤≥≠±∓]/g) || [];
  entities.push(...operators.map(op => ({ type: 'operator', value: op })));
  
  return entities;
}

/**
 * Tokenize mathematical text with special handling for math concepts
 * @param {string} text - Input text
 * @returns {Array} Array of tokens
 */
export function tokenize(text) {
  if (!text) return [];
  
  // Split on whitespace and common punctuation, but preserve mathematical notation
  const tokens = text
    .toLowerCase()
    .split(/[\s\.,;:\(\)\[\]]+/)
    .filter(token => token.length > 0);
  
  // Filter out stopwords but keep mathematical terms
  const filtered = tokens.filter(token => {
    // Always keep mathematical terms
    if (Object.values(MATH_TERM_MAPPINGS).includes(token)) {
      return true;
    }
    
    // Keep numbers and single letters (variables)
    if (/^[\d.,\/]+$/.test(token) || /^[a-z]$/i.test(token)) {
      return true;
    }
    
    // Filter out stopwords
    return !POLISH_STOPWORDS.has(token);
  });
  
  return filtered;
}

/**
 * Complete preprocessing pipeline for mathematical text
 * @param {string} text - Raw mathematical text with LaTeX
 * @returns {Array} Array of normalized tokens
 */
export function preprocessMathText(text) {
  if (!text) return [];
  
  // Step 1: Clean LaTeX commands
  const cleaned = cleanLatex(text);
  
  // Step 2: Normalize mathematical terms
  const normalized = normalizeMathTerms(cleaned);
  
  // Step 3: Tokenize
  const tokens = tokenize(normalized);
  
  // Step 4: Remove duplicates while preserving order
  const uniqueTokens = [...new Set(tokens)];
  
  return uniqueTokens;
}

/**
 * Calculate term frequency for a document
 * @param {Array} tokens - Array of tokens
 * @returns {Object} Term frequency map
 */
export function calculateTermFrequency(tokens) {
  const tf = {};
  const totalTerms = tokens.length;
  
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  
  // Normalize by total number of terms
  for (const term in tf) {
    tf[term] = tf[term] / totalTerms;
  }
  
  return tf;
}

/**
 * Debug function to analyze text processing steps
 * @param {string} text - Input text
 * @returns {Object} Debug information
 */
export function debugTextProcessing(text) {
  const steps = {
    original: text,
    cleaned: cleanLatex(text),
    normalized: normalizeMathTerms(cleanLatex(text)),
    tokens: tokenize(normalizeMathTerms(cleanLatex(text))),
    finalTokens: preprocessMathText(text),
    entities: extractMathEntities(text)
  };
  
  console.log('Text Processing Debug:', steps);
  return steps;
}

export default {
  cleanLatex,
  normalizeMathTerms,
  extractMathEntities,
  tokenize,
  preprocessMathText,
  calculateTermFrequency,
  debugTextProcessing
};