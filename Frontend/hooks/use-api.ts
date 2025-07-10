import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const makeRequest = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    config?: any
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient[method](url, data, config);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  const get = useCallback((url: string, config?: any) => makeRequest('get', url, undefined, config), [makeRequest]);
  const post = useCallback((url: string, data?: any, config?: any) => makeRequest('post', url, data, config), [makeRequest]);
  const put = useCallback((url: string, data?: any, config?: any) => makeRequest('put', url, data, config), [makeRequest]);
  const del = useCallback((url: string, config?: any) => makeRequest('delete', url, undefined, config), [makeRequest]);
  const patch = useCallback((url: string, data?: any, config?: any) => makeRequest('patch', url, data, config), [makeRequest]);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    patch,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
} 