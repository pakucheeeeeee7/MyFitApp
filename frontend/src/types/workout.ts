export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_builtin: boolean;
  user_id?: number;
}

export interface WorkoutSet {
  id: number;
  set_index: number;
  weight: number;
  reps: number;
  rpe?: number;
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
}

// API用の型定義
export interface CreateWorkoutRequest {
  date: string;
  note?: string;
}

export interface CreateSetRequest {
  weight: number;
  reps: number;
  rpe?: number;
  is_warmup?: boolean;
  note?: string;
}

export interface WorkoutFormData {
  date: string;
  note: string;
}

export interface SetFormData {
  weight: string;
  reps: string;
  rpe: string;
  is_warmup: boolean;
  note: string;
}

// 1RM計算結果
export interface OneRepMax {
  weight: number;
  formula: string; // "Epley", "Brzycki", etc.
}