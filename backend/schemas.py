from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

# 認証関連スキーマ
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# 種目関連スキーマ
class ExerciseBase(BaseModel):
    name: str
    muscle_group: str
    exercise_type: str = "strength"  # "strength" or "cardio"

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int
    user_id: Optional[int]
    exercise_type: str
    is_builtin: bool
    
    class Config:
        from_attributes = True

# ワークアウト関連スキーマ
class WorkoutCreate(BaseModel):
    date: datetime
    note: Optional[str] = None

class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    note: Optional[str] = None
    is_completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        # 日時フィールドの処理を改善
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# セット関連スキーマ
class SetCreate(BaseModel):
    # 筋力トレーニング用フィールド
    weight: Optional[float] = None
    reps: Optional[int] = None
    rpe: Optional[int] = None
    
    # 有酸素運動用フィールド
    duration_seconds: Optional[int] = None  # 時間（秒）
    distance_km: Optional[float] = None     # 距離（km）
    incline_percent: Optional[float] = None  # 傾斜（%）
    avg_heart_rate: Optional[int] = None    # 平均心拍数
    
    # 共通フィールド
    is_warmup: bool = False
    note: Optional[str] = None

class SetUpdate(BaseModel):
    # 筋力トレーニング用フィールド
    weight: Optional[float] = None
    reps: Optional[int] = None
    rpe: Optional[int] = None
    
    # 有酸素運動用フィールド
    duration_seconds: Optional[int] = None
    distance_km: Optional[float] = None
    incline_percent: Optional[float] = None
    avg_heart_rate: Optional[int] = None
    
    # 共通フィールド
    is_warmup: Optional[bool] = None
    note: Optional[str] = None

class SetResponse(BaseModel):
    id: int
    workout_exercise_id: int
    set_index: int
    
    # 筋力トレーニング用フィールド
    weight: Optional[float]
    reps: Optional[int]
    rpe: Optional[int]
    
    # 有酸素運動用フィールド
    duration_seconds: Optional[int]
    distance_km: Optional[float]
    incline_percent: Optional[float]
    avg_heart_rate: Optional[int]
    
    # 共通フィールド
    is_warmup: bool
    note: Optional[str]
    
    class Config:
        from_attributes = True


# ワークアウト種目関連スキーマ
class WorkoutExerciseCreate(BaseModel):
    exercise_id: int
    order_index: int

class WorkoutExerciseResponse(BaseModel):
    id: int
    workout_id: int
    exercise_id: int
    order_index: int
    exercise: ExerciseResponse  # 種目情報も含める
    sets: list[SetResponse] = []  # セット情報も含める
    
    class Config:
        from_attributes = True


# 詳細なワークアウトレスポンス（種目とセット情報含む）
class WorkoutDetailResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    note: Optional[str]
    is_completed: bool
    completed_at: Optional[datetime] = None
    workout_exercises: list[WorkoutExerciseResponse]
    
    class Config:
        from_attributes = True
        # 日時フィールドの処理を改善
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }



# 身体データ関連スキーマ
class BodyMetricCreate(BaseModel):
    date: datetime
    body_weight: Optional[float] = None
    body_fat_percent: Optional[float] = None
    note: Optional[str] = None

class BodyMetricUpdate(BaseModel):
    body_weight: Optional[float] = None
    body_fat_percent: Optional[float] = None
    note: Optional[str] = None

class BodyMetricResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    body_weight: Optional[float]
    body_fat_percent: Optional[float]
    note: Optional[str]
    
    class Config:
        from_attributes = True

# 身長データ用スキーマ
class HeightRecordCreate(BaseModel):
    height_cm: float
    date: datetime
    note: Optional[str] = None

class HeightRecordResponse(BaseModel):
    id: int
    user_id: int
    height_cm: float
    date: datetime
    note: Optional[str]
    
    class Config:
        from_attributes = True

# BMI・体脂肪率分析用スキーマ
class BodyAnalysisResponse(BaseModel):
    date: datetime
    body_weight: Optional[float]
    height_cm: Optional[float]
    bmi: Optional[float]
    body_fat_percent: Optional[float]
    estimated_body_fat: Optional[float]  # 推定体脂肪率
    note: Optional[str]

class BodyAnalyticsSummaryResponse(BaseModel):
    latest_weight: Optional[float]
    latest_height: Optional[float]
    latest_bmi: Optional[float]
    weight_change_30days: Optional[float]
    bmi_change_30days: Optional[float]
    body_fat_trend: str  # "improving", "stable", "concerning"
    total_records: int
    history: list[BodyAnalysisResponse]


# ユーザープロフィール管理用スキーマ
class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None  # "male", "female", "other"

class UserProfileResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    birth_date: Optional[date]
    gender: Optional[str]
    age: Optional[int]  # 計算される年齢
    created_at: datetime
    
    class Config:
        from_attributes = True

# 高度な身体分析用スキーマ（年齢・性別考慮）
class AdvancedBodyAnalysisResponse(BaseModel):
    date: datetime
    body_weight: Optional[float]
    height_cm: Optional[float]
    bmi: Optional[float]
    body_fat_percent: Optional[float]
    estimated_body_fat: Optional[float]
    ideal_weight_range: Optional[dict]  # {"min": 60.0, "max": 70.0}
    bmr: Optional[float]  # 基礎代謝率
    note: Optional[str]

class AdvancedBodyAnalyticsSummaryResponse(BaseModel):
    # 基本データ
    latest_weight: Optional[float]
    latest_height: Optional[float]
    latest_bmi: Optional[float]
    age: Optional[int]
    gender: Optional[str]
    
    # 変化データ
    weight_change_30days: Optional[float]
    bmi_change_30days: Optional[float]
    body_fat_trend: str
    
    # 高度な分析
    ideal_weight_range: Optional[dict]
    bmr: Optional[float]  # 基礎代謝率
    daily_calorie_needs: Optional[dict]  # {"sedentary": 2000, "active": 2400}
    bmi_for_age_category: Optional[str]  # 年齢考慮のBMI判定
    
    # データ統計
    total_records: int
    history: list[AdvancedBodyAnalysisResponse]