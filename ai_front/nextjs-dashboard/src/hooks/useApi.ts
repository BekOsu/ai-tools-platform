"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<{ data: T }>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      if (onError && error instanceof ApiError) {
        onError(error);
      }
      
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

// Authentication hooks
export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      localStorage.setItem('auth_token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await apiClient.signup(userData);
      localStorage.setItem('auth_token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Log error but continue with logout
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      return;
    }

    try {
      const response = await apiClient.getCurrentUser();
      setAuthState({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    signup,
    logout,
    refetch: checkAuth,
  };
}

// AI Features hooks
export function useAIFeatures() {
  return useApi(() => apiClient.getAIFeatures(), {
    immediate: true,
  });
}

export function useAIFeature(id: string) {
  return useApi(() => apiClient.getAIFeature(id), {
    immediate: !!id,
  });
}

// Products hooks (for Django backend)
export function useProducts() {
  return useApi(() => apiClient.getProducts(), {
    immediate: true,
  });
}

export function useProduct(id: string) {
  return useApi(() => apiClient.getProduct(id), {
    immediate: !!id,
  });
}

// Mutation hook for create/update/delete operations
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
  } = {}
) {
  const [state, setState] = useState({
    loading: false,
    error: null as string | null,
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState({ loading: true, error: null });
    
    try {
      const response = await mutationFn(variables);
      setState({ loading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data, variables);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({ loading: false, error: errorMessage });
      
      if (options.onError && error instanceof ApiError) {
        options.onError(error, variables);
      }
      
      throw error;
    }
  }, [mutationFn, options]);

  return {
    ...state,
    mutate,
  };
}