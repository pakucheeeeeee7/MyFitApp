# MyFitApp 開発ルール・設定ガイド

## 📁 プロジェクト構成

```
MyFitApp/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/ui/       # shadcn/ui コンポーネント
│   │   ├── pages/              # ページコンポーネント
│   │   │   ├── Login.tsx       # 🆕 ログイン・サインアップページ
│   │   │   ├── Dashboard.tsx   # ダッシュボード（認証後）
│   │   │   └── Workout.tsx     # ワークアウトページ
│   │   ├── hooks/              # 🆕 カスタムフック
│   │   │   ├── useAuth.ts      # 認証ロジック（ログイン・サインアップ・ログアウト）
│   │   │   └── useDashboard.ts # ダッシュボードデータ取得
│   │   ├── stores/             # 🆕 状態管理
│   │   │   └── authStore.ts    # Zustand認証状態管理
│   │   ├── lib/                # 🆕 ユーティリティ
│   │   │   ├── api.ts          # API関数・Axiosインターセプター
│   │   │   ├── schemas.ts      # Zodバリデーションスキーマ
│   │   │   └── utils.ts        # 共通ユーティリティ
│   │   ├── types/              # 🆕 型定義
│   │   │   ├── auth.ts         # 認証関連型（User, AuthResponse等）
│   │   │   └── workout.ts      # ワークアウト関連型
│   │   ├── App.tsx             # 🆕 認証ベースルーティング設定
│   │   ├── main.tsx            # React Query Provider設定
│   │   └── index.css           # Tailwind CSS設定
│   ├── vite.config.ts          # Vite設定（path alias含む）
│   ├── components.json         # shadcn/ui設定
│   ├── tailwind.config.js      # Tailwind CSS設定
│   └── package.json
├── backend/                     # FastAPI + Python
│   ├── myfit-backend-env/       # Python仮想環境
│   ├── .python-version         # pyenv設定（Python 3.11.0）
│   ├── models.py               # SQLAlchemyモデル（DB構造定義）
│   ├── schemas.py              # Pydanticスキーマ（API入出力型）
│   ├── database.py             # DB接続設定
│   ├── auth.py                 # 認証機能（JWT、パスワードハッシュ）
│   ├── main.py                 # APIエンドポイント定義
│   ├── seed_data.py            # 初期データ投入スクリプト
│   ├── requirements.txt        # Python依存関係
│   └── myfit.db               # SQLiteデータベースファイル
├── docs/                       # ドキュメント
│   └── development-rules.md    # 開発ルール（このファイル）
├── progress/                   # 開発進捗記録
│   ├── progress-day1.md        # Day1: フロントエンド環境構築
│   ├── progress-day2.md        # Day2: バックエンド・認証・API実装
│   ├── progress-day3.md        # Day3: 個人化分析機能・年齢性別対応
│   └── progress-day4.md        # 🆕 Day4: フロントエンド認証機能完全実装
└── workout_app_requirements.md # 要件定義書
```

## 🛠️ 環境構築ルール

### Python環境（pyenv + venv方式）
```bash
# 1. 特定Pythonバージョンを設定（学習目的でバージョン固定）
cd backend
pyenv local 3.11.0              # FastAPI推奨バージョン

# 2. プロジェクト専用仮想環境作成（明確な命名）
python -m venv myfit-backend-env # プロジェクト名含む命名

# 3. 仮想環境アクティベート（開発時は常時）
source backend/myfit-backend-env/bin/activate
# 成功確認：プロンプトに (myfit-backend-env) 表示

# 4. 依存関係管理
pip install -r requirements.txt  # 依存関係インストール
pip freeze > requirements.txt    # 新規パッケージ追加時
```

**重要な理由:**
- **pyenv**: Pythonバージョン管理（3.11.0で固定）
- **venv**: パッケージ分離（他プロジェクトとの競合回避）
- **明確な命名**: 複数プロジェクトでの混同防止

### Node.js環境
```bash
# 1. フロントエンド依存関係インストール
cd frontend
npm install

# 2. 開発サーバー起動（ホットリロード対応）
npm run dev  # localhost:5173

# 3. 新規パッケージ追加手順
npm install {package-name}       # 追加
npm install -D {package-name}    # 開発時のみ
```

### 開発サーバー起動手順
```bash
# ターミナル1: バックエンドAPI
cd backend
source myfit-backend-env/bin/activate
python main.py                  # localhost:8000

# ターミナル2: フロントエンド
cd frontend  
npm run dev                     # localhost:5173

# 確認URL
# - API: http://localhost:8000/docs （Swagger UI）
# - App: http://localhost:5173 （React App）
```

## � ファイル別詳細解説

### **backend/models.py** - データベース構造定義
```python
# SQLAlchemyモデル = データベーステーブルをPythonクラスで定義
class User(Base):               # users テーブル
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password_hash = Column(String)  # 平文パスワード保存禁止
    created_at = Column(DateTime)
    birth_date = Column(Date, nullable=True)      # 🆕 生年月日
    gender = Column(String, nullable=True)        # 🆕 性別（male/female/other）
    
    # リレーション（関連性）設定
    exercises = relationship("Exercise", back_populates="user")
    workouts = relationship("Workout", back_populates="user")
    body_metrics = relationship("BodyMetric", back_populates="user")
    height_records = relationship("HeightRecord", back_populates="user")
```

