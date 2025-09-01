import axios from 'axios';
import type { User, AuthResponse } from '../types/auth';
import type { Workout, DashboardStats } from '../types/workout';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWTトークンを自動的に付与するインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 認証API関数
export const authAPI = {
  signup: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  me: () =>
    api.get<User>('/auth/me'),
};

// ダッシュボードAPI関数
export const dashboardAPI = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
  
  getRecentWorkouts: (limit: number = 5) =>
    api.get<Workout[]>(`/workouts/recent?limit=${limit}`),
};

// ワークアウトAPI関数
export const workoutAPI = {
  getWorkouts: (from?: string, to?: string) =>
    api.get<Workout[]>('/workouts', { params: { from, to } }),
  
  createWorkout: (date: string, note?: string) =>
    api.post<Workout>('/workouts', { date, note }),
};