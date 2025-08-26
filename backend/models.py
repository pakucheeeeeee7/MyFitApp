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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    birth_date = Column(Date, nullable=True)  # 生年月日
    gender = Column(String, nullable=True)    # "male", "female", "other"
    
    # リレーション
    exercises = relationship("Exercise", back_populates="user")
    workouts = relationship("Workout", back_populates="user")
    body_metrics = relationship("BodyMetric", back_populates="user")
    height_records = relationship("HeightRecord", back_populates="user")

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Noneの場合は内蔵種目
    name = Column(String, nullable=False)
    muscle_group = Column(String, nullable=False)
    is_builtin = Column(Boolean, default=False)
    
    # リレーション
    user = relationship("User", back_populates="exercises")
    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")

class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    note = Column(Text)
    
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

class Set(Base):
    __tablename__ = "sets"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
    set_index = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    rpe = Column(Integer)  # Rate of Perceived Exertion (1-10)
    is_warmup = Column(Boolean, default=False)
    note = Column(Text)
    
    # リレーション
    workout_exercise = relationship("WorkoutExercise", back_populates="sets")

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