**設計思想:**
- **正規化**: データ重複を避ける適切なテーブル分割
- **リレーション**: `relationship()` で関連データを簡単取得
- **制約**: `unique=True`, `nullable=False` でデータ整合性確保
- **個人化**: 年齢・性別による科学的分析対応

### **backend/schemas.py** - API入出力型定義
```python
# Pydanticスキーマ = API通信データの型とバリデーション
class UserCreate(BaseModel):    # リクエスト用（クライアント→サーバー）
    email: EmailStr             # メール形式自動検証
    password: str
    
class UserResponse(BaseModel):  # レスポンス用（サーバー→クライアント）
    id: int
    email: str
    created_at: datetime
    birth_date: Optional[date] = None     # 🆕 生年月日
    gender: Optional[str] = None          # 🆕 性別
    # password_hash は含めない（セキュリティ）
    
    class Config:
        from_attributes = True  # SQLAlchemy → Pydantic 自動変換

# 🆕 個人化機能用スキーマ
class UserProfileUpdate(BaseModel):
    birth_date: Optional[date] = None
    gender: Optional[str] = None          # "male", "female", "other"

class UserProfileResponse(BaseModel):
    id: int
    email: str
    birth_date: Optional[date]
    gender: Optional[str]
    age: Optional[int]                    # 計算される年齢
    created_at: datetime

# 🆕 高度な身体分析用スキーマ
class AdvancedBodyAnalyticsSummaryResponse(BaseModel):
    latest_weight: Optional[float]
    latest_height: Optional[float]
    latest_bmi: Optional[float]
    age: Optional[int]
    gender: Optional[str]
    bmr: Optional[float]                  # 基礎代謝率
    daily_calorie_needs: Optional[dict]   # 必要カロリー（活動レベル別）
    ideal_weight_range: Optional[dict]    # 理想体重範囲
    bmi_for_age_category: Optional[str]   # 年齢考慮BMI判定
```

**命名ルール詳細:**
- `{Model}Create`: 作成用データ（POST）
- `{Model}Response`: 出力用データ（GET）
- `{Model}Update`: 更新用データ（PUT）
- `{Model}Login`: 特殊な用途（ログイン専用）
- `Advanced{Model}`: 高度な分析機能用

### **backend/database.py** - DB接続管理
```python
# データベース接続の一元管理
SQLALCHEMY_DATABASE_URL = "sqlite:///./myfit.db"
engine = create_engine(DATABASE_URL)      # DB接続エンジン
SessionLocal = sessionmaker(bind=engine)  # セッション工場

def get_db():                              # 依存性注入用
    db = SessionLocal()                    # 接続作成
    try:
        yield db                           # APIに渡す
    finally:
        db.close()                         # 確実に接続を閉じる
```

**重要ポイント:**
- **接続プール**: 効率的なDB接続管理
- **自動クローズ**: メモリリーク防止
- **トランザクション**: commit/rollback管理

### **backend/auth.py** - 認証機能
```python
# セキュリティ機能の集約
pwd_context = CryptContext(schemes=["bcrypt"])  # パスワードハッシュ化

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)           # 安全なハッシュ化

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, ALGORITHM)  # JWT生成

def verify_token(token: str):
    payload = jwt.decode(token, SECRET_KEY)     # JWT検証
    return payload.get("sub")                   # ユーザー識別子取得
```

**セキュリティ設計:**
- **bcrypt**: 業界標準のパスワードハッシュ化
- **JWT**: ステートレス認証（サーバー負荷軽減）
- **有効期限**: 30分でトークン無効化

### **backend/main.py** - APIエンドポイント定義
```python
# FastAPIアプリケーションのメイン
app = FastAPI(title="MyFit API")

# 認証必須APIの例
@app.get("/exercises")
async def get_exercises(
    current_user: models.User = Depends(get_current_user),  # 認証確認
    db: Session = Depends(get_db)                           # DB接続
):
    # 内蔵種目 + ユーザー種目を取得
    builtin = db.query(models.Exercise).filter(Exercise.is_builtin == True).all()
    user_exercises = db.query(models.Exercise).filter(
        Exercise.user_id == current_user.id
    ).all()
    return builtin + user_exercises
```

**API設計パターン:**
- **依存性注入**: `Depends()` で共通処理を分離
- **認証チェック**: `get_current_user` で自動認証
- **エラーハンドリング**: `HTTPException` で適切なステータスコード

### **backend/seed_data.py** - 初期データ投入
```python
# データベース初期化スクリプト
def create_builtin_exercises():
    # 重複チェック → 新規作成 → コミット
    builtin_exercises = [
        {"name": "ベンチプレス", "muscle_group": "胸筋"},
        {"name": "スクワット", "muscle_group": "脚"},
        # ...
    ]
```

**実行タイミング:**
- 初回環境構築時: `python seed_data.py`
- 内蔵種目追加時: スクリプト更新 → 再実行

## 📝 命名規則

### 1. SQLAlchemyモデル（models.py）
```python
# ルール: 単数形クラス名 → 複数形テーブル名
class User(Base):          # → users テーブル
class Exercise(Base):      # → exercises テーブル
class Workout(Base):       # → workouts テーブル
class WorkoutExercise(Base): # → workout_exercises テーブル
class Set(Base):           # → sets テーブル
class BodyMetric(Base):    # → body_metrics テーブル

# 外部キー命名: {参照テーブル名(単数)}_id
user_id = Column(Integer, ForeignKey("users.id"))
workout_id = Column(Integer, ForeignKey("workouts.id"))
exercise_id = Column(Integer, ForeignKey("exercises.id"))
```

