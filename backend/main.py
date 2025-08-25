from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import models
import schemas  
from database import engine, get_db
from schemas import UserCreate, UserLogin, UserResponse, Token
from auth import verify_password, get_password_hash, create_access_token, verify_token

# データベーステーブルを作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='MyFit API',
    description='筋トレ管理アプリのAPI',
    version='1.0.0'
)

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# JWT認証スキーム
security = HTTPBearer()

# 現在のユーザーを取得する依存関数
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    email = verify_token(credentials.credentials)
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが見つかりません"
        )
    return user

@app.get("/")
async def root():
    return {"message": "MyFit API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 認証エンドポイント
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # メールアドレスの重複チェック
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
    
    # パスワードをハッシュ化
    hashed_password = get_password_hash(user_data.password)
    
    # 新しいユーザーを作成
    db_user = models.User(
        email=user_data.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # ユーザーを検索
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが間違っています"
        )
    
    # JWTトークンを作成
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user


# 種目関連エンドポイント
@app.get("/exercises", response_model=list[schemas.ExerciseResponse])
async def get_exercises(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """内蔵種目 + ユーザーの種目を取得"""
    # 内蔵種目を取得
    builtin_exercises = db.query(models.Exercise).filter(models.Exercise.is_builtin == True).all()
    
    # ユーザーの種目を取得
    user_exercises = db.query(models.Exercise).filter(
        models.Exercise.user_id == current_user.id,
        models.Exercise.is_builtin == False
    ).all()
    
    # 合わせて返却
    return builtin_exercises + user_exercises

@app.post("/exercises", response_model=schemas.ExerciseResponse)
async def create_exercise(
    exercise_data: schemas.ExerciseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザー独自の種目を作成"""
    # 同じ名前の種目が既に存在するかチェック
    existing = db.query(models.Exercise).filter(
        models.Exercise.name == exercise_data.name,
        models.Exercise.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="同じ名前の種目が既に存在します"
        )
    
    # 新しい種目を作成
    db_exercise = models.Exercise(
        name=exercise_data.name,
        muscle_group=exercise_data.muscle_group,
        user_id=current_user.id,
        is_builtin=False
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    
    return db_exercise

@app.get("/exercises/{exercise_id}", response_model=schemas.ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定の種目を取得"""
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="種目が見つかりません"
        )
    
    # 内蔵種目または自分の種目のみアクセス可能
    if not exercise.is_builtin and exercise.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この種目にはアクセスできません"
        )
    
    return exercise


# ワークアウト関連エンドポイント
@app.get("/workouts", response_model=list[schemas.WorkoutResponse])
async def get_workouts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーのワークアウト一覧を取得"""
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.date.desc()).all()
    
    return workouts

@app.post("/workouts", response_model=schemas.WorkoutResponse)
async def create_workout(
    workout_data: schemas.WorkoutCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新しいワークアウトを作成"""
    db_workout = models.Workout(
        user_id=current_user.id,
        date=workout_data.date,
        note=workout_data.note
    )
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    
    return db_workout

@app.get("/workouts/{workout_id}", response_model=schemas.WorkoutResponse)
async def get_workout(
    workout_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定のワークアウトを取得"""
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ワークアウトが見つかりません"
        )
    
    return workout

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)