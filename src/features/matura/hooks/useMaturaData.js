import { useState, useEffect } from 'react';
import { getSessionById } from '../config/sessions.config';

/**
 * Hook do dynamicznego ładowania danych sesji maturalnych
 * Obsługuje lazy loading i cache'owanie
 */
const useMaturaData = (sessionId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setData(null);
      setError(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionConfig = getSessionById(sessionId);

        if (!sessionConfig) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        // Check cache first
        const cacheKey = `matura_data_${sessionId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Dynamic import based on session config
        const module = await import(`../../../data/${sessionConfig.dataPath}`);
        const sessionData = module.default;

        // Cache the data in sessionStorage
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(sessionData));
        } catch (e) {
          // SessionStorage might be full, ignore
          console.warn('Could not cache session data:', e);
        }

        setData(sessionData);
      } catch (err) {
        console.error('Error loading matura data:', err);
        setError(err.message || 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  // Clear cache for a specific session
  const clearCache = (id = sessionId) => {
    if (id) {
      const cacheKey = `matura_data_${id}`;
      sessionStorage.removeItem(cacheKey);
    }
  };

  // Clear all matura data cache
  const clearAllCache = () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('matura_data_')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Reload data (bypass cache)
  const reloadData = () => {
    if (sessionId) {
      clearCache(sessionId);
      // Trigger re-render by updating sessionId
      const temp = sessionId;
      setData(null);
      // Force reload
      setTimeout(() => {
        if (temp === sessionId) {
          window.location.reload();
        }
      }, 0);
    }
  };

  return {
    data,
    loading,
    error,
    clearCache,
    clearAllCache,
    reloadData
  };
};

export default useMaturaData;