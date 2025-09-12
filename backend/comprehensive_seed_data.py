"""
種目データ一括投入システム
training_exercises.mdの内容を体系的にデータベースに投入
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Exercise
import sys

def get_comprehensive_exercises():
    """training_exercises.mdベースの包括的な種目定義"""
    return [
        # 🏋️‍♂️ 胸（Chest）
        
        ## プレス系
        {
            "name": "バーベルベンチプレス",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "バーベル", "target_muscle": "大胸筋",
            "difficulty_level": "中級",
            "angle_options": "フラット,インクライン,デクライン",
            "description": "胸の代表的な種目。大胸筋全体を鍛える"
        },
        {
            "name": "ダンベルベンチプレス",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "ダンベル", "target_muscle": "大胸筋",
            "difficulty_level": "中級",
            "angle_options": "フラット,インクライン,デクライン",
            "description": "可動域が広く、胸筋の発達に効果的"
        },
        {
            "name": "スミスマシンベンチプレス",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "スミスマシン", "target_muscle": "大胸筋",
            "difficulty_level": "初級",
            "description": "軌道が安定しており、初心者にも安全"
        },
        {
            "name": "マシンチェストプレス",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "マシン", "target_muscle": "大胸筋",
            "difficulty_level": "初級",
            "description": "安全性が高く、初心者に最適"
        },
        
        ## フライ系
        {
            "name": "ダンベルフライ",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "フライ系", "equipment_type": "ダンベル", "target_muscle": "大胸筋",
            "difficulty_level": "中級",
            "angle_options": "フラット,インクライン,デクライン",
            "description": "胸筋のストレッチを重視した種目"
        },
        {
            "name": "ケーブルフライ",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "フライ系", "equipment_type": "ケーブル", "target_muscle": "大胸筋",
            "difficulty_level": "中級",
            "angle_options": "ハイ,ミドル,ロウ",
            "description": "様々な角度から胸筋を刺激"
        },
        {
            "name": "ペックデック",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "フライ系", "equipment_type": "マシン", "target_muscle": "大胸筋",
            "difficulty_level": "初級",
            "description": "マシンフライ。安定した軌道で胸筋を鍛える"
        },
        
        ## 自重
        {
            "name": "プッシュアップ",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "自重", "equipment_type": "自重", "target_muscle": "大胸筋",
            "difficulty_level": "初級",
            "variation_options": "通常,ワイド,ナロー,足上げ,加重",
            "description": "いつでもどこでもできる胸の基本種目"
        },
        {
            "name": "ディップス",
            "muscle_group": "胸", "exercise_type": "strength", "is_builtin": True,
            "category": "自重", "equipment_type": "自重", "target_muscle": "大胸筋下部",
            "difficulty_level": "中級",
            "variation_options": "胸寄り,三頭筋寄り,加重",
            "description": "胸の下部と三頭筋に効果的"
        },
        
        # 🏋️‍♂️ 背中（Back）
        
        ## 垂直引き
        {
            "name": "プルアップ",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "垂直引き", "equipment_type": "自重", "target_muscle": "広背筋",
            "difficulty_level": "上級",
            "grip_options": "ワイド,リバース,パラレル",
            "variation_options": "加重,アシスト",
            "description": "背中の代表的な自重種目"
        },
        {
            "name": "ラットプルダウン",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "垂直引き", "equipment_type": "ケーブル", "target_muscle": "広背筋",
            "difficulty_level": "初級",
            "grip_options": "ワイド,リバース,パラレル",
            "description": "プルアップの準備や補助として最適"
        },
        
        ## 水平引き
        {
            "name": "バーベルローイング",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "水平引き", "equipment_type": "バーベル", "target_muscle": "僧帽筋中部",
            "difficulty_level": "中級",
            "grip_options": "オーバー,アンダー",
            "description": "背中の厚みを作る基本種目"
        },
        {
            "name": "ダンベルロー",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "水平引き", "equipment_type": "ダンベル", "target_muscle": "僧帽筋中部",
            "difficulty_level": "初級",
            "variation_options": "片手,両手",
            "description": "片側ずつ集中して鍛えられる"
        },
        {
            "name": "シーテッドロー",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "水平引き", "equipment_type": "ケーブル", "target_muscle": "僧帽筋中部",
            "difficulty_level": "初級",
            "description": "座位で安定した姿勢で実施"
        },
        {
            "name": "Tバーロー",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "水平引き", "equipment_type": "バーベル", "target_muscle": "僧帽筋中部",
            "difficulty_level": "中級",
            "description": "背中の厚みづくりに効果的"
        },
        {
            "name": "チェストサポートロー",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "水平引き", "equipment_type": "マシン", "target_muscle": "僧帽筋中部",
            "difficulty_level": "初級",
            "description": "胸当てがあり、正しいフォームで実施しやすい"
        },
        
        ## その他
        {
            "name": "デッドリフト",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "バーベル", "target_muscle": "脊柱起立筋",
            "difficulty_level": "上級",
            "stance_options": "コンベンショナル,スモウ",
            "description": "BIG3の一つ。全身を鍛える王様種目"
        },
        {
            "name": "ルーマニアンデッドリフト",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "バーベル", "target_muscle": "ハムストリングス",
            "difficulty_level": "中級",
            "description": "ハムストリングスと臀部に重点"
        },
        {
            "name": "グッドモーニング",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "バーベル", "target_muscle": "脊柱起立筋",
            "difficulty_level": "上級",
            "description": "脊柱起立筋とハムストリングスを強化"
        },
        {
            "name": "シュラッグ",
            "muscle_group": "背中", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "バーベル", "target_muscle": "僧帽筋上部",
            "difficulty_level": "初級",
            "description": "僧帽筋上部を集中的に鍛える"
        },
        
        # 🏋️‍♂️ 肩（Shoulders）
        
        ## プレス系
        {
            "name": "ダンベルショルダープレス",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "ダンベル", "target_muscle": "三角筋前部",
            "difficulty_level": "中級",
            "description": "肩の基本的なプレス種目"
        },
        {
            "name": "バーベルショルダープレス",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "バーベル", "target_muscle": "三角筋前部",
            "difficulty_level": "中級",
            "description": "オーバーヘッドプレス。高重量を扱える"
        },
        {
            "name": "アーノルドプレス",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "ダンベル", "target_muscle": "三角筋",
            "difficulty_level": "上級",
            "description": "回転動作が加わった高度なプレス"
        },
        {
            "name": "スミスマシンショルダープレス",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "プレス系", "equipment_type": "スミスマシン", "target_muscle": "三角筋前部",
            "difficulty_level": "初級",
            "description": "軌道が安定したプレス種目"
        },
        
        ## レイズ系
        {
            "name": "サイドレイズ",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "レイズ系", "equipment_type": "ダンベル", "target_muscle": "三角筋中部",
            "difficulty_level": "初級",
            "description": "肩幅を作る代表的な種目"
        },
        {
            "name": "フロントレイズ",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "レイズ系", "equipment_type": "ダンベル", "target_muscle": "三角筋前部",
            "difficulty_level": "初級",
            "description": "三角筋前部を集中的に鍛える"
        },
        {
            "name": "リアレイズ",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "レイズ系", "equipment_type": "ダンベル", "target_muscle": "三角筋後部",
            "difficulty_level": "中級",
            "description": "後ろ肩の発達に重要"
        },
        {
            "name": "ケーブルサイドレイズ",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "レイズ系", "equipment_type": "ケーブル", "target_muscle": "三角筋中部",
            "difficulty_level": "中級",
            "description": "一定の張力でレイズ動作"
        },
        
        ## その他
        {
            "name": "アップライトロー",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "バーベル", "target_muscle": "三角筋",
            "difficulty_level": "中級",
            "description": "肩と僧帽筋を同時に鍛える"
        },
        {
            "name": "フェイスプル",
            "muscle_group": "肩", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "ケーブル", "target_muscle": "三角筋後部",
            "difficulty_level": "中級",
            "description": "後ろ肩と上背部の改善に効果的"
        },
        
        # 🏋️‍♂️ 脚（Legs）
        
        ## 大腿四頭筋
        {
            "name": "バーベルスクワット",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "大腿四頭筋", "equipment_type": "バーベル", "target_muscle": "大腿四頭筋",
            "difficulty_level": "中級",
            "stance_options": "バック,フロント,ボックス",
            "description": "BIG3の一つ。下半身の王様"
        },
        {
            "name": "スミスマシンスクワット",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "大腿四頭筋", "equipment_type": "スミスマシン", "target_muscle": "大腿四頭筋",
            "difficulty_level": "初級",
            "description": "軌道が安定したスクワット"
        },
        {
            "name": "レッグプレス",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "大腿四頭筋", "equipment_type": "マシン", "target_muscle": "大腿四頭筋",
            "difficulty_level": "初級",
            "description": "高重量を安全に扱える"
        },
        {
            "name": "レッグエクステンション",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "大腿四頭筋", "equipment_type": "マシン", "target_muscle": "大腿四頭筋",
            "difficulty_level": "初級",
            "description": "大腿四頭筋を単関節で鍛える"
        },
        
        ## ハムストリングス・臀部
        {
            "name": "ヒップスラスト",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "ハムストリングス・臀部", "equipment_type": "バーベル", "target_muscle": "大臀筋",
            "difficulty_level": "中級",
            "description": "臀部の発達に最も効果的"
        },
        {
            "name": "グルートブリッジ",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "ハムストリングス・臀部", "equipment_type": "自重", "target_muscle": "大臀筋",
            "difficulty_level": "初級",
            "description": "ヒップスラストの自重版"
        },
        {
            "name": "レッグカール",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "ハムストリングス・臀部", "equipment_type": "マシン", "target_muscle": "ハムストリングス",
            "difficulty_level": "初級",
            "variation_options": "ライイング,シーテッド,スタンディング",
            "description": "ハムストリングスを単関節で鍛える"
        },
        
        ## その他
        {
            "name": "ランジ",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "ダンベル", "target_muscle": "大腿四頭筋",
            "difficulty_level": "中級",
            "variation_options": "フロント,バック,ウォーキング,ブルガリアンスクワット",
            "description": "一側ずつ鍛える機能的な種目"
        },
        {
            "name": "ステップアップ",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "ダンベル", "target_muscle": "大腿四頭筋",
            "difficulty_level": "初級",
            "description": "台を使った機能的なトレーニング"
        },
        {
            "name": "カーフレイズ",
            "muscle_group": "脚", "exercise_type": "strength", "is_builtin": True,
            "category": "その他", "equipment_type": "ダンベル", "target_muscle": "腓腹筋",
            "difficulty_level": "初級",
            "variation_options": "スタンディング,シーテッド",
            "description": "ふくらはぎを鍛える基本種目"
        },
        
        # 🏋️‍♂️ 腕（Arms）
        
        ## 上腕二頭筋
        {
            "name": "バーベルカール",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕二頭筋", "equipment_type": "バーベル", "target_muscle": "上腕二頭筋",
            "difficulty_level": "初級",
            "variation_options": "ストレート,EZバー",
            "description": "上腕二頭筋の基本種目"
        },
        {
            "name": "ダンベルカール",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕二頭筋", "equipment_type": "ダンベル", "target_muscle": "上腕二頭筋",
            "difficulty_level": "初級",
            "variation_options": "オルタネイト,インクライン",
            "description": "可動域が広く効果的"
        },
        {
            "name": "コンセントレーションカール",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕二頭筋", "equipment_type": "ダンベル", "target_muscle": "上腕二頭筋",
            "difficulty_level": "中級",
            "description": "集中的に上腕二頭筋を鍛える"
        },
        {
            "name": "プリーチャーカール",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕二頭筋", "equipment_type": "マシン", "target_muscle": "上腕二頭筋",
            "difficulty_level": "中級",
            "description": "プリーチャーベンチを使用"
        },
        {
            "name": "ケーブルカール",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕二頭筋", "equipment_type": "ケーブル", "target_muscle": "上腕二頭筋",
            "difficulty_level": "中級",
            "variation_options": "ロープ,ストレートバー",
            "description": "一定の張力でカール動作"
        },
        
        ## 上腕三頭筋
        {
            "name": "トライセプスプレスダウン",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕三頭筋", "equipment_type": "ケーブル", "target_muscle": "上腕三頭筋",
            "difficulty_level": "初級",
            "variation_options": "ロープ,バー",
            "description": "上腕三頭筋の基本種目"
        },
        {
            "name": "オーバーヘッドエクステンション",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕三頭筋", "equipment_type": "ダンベル", "target_muscle": "上腕三頭筋",
            "difficulty_level": "中級",
            "description": "頭上からのエクステンション"
        },
        {
            "name": "フレンチプレス",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕三頭筋", "equipment_type": "バーベル", "target_muscle": "上腕三頭筋",
            "difficulty_level": "中級",
            "description": "スカルクラッシャーとも呼ばれる"
        },
        {
            "name": "ナローベンチプレス",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕三頭筋", "equipment_type": "バーベル", "target_muscle": "上腕三頭筋",
            "difficulty_level": "中級",
            "description": "胸と三頭筋を同時に鍛える"
        },
        {
            "name": "キックバック",
            "muscle_group": "腕", "exercise_type": "strength", "is_builtin": True,
            "category": "上腕三頭筋", "equipment_type": "ダンベル", "target_muscle": "上腕三頭筋",
            "difficulty_level": "初級",
            "description": "上腕三頭筋の収縮を感じやすい"
        },
        
        # 🏋️‍♂️ 体幹・腹筋（Core）
        
        {
            "name": "クランチ",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "腹直筋", "equipment_type": "自重", "target_muscle": "腹直筋",
            "difficulty_level": "初級",
            "variation_options": "床,マシン,ケーブル",
            "description": "腹筋の基本種目"
        },
        {
            "name": "シットアップ",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "腹直筋", "equipment_type": "自重", "target_muscle": "腹直筋",
            "difficulty_level": "初級",
            "description": "上半身を完全に起こす腹筋運動"
        },
        {
            "name": "レッグレイズ",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "腹直筋下部", "equipment_type": "自重", "target_muscle": "腹直筋下部",
            "difficulty_level": "中級",
            "variation_options": "フロア,ハンギング",
            "description": "下腹部に効果的"
        },
        {
            "name": "アブローラー",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "体幹", "equipment_type": "自重", "target_muscle": "腹直筋",
            "difficulty_level": "上級",
            "description": "腹筋ローラー。強力な体幹トレーニング"
        },
        {
            "name": "プランク",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "体幹", "equipment_type": "自重", "target_muscle": "体幹",
            "difficulty_level": "初級",
            "variation_options": "通常,サイド,加重",
            "description": "体幹安定性を向上させる"
        },
        {
            "name": "ロシアンツイスト",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "腹斜筋", "equipment_type": "自重", "target_muscle": "腹斜筋",
            "difficulty_level": "中級",
            "description": "回転動作で腹斜筋を鍛える"
        },
        {
            "name": "ケーブルウッドチョッパー",
            "muscle_group": "体幹・腹筋", "exercise_type": "strength", "is_builtin": True,
            "category": "腹斜筋", "equipment_type": "ケーブル", "target_muscle": "腹斜筋",
            "difficulty_level": "中級",
            "description": "機能的な回転動作"
        },
        
        # 🏋️‍♂️ 前腕・握力（Forearms）
        
        {
            "name": "リストカール",
            "muscle_group": "前腕・握力", "exercise_type": "strength", "is_builtin": True,
            "category": "前腕屈筋", "equipment_type": "ダンベル", "target_muscle": "前腕屈筋",
            "difficulty_level": "初級",
            "description": "前腕の屈筋を鍛える"
        },
        {
            "name": "リバースリストカール",
            "muscle_group": "前腕・握力", "exercise_type": "strength", "is_builtin": True,
            "category": "前腕伸筋", "equipment_type": "ダンベル", "target_muscle": "前腕伸筋",
            "difficulty_level": "初級",
            "description": "前腕の伸筋を鍛える"
        },
        {
            "name": "ハンマーカール",
            "muscle_group": "前腕・握力", "exercise_type": "strength", "is_builtin": True,
            "category": "前腕", "equipment_type": "ダンベル", "target_muscle": "上腕筋",
            "difficulty_level": "初級",
            "description": "上腕筋と前腕を同時に鍛える"
        },
        {
            "name": "ファーマーズウォーク",
            "muscle_group": "前腕・握力", "exercise_type": "strength", "is_builtin": True,
            "category": "握力", "equipment_type": "ダンベル", "target_muscle": "握力",
            "difficulty_level": "中級",
            "description": "重いものを持って歩く機能的な運動"
        },
        
        # 🏃 有酸素運動（Cardio）
        
        {
            "name": "ランニング",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "自重", "target_muscle": "全身",
            "difficulty_level": "中級",
            "variation_options": "トレッドミル,屋外",
            "description": "最もポピュラーな有酸素運動"
        },
        {
            "name": "ウォーキング",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "自重", "target_muscle": "全身",
            "difficulty_level": "初級",
            "description": "低強度で継続しやすい"
        },
        {
            "name": "エアロバイク",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "マシン", "target_muscle": "下半身",
            "difficulty_level": "初級",
            "description": "膝への負担が少ない"
        },
        {
            "name": "クロストレーナー",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "マシン", "target_muscle": "全身",
            "difficulty_level": "初級",
            "description": "エリプティカル。上下肢を同時に動かす"
        },
        {
            "name": "ローイングマシン",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "マシン", "target_muscle": "全身",
            "difficulty_level": "中級",
            "description": "全身を使う効率的な有酸素運動"
        },
        {
            "name": "ステアクライマー",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "マシン", "target_muscle": "下半身",
            "difficulty_level": "中級",
            "description": "ステップマシン。階段昇降の動作"
        },
        {
            "name": "サーキットトレーニング",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "自重", "target_muscle": "全身",
            "difficulty_level": "中級",
            "description": "筋トレと有酸素を組み合わせる"
        },
        {
            "name": "ジャンプロープ",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "自重", "target_muscle": "全身",
            "difficulty_level": "中級",
            "description": "縄跳び。短時間で高い効果"
        },
        {
            "name": "HIIT",
            "muscle_group": "有酸素運動", "exercise_type": "cardio", "is_builtin": True,
            "category": "有酸素", "equipment_type": "自重", "target_muscle": "全身",
            "difficulty_level": "上級",
            "description": "高強度インターバルトレーニング"
        },
    ]

def create_comprehensive_exercises():
    """包括的な種目データベースを作成"""
    db = SessionLocal()
    
    try:
        # 既存の内蔵種目を削除（クリーンスタート）
        db.query(Exercise).filter(Exercise.is_builtin == True).delete()
        db.commit()
        
        exercises = get_comprehensive_exercises()
        
        created_count = 0
        for exercise_data in exercises:
            # 既存チェック（念のため）
            existing = db.query(Exercise).filter(
                Exercise.name == exercise_data["name"],
                Exercise.is_builtin == True
            ).first()
            
            if not existing:
                exercise = Exercise(**exercise_data)
                db.add(exercise)
                created_count += 1
        
        db.commit()
        print(f"✅ {created_count}件の包括的な種目を作成しました")
        
        # 統計情報の表示
        total_builtin = db.query(Exercise).filter(Exercise.is_builtin == True).count()
        
        # 部位別統計
        muscle_groups = db.query(Exercise.muscle_group).filter(Exercise.is_builtin == True).distinct().all()
        print(f"\\n📊 統計情報:")
        print(f"内蔵種目総数: {total_builtin}件")
        print(f"部位数: {len(muscle_groups)}部位")
        
        for muscle_group in muscle_groups:
            count = db.query(Exercise).filter(
                Exercise.is_builtin == True,
                Exercise.muscle_group == muscle_group[0]
            ).count()
            print(f"  - {muscle_group[0]}: {count}件")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        return False
        
    finally:
        db.close()
    
    return True

def update_comprehensive_exercises():
    """既存の種目データベースを更新"""
    db = SessionLocal()
    
    try:
        exercises = get_comprehensive_exercises()
        
        updated_count = 0
        created_count = 0
        
        for exercise_data in exercises:
            # 既存の種目を検索
            existing = db.query(Exercise).filter(
                Exercise.name == exercise_data["name"],
                Exercise.is_builtin == True
            ).first()
            
            if existing:
                # 更新
                for key, value in exercise_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                updated_count += 1
            else:
                # 新規作成
                exercise = Exercise(**exercise_data)
                db.add(exercise)
                created_count += 1
        
        db.commit()
        print(f"✅ {created_count}件の種目を新規作成、{updated_count}件を更新しました")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        return False
        
    finally:
        db.close()
    
    return True

def list_exercises():
    """現在の種目一覧を表示"""
    db = SessionLocal()
    
    try:
        exercises = db.query(Exercise).filter(Exercise.is_builtin == True).order_by(
            Exercise.muscle_group, Exercise.category, Exercise.name
        ).all()
        
        current_muscle_group = None
        current_category = None
        
        for exercise in exercises:
            if exercise.muscle_group != current_muscle_group:
                print(f"\\n🏋️‍♂️ {exercise.muscle_group}")
                current_muscle_group = exercise.muscle_group
                current_category = None
            
            if exercise.category != current_category:
                print(f"  ## {exercise.category or '未分類'}")
                current_category = exercise.category
            
            # オプション情報の整理
            options = []
            if exercise.angle_options:
                options.append(f"角度: {exercise.angle_options}")
            if exercise.grip_options:
                options.append(f"グリップ: {exercise.grip_options}")
            if exercise.stance_options:
                options.append(f"スタンス: {exercise.stance_options}")
            if exercise.variation_options:
                options.append(f"バリエーション: {exercise.variation_options}")
            
            option_str = f" ({'; '.join(options)})" if options else ""
            print(f"    - {exercise.name} [{exercise.equipment_type}]{option_str}")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "create":
            create_comprehensive_exercises()
        elif command == "update":
            update_comprehensive_exercises()
        elif command == "list":
            list_exercises()
        else:
            print("使用方法:")
            print("  python comprehensive_seed_data.py create  # 新規作成")
            print("  python comprehensive_seed_data.py update  # 更新")
            print("  python comprehensive_seed_data.py list    # 一覧表示")
    else:
        print("コマンドを指定してください: create, update, list")