### 2. Pydanticスキーマ（schemas.py）
```python
# ルール: {モデル名}{用途}
class UserCreate(BaseModel):     # 作成用（POST リクエスト）
class UserResponse(BaseModel):   # レスポンス用（GET レスポンス）
class UserUpdate(BaseModel):     # 更新用（PUT リクエスト）
class UserLogin(BaseModel):      # ログイン専用

# 認証関連
class Token(BaseModel):          # JWTトークン
class TokenData(BaseModel):      # トークンデータ

# 汎用ベースクラス
class ExerciseBase(BaseModel):   # 共通フィールド定義
    name: str
    muscle_group: str

class ExerciseCreate(ExerciseBase):  # ベースクラス継承
    pass
```

### 3. APIエンドポイント
```python
# ルール: HTTP動詞 + 複数形リソース名
@app.post("/auth/signup")           # サインアップ
@app.post("/auth/login")            # ログイン
@app.get("/auth/me")                # 現在のユーザー情報

# 🆕 ユーザープロフィール管理
@app.get("/profile")                # プロフィール取得（年齢自動計算）
@app.put("/profile")                # プロフィール更新（生年月日・性別）

@app.get("/exercises")              # 種目一覧取得
@app.post("/exercises")             # 種目作成
@app.get("/exercises/{exercise_id}") # 特定種目取得

@app.get("/workouts")               # ワークアウト一覧
@app.post("/workouts")              # ワークアウト作成
@app.get("/workouts/{workout_id}")  # 特定ワークアウト取得
@app.post("/workouts/{id}/exercises")    # ワークアウトに種目追加
@app.post("/workout-exercises/{id}/sets") # セット記録

# 身体データ管理
@app.get("/height-records")         # 身長記録一覧
@app.post("/height-records")        # 身長記録作成
@app.get("/body-metrics")           # 体重記録一覧
@app.post("/body-metrics")          # 体重記録作成

# 分析機能
@app.get("/analytics/workout/summary")       # ワークアウト分析
@app.get("/analytics/body/summary")          # 基本身体データ分析
@app.get("/analytics/body/advanced-summary") # 🆕 高度な身体分析（個人化）
@app.get("/analytics/body/bmi-history")      # BMI履歴
```

**🆕 高度分析機能の特徴:**
- **基礎代謝率（BMR）**: Mifflin-St Jeor式
- **必要カロリー**: 活動レベル別（5段階）
- **理想体重範囲**: BMI基準
- **年齢考慮BMI判定**: 高齢者対応

### 4. React コンポーネント
```typescript
// ルール: PascalCase、用途が分かる名前
// ページコンポーネント
Login.tsx                    # ログインページ
Dashboard.tsx               # ダッシュボードページ
Workout.tsx                 # ワークアウトページ

// UIコンポーネント（shadcn/ui）
Button.tsx                  # ボタンコンポーネント
Card.tsx                    # カードコンポーネント
Input.tsx                   # 入力フィールド
```

### 5. ファイル・ディレクトリ命名
```
# Python: snake_case
models.py, schemas.py, auth.py, seed_data.py

# TypeScript: kebab-case または PascalCase
components/ui/, development-rules.md

# 設定ファイル: 各技術の慣習に従う
vite.config.ts, tailwind.config.js, package.json
```

## 🔄 データフロー設計

### 1. API リクエストフロー
```
[React Client] → [FastAPI] → [Pydantic] → [SQLAlchemy] → [SQLite]
     ↓              ↓           ↓            ↓            ↓
1. HTTP Request → 2. 型検証 → 3. ビジネス → 4. DB操作 → 5. データ保存
                              ロジック
[React Client] ← [FastAPI] ← [Pydantic] ← [SQLAlchemy] ← [SQLite]
     ↑              ↑           ↑            ↑            ↑
8. JSON Response ← 7. 型変換 ← 6. データ整形 ← データ取得
```

**具体例: ワークアウト作成**
```
1. React: POST /workouts {date: "2025-01-15", note: "胸筋"}
2. FastAPI: エンドポイント受信
3. Pydantic: WorkoutCreate スキーマで検証
4. SQLAlchemy: models.Workout インスタンス作成
5. SQLite: workouts テーブルに INSERT
6. SQLAlchemy: 作成されたWorkoutオブジェクト取得
7. Pydantic: WorkoutResponse スキーマで出力整形
8. React: JSON レスポンス受信
```

### 2. 認証フロー
```
[サインアップ/ログイン]
User Input → Pydantic検証 → パスワードハッシュ化 → DB保存/検証
                ↓
[トークン発行]
認証成功 → JWT生成(email, expire) → クライアントに返却
                ↓
[API保護]
Request + Bearer Token → JWT検証 → email抽出 → User取得 → 処理実行
```

**実装例:**
```python
# 1. ログイン時
user = verify_password(input_password, stored_hash)  # パスワード検証
token = create_access_token({"sub": user.email})     # JWT生成

# 2. 保護されたAPI呼び出し時
def get_current_user(token: str = Depends(security)):
    email = verify_token(token)                      # JWT検証
    user = db.query(User).filter_by(email=email)     # ユーザー取得
    return user
```

