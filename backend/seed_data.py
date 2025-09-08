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
        # 筋力トレーニング
        {"name": "ベンチプレス", "muscle_group": "胸", "exercise_type": "strength"},
        {"name": "スクワット", "muscle_group": "脚", "exercise_type": "strength"},
        {"name": "デッドリフト", "muscle_group": "背中", "exercise_type": "strength"},
        {"name": "ショルダープレス", "muscle_group": "肩", "exercise_type": "strength"},
        {"name": "バーベルロウ", "muscle_group": "背中", "exercise_type": "strength"},
        {"name": "インクラインベンチプレス", "muscle_group": "胸", "exercise_type": "strength"},
        {"name": "ラットプルダウン", "muscle_group": "背中", "exercise_type": "strength"},
        {"name": "レッグプレス", "muscle_group": "脚", "exercise_type": "strength"},
        {"name": "ダンベルカール", "muscle_group": "腕", "exercise_type": "strength"},
        {"name": "ディップス", "muscle_group": "胸", "exercise_type": "strength"},
        
        # 有酸素運動
        {"name": "ランニングマシン", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "ランニング（ロード）", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "サイクリング（ロード）", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "サイクリングマシン", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
    ]
    
    # データベースに追加
    for exercise_data in builtin_exercises:
        exercise = Exercise(
            name=exercise_data["name"],
            muscle_group=exercise_data["muscle_group"],
            exercise_type=exercise_data["exercise_type"],
            is_builtin=True,
            user_id=None  # 内蔵種目はuser_idがNone
        )
        db.add(exercise)
    
    db.commit()
    print(f"{len(builtin_exercises)}個の内蔵種目を追加しました")
    db.close()

if __name__ == "__main__":
    create_builtin_exercises()