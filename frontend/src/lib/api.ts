import axios from 'axios';
import type { User, AuthResponse } from '../types/auth';
import type { Workout, DashboardStats, Exercise, DashboardConfig } from '../types/workout';
import type { 
  UserProfile, 
  ProfileUpdateRequest, 
  BodyMetric, 
  BodyMetricCreateRequest,
  HeightRecord,
  HeightRecordCreateRequest,
  AdvancedAnalytics 
} from '../types/profile';

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

// 認証エラー時の自動リダイレクト
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // トークンを削除
      localStorage.removeItem('access_token');
      
      // ログイン画面にリダイレクト
      window.location.href = '/login';
    }
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
  
  getCalorieGoal: () =>
    api.get<{
      daily_goal: number | null;
      weekly_goal: number | null;
      goal_type: string;
      message?: string;
    }>('/dashboard/calorie-goal'),
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
  
  createExercise: (name: string, muscle_group: string, exercise_type: 'strength' | 'cardio' = 'strength') =>
    api.post<Exercise>('/exercises', { name, muscle_group, exercise_type }),
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
  
  deleteWorkoutExercise: (workoutExerciseId: number) =>
    api.delete(`/workout-exercises/${workoutExerciseId}`),
  
  completeWorkout: (workoutId: number) =>
    api.patch<{ message: string; workout_id: number }>(`/workouts/${workoutId}/complete`),
};

// プロフィール管理API
export const profileAPI = {
  getProfile: () =>
    api.get<UserProfile>('/profile'),
  
  updateProfile: (profileData: ProfileUpdateRequest) =>
    api.put<UserProfile>('/profile', profileData),
};

// 体重管理API
export const bodyMetricsAPI = {
  getBodyMetrics: () =>
    api.get<BodyMetric[]>('/body-metrics'),
  
  createBodyMetric: (data: BodyMetricCreateRequest) =>
    api.post<BodyMetric>('/body-metrics', data),
  
  updateBodyMetric: (metricId: number, data: Partial<BodyMetricCreateRequest>) =>
    api.put<BodyMetric>(`/body-metrics/${metricId}`, data),
};

// 身長管理API
export const heightRecordsAPI = {
  getHeightRecords: () =>
    api.get<HeightRecord[]>('/height-records'),
  
  createHeightRecord: (data: HeightRecordCreateRequest) =>
    api.post<HeightRecord>('/height-records', data),
};

// 高度分析API
export const advancedAnalyticsAPI = {
  getAdvancedSummary: () =>
    api.get<AdvancedAnalytics>('/analytics/body/advanced-summary'),
};

// ユーザー設定API
export interface UserSettings {
  id: number;
  user_id: number;
  dashboard_config: DashboardConfig | null;
  created_at: string;
  updated_at: string;
}

export const userSettingsAPI = {
  getSettings: () =>
    api.get<UserSettings>('/settings'),
  
  updateDashboardConfig: (config: DashboardConfig) =>
    api.put<UserSettings>('/settings/dashboard', config),
};