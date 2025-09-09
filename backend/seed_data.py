from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Exercise
import sys

def get_builtin_exercises():
    """内蔵種目の定義を返す"""
    return [
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
        
        # 新しく追加する筋力トレーニング種目
        {"name": "プルアップ", "muscle_group": "背中", "exercise_type": "strength"},
        {"name": "フレンチプレス", "muscle_group": "腕", "exercise_type": "strength"},
        {"name": "サイドレイズ", "muscle_group": "肩", "exercise_type": "strength"},
        {"name": "カーフレイズ", "muscle_group": "脚", "exercise_type": "strength"},
        {"name": "アブドミナルクランチ", "muscle_group": "腹筋", "exercise_type": "strength"},
        
        # 有酸素運動
        {"name": "ランニングマシン", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "ランニング（ロード）", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "サイクリング（ロード）", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "サイクリングマシン", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        
        # 新しく追加する有酸素運動種目
        {"name": "エリプティカル", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        {"name": "ステップマシン", "muscle_group": "有酸素運動", "exercise_type": "cardio"},
        
        # ローイングマシンは筋力トレーニングに分類
        {"name": "ローイングマシン", "muscle_group": "背中", "exercise_type": "strength"},
    ]

def create_builtin_exercises():
    """内蔵種目を作成（初回のみ）"""
    db = SessionLocal()
    
    try:
        # 既に内蔵種目があるかチェック
        existing = db.query(Exercise).filter(Exercise.is_builtin == True).first()
        if existing:
            print("内蔵種目は既に存在します。更新する場合は 'python seed_data.py update' を使用してください。")
            return
        
        builtin_exercises = get_builtin_exercises()
        
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
        
    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
    finally:
        db.close()

def update_builtin_exercises():
    """内蔵種目を更新（既存データを保持）"""
    db = SessionLocal()
    
    try:
        builtin_exercises = get_builtin_exercises()
        updated_count = 0
        added_count = 0
        
        for exercise_data in builtin_exercises:
            # 既存の内蔵種目を検索
            existing = db.query(Exercise).filter(
                Exercise.name == exercise_data["name"],
                Exercise.is_builtin == True
            ).first()
            
            if existing:
                # 既存種目の更新
                existing.muscle_group = exercise_data["muscle_group"]
                existing.exercise_type = exercise_data["exercise_type"]
                updated_count += 1
                print(f"更新: {exercise_data['name']}")
            else:
                # 新しい種目の追加
                exercise = Exercise(
                    name=exercise_data["name"],
                    muscle_group=exercise_data["muscle_group"],
                    exercise_type=exercise_data["exercise_type"],
                    is_builtin=True,
                    user_id=None
                )
                db.add(exercise)
                added_count += 1
                print(f"追加: {exercise_data['name']}")
        
        db.commit()
        print(f"\n内蔵種目の更新が完了しました:")
        print(f"- 更新: {updated_count}個")
        print(f"- 追加: {added_count}個")
        print("※ユーザーの独自種目とワークアウトデータは保持されました")
        
    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
    finally:
        db.close()

def show_builtin_exercises():
    """現在の内蔵種目を表示"""
    db = SessionLocal()
    
    try:
        exercises = db.query(Exercise).filter(Exercise.is_builtin == True).order_by(Exercise.exercise_type, Exercise.name).all()
        
        if not exercises:
            print("内蔵種目がありません")
            return
        
        print(f"\n現在の内蔵種目 ({len(exercises)}個):")
        print("-" * 50)
        
        current_type = None
        for exercise in exercises:
            if exercise.exercise_type != current_type:
                current_type = exercise.exercise_type
                type_name = "筋力トレーニング" if current_type == "strength" else "有酸素運動"
                print(f"\n[{type_name}]")
            
            print(f"  {exercise.name} ({exercise.muscle_group})")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "update":
            print("内蔵種目を更新中...")
            update_builtin_exercises()
        elif command == "show" or command == "list":
            show_builtin_exercises()
        elif command == "help":
            print("\n使用方法:")
            print("  python seed_data.py          # 初回作成（既存の場合はスキップ）")
            print("  python seed_data.py update   # 内蔵種目を更新（データ保持）")
            print("  python seed_data.py show     # 現在の内蔵種目を表示")
            print("  python seed_data.py help     # このヘルプを表示")
        else:
            print(f"不明なコマンド: {command}")
            print("使用可能なコマンド: update, show, help")
    else:
        # デフォルト動作（初回作成）
        print("内蔵種目を作成中...")
        create_builtin_exercises()