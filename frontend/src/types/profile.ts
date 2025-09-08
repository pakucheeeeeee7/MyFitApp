export interface UserProfile {
  id: number;
  email: string;
  username: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  created_at: string;
}

export interface ProfileUpdateRequest {
  username?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface BodyMetric {
  id: number;
  user_id: number;
  date: string;
  body_weight: number | null;
  body_fat_percent: number | null;
  note: string | null;
}

export interface BodyMetricCreateRequest {
  date: string;
  body_weight?: number | null;
  body_fat_percent?: number | null;
  note?: string | null;
}

export interface HeightRecord {
  id: number;
  user_id: number;
  height_cm: number;
  date: string;
  note: string | null;
}

export interface HeightRecordCreateRequest {
  height_cm: number;
  date: string;
  note?: string | null;
}

export interface AdvancedAnalytics {
  latest_weight: number | null;
  latest_height: number | null;
  latest_bmi: number | null;
  age: number | null;
  gender: string | null;
  weight_change_30days: number | null;
  bmi_change_30days: number | null;
  body_fat_trend: string;
  ideal_weight_range: {
    min: number;
    max: number;
  } | null;
  bmr: number | null;
  daily_calorie_needs: {
    sedentary: number;
    light: number;
    moderate: number;
    active: number;
    very_active: number;
  } | null;
  bmi_for_age_category: string | null;
  total_records: number;
}
