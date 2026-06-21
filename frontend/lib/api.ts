import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function apiClient(token?: string) {
  return axios.create({
    baseURL: API_BASE + '/api',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
