import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

export type RequestOptions = RequestInit & { body?: any };

export async function request(endpoint: string, options: RequestOptions = {}) {
  const token = await AsyncStorage.getItem('authToken');
  const tokenType = (await AsyncStorage.getItem('tokenType')) || 'Bearer';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const get = (endpoint: string) => request(endpoint, { method: 'GET' });
export const post = (endpoint: string, body?: any) =>
  request(endpoint, { method: 'POST', body });
export const put = (endpoint: string, body?: any) =>
  request(endpoint, { method: 'PUT', body });
export const del = (endpoint: string) => request(endpoint, { method: 'DELETE' });
