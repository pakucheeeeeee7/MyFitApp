from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Exercise

def create_builtin_exercises():
    """内蔵種目を作成"""
    db = SessionLocal()
    
    # 既に内蔵種目があるかチェック
    existing = db.query(Exercise).filter(Exercise.is_builtin == True).first()
    if existing:
        print("内蔵種目は既に存在します")
        db.close()
        return
    
    # 内蔵種目リスト
    builtin_exercises = [
        {"name": "ベンチプレス", "muscle_group": "胸筋"},
        {"name": "スクワット", "muscle_group": "脚"},
        {"name": "デッドリフト", "muscle_group": "背中"},
        {"name": "ショルダープレス", "muscle_group": "肩"},
        {"name": "バーベルロウ", "muscle_group": "背中"},
        {"name": "インクラインベンチプレス", "muscle_group": "胸筋"},
        {"name": "ラットプルダウン", "muscle_group": "背中"},
        {"name": "レッグプレス", "muscle_group": "脚"},
        {"name": "ダンベルカール", "muscle_group": "腕"},
        {"name": "ディップス", "muscle_group": "胸筋"},
    ]
    
    # データベースに追加
    for exercise_data in builtin_exercises:
        exercise = Exercise(
            name=exercise_data["name"],
            muscle_group=exercise_data["muscle_group"],
            is_builtin=True,
            user_id=None  # 内蔵種目はuser_idがNone
        )
        db.add(exercise)
    
    db.commit()
    print(f"{len(builtin_exercises)}個の内蔵種目を追加しました")
    db.close()

if __name__ == "__main__":
    create_builtin_exercises()