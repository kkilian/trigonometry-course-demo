/**
 * Cosine Similarity and Other Distance Metrics
 * Calculates similarity between TF-IDF vectors and other mathematical representations
 */

/**
 * Calculate dot product of two sparse vectors
 * @param {Object} vector1 - First sparse vector
 * @param {Object} vector2 - Second sparse vector
 * @returns {number} Dot product
 */
export function dotProduct(vector1, vector2) {
  let product = 0;
  
  // Iterate through the smaller vector for efficiency
  const smaller = Object.keys(vector1).length <= Object.keys(vector2).length ? vector1 : vector2;
  const larger = smaller === vector1 ? vector2 : vector1;
  
  for (const term in smaller) {
    if (larger[term]) {
      product += smaller[term] * larger[term];
    }
  }
  
  return product;
}

/**
 * Calculate magnitude (L2 norm) of a sparse vector
 * @param {Object} vector - Sparse vector
 * @returns {number} Vector magnitude
 */
export function magnitude(vector) {
  let sum = 0;
  for (const term in vector) {
    sum += vector[term] * vector[term];
  }
  return Math.sqrt(sum);
}

/**
 * Calculate cosine similarity between two sparse vectors
 * Cosine similarity = dot(A, B) / (||A|| * ||B||)
 * @param {Object} vector1 - First sparse vector
 * @param {Object} vector2 - Second sparse vector
 * @returns {number} Cosine similarity (0-1)
 */
export function cosineSimilarity(vector1, vector2) {
  // Handle empty vectors
  if (!vector1 || !vector2 || Object.keys(vector1).length === 0 || Object.keys(vector2).length === 0) {
    return 0;
  }
  
  const dot = dotProduct(vector1, vector2);
  const mag1 = magnitude(vector1);
  const mag2 = magnitude(vector2);
  
  // Avoid division by zero
  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }
  
  return dot / (mag1 * mag2);
}

/**
 * Calculate Jaccard similarity between two sets of terms
 * Jaccard = |A ∩ B| / |A ∪ B|
 * @param {Object} vector1 - First sparse vector
 * @param {Object} vector2 - Second sparse vector
 * @param {number} threshold - Minimum value to consider term present
 * @returns {number} Jaccard similarity (0-1)
 */
