# 筋トレ管理Webアプリ 要件定義（React + FastAPI）

## 1. 目的と背景
日々の筋トレ内容（種目・セット・重量・回数・RPEなど）を記録し、可視化することで継続を促し、成果を分析できるWebアプリを構築する。将来的にモバイルアプリやウェアラブルとの連携も可能にする。

## 2. 開発方針
- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: FastAPI + Python
- **DB**: 開発ではSQLite、本番はPostgreSQL（Supabase等）
- **UIライブラリ**: Tailwind CSS + shadcn/ui
- **状態管理**: TanStack Query（サーバ状態）、Zustand（UI状態）、React Hook Form + zod（フォーム）
- **グラフ描画**: Recharts
- **認証**: JWTまたはセッショントークン（httpOnly Cookie）
- **デプロイ**: フロント/バックエンドをFly.ioやRailwayにデプロイ

## 3. MVP機能
1. **ユーザー認証**
   - サインアップ、ログイン、ログアウト、パスワードリセット
2. **種目管理**
   - 内蔵種目（ベンチプレス等）とユーザー追加種目
3. **ワークアウト管理**
   - 日付、メモ、種目、セット（重量・回数・RPE）登録
4. **履歴表示**
   - 一覧、カレンダー表示
5. **分析**
   - 種目別のトレーニングボリューム、推定1RM表示（Epley式）

## 4. APIエンドポイント例
```
POST   /auth/signup
POST   /auth/login
GET    /exercises
POST   /exercises
GET    /workouts?from=&to=
POST   /workouts
POST   /workouts/{id}/exercises
POST   /workout-exercises/{id}/sets
GET    /analytics/volume
GET    /analytics/est1rm
```
レスポンスはJSON、型はOpenAPI仕様で自動生成。

## 5. データモデル
```
users(id, email, password_hash, created_at)
exercises(id, user_id, name, muscle_group, is_builtin)
workouts(id, user_id, date, note)
workout_exercises(id, workout_id, exercise_id, order_index)
sets(id, workout_exercise_id, set_index, weight, reps, rpe, is_warmup, note)
body_metrics(id, user_id, date, body_weight, body_fat_percent, note)
```
将来的にpr_recordsやtemplatesなど拡張可能。

## 6. 画面構成
- **ログイン/サインアップ**
- **ダッシュボード**（今週のボリューム、PR、予定）
- **今日のワークアウト**（種目とセット追加）
- **履歴/カレンダー**
- **分析**（推定1RM/ボリュームグラフ）
- **種目管理**

## 7. 開発ロードマップ（4週間）
**Week 1**: 環境構築（Vite, Tailwind, shadcn, QueryClient, Zustand, RHF+zod）、ルーティング設定  
**Week 2**: 認証機能、種目CRUD  
**Week 3**: ワークアウト入力UIとAPI連携、履歴表示  
**Week 4**: 分析グラフ、UI改善、エラーハンドリング、デプロイ

## 8. セキュリティ要件
- CookieはhttpOnly + Secure属性
- CSRF対策（SameSite属性またはCSRFトークン）
- XSS対策（入力サニタイズ、危険なHTML描画禁止）
- パスワードはbcrypt/argon2でハッシュ化

## 9. 成果物
- **フロント**: React SPA（API連携済）
- **バックエンド**: FastAPI（DB接続、認証、分析API）
- **ドキュメント**: OpenAPI仕様書、README、環境構築手順書
