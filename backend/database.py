from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLiteデータベースのURL
SQLALCHEMY_DATABASE_URL = "sqlite:///./myfit.db"

# SQLAlchemyエンジンを作成
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# セッションローカルクラス
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラス
Base = declarative_base()

# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()