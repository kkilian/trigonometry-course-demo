/**
 * TF-IDF Implementation for Mathematical Documents
 * Calculates Term Frequency-Inverse Document Frequency vectors
 */

/**
 * Calculate Term Frequency (TF) for a document
 * TF(t,d) = (Number of times term t appears in document d) / (Total number of terms in document d)
 * @param {Array} tokens - Array of tokens for the document
 * @returns {Object} Term frequency map
 */
export function calculateTF(tokens) {
  if (!tokens || tokens.length === 0) return {};
  
  const tf = {};
  const totalTerms = tokens.length;
  
  // Count occurrences of each term
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
 * Calculate Inverse Document Frequency (IDF) for a corpus
 * IDF(t,D) = log(|D| / |{d ∈ D : t ∈ d}|)
 * @param {Array} documents - Array of document token arrays
 * @returns {Object} IDF map for all terms
 */
export function calculateIDF(documents) {
  const idf = {};
  const totalDocuments = documents.length;
  
  if (totalDocuments === 0) return {};
  
  // Create vocabulary from all documents
  const vocabulary = new Set();
  for (const doc of documents) {
    for (const token of doc) {
      vocabulary.add(token);
    }
  }
  
  // Calculate IDF for each term
  for (const term of vocabulary) {
    let documentsWithTerm = 0;
    
    for (const doc of documents) {
      if (doc.includes(term)) {
        documentsWithTerm++;
      }
    }
    
    // Use smoothing to avoid division by zero
    idf[term] = Math.log(totalDocuments / (1 + documentsWithTerm));
  }
  
  return idf;
}

/**
 * Calculate TF-IDF score for a term in a document
 * TF-IDF(t,d,D) = TF(t,d) × IDF(t,D)
 * @param {number} tf - Term frequency
 * @param {number} idf - Inverse document frequency
 * @returns {number} TF-IDF score
 */
export function calculateTFIDF(tf, idf) {
  return tf * idf;
}

/**
 * Create TF-IDF vector for a document
 * @param {Array} tokens - Document tokens
 * @param {Object} idf - IDF map for the corpus
 * @returns {Object} TF-IDF vector
 */
export function createTFIDFVector(tokens, idf) {
  const tf = calculateTF(tokens);
  const tfidfVector = {};
  
  // Calculate TF-IDF for each term in the document
  for (const term in tf) {
    const idfValue = idf[term] || 0;
    tfidfVector[term] = calculateTFIDF(tf[term], idfValue);
  }
  
  return tfidfVector;
}

/**
 * Normalize a TF-IDF vector (L2 normalization)
 * @param {Object} vector - TF-IDF vector
 * @returns {Object} Normalized vector
 */
export function normalizeVector(vector) {
  // Calculate L2 norm (Euclidean norm)
  let norm = 0;
  for (const term in vector) {
    norm += vector[term] * vector[term];
  }
  norm = Math.sqrt(norm);
  
  // Avoid division by zero
  if (norm === 0) return vector;
  
  // Normalize each component
  const normalizedVector = {};
  for (const term in vector) {
    normalizedVector[term] = vector[term] / norm;
  }
  
  return normalizedVector;
}

/**
 * Build TF-IDF matrix for a collection of documents
 * @param {Array} documentsTokens - Array of token arrays
 * @returns {Object} Object containing vectors and vocabulary
 */
export function buildTFIDFMatrix(documentsTokens) {
  if (!documentsTokens || documentsTokens.length === 0) {
    return { vectors: [], vocabulary: [], idf: {} };
  }
  
  // Calculate IDF for the corpus
  const idf = calculateIDF(documentsTokens);
  
  // Create vocabulary (sorted for consistency)
  const vocabulary = Object.keys(idf).sort();
  
  // Create TF-IDF vectors for each document
  const vectors = documentsTokens.map(tokens => {
    const tfidfVector = createTFIDFVector(tokens, idf);
    return normalizeVector(tfidfVector);
  });
  
  return {
    vectors,
    vocabulary,
    idf,
    documentsCount: documentsTokens.length,
    vocabularySize: vocabulary.length
  };
}

/**
 * Convert sparse TF-IDF vector to dense array representation
 * @param {Object} sparseVector - Sparse TF-IDF vector
 * @param {Array} vocabulary - Ordered vocabulary
 * @returns {Array} Dense vector array
 */
export function sparseToDense(sparseVector, vocabulary) {
  return vocabulary.map(term => sparseVector[term] || 0);
}

/**
 * Convert dense array to sparse vector representation
 * @param {Array} denseVector - Dense vector array
 * @param {Array} vocabulary - Ordered vocabulary
 * @returns {Object} Sparse vector object
 */
export function denseToSparse(denseVector, vocabulary) {
  const sparseVector = {};
  for (let i = 0; i < vocabulary.length; i++) {
    if (denseVector[i] !== 0) {
      sparseVector[vocabulary[i]] = denseVector[i];
    }
  }
  return sparseVector;
}

/**
 * Get top N terms by TF-IDF score for a document
 * @param {Object} tfidfVector - TF-IDF vector for document
 * @param {number} n - Number of top terms to return
 * @returns {Array} Array of {term, score} objects sorted by score
 */
export function getTopTerms(tfidfVector, n = 10) {
  const terms = Object.entries(tfidfVector)
    .map(([term, score]) => ({ term, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  
  return terms;
}

/**
 * Calculate document similarity based on shared high-scoring terms
 * @param {Object} vector1 - First TF-IDF vector
 * @param {Object} vector2 - Second TF-IDF vector
 * @param {number} threshold - Minimum TF-IDF score to consider
 * @returns {number} Jaccard similarity of high-scoring terms
 */
export function calculateTermOverlap(vector1, vector2, threshold = 0.1) {
  const terms1 = new Set(
    Object.entries(vector1)
      .filter(([_, score]) => score >= threshold)
      .map(([term, _]) => term)
  );
  
  const terms2 = new Set(
    Object.entries(vector2)
      .filter(([_, score]) => score >= threshold)
      .map(([term, _]) => term)
  );
  
  const intersection = new Set([...terms1].filter(x => terms2.has(x)));
  const union = new Set([...terms1, ...terms2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Analyze TF-IDF statistics for debugging
 * @param {Object} tfidfMatrix - TF-IDF matrix from buildTFIDFMatrix
 * @returns {Object} Statistics object
 */
export function analyzeTFIDFStatistics(tfidfMatrix) {
  const { vectors, vocabulary, idf } = tfidfMatrix;
  
  // Calculate average TF-IDF scores
  const avgScores = {};
  for (const term of vocabulary) {
    let sum = 0;
    let count = 0;
    
    for (const vector of vectors) {
      if (vector[term]) {
        sum += vector[term];
        count++;
      }
    }
    
    avgScores[term] = count > 0 ? sum / count : 0;
  }
  
  // Find most and least discriminative terms
  const sortedTerms = Object.entries(avgScores)
    .sort(([,a], [,b]) => b - a);
  
  const statistics = {
    vocabularySize: vocabulary.length,
    documentsCount: vectors.length,
    avgVocabularyPerDocument: vectors.reduce((sum, vec) => 
      sum + Object.keys(vec).length, 0) / vectors.length,
    mostDiscriminativeTerms: sortedTerms.slice(0, 10),
    leastDiscriminativeTerms: sortedTerms.slice(-10),
    idfRange: {
      min: Math.min(...Object.values(idf)),
      max: Math.max(...Object.values(idf)),
      avg: Object.values(idf).reduce((a, b) => a + b, 0) / Object.values(idf).length
    }
  };
  
  return statistics;
}

/**
 * Main class for TF-IDF processing
 */
export class TFIDFProcessor {
  constructor() {
    this.idf = {};
    this.vocabulary = [];
    this.isTrained = false;
  }
  
  /**
   * Train the TF-IDF processor on a corpus
   * @param {Array} documentsTokens - Array of token arrays
   */
  fit(documentsTokens) {
    const matrix = buildTFIDFMatrix(documentsTokens);
    this.idf = matrix.idf;
    this.vocabulary = matrix.vocabulary;
    this.isTrained = true;
    
    return this;
  }
  
  /**
   * Transform documents to TF-IDF vectors
   * @param {Array} documentsTokens - Array of token arrays
   * @returns {Array} Array of TF-IDF vectors
   */
  transform(documentsTokens) {
    if (!this.isTrained) {
      throw new Error('TFIDFProcessor must be trained before transforming');
    }
    
    return documentsTokens.map(tokens => {
      const vector = createTFIDFVector(tokens, this.idf);
      return normalizeVector(vector);
    });
  }
  
  /**
   * Fit and transform in one step
   * @param {Array} documentsTokens - Array of token arrays
   * @returns {Array} Array of TF-IDF vectors
   */
  fitTransform(documentsTokens) {
    this.fit(documentsTokens);
    return this.transform(documentsTokens);
  }
  
  /**
   * Get TF-IDF vector for a single document
   * @param {Array} tokens - Document tokens
   * @returns {Object} TF-IDF vector
   */
  transformOne(tokens) {
    if (!this.isTrained) {
      throw new Error('TFIDFProcessor must be trained before transforming');
    }
    
    const vector = createTFIDFVector(tokens, this.idf);
    return normalizeVector(vector);
  }
}

const tfidfUtils = {
  calculateTF,
  calculateIDF,
  calculateTFIDF,
  createTFIDFVector,
  normalizeVector,
  buildTFIDFMatrix,
  sparseToDense,
  denseToSparse,
  getTopTerms,
  calculateTermOverlap,
  analyzeTFIDFStatistics,
  TFIDFProcessor
};

export default tfidfUtils;