### 3. 種目管理データフロー
```
[内蔵種目]
seed_data.py → SQLite (user_id=NULL, is_builtin=True)
                ↓
[ユーザー種目]  
User Create → SQLite (user_id=123, is_builtin=False)
                ↓
[種目一覧API]
GET /exercises → 内蔵種目 + ユーザー種目 → 統合して返却
```

**データ分離ルール:**
```python
# 内蔵種目取得（全ユーザー共通）
builtin = db.query(Exercise).filter(Exercise.is_builtin == True)

# ユーザー種目取得（個人専用）
user_exercises = db.query(Exercise).filter(
    Exercise.user_id == current_user.id,
    Exercise.is_builtin == False
)
```

## 🗄️ データベース設計ルール

### 1. テーブル設計思想
```sql
-- 正規化されたテーブル構造
users              -- ユーザーアカウント + プロフィール 🆕
├── exercises      -- 種目マスタ（内蔵 + ユーザー）
├── workouts       -- ワークアウト（日付単位）
│   └── workout_exercises  -- ワークアウト内の種目
│       └── sets   -- 各種目のセット記録
├── body_metrics   -- 体重・体脂肪率記録
└── height_records -- 身長記録 🆕
```

**🆕 個人化対応の拡張テーブル:**
```sql
-- usersテーブル（プロフィール情報追加）
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    birth_date DATE,           -- 🆕 生年月日（年齢計算用）
    gender VARCHAR             -- 🆕 性別（BMR計算用）
);

-- height_recordsテーブル（身長履歴管理）
CREATE TABLE height_records (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    height_cm FLOAT NOT NULL,
    date DATETIME NOT NULL,
    note TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 2. リレーション設計パターン
```python
# 1対多の関係設定
class User(Base):
    workouts = relationship("Workout", back_populates="user")
    # 1人のユーザー → 複数のワークアウト

class Workout(Base):
    user = relationship("User", back_populates="workouts")
    workout_exercises = relationship("WorkoutExercise", back_populates="workout")
    # 1つのワークアウト → 複数の種目

# 外部キー制約
user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
```

### 3. 特殊な設計パターン

#### **内蔵種目 vs ユーザー種目**
```python
# 内蔵種目（全ユーザー共通）
Exercise(
    user_id=None,           # NULL = 全ユーザー利用可能
    is_builtin=True,        # 内蔵フラグ
    name="ベンチプレス"
)

# ユーザー種目（個人専用）
Exercise(
    user_id=123,            # 特定ユーザーのみ
    is_builtin=False,       # ユーザー作成フラグ
    name="インクラインダンベルプレス"
)
```

#### **中間テーブル（WorkoutExercise）**
```python
# なぜ中間テーブルが必要？
# ❌ 直接関連だと順序やセット情報を保存できない
class Workout(Base):
    exercises = relationship("Exercise")  # 順序不明

# ✅ 中間テーブルで詳細情報を管理
class WorkoutExercise(Base):
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    order_index = Column(Integer)  # 実行順序（1番目、2番目...）
```

### 4. データ取得パターン
```python
# リレーションを活用した効率的な取得
user = db.query(User).filter_by(email="test@example.com").first()

# ユーザーの全ワークアウトを取得
workouts = user.workouts  # SQL JOIN自動生成

# 特定ワークアウトの詳細
for workout in workouts:
    print(f"日付: {workout.date}")
    for we in workout.workout_exercises:  # ワークアウト種目
        print(f"種目: {we.exercise.name}")
        for set in we.sets:               # セット記録
            print(f"  {set.weight}kg × {set.reps}回")
```

### 5. データ整合性ルール
```python
# 必須項目制約
email = Column(String, nullable=False, unique=True)  # メール重複禁止
password_hash = Column(String, nullable=False)       # パスワード必須

# 外部キー制約
user_id = Column(Integer, ForeignKey("users.id"))    # 参照整合性

# チェック制約（今後追加予定）
rpe = Column(Integer, CheckConstraint('rpe >= 1 AND rpe <= 10'))  # RPE範囲
weight = Column(Float, CheckConstraint('weight > 0'))             # 重量正数
```

## 🛡️ セキュリティルール

### 1. パスワード管理
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ 正しい方法：ハッシュ化して保存
def signup(user_data):
    password_hash = pwd_context.hash(user_data.password)  # bcryptハッシュ化
    user = User(email=user_data.email, password_hash=password_hash)

# ✅ ログイン検証
def login(user_data):
    user = db.query(User).filter_by(email=user_data.email).first()
    if pwd_context.verify(user_data.password, user.password_hash):  # ハッシュ比較
        return create_access_token({"sub": user.email})

# ❌ 危険：平文で保存/比較しない
password = "plain_password"  # 絶対NG
if user_data.password == stored_password:  # 危険
```

### 2. JWT設定
```python
# トークン設定
SECRET_KEY = "your-secret-key-here"    # 本番では環境変数
ALGORITHM = "HS256"                    # 暗号化アルゴリズム
ACCESS_TOKEN_EXPIRE_MINUTES = 30       # 30分で期限切れ

# トークン生成
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = data.copy()
    to_encode.update({"exp": expire})   # 有効期限設定
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# トークン検証
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")      # ユーザー識別子
        if email is None:
            raise HTTPException(401, "無効なトークン")
        return email
    except JWTError:
        raise HTTPException(401, "トークンが無効または期限切れ")
```

### 3. API保護パターン
```python
# 認証必須APIの実装
@app.get("/exercises")
async def get_exercises(
    current_user: models.User = Depends(get_current_user),  # 認証チェック
    db: Session = Depends(get_db)
):
    # current_user が取得できた = 認証済み
    return user_exercises

# 所有者チェック
@app.get("/workouts/{workout_id}")
async def get_workout(workout_id: int, current_user: User = Depends(get_current_user)):
    workout = db.query(Workout).filter_by(id=workout_id).first()
    
    if workout.user_id != current_user.id:  # 所有者確認
        raise HTTPException(403, "他のユーザーのデータにはアクセスできません")
    
    return workout
```

### 4. CORS設定
```python
# フロントエンドからのアクセス許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite開発サーバー
    allow_credentials=True,                   # Cookieを許可
    allow_methods=["*"],                      # 全HTTPメソッド
    allow_headers=["*"]                       # 全ヘッダー
)

# 本番環境設定例
allow_origins=["https://myfit-app.com"]      # 本番ドメインのみ
```

### 5. データ検証（Pydantic）
```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr                          # メール形式自動検証
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:                       # パスワード長制限
            raise ValueError('パスワードは8文字以上')
        return v
```

### 6. 本番環境セキュリティ
```python
import os

# 環境変数から秘密鍵取得
SECRET_KEY = os.getenv("SECRET_KEY", "development-key")

# HTTPSリダイレクト
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
app.add_middleware(HTTPSRedirectMiddleware)  # 本番のみ

# セキュリティヘッダー
from fastapi.middleware.security import SecurityHeaders
app.add_middleware(SecurityHeaders)
```

## ⚙️ 設定ファイルルール

### 1. Pydantic Config
```python
class ExerciseResponse(BaseModel):
    id: int
    name: str
    muscle_group: str
    user_id: Optional[int]
    is_builtin: bool
    
    class Config:
        from_attributes = True    # SQLAlchemy → Pydantic 自動変換
        # 旧版では orm_mode = True
```

**Config設定の意味:**
```python
# SQLAlchemyオブジェクトから自動変換
exercise_db = db.query(Exercise).first()        # SQLAlchemyオブジェクト
exercise_response = ExerciseResponse.from_orm(exercise_db)  # Pydantic変換
```

### 2. TypeScript Config（tsconfig.json）
```json
{
  "files": [],
  "references": [
    {"path": "./tsconfig.app.json"},
    {"path": "./tsconfig.node.json"}
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]         # path alias設定
    }
  }
}
```

**使用例:**
```typescript
// ❌ 相対パス（複雑）
import { Button } from "../../../../components/ui/button"

// ✅ path alias（簡潔）
import { Button } from "@/components/ui/button"
```

### 3. Vite Config（vite.config.ts）
```typescript
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],    # Tailwind CSS v4プラグイン
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),  # path alias設定
    },
  },
})
```

**重要ポイント:**
- `process.cwd()` を使用（`__dirname` は非推奨）
- Tailwind CSS v4用プラグイン

### 4. Tailwind CSS Config
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",       # ファイル監視対象
  ],
  theme: {
    extend: {},                         # カスタムテーマ拡張
  },
  plugins: [],                          # 追加プラグイン
}
```

### 5. shadcn/ui Config（components.json）
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",                  # UIスタイル
  "rsc": false,                         # React Server Components無効
  "tsx": true,                          # TypeScript使用
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",               # ベースカラー
    "cssVariables": true                # CSS変数使用
  },
  "aliases": {
    "components": "@/components",       # コンポーネントalias
    "utils": "@/lib/utils"              # ユーティリティalias
  }
}
```

### 6. FastAPI設定
```python
app = FastAPI(
    title="MyFit API",                  # API名
    description="筋トレ管理アプリのAPI",  # 説明
    version="1.0.0",                    # バージョン
    docs_url="/docs",                   # Swagger UI URL
    redoc_url="/redoc"                  # ReDoc URL
)

# 本番環境設定
if environment == "production":
    app = FastAPI(
        title="MyFit API",
        docs_url=None,                  # Swagger UI無効化
        redoc_url=None                  # ReDoc無効化
    )
```

## 🚨 トラブルシューティング

### 1. Python関連エラー

#### **仮想環境エラー**
```bash
# 問題: プロンプトに (myfit-backend-env) が表示されない
# 解決法:
source myfit-backend-env/bin/activate  # 仮想環境再アクティベート
which python                           # pythonパス確認

# 問題: モジュールが見つからない
# 解決法:
pip install -r requirements.txt       # 依存関係再インストール
pip list                              # インストール済みパッケージ確認
```

#### **bcryptエラー**
```bash
# 問題: bcrypt version エラー
# 解決法:
pip uninstall bcrypt
pip install bcrypt==4.0.1             # 安定バージョン使用

# 代替案: argon2使用
pip install argon2-cffi
# auth.py で pwd_context = CryptContext(schemes=["argon2"])
```

#### **SQLAlchemyインポートエラー**
```python
# 問題: ImportError: cannot import name 'relationship'
# 解決法:
from sqlalchemy.orm import relationship  # 正しいインポート
# ❌ from sqlalchemy.relationship import relationship
```

### 2. Node.js関連エラー

#### **TypeScriptエラー**
```bash
# 問題: Module '@/components/ui/button' not found
# 解決法:
npm install -D @types/node            # 型定義追加

# tsconfig.json 確認:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {"@/*": ["./src/*"]}
  }
}
```

#### **Vite設定エラー**
```typescript
// 問題: Property 'dirname' does not exist on type 'ImportMeta'
// 解決法:
import.meta.dirname → process.cwd()    # ES Modules対応

// 問題: Cannot resolve dependency vite@"^5.2.0 || ^6"
// 解決法: Tailwind CSS v3使用
npm uninstall tailwindcss @tailwindcss/vite
npm install -D tailwindcss postcss autoprefixer
```

### 3. zsh特有の問題
```bash
# 問題: zsh: no matches found: python-jose[cryptography]
# 解決法: クォートで囲む
pip install "python-jose[cryptography]" "passlib[bcrypt]"
```

### 4. データベース関連

#### **テーブル作成エラー**
```python
# 問題: テーブルが作成されない
# 解決法:
import models                          # models.pyインポート確認
models.Base.metadata.create_all(bind=engine)  # テーブル作成コマンド

# 確認方法:
ls -la myfit.db                       # ファイル存在確認
```

#### **外部キー制約エラー**
```python
# 問題: FOREIGN KEY constraint failed
# 解決法: 参照されるレコードが存在するか確認
user = db.query(User).first()         # ユーザー存在確認
if user:
    workout = Workout(user_id=user.id)  # 有効なuser_id使用
```

### 5. 認証関連エラー

#### **JWTトークンエラー**
```python
# 問題: 401 Unauthorized
# 確認手順:
1. ログインAPIでトークン取得確認
2. Authorization: Bearer <token> ヘッダー確認
3. トークン有効期限確認（30分）
4. SECRET_KEY一致確認

# デバッグ用:
print(f"Token: {token}")
print(f"Decoded: {jwt.decode(token, SECRET_KEY, algorithms=['HS256'])}")
```

### 6. CORS エラー
```javascript
// 問題: Access to fetch at 'localhost:8000' from origin 'localhost:5173' has been blocked by CORS
// 解決法: FastAPI CORS設定確認
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # フロントエンドURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

### 7. 開発サーバー起動失敗

#### **ポート競合**
```bash
# 問題: Port 8000 is already in use
# 解決法:
lsof -ti:8000                         # プロセス確認
kill -9 $(lsof -ti:8000)             # プロセス終了
python main.py                       # 再起動
```

#### **依存関係エラー**
```bash
# 問題: ModuleNotFoundError
# 解決法: 仮想環境確認
echo $VIRTUAL_ENV                     # 仮想環境パス確認
pip list | grep fastapi               # FastAPIインストール確認
```

## 📚 ベストプラクティス

### 1. コード品質
```python
# 型ヒント必須（Python）
def create_workout(
    workout_data: schemas.WorkoutCreate,    # 入力型明示
    current_user: models.User,              # 認証ユーザー型
    db: Session                            # DB接続型
) -> schemas.WorkoutResponse:              # 戻り値型明示
    pass

# Optional明示
note: Optional[str] = None              # NULL許可の明示
rpe: Optional[int] = None               # 任意入力項目

# エラーハンドリング
if not workout:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="ワークアウトが見つかりません"    # 日本語エラーメッセージ
    )
```

### 2. セキュリティベストプラクティス
```python
# 認証チェック関数の統一
def get_current_user(credentials = Depends(security), db = Depends(get_db)):
    email = verify_token(credentials.credentials)
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "認証が必要です")
    return user

# データ所有者チェック
def check_resource_owner(resource, current_user):
    if resource.user_id != current_user.id:
        raise HTTPException(403, "アクセス権限がありません")
```

### 3. API設計
```python
# 一貫性のあるレスポンス形式
@app.get("/exercises", response_model=list[schemas.ExerciseResponse])
@app.post("/exercises", response_model=schemas.ExerciseResponse)
@app.get("/exercises/{exercise_id}", response_model=schemas.ExerciseResponse)

# 適切なHTTPステータスコード
return workout, 201                    # 作成成功
raise HTTPException(404, "Not Found") # リソース不存在
raise HTTPException(403, "Forbidden") # アクセス権限なし
raise HTTPException(401, "Unauthorized") # 認証失敗
```

### 4. データベース操作
```python
# トランザクション管理
try:
    db.add(new_workout)
    db.commit()                        # 明示的コミット
    db.refresh(new_workout)            # ID等の自動生成値取得
    return new_workout
except Exception as e:
    db.rollback()                      # エラー時ロールバック
    raise HTTPException(500, "データベースエラー")
finally:
    db.close()                         # 確実な接続クローズ

# 効率的なクエリ
# ❌ N+1問題
workouts = db.query(Workout).all()
for workout in workouts:
    exercises = workout.workout_exercises  # 個別クエリ実行

# ✅ JOIN使用
workouts = db.query(Workout).options(
    joinedload(Workout.workout_exercises)
).all()
```

### 5. フロントエンド連携

#### **認証システムアーキテクチャ**
```typescript
// 🆕 Day 4: 完全な認証システム実装
// Zustand状態管理
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false 
  }),
}));
```

#### **認証フックの実装**
```typescript
// useAuth カスタムフック
export function useAuth() {
  const { user, isAuthenticated, setUser, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 認証状態チェック（JWTトークンがある場合のみ）
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.me().then(res => res.data),
    retry: false,
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 1000 * 60 * 5,
  });

  // ログイン処理
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => 
      authAPI.login(email, password),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token);
      setUser(response.data.user);
      navigate('/dashboard');
    },
  });

  return {
    user, isLoading, isAuthenticated,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
```

#### **型安全なAPI呼び出し**
```typescript
// Axiosインターセプターで自動認証
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 認証API関数
export const authAPI = {
  signup: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
};

// ワークアウトAPI
const createWorkout = async (data: WorkoutCreate): Promise<WorkoutResponse> => {
  const response = await api.post('/workouts', data); // 自動でJWTトークン付与
  return response.data;
};
```

#### **認証ベースルーティング**
```typescript
function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // 認証チェック中
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        // 未認証時はログインページのみ
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        // 認証済み時は全ページアクセス可能
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}
```

#### **フォームバリデーション**
```typescript
// Zod + React Hook Form
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
});

const signupSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

// ログインコンポーネント内
const loginForm = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

const handleLogin = async (data: LoginFormData) => {
  try {
    await login(data);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 6. ドキュメント作成
```python
@app.post("/workouts", response_model=schemas.WorkoutResponse)
async def create_workout(
    workout_data: schemas.WorkoutCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    新しいワークアウトを作成する
    
    - **date**: ワークアウト実施日時（ISO 8601形式）
    - **note**: メモ（任意）
    
    認証が必要です。
    """
    pass
```

### 7. 開発ワークフロー
```bash
# 1. 機能開発前
git checkout -b feature/workout-sets   # フィーチャーブランチ作成

# 2. 開発中
source myfit-backend-env/bin/activate  # 仮想環境アクティベート
python main.py                        # APIサーバー起動
npm run dev                           # フロントエンド起動

# 3. 開発完了後
pip freeze > requirements.txt         # 依存関係更新
git add .
git commit -m "Add workout sets functionality"
git push origin feature/workout-sets

# 4. テスト
curl -X GET http://localhost:8000/exercises  # API動作確認
```

### 8. バージョン管理
```bash
# コミットメッセージ規則
git commit -m "Add: ワークアウト作成API実装"          # 新機能追加
git commit -m "Fix: bcryptバージョン競合エラー修正"    # バグ修正  
git commit -m "Update: 認証フロー改善"                # 既存機能改善
git commit -m "Docs: 開発ルール更新"                  # ドキュメント更新

# .gitignore適切な設定
myfit-backend-env/                    # 仮想環境除外
*.db                                  # データベースファイル除外
.env                                  # 環境変数ファイル除外
__pycache__/                          # Pythonキャッシュ除外
node_modules/                         # Node.js依存関係除外
```

## 🔧 開発コマンド一覧

### 日常開発コマンド

#### **環境準備**
```bash
# プロジェクトルートから
cd backend
source myfit-backend-env/bin/activate  # 仮想環境アクティベート
cd ../frontend                         # フロントエンドに移動
```

#### **サーバー起動**
```bash
# バックエンド（ターミナル1）
cd backend
source myfit-backend-env/bin/activate
python main.py                         # API: http://localhost:8000

# フロントエンド（ターミナル2）  
cd frontend
npm run dev                            # App: http://localhost:5173
```

#### **パッケージ管理**
```bash
# Python（backend）
pip install {package-name}             # パッケージ追加
pip freeze > requirements.txt          # 依存関係更新
pip install -r requirements.txt        # 依存関係復元

# Node.js（frontend）
npm install {package-name}             # 本番依存関係
npm install -D {package-name}          # 開発依存関係
npx shadcn@latest add {component}      # UIコンポーネント追加
```

#### **データベース操作**
```bash
cd backend
source myfit-backend-env/bin/activate
python seed_data.py                   # 内蔵種目データ投入
ls -la myfit.db                       # データベースファイル確認
```

### API開発・テスト

#### **API確認**
```bash
# Swagger UI
open http://localhost:8000/docs        # インタラクティブAPI仕様

# ReDoc  
open http://localhost:8000/redoc       # 読みやすいAPI仕様

# ヘルスチェック
curl http://localhost:8000/health      # {"status": "healthy"}
```

#### **認証テスト**
```bash
# 🆕 フロントエンド認証フロー確認
# 1. フロントエンドアクセス
open http://localhost:5173            # Reactアプリ（自動的にログインページ）

# 2. 新規アカウント作成テスト
# UI: アカウント作成フォーム → メール・パスワード入力 → 作成ボタン
# 期待結果: ダッシュボードページに自動遷移

# 3. ログインテスト  
# UI: ログインフォーム → メール・パスワード入力 → ログインボタン
# 期待結果: ダッシュボードページに遷移

# 4. 認証状態確認
# UI: ダッシュボード右上にユーザーメール表示
# 期待結果: ユーザー情報が正しく表示される

# 5. ログアウトテスト
# UI: ダッシュボード右上のログアウトボタン
# 期待結果: ログインページに戻る

# バックエンド直接API確認
# サインアップ
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# ログイン
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 認証必須API（要トークン）
curl -X GET http://localhost:8000/exercises \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### トラブルシューティング

#### **プロセス管理**
```bash
# ポート使用確認
lsof -ti:8000                         # ポート8000使用プロセス確認
lsof -ti:5173                         # ポート5173使用プロセス確認

# プロセス終了
kill -9 $(lsof -ti:8000)             # ポート8000プロセス強制終了

# 仮想環境確認
echo $VIRTUAL_ENV                     # 仮想環境パス表示
which python                          # python実行パス確認
```

#### **ログ・デバッグ**
```bash
# Python エラー確認
python main.py                       # コンソールでエラー表示
tail -f logs/api.log                 # ログファイル監視（今後実装）

# TypeScript エラー確認
npm run type-check                   # 型チェック実行
```

### Git操作

#### **基本ワークフロー**
```bash
git status                           # 変更状況確認
git add .                           # 全変更をステージング
git commit -m "Add workout API endpoints"  # コミット
git push origin main                # プッシュ

# ブランチ操作
git checkout -b feature/sets-api    # 新ブランチ作成・切り替え
git merge feature/sets-api          # ブランチマージ
```

#### **環境復元**
```bash
# 新しい環境での初期セットアップ
git clone git@github.com:username/MyFitApp.git
cd MyFitApp

# バックエンド復元
cd backend
pyenv local 3.11.0
python -m venv myfit-backend-env
source myfit-backend-env/bin/activate
pip install -r requirements.txt
python seed_data.py

# フロントエンド復元
cd ../frontend
npm install
```

### 性能・品質チェック

#### **コード品質**
```bash
# Python
pip install black isort             # フォーマッター
black .                            # コード整形
isort .                            # import整理

# TypeScript
npm run lint                       # ESLint実行
npm run format                     # Prettier実行（今後設定）
```

#### **テスト実行**
```bash
# API手動テスト
python -m pytest tests/           # 単体テスト（今後実装）

# フロントエンドテスト
npm test                          # Jest/Vitest実行（今後実装）
```

---

## 🧮 科学的計算機能（個人化分析）

### 基礎代謝率（BMR）計算 - Mifflin-St Jeor式
```python
def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    科学的根拠に基づく基礎代謝率計算
    - 男性: BMR = 10 × 体重(kg) + 6.25 × 身長(cm) - 5 × 年齢 + 5
    - 女性: BMR = 10 × 体重(kg) + 6.25 × 身長(cm) - 5 × 年齢 - 161
    """
    if gender == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    elif gender == "female":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        # その他の性別の場合は男女平均
        male_bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        female_bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        return (male_bmr + female_bmr) / 2
```

### 必要カロリー計算 - Harris-Benedict式
```python
def calculate_daily_calories(bmr: float) -> dict:
    """
    活動レベル別の1日必要カロリー計算
    """
    return {
        "sedentary": round(bmr * 1.2, 0),      # 座り仕事・運動なし
        "light": round(bmr * 1.375, 0),       # 軽い運動（週1-3回）
        "moderate": round(bmr * 1.55, 0),     # 中程度の運動（週3-5回）
        "active": round(bmr * 1.725, 0),      # 積極的な運動（週6-7回）
        "very_active": round(bmr * 1.9, 0)    # 非常に活発（1日2回、激しい運動）
    }
```

### 理想体重範囲計算 - WHO基準
```python
def calculate_ideal_weight_range(height_cm: float) -> dict:
    """
    WHO推奨のBMI範囲（18.5-24.9）に基づく理想体重
    """
    height_m = height_cm / 100
    return {
        "min": round(18.5 * (height_m ** 2), 1),
        "max": round(24.9 * (height_m ** 2), 1)
    }
```

### 体脂肪率推定 - 性別・年齢考慮
```python
def estimate_body_fat(bmi: float, age: int, gender: str) -> float:
    """
    BMI・年齢・性別による体脂肪率推定
    - 男性: 1.20 × BMI + 0.23 × 年齢 - 16.2
    - 女性: 1.20 × BMI + 0.23 × 年齢 - 5.4
    """
    if gender == "male":
        estimated = 1.20 * bmi + 0.23 * age - 16.2
    elif gender == "female":
        estimated = 1.20 * bmi + 0.23 * age - 5.4
    else:
        # その他の性別は男女平均
        male_est = 1.20 * bmi + 0.23 * age - 16.2
        female_est = 1.20 * bmi + 0.23 * age - 5.4
        estimated = (male_est + female_est) / 2
    
    return max(5, min(50, round(estimated, 1)))  # 5-50%の範囲で制限
```

### 年齢考慮BMI判定
```python
def categorize_bmi_for_age(bmi: float, age: int) -> str:
    """
    年齢を考慮したBMI分類
    高齢者（65歳以上）は基準を緩和
    """
    if age >= 65:
        # 高齢者基準（少し高めが健康的）
        if bmi < 20:
            return "低体重（注意）"
        elif bmi < 27:
            return "標準"
        else:
            return "過体重"
    else:
        # 一般成人基準
        if bmi < 18.5:
            return "低体重"
        elif bmi < 25:
            return "標準"
        elif bmi < 30:
            return "過体重"
        else:
            return "肥満"
```

### 科学的根拠
- **Mifflin-St Jeor式**: 1990年代に開発された最も精度の高い基礎代謝計算式
- **Harris-Benedict式**: 活動代謝の標準的な計算方法
- **WHO基準**: 世界保健機関による国際的なBMI分類
- **年齢考慮**: 高齢者の健康維持に関する最新の医学研究を反映

**このコマンド集により、効率的な開発が可能になります。必要に応じてエイリアスやスクリプト化も検討してください。**
