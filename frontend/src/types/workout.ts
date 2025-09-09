export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  exercise_type: 'strength' | 'cardio';
  is_builtin: boolean;
  user_id?: number;
}

export interface WorkoutSet {
  id: number;
  set_index: number;
  // 筋力トレーニング用フィールド
  weight?: number;
  reps?: number;
  rpe?: number;
  // 有酸素運動用フィールド
  duration_seconds?: number;
  distance_km?: number;
  incline_percent?: number;
  avg_heart_rate?: number;
  // 共通フィールド
  is_warmup: boolean;
  note?: string;
}

export interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  sets: WorkoutSet[];
  order_index: number;
}

export interface Workout {
  id: number;
  date: string;
  note?: string;
  is_completed: boolean;
  completed_at?: string;
  workout_exercises: WorkoutExercise[];
}

export interface DashboardStats {
  total_workouts: number;
  this_week_workouts: number;
  total_volume: number;
  this_week_volume: number;
  this_week_calories_burned: number;
  today_calories_burned: number;
  today_total_estimated_calories: number;
  weight_change_since_last: number | null;
  latest_weight: number | null;
  user_age: number | null;
  user_gender: string | null;
}

export interface CalorieGoal {
  daily_goal: number | null;
  weekly_goal: number | null;
  goal_type: string;
  message?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'health' | 'progress';
  enabled: boolean;
  getValue: (stats: DashboardStats, calorieGoal?: CalorieGoal) => string | number | null;
  format: 'number' | 'decimal' | 'weight' | 'calories' | 'percentage';
  icon?: string;
}

export interface DashboardConfig {
  selectedWidgets: string[];
  maxWidgets: number;
}

// API用の型定義
export interface CreateWorkoutRequest {
  date: string;
  note?: string;
}

export interface CreateSetRequest {
  // 筋力トレーニング用フィールド
  weight?: number;
  reps?: number;
  rpe?: number;
  // 有酸素運動用フィールド
  duration_seconds?: number;
  distance_km?: number;
  incline_percent?: number;
  avg_heart_rate?: number;
  // 共通フィールド
  is_warmup?: boolean;
  note?: string;
}

export interface WorkoutFormData {
  date: string;
  note: string;
}

export interface SetFormData {
  // 筋力トレーニング用フィールド
  weight: string;
  reps: string;
  rpe: string;
  // 有酸素運動用フィールド
  duration_minutes: string;   // 分単位で入力
  duration_seconds: string;   // 秒単位で入力
  distance_km: string;
  incline_percent: string;
  avg_heart_rate: string;
  // 共通フィールド
  is_warmup: boolean;
  note: string;
}

// 1RM計算結果
export interface OneRepMax {
  weight: number;
  formula: string; // "Epley", "Brzycki", etc.
}