export function jaccardSimilarity(vector1, vector2, threshold = 0) {
  const terms1 = new Set(
    Object.entries(vector1)
      .filter(([_, value]) => value > threshold)
      .map(([term, _]) => term)
  );
  
  const terms2 = new Set(
    Object.entries(vector2)
      .filter(([_, value]) => value > threshold)
      .map(([term, _]) => term)
  );
  
  const intersection = new Set([...terms1].filter(x => terms2.has(x)));
  const union = new Set([...terms1, ...terms2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate Euclidean distance between two sparse vectors
 * @param {Object} vector1 - First sparse vector
 * @param {Object} vector2 - Second sparse vector
 * @returns {number} Euclidean distance
 */
export function euclideanDistance(vector1, vector2) {
  const allTerms = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
  let sumSquares = 0;
  
  for (const term of allTerms) {
    const val1 = vector1[term] || 0;
    const val2 = vector2[term] || 0;
    sumSquares += Math.pow(val1 - val2, 2);
  }
  
  return Math.sqrt(sumSquares);
}

/**
 * Convert Euclidean distance to similarity (0-1 scale)
 * @param {number} distance - Euclidean distance
 * @returns {number} Similarity score (0-1)
 */
export function distanceToSimilarity(distance) {
  return 1 / (1 + distance);
}

/**
 * Calculate Manhattan distance between two sparse vectors
 * @param {Object} vector1 - First sparse vector
 * @param {Object} vector2 - Second sparse vector
 * @returns {number} Manhattan distance
 */
export function manhattanDistance(vector1, vector2) {
  const allTerms = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
  let sum = 0;
  
  for (const term of allTerms) {
    const val1 = vector1[term] || 0;
    const val2 = vector2[term] || 0;
    sum += Math.abs(val1 - val2);
  }
  
  return sum;
}

/**
 * Build similarity matrix for a collection of vectors
 * @param {Array} vectors - Array of sparse vectors
 * @param {string} metric - Similarity metric ('cosine', 'jaccard', 'euclidean')
 * @param {Object} options - Additional options for metrics
 * @returns {Array} 2D similarity matrix
 */
export function buildSimilarityMatrix(vectors, metric = 'cosine', options = {}) {
  const n = vectors.length;
  const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
  
  // Choose similarity function
  let similarityFn;
  switch (metric) {
    case 'jaccard':
      similarityFn = (v1, v2) => jaccardSimilarity(v1, v2, options.threshold || 0);
      break;
    case 'euclidean':
      similarityFn = (v1, v2) => distanceToSimilarity(euclideanDistance(v1, v2));
      break;
    case 'manhattan':
      similarityFn = (v1, v2) => distanceToSimilarity(manhattanDistance(v1, v2));
      break;
    case 'cosine':
    default:
      similarityFn = cosineSimilarity;
      break;
  }
  
  // Calculate similarities (matrix is symmetric, so only calculate upper triangle)
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1.0; // Self-similarity is always 1
    
    for (let j = i + 1; j < n; j++) {
      const similarity = similarityFn(vectors[i], vectors[j]);
      matrix[i][j] = similarity;
      matrix[j][i] = similarity; // Symmetric
    }
  }
  
  return matrix;
}

/**
 * Find most similar documents to a given document
 * @param {Array} vectors - Array of all vectors
 * @param {number} targetIndex - Index of target document
 * @param {number} topN - Number of similar documents to return
 * @param {string} metric - Similarity metric to use
 * @returns {Array} Array of {index, similarity} objects sorted by similarity
 */
export function findMostSimilar(vectors, targetIndex, topN = 5, metric = 'cosine') {
  if (targetIndex < 0 || targetIndex >= vectors.length) {
    throw new Error('Target index out of bounds');
  }
  
  const targetVector = vectors[targetIndex];
  const similarities = [];
  
  // Choose similarity function
  let similarityFn;
  switch (metric) {
    case 'jaccard':
      similarityFn = jaccardSimilarity;
      break;
    case 'euclidean':
      similarityFn = (v1, v2) => distanceToSimilarity(euclideanDistance(v1, v2));
      break;
    case 'manhattan':
      similarityFn = (v1, v2) => distanceToSimilarity(manhattanDistance(v1, v2));
      break;
    case 'cosine':
    default:
      similarityFn = cosineSimilarity;
      break;
  }
  
  // Calculate similarities to all other documents
  for (let i = 0; i < vectors.length; i++) {
    if (i !== targetIndex) {
      const similarity = similarityFn(targetVector, vectors[i]);
      similarities.push({ index: i, similarity });
    }
  }
  
  // Sort by similarity (descending) and return top N
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

/**
 * Find documents similar to a query vector
 * @param {Array} vectors - Array of document vectors
 * @param {Object} queryVector - Query vector
 * @param {number} topN - Number of similar documents to return
 * @param {string} metric - Similarity metric to use
 * @returns {Array} Array of {index, similarity} objects sorted by similarity
 */
export function findSimilarToQuery(vectors, queryVector, topN = 5, metric = 'cosine') {
  const similarities = [];
  
  // Choose similarity function
  let similarityFn;
  switch (metric) {
    case 'jaccard':
      similarityFn = jaccardSimilarity;
      break;
    case 'euclidean':
      similarityFn = (v1, v2) => distanceToSimilarity(euclideanDistance(v1, v2));
      break;
    case 'manhattan':
      similarityFn = (v1, v2) => distanceToSimilarity(manhattanDistance(v1, v2));
      break;
    case 'cosine':
    default:
      similarityFn = cosineSimilarity;
      break;
  }
  
  // Calculate similarities to all documents
  for (let i = 0; i < vectors.length; i++) {
    const similarity = similarityFn(queryVector, vectors[i]);
    similarities.push({ index: i, similarity });
  }
  
  // Sort by similarity (descending) and return top N
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

/**
 * Cluster documents based on similarity threshold
 * @param {Array} vectors - Array of vectors
 * @param {number} threshold - Similarity threshold for clustering
 * @param {string} metric - Similarity metric to use
 * @returns {Array} Array of clusters (each cluster is array of indices)
 */
export function clusterBySimilarity(vectors, threshold = 0.7, metric = 'cosine') {
  const clusters = [];
  const visited = new Set();
  
  // Choose similarity function
  let similarityFn;
  switch (metric) {
    case 'jaccard':
      similarityFn = jaccardSimilarity;
      break;
    case 'euclidean':
      similarityFn = (v1, v2) => distanceToSimilarity(euclideanDistance(v1, v2));
      break;
    case 'manhattan':
      similarityFn = (v1, v2) => distanceToSimilarity(manhattanDistance(v1, v2));
      break;
    case 'cosine':
    default:
      similarityFn = cosineSimilarity;
      break;
  }
  
  for (let i = 0; i < vectors.length; i++) {
    if (visited.has(i)) continue;
    
    const cluster = [i];
    visited.add(i);
    
    // Find all similar documents
    for (let j = i + 1; j < vectors.length; j++) {
      if (visited.has(j)) continue;
      
      const similarity = similarityFn(vectors[i], vectors[j]);
      if (similarity >= threshold) {
        cluster.push(j);
        visited.add(j);
      }
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}

/**
 * Analyze similarity distribution in a matrix
 * @param {Array} matrix - 2D similarity matrix
 * @returns {Object} Statistics about the similarity distribution
 */
export function analyzeSimilarityDistribution(matrix) {
  const n = matrix.length;
  const similarities = [];
  
  // Extract upper triangle (excluding diagonal)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      similarities.push(matrix[i][j]);
    }
  }
  
  similarities.sort((a, b) => a - b);
  
  const stats = {
    count: similarities.length,
    min: similarities[0] || 0,
    max: similarities[similarities.length - 1] || 0,
    mean: similarities.reduce((a, b) => a + b, 0) / similarities.length || 0,
    median: similarities[Math.floor(similarities.length / 2)] || 0,
    q1: similarities[Math.floor(similarities.length * 0.25)] || 0,
    q3: similarities[Math.floor(similarities.length * 0.75)] || 0,
    std: 0
  };
  
  // Calculate standard deviation
  const variance = similarities.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / similarities.length;
  stats.std = Math.sqrt(variance);
  
  return stats;
}

/**
 * Main class for similarity calculations
 */
export class SimilarityCalculator {
  constructor(metric = 'cosine', options = {}) {
    this.metric = metric;
    this.options = options;
    this.vectors = null;
    this.matrix = null;
  }
  
  /**
   * Set vectors for similarity calculations
   * @param {Array} vectors - Array of sparse vectors
   */
  setVectors(vectors) {
    this.vectors = vectors;
    this.matrix = null; // Reset matrix
  }
  
  /**
   * Calculate similarity between two specific vectors
   * @param {number} index1 - First vector index
   * @param {number} index2 - Second vector index
   * @returns {number} Similarity score
   */
  similarity(index1, index2) {
    if (!this.vectors || index1 >= this.vectors.length || index2 >= this.vectors.length) {
      throw new Error('Invalid vector indices');
    }
    
    if (index1 === index2) return 1.0;
    
    switch (this.metric) {
      case 'jaccard':
        return jaccardSimilarity(this.vectors[index1], this.vectors[index2], this.options.threshold || 0);
      case 'euclidean':
        return distanceToSimilarity(euclideanDistance(this.vectors[index1], this.vectors[index2]));
      case 'manhattan':
        return distanceToSimilarity(manhattanDistance(this.vectors[index1], this.vectors[index2]));
      case 'cosine':
      default:
        return cosineSimilarity(this.vectors[index1], this.vectors[index2]);
    }
  }
  
  /**
   * Build and cache similarity matrix
   * @returns {Array} 2D similarity matrix
   */
  getMatrix() {
    if (!this.matrix && this.vectors) {
      this.matrix = buildSimilarityMatrix(this.vectors, this.metric, this.options);
    }
    return this.matrix;
  }
  
  /**
   * Find most similar vectors to a target
   * @param {number} targetIndex - Target vector index
   * @param {number} topN - Number of results to return
   * @returns {Array} Array of {index, similarity} objects
   */
  getMostSimilar(targetIndex, topN = 5) {
    if (!this.vectors) {
      throw new Error('No vectors set');
    }
    return findMostSimilar(this.vectors, targetIndex, topN, this.metric);
  }
}

export default {
  dotProduct,
  magnitude,
  cosineSimilarity,
  jaccardSimilarity,
  euclideanDistance,
  distanceToSimilarity,
  manhattanDistance,
  buildSimilarityMatrix,
  findMostSimilar,
  findSimilarToQuery,
  clusterBySimilarity,
  analyzeSimilarityDistribution,
  SimilarityCalculator
};