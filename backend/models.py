from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Date
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)  # ユーザーネーム
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    birth_date = Column(Date, nullable=True)  # 生年月日
    gender = Column(String, nullable=True)    # "male", "female", "other"
    
    # リレーション
    exercises = relationship("Exercise", back_populates="user")
    workouts = relationship("Workout", back_populates="user")
    body_metrics = relationship("BodyMetric", back_populates="user")
    height_records = relationship("HeightRecord", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Noneの場合は内蔵種目
    name = Column(String, nullable=False)
    muscle_group = Column(String, nullable=False)
    exercise_type = Column(String, nullable=False, default="strength")  # "strength" or "cardio"
    is_builtin = Column(Boolean, default=False)
    
    # 新しい分類・オプションフィールド
    category = Column(String, nullable=True)        # "プレス系", "フライ系", "垂直引き" など
    subcategory = Column(String, nullable=True)     # "バーベル", "ダンベル", "マシン" など
    equipment_type = Column(String, nullable=True)  # "バーベル", "ダンベル", "マシン", "自重", "ケーブル"
    target_muscle = Column(String, nullable=True)   # "大胸筋", "上腕三頭筋", "三角筋前部" など詳細な筋肉
    difficulty_level = Column(String, nullable=True) # "初級", "中級", "上級"
    
    # オプション系（JSONまたは区切り文字で複数値保存）
    angle_options = Column(String, nullable=True)    # "フラット,インクライン,デクライン"
    grip_options = Column(String, nullable=True)     # "ワイド,ナロー,リバース"
    stance_options = Column(String, nullable=True)   # "バック,フロント,ボックス"
    variation_options = Column(String, nullable=True) # その他のバリエーション
    
    # カスタム種目用METs値（内蔵種目はコードで定義）
    custom_mets_value = Column(Float, nullable=True)
    
    # メタデータ
    description = Column(Text, nullable=True)        # 種目の説明
    instructions = Column(Text, nullable=True)       # 実行方法の説明
    
    # リレーション
    user = relationship("User", back_populates="exercises")
    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")

class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    note = Column(Text)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # リレーション
    user = relationship("User", back_populates="workouts")
    workout_exercises = relationship("WorkoutExercise", back_populates="workout")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    
    # リレーション
    workout = relationship("Workout", back_populates="workout_exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")
    sets = relationship("Set", back_populates="workout_exercise")
    exercise_variant = relationship("ExerciseVariant", back_populates="workout_exercise", uselist=False)

class Set(Base):
    __tablename__ = "sets"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
    set_index = Column(Integer, nullable=False)
    
    # 筋力トレーニング用フィールド
    weight = Column(Float, nullable=True)  # 重量（kg）
    reps = Column(Integer, nullable=True)  # 回数
    rpe = Column(Integer, nullable=True)   # Rate of Perceived Exertion (1-10)
    
    # 有酸素運動用フィールド
    duration_seconds = Column(Integer, nullable=True)  # 時間（秒）
    distance_km = Column(Float, nullable=True)         # 距離（km）
    incline_percent = Column(Float, nullable=True)     # 傾斜（%）
    avg_heart_rate = Column(Integer, nullable=True)    # 平均心拍数（将来的な拡張用）
    
    # 共通フィールド
    is_warmup = Column(Boolean, default=False)
    note = Column(Text)
    
    # リレーション
    workout_exercise = relationship("WorkoutExercise", back_populates="sets")

class ExerciseVariant(Base):
    """ワークアウト実行時に選択されたバリエーション（角度、グリップ等）を記録"""
    __tablename__ = "exercise_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
    selected_angle = Column(String, nullable=True)     # "フラット", "インクライン", "デクライン"
    selected_grip = Column(String, nullable=True)      # "ワイド", "ナロー", "リバース"
    selected_stance = Column(String, nullable=True)    # "バック", "フロント", "ボックス"
    selected_variation = Column(String, nullable=True) # その他のバリエーション
    
    # リレーション
    workout_exercise = relationship("WorkoutExercise", back_populates="exercise_variant")

class BodyMetric(Base):
    __tablename__ = "body_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    body_weight = Column(Float)
    body_fat_percent = Column(Float)
    note = Column(Text)
    
    # リレーション
    user = relationship("User", back_populates="body_metrics")

class HeightRecord(Base):
    __tablename__ = "height_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    height_cm = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    note = Column(Text)
    
    # リレーション
    user = relationship("User", back_populates="height_records")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dashboard_config = Column(Text, nullable=True)  # JSON文字列として保存
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # リレーション
    user = relationship("User", back_populates="settings")