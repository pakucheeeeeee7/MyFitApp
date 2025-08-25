from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int
    user_id: Optional[int]
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
    note: Optional[str]
    
    class Config:
        from_attributes = True

# セット関連スキーマ
class SetCreate(BaseModel):
    weight: float
    reps: int
    rpe: Optional[int] = None
    is_warmup: bool = False
    note: Optional[str] = None

class SetResponse(SetCreate):
    id: int
    set_index: int
    
    class Config:
        from_attributes = True