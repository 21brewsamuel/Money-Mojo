import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './api';

// Custom hook for Plaid Link Token
export const usePlaidLinkToken = (session) => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLinkToken = useCallback(async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.createLinkToken();
      setLinkToken(data.link_token);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch link token:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  return { linkToken, isLoading, error, refetch: fetchLinkToken };
};

// Custom hook for transactions
export const useTransactions = (accessToken, session) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!accessToken || !session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getTransactions(accessToken);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, session]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
};

// Custom hook for accounts
export const useAccounts = (accessToken) => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getAccounts(accessToken);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return { accounts, isLoading, error, refetch: fetchAccounts };
};

// Custom hook for localStorage with validation
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      // Validate the parsed data structure
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};