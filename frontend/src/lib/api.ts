import axios from 'axios';
import type { User, AuthResponse } from '../types/auth';
import type { Workout, DashboardStats, Exercise } from '../types/workout';

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
  getWorkouts: (from?: string, to?: string, includeCompleted: boolean = true) =>
    api.get<Workout[]>('/workouts', { 
      params: { 
        from_date: from, 
        to_date: to, 
        include_completed: includeCompleted 
      } 
    }),
  
  createWorkout: (date: string, note?: string) =>
    api.post<Workout>('/workouts', { date, note }),
};

// 種目API関数
export const exerciseAPI = {
  getExercises: () =>
    api.get<Exercise[]>('/exercises'),
  
  createExercise: (name: string, muscle_group: string) =>
    api.post<Exercise>('/exercises', { name, muscle_group }),
};

// ワークアウト詳細API
export const workoutDetailAPI = {
  getWorkout: (workoutId: number) =>
    api.get<Workout>(`/workouts/${workoutId}`),
  
  addExerciseToWorkout: (workoutId: number, exerciseId: number, orderIndex?: number) =>
    api.post(`/workouts/${workoutId}/exercises`, { 
      exercise_id: exerciseId, 
      order_index: orderIndex || 1 
    }),
  
  addSetToExercise: (workoutExerciseId: number, setData: {
    weight: number;
    reps: number;
    rpe?: number;
    is_warmup?: boolean;
    note?: string;
  }) =>
    api.post(`/workout-exercises/${workoutExerciseId}/sets`, setData),
  
  updateSet: (setId: number, setData: Partial<{
    weight: number;
    reps: number;
    rpe?: number;
    is_warmup: boolean;
    note?: string;
  }>) =>
    api.put(`/sets/${setId}`, setData),
  
  deleteSet: (setId: number) =>
    api.delete(`/sets/${setId}`),
  
  completeWorkout: (workoutId: number) =>
    api.patch<{ message: string; workout_id: number }>(`/workouts/${workoutId}/complete`),
};