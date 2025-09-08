from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import Date
from sqlalchemy.sql import func
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
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # 具体的なURLを指定
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ヘルスチェックエンドポイント
@app.get("/test")
async def health_check():
    """APIサーバーの稼働状況を確認"""
    return {"message": "Backend connection successful!", "status": "OK"}

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
@app.post("/auth/signup", response_model=dict)  # ← 型を変更
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
    
    # ← JWTトークンを作成して返す
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "created_at": db_user.created_at.isoformat()
        },
        "access_token": access_token,
        "token_type": "bearer",
        "message": "アカウントが作成されました"
    }

@app.post("/auth/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # ユーザー認証
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません"
        )
    
    # JWTトークンを作成して返す（サインアップと同じ形式）
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at.isoformat()
        },
        "access_token": access_token,
        "token_type": "bearer",
        "message": "ログインしました"
    }


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
    from_date: str = None,
    to_date: str = None,
    include_completed: bool = True,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーのワークアウト一覧を取得"""
    query = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    )
    
    # 完了状態でフィルタ
    if not include_completed:
        query = query.filter(models.Workout.is_completed == False)
    
    # 日付範囲でフィルタ
    if from_date:
        query = query.filter(models.Workout.date >= from_date)
    if to_date:
        query = query.filter(models.Workout.date <= to_date + " 23:59:59")
    
    workouts = query.order_by(models.Workout.date.desc()).all()
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

# 最近のワークアウト取得エンドポイント（{workout_id}の前に配置）
@app.get("/workouts/recent", response_model=list[schemas.WorkoutDetailResponse])
async def get_recent_workouts(
    limit: int = 5,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """最近のワークアウトを取得（種目情報含む）"""
    try:
        from sqlalchemy.orm import joinedload
        
        # 完了済みのワークアウトのみを取得（workout_exercisesもjoinedloadで取得）
        workouts = db.query(models.Workout).options(
            joinedload(models.Workout.workout_exercises).joinedload(models.WorkoutExercise.exercise),
            joinedload(models.Workout.workout_exercises).joinedload(models.WorkoutExercise.sets)
        ).filter(
            models.Workout.user_id == current_user.id,
            models.Workout.is_completed == True
        ).order_by(models.Workout.date.desc()).limit(limit).all()
        
        return workouts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="最近のワークアウト取得に失敗しました"
        )

@app.get("/workouts/{workout_id}", response_model=schemas.WorkoutDetailResponse)
async def get_workout(
    workout_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定のワークアウトを取得（種目情報含む）"""
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

# ワークアウト種目関連エンドポイント
@app.post("/workouts/{workout_id}/exercises", response_model=schemas.WorkoutExerciseResponse)
async def add_exercise_to_workout(
    workout_id: int,
    exercise_data: schemas.WorkoutExerciseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ワークアウトに種目を追加"""
    # ワークアウトの所有者確認
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ワークアウトが見つかりません"
        )
    
    # 種目の存在確認
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_data.exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="種目が見つかりません"
        )
    
    # 種目のアクセス権限確認（内蔵種目または自分の種目）
    if not exercise.is_builtin and exercise.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この種目にはアクセスできません"
        )
    
    # ワークアウト種目を作成
    db_workout_exercise = models.WorkoutExercise(
        workout_id=workout_id,
        exercise_id=exercise_data.exercise_id,
        order_index=exercise_data.order_index
    )
    db.add(db_workout_exercise)
    db.commit()
    db.refresh(db_workout_exercise)
    
    return db_workout_exercise

@app.get("/workouts/{workout_id}/exercises", response_model=list[schemas.WorkoutExerciseResponse])
async def get_workout_exercises(
    workout_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ワークアウトの種目一覧を取得"""
    # ワークアウトの所有者確認
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ワークアウトが見つかりません"
        )
    
    # ワークアウト種目を取得（順番順）
    workout_exercises = db.query(models.WorkoutExercise).filter(
        models.WorkoutExercise.workout_id == workout_id
    ).order_by(models.WorkoutExercise.order_index).all()
    
    return workout_exercises

# セット記録関連エンドポイント
@app.post("/workout-exercises/{workout_exercise_id}/sets", response_model=schemas.SetResponse)
async def add_set(
    workout_exercise_id: int,
    set_data: schemas.SetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """セットを追加"""
    # ワークアウト種目の確認と所有者チェック
    workout_exercise = db.query(models.WorkoutExercise).join(models.Workout).filter(
        models.WorkoutExercise.id == workout_exercise_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ワークアウト種目が見つかりません"
        )
    
    # 現在のセット数を取得（set_indexを決定）
    current_set_count = db.query(models.Set).filter(
        models.Set.workout_exercise_id == workout_exercise_id
    ).count()
    
    # 新しいセットを作成
    db_set = models.Set(
        workout_exercise_id=workout_exercise_id,
        set_index=current_set_count + 1,
        weight=set_data.weight,
        reps=set_data.reps,
        rpe=set_data.rpe,
        is_warmup=set_data.is_warmup,
        note=set_data.note
    )
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    
    return db_set

@app.get("/workout-exercises/{workout_exercise_id}/sets", response_model=list[schemas.SetResponse])
async def get_sets(
    workout_exercise_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ワークアウト種目のセット一覧を取得"""
    # ワークアウト種目の確認と所有者チェック
    workout_exercise = db.query(models.WorkoutExercise).join(models.Workout).filter(
        models.WorkoutExercise.id == workout_exercise_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ワークアウト種目が見つかりません"
        )
    
    # セット一覧を取得（セット順）
    sets = db.query(models.Set).filter(
        models.Set.workout_exercise_id == workout_exercise_id
    ).order_by(models.Set.set_index).all()
    
    return sets


# 分析機能関連エンドポイント
@app.get("/analytics/exercise/{exercise_id}/1rm")
async def get_exercise_1rm_history(
    exercise_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """種目の推定1RM履歴を取得"""
    # 種目のアクセス権限確認
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="種目が見つかりません")
    
    if not exercise.is_builtin and exercise.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="この種目にはアクセスできません")
    
    # その種目のセットデータを取得（ウォームアップ除く）
    sets = db.query(models.Set).join(models.WorkoutExercise).join(models.Workout).filter(
        models.WorkoutExercise.exercise_id == exercise_id,
        models.Workout.user_id == current_user.id,
        models.Set.is_warmup == False
    ).order_by(models.Workout.date.desc()).all()
    
    # 推定1RM計算（Epley公式: 1RM = weight * (1 + reps/30)）
    rm_history = []
    for set_data in sets:
        estimated_1rm = set_data.weight * (1 + set_data.reps / 30)
        rm_history.append({
            "date": set_data.workout_exercise.workout.date,
            "weight": set_data.weight,
            "reps": set_data.reps,
            "estimated_1rm": round(estimated_1rm, 1),
            "rpe": set_data.rpe,
            "workout_id": set_data.workout_exercise.workout_id
        })
    
    return {
        "exercise_name": exercise.name,
        "muscle_group": exercise.muscle_group,
        "max_estimated_1rm": max([item["estimated_1rm"] for item in rm_history]) if rm_history else 0,
        "history": rm_history[:20]  # 最新20件
    }

@app.get("/analytics/workout/{workout_id}/volume")
async def get_workout_volume(
    workout_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ワークアウトのトレーニングボリューム分析"""
    # ワークアウトの所有者確認
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="ワークアウトが見つかりません")
    
    # ワークアウトの全セットを取得
    sets = db.query(models.Set).join(models.WorkoutExercise).filter(
        models.WorkoutExercise.workout_id == workout_id,
        models.Set.is_warmup == False  # ウォームアップは除く
    ).all()
    
    # 種目別ボリューム計算
    exercise_volumes = {}
    total_volume = 0
    total_sets = 0
    
    for set_data in sets:
        exercise_name = set_data.workout_exercise.exercise.name
        volume = set_data.weight * set_data.reps
        
        if exercise_name not in exercise_volumes:
            exercise_volumes[exercise_name] = {
                "exercise_name": exercise_name,
                "muscle_group": set_data.workout_exercise.exercise.muscle_group,
                "sets": 0,
                "total_volume": 0,
                "avg_weight": 0,
                "total_reps": 0
            }
        
        exercise_volumes[exercise_name]["sets"] += 1
        exercise_volumes[exercise_name]["total_volume"] += volume
        exercise_volumes[exercise_name]["total_reps"] += set_data.reps
        
        total_volume += volume
        total_sets += 1
    
    # 平均重量計算
    for exercise_name in exercise_volumes:
        total_weight = sum(
            set_data.weight for set_data in sets 
            if set_data.workout_exercise.exercise.name == exercise_name
        )
        exercise_volumes[exercise_name]["avg_weight"] = round(
            total_weight / exercise_volumes[exercise_name]["sets"], 1
        )
    
    return {
        "workout_date": workout.date,
        "total_volume": round(total_volume, 1),
        "total_sets": total_sets,
        "exercise_breakdown": list(exercise_volumes.values())
    }

@app.get("/analytics/user/summary")
async def get_user_analytics_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーの総合分析データ"""
    # 総ワークアウト数
    total_workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).count()
    
    # 総セット数（ウォームアップ除く）
    total_sets = db.query(models.Set).join(models.WorkoutExercise).join(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Set.is_warmup == False
    ).count()
    
    # 総ボリューム
    sets = db.query(models.Set).join(models.WorkoutExercise).join(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Set.is_warmup == False
    ).all()
    
    total_volume = sum(set_data.weight * set_data.reps for set_data in sets)
    
    # 最新ワークアウト
    latest_workout = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.date.desc()).first()
    
    return {
        "total_workouts": total_workouts,
        "total_sets": total_sets,
        "total_volume": round(total_volume, 1),
        "latest_workout_date": latest_workout.date if latest_workout else None,
        "user_since": current_user.created_at
    }


# 身体データ関連エンドポイント
@app.get("/body-metrics", response_model=list[schemas.BodyMetricResponse])
async def get_body_metrics(
    limit: int = 30,  # 最新30件
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """体重・体脂肪率記録の一覧取得"""
    metrics = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id
    ).order_by(models.BodyMetric.date.desc()).limit(limit).all()
    
    return metrics

@app.post("/body-metrics", response_model=schemas.BodyMetricResponse)
async def create_body_metric(
    metric_data: schemas.BodyMetricCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """体重・体脂肪率記録の作成"""
    # 同じ日の記録があるかチェック
    existing = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id,
        models.BodyMetric.date.cast(Date) == metric_data.date.date()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="同じ日の記録が既に存在します。更新してください。"
        )
    
    db_metric = models.BodyMetric(
        user_id=current_user.id,
        date=metric_data.date,
        body_weight=metric_data.body_weight,
        body_fat_percent=metric_data.body_fat_percent,
        note=metric_data.note
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    
    return db_metric

@app.put("/body-metrics/{metric_id}", response_model=schemas.BodyMetricResponse)
async def update_body_metric(
    metric_id: int,
    metric_data: schemas.BodyMetricUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """体重・体脂肪率記録の更新"""
    metric = db.query(models.BodyMetric).filter(
        models.BodyMetric.id == metric_id,
        models.BodyMetric.user_id == current_user.id
    ).first()
    
    if not metric:
        raise HTTPException(status_code=404, detail="記録が見つかりません")
    
    # 更新
    if metric_data.body_weight is not None:
        metric.body_weight = metric_data.body_weight
    if metric_data.body_fat_percent is not None:
        metric.body_fat_percent = metric_data.body_fat_percent
    if metric_data.note is not None:
        metric.note = metric_data.note
    
    db.commit()
    db.refresh(metric)
    return metric

# 身長記録関連エンドポイント
@app.get("/height-records", response_model=list[schemas.HeightRecordResponse])
async def get_height_records(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """身長記録の一覧取得"""
    records = db.query(models.HeightRecord).filter(
        models.HeightRecord.user_id == current_user.id
    ).order_by(models.HeightRecord.date.desc()).all()
    
    return records

@app.post("/height-records", response_model=schemas.HeightRecordResponse)
async def create_height_record(
    height_data: schemas.HeightRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """身長記録の作成"""
    db_height = models.HeightRecord(
        user_id=current_user.id,
        height_cm=height_data.height_cm,
        date=height_data.date,
        note=height_data.note
    )
    db.add(db_height)
    db.commit()
    db.refresh(db_height)
    
    return db_height

# 身体データ分析エンドポイント
@app.get("/analytics/body/summary", response_model=schemas.BodyAnalyticsSummaryResponse)
async def get_body_analytics_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """身体データの分析サマリー"""
    from datetime import datetime, timedelta
    
    # 最新の身長を取得
    latest_height_record = db.query(models.HeightRecord).filter(
        models.HeightRecord.user_id == current_user.id
    ).order_by(models.HeightRecord.date.desc()).first()
    
    latest_height = latest_height_record.height_cm if latest_height_record else None
    
    # 最新30日間の体重データを取得（体重がNoneでないもののみ）
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_metrics = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id,
        models.BodyMetric.date >= thirty_days_ago,
        models.BodyMetric.body_weight.isnot(None)  # ← この条件を追加
    ).order_by(models.BodyMetric.date.desc()).all()
    
    # 全体の記録数
    total_records = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id
    ).count()
    
    # 分析データを計算
    latest_weight = None
    latest_bmi = None
    weight_change_30days = None
    bmi_change_30days = None
    body_fat_trend = "stable"
    
    if recent_metrics:
        latest_weight = recent_metrics[0].body_weight  # 確実にNoneでない値
        
        # BMI計算
        if latest_weight and latest_height:
            latest_bmi = round(latest_weight / ((latest_height / 100) ** 2), 1)
        
        # 30日前との比較
        if len(recent_metrics) > 1:
            oldest_recent = recent_metrics[-1]
            weight_change_30days = round(latest_weight - oldest_recent.body_weight, 1)
            
            if latest_height and latest_bmi:
                old_bmi = oldest_recent.body_weight / ((latest_height / 100) ** 2)
                bmi_change_30days = round(latest_bmi - old_bmi, 1)
        
        # 体脂肪率トレンド分析（30日間の全記録から）
        all_recent_metrics = db.query(models.BodyMetric).filter(
            models.BodyMetric.user_id == current_user.id,
            models.BodyMetric.date >= thirty_days_ago,
            models.BodyMetric.body_fat_percent.isnot(None)
        ).order_by(models.BodyMetric.date.desc()).all()
        
        body_fat_values = [m.body_fat_percent for m in all_recent_metrics]
        if len(body_fat_values) >= 3:
            recent_avg = sum(body_fat_values[:3]) / 3
            older_avg = sum(body_fat_values[-3:]) / 3
            diff = recent_avg - older_avg
            if diff < -1:
                body_fat_trend = "improving"
            elif diff > 1:
                body_fat_trend = "concerning"
    
    # 履歴データを作成（体重データがあるもののみ）
    history = []
    for metric in recent_metrics:
        bmi = None
        estimated_body_fat = None
        
        if metric.body_weight and latest_height:
            bmi = round(metric.body_weight / ((latest_height / 100) ** 2), 1)
            
            # 推定体脂肪率計算
            if bmi:
                estimated_body_fat = round(1.39 * bmi + 0.16 * 25 - 10.34, 1)
                estimated_body_fat = max(5, min(50, estimated_body_fat))
        
        history.append(schemas.BodyAnalysisResponse(
            date=metric.date,
            body_weight=metric.body_weight,
            height_cm=latest_height,
            bmi=bmi,
            body_fat_percent=metric.body_fat_percent,
            estimated_body_fat=estimated_body_fat,
            note=metric.note
        ))
    
    return schemas.BodyAnalyticsSummaryResponse(
        latest_weight=latest_weight,
        latest_height=latest_height,
        latest_bmi=latest_bmi,
        weight_change_30days=weight_change_30days,
        bmi_change_30days=bmi_change_30days,
        body_fat_trend=body_fat_trend,
        total_records=total_records,
        history=history
    )

@app.get("/analytics/body/bmi-history")
async def get_bmi_history(
    days: int = 90,  # デフォルト90日
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """BMI履歴を取得"""
    from datetime import datetime, timedelta
    
    # 最新の身長を取得
    latest_height_record = db.query(models.HeightRecord).filter(
        models.HeightRecord.user_id == current_user.id
    ).order_by(models.HeightRecord.date.desc()).first()
    
    if not latest_height_record:
        raise HTTPException(status_code=400, detail="身長の記録が必要です")
    
    height_cm = latest_height_record.height_cm
    
    # 指定期間の体重データを取得
    start_date = datetime.now() - timedelta(days=days)
    metrics = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id,
        models.BodyMetric.date >= start_date,
        models.BodyMetric.body_weight.isnot(None)
    ).order_by(models.BodyMetric.date.desc()).all()
    
    # BMI計算
    bmi_history = []
    for metric in metrics:
        bmi = round(metric.body_weight / ((height_cm / 100) ** 2), 1)
        bmi_category = ""
        
        if bmi < 18.5:
            bmi_category = "低体重"
        elif bmi < 25:
            bmi_category = "標準"
        elif bmi < 30:
            bmi_category = "過体重"
        else:
            bmi_category = "肥満"
        
        bmi_history.append({
            "date": metric.date,
            "weight": metric.body_weight,
            "bmi": bmi,
            "bmi_category": bmi_category,
            "note": metric.note
        })
    
    return {
        "height_cm": height_cm,
        "period_days": days,
        "total_records": len(bmi_history),
        "latest_bmi": bmi_history[0]["bmi"] if bmi_history else None,
        "history": bmi_history
    }

# ユーザープロフィール関連エンドポイント
@app.get("/profile", response_model=schemas.UserProfileResponse)
async def get_user_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザープロフィール取得"""
    from datetime import date
    
    # 年齢計算
    age = None
    if current_user.birth_date:
        today = date.today()
        age = today.year - current_user.birth_date.year
        if today.month < current_user.birth_date.month or \
           (today.month == current_user.birth_date.month and today.day < current_user.birth_date.day):
            age -= 1
    
    return schemas.UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        birth_date=current_user.birth_date,
        gender=current_user.gender,
        age=age,
        created_at=current_user.created_at
    )

@app.put("/profile", response_model=schemas.UserProfileResponse)
async def update_user_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザープロフィール更新"""
    from datetime import date
    
    # ユーザーネームの検証
    if profile_data.username is not None:
        if profile_data.username.strip() == "":
            # 空文字の場合はNoneに設定（ユーザーネーム削除）
            current_user.username = None
        else:
            # ユーザーネームの重複チェック
            existing_user = db.query(models.User).filter(
                models.User.username == profile_data.username,
                models.User.id != current_user.id
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="このユーザーネームは既に使用されています"
                )
            
            # ユーザーネームの長さ制限（3-20文字）
            if len(profile_data.username) < 3 or len(profile_data.username) > 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ユーザーネームは3文字以上20文字以下で入力してください"
                )
            
            current_user.username = profile_data.username
    
    # 性別の検証
    if profile_data.gender and profile_data.gender not in ["male", "female", "other"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="性別は male, female, other のいずれかを指定してください"
        )
    
    # 生年月日の検証
    if profile_data.birth_date:
        today = date.today()
        if profile_data.birth_date > today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="生年月日は過去の日付を指定してください"
            )
        
        # 年齢制限（5歳〜120歳）
        age = today.year - profile_data.birth_date.year
        if age < 5 or age > 120:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="年齢は5歳から120歳の間で入力してください"
            )
    
    # 更新
    if profile_data.birth_date is not None:
        current_user.birth_date = profile_data.birth_date
    if profile_data.gender is not None:
        current_user.gender = profile_data.gender
    
    db.commit()
    db.refresh(current_user)
    
    # 年齢計算
    age = None
    if current_user.birth_date:
        today = date.today()
        age = today.year - current_user.birth_date.year
        if today.month < current_user.birth_date.month or \
           (today.month == current_user.birth_date.month and today.day < current_user.birth_date.day):
            age -= 1
    
    return schemas.UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        birth_date=current_user.birth_date,
        gender=current_user.gender,
        age=age,
        created_at=current_user.created_at
    )

# 高度な身体データ分析エンドポイント（年齢・性別考慮）
@app.get("/analytics/body/advanced-summary", response_model=schemas.AdvancedBodyAnalyticsSummaryResponse)
async def get_advanced_body_analytics_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """年齢・性別を考慮した高度な身体データ分析"""
    from datetime import datetime, timedelta, date
    
    # ユーザーの年齢計算
    age = None
    if current_user.birth_date:
        today = date.today()
        age = today.year - current_user.birth_date.year
        if today.month < current_user.birth_date.month or \
           (today.month == current_user.birth_date.month and today.day < current_user.birth_date.day):
            age -= 1
    
    # 最新の身長を取得
    latest_height_record = db.query(models.HeightRecord).filter(
        models.HeightRecord.user_id == current_user.id
    ).order_by(models.HeightRecord.date.desc()).first()
    
    latest_height = latest_height_record.height_cm if latest_height_record else None
    
    # 最新30日間の体重データを取得
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_metrics = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id,
        models.BodyMetric.date >= thirty_days_ago,
        models.BodyMetric.body_weight.isnot(None)
    ).order_by(models.BodyMetric.date.desc()).all()
    
    # 基本分析データ
    latest_weight = recent_metrics[0].body_weight if recent_metrics else None
    latest_bmi = None
    if latest_weight and latest_height:
        latest_bmi = round(latest_weight / ((latest_height / 100) ** 2), 1)
    
    # 変化データ
    weight_change_30days = None
    bmi_change_30days = None
    if len(recent_metrics) > 1:
        oldest_recent = recent_metrics[-1]
        if latest_weight:
            weight_change_30days = round(latest_weight - oldest_recent.body_weight, 1)
        if latest_bmi and latest_height:
            old_bmi = oldest_recent.body_weight / ((latest_height / 100) ** 2)
            bmi_change_30days = round(latest_bmi - old_bmi, 1)
    
    # 理想体重範囲計算（BMI 18.5-24.9）
    ideal_weight_range = None
    if latest_height:
        height_m = latest_height / 100
        ideal_min = round(18.5 * (height_m ** 2), 1)
        ideal_max = round(24.9 * (height_m ** 2), 1)
        ideal_weight_range = {"min": ideal_min, "max": ideal_max}
    
    # 基礎代謝率計算（Mifflin-St Jeor式）
    bmr = None
    if latest_weight and latest_height and age and current_user.gender:
        if current_user.gender == "male":
            bmr = round(10 * latest_weight + 6.25 * latest_height - 5 * age + 5, 0)
        elif current_user.gender == "female":
            bmr = round(10 * latest_weight + 6.25 * latest_height - 5 * age - 161, 0)
    
    # 1日の必要カロリー計算
    daily_calorie_needs = None
    if bmr:
        daily_calorie_needs = {
            "sedentary": round(bmr * 1.2, 0),      # 座り仕事
            "light": round(bmr * 1.375, 0),       # 軽い運動
            "moderate": round(bmr * 1.55, 0),     # 中程度の運動
            "active": round(bmr * 1.725, 0),      # 積極的な運動
            "very_active": round(bmr * 1.9, 0)    # 非常に活発
        }
    
    # 年齢考慮のBMI判定
    bmi_for_age_category = "不明"
    if latest_bmi and age:
        if age >= 65:
            # 高齢者は少し高めが健康的
            if latest_bmi < 20:
                bmi_for_age_category = "低体重（注意）"
            elif latest_bmi < 27:
                bmi_for_age_category = "標準"
            else:
                bmi_for_age_category = "過体重"
        else:
            # 一般成人
            if latest_bmi < 18.5:
                bmi_for_age_category = "低体重"
            elif latest_bmi < 25:
                bmi_for_age_category = "標準"
            elif latest_bmi < 30:
                bmi_for_age_category = "過体重"
            else:
                bmi_for_age_category = "肥満"
    
    # 体脂肪率トレンド
    body_fat_trend = "stable"
    all_recent_metrics = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id,
        models.BodyMetric.date >= thirty_days_ago,
        models.BodyMetric.body_fat_percent.isnot(None)
    ).order_by(models.BodyMetric.date.desc()).all()
    
    body_fat_values = [m.body_fat_percent for m in all_recent_metrics]
    if len(body_fat_values) >= 3:
        recent_avg = sum(body_fat_values[:3]) / 3
        older_avg = sum(body_fat_values[-3:]) / 3
        diff = recent_avg - older_avg
        if diff < -1:
            body_fat_trend = "improving"
        elif diff > 1:
            body_fat_trend = "concerning"
    
    # 履歴データ作成
    history = []
    for metric in recent_metrics:
        bmi = None
        estimated_body_fat = None
        
        if metric.body_weight and latest_height:
            bmi = round(metric.body_weight / ((latest_height / 100) ** 2), 1)
            
            # 性別・年齢考慮の推定体脂肪率
            if bmi and age and current_user.gender:
                if current_user.gender == "male":
                    estimated_body_fat = round(1.20 * bmi + 0.23 * age - 16.2, 1)
                elif current_user.gender == "female":
                    estimated_body_fat = round(1.20 * bmi + 0.23 * age - 5.4, 1)
                
                if estimated_body_fat:
                    estimated_body_fat = max(5, min(50, estimated_body_fat))
        
        history.append(schemas.AdvancedBodyAnalysisResponse(
            date=metric.date,
            body_weight=metric.body_weight,
            height_cm=latest_height,
            bmi=bmi,
            body_fat_percent=metric.body_fat_percent,
            estimated_body_fat=estimated_body_fat,
            ideal_weight_range=ideal_weight_range,
            bmr=bmr,
            note=metric.note
        ))
    
    total_records = db.query(models.BodyMetric).filter(
        models.BodyMetric.user_id == current_user.id
    ).count()
    
    return schemas.AdvancedBodyAnalyticsSummaryResponse(
        latest_weight=latest_weight,
        latest_height=latest_height,
        latest_bmi=latest_bmi,
        age=age,
        gender=current_user.gender,
        weight_change_30days=weight_change_30days,
        bmi_change_30days=bmi_change_30days,
        body_fat_trend=body_fat_trend,
        ideal_weight_range=ideal_weight_range,
        bmr=bmr,
        daily_calorie_needs=daily_calorie_needs,
        bmi_for_age_category=bmi_for_age_category,
        total_records=total_records,
        history=history
    )

# 既存のコードの最後に以下を追加

# ダッシュボード関連エンドポイント
@app.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ダッシュボード統計データを取得"""
    from datetime import datetime, timedelta
    
    # 今週の開始日を計算（月曜日）
    today = datetime.now().date()
    days_since_monday = today.weekday()
    week_start = today - timedelta(days=days_since_monday)
    
    # 総ワークアウト数（完了済みのみ）
    total_workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.is_completed == True
    ).count()
    
    # 今週のワークアウト数（完了済みのみ）
    this_week_workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.date >= week_start,
        models.Workout.is_completed == True
    ).count()
    
    # 総ボリューム計算（ウォームアップ除く）
    total_sets = db.query(models.Set).join(models.WorkoutExercise).join(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Set.is_warmup == False
    ).all()
    
    total_volume = sum(set_data.weight * set_data.reps for set_data in total_sets)
    
    # 今週のボリューム計算
    this_week_sets = db.query(models.Set).join(models.WorkoutExercise).join(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.date >= week_start,
        models.Set.is_warmup == False
    ).all()
    
    this_week_volume = sum(set_data.weight * set_data.reps for set_data in this_week_sets)
    
    return {
        "total_workouts": total_workouts,
        "this_week_workouts": this_week_workouts,
        "total_volume": round(total_volume, 1),
        "this_week_volume": round(this_week_volume, 1)
    }

# filepath: [main.py](http://_vscodecontentref_/1)


# /auth/me エンドポイントを追加

# /auth/me エンドポイントを追加
@app.get("/auth/me")
async def get_current_user_info(
    current_user: models.User = Depends(get_current_user)
):
    """現在のユーザー情報を取得"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat()
    }

@app.post("/auth/logout")
async def logout():
    """ログアウト（クライアント側でトークンを削除）"""
    return {"message": "ログアウトしました"}

@app.patch("/workouts/{workout_id}/complete")
async def complete_workout(
    workout_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="ワークアウトが見つかりません")
    
    if workout.is_completed:
        raise HTTPException(status_code=400, detail="既に完了済みのワークアウトです")
    
    # ワークアウトを完了状態に更新
    workout.is_completed = True
    workout.completed_at = func.now()
    db.commit()
    db.refresh(workout)
    
    return {"message": "ワークアウトが完了しました", "workout_id": workout_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)