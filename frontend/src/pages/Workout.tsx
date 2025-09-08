import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { ExerciseSelector } from '../components/workout/ExerciseSelector';
import { WorkoutExerciseCard } from '../components/workout/WorkoutExerciseCard';
import type { Exercise, WorkoutExercise } from '../types/workout';

export default function Workout() {
  const navigate = useNavigate();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [workoutNote, setWorkoutNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // YYYY-MM-DD形式の今日の日付
  );
  
  const {
    todayWorkout,
    isLoading,
    startTodayWorkout,
    addExercise,
    isCreating,
    isAddingExercise,
    completeWorkout,
    isCompleting,
  } = useWorkout(selectedDate);

  const handleStartWorkout = async () => {
    await startTodayWorkout(workoutNote);
  };
  const handleAddExercise = async (exercise: Exercise) => {
    if (todayWorkout) {
      const orderIndex = (todayWorkout.workout_exercises?.length || 0) + 1;
      await addExercise({ 
        workoutId: todayWorkout.id, 
        exerciseId: exercise.id,
        orderIndex 
      });
    }
  };

  // 選択された日付の表示用フォーマット
  const formatSelectedDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleCompleteWorkout = async () => {
    if (!todayWorkout?.id) return;
    
    try {
      await completeWorkout(todayWorkout.id);
      // 成功時はダッシュボードにナビゲート
      navigate('/dashboard');
    } catch (error) {
      // エラーはtoastで表示される
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">ワークアウト</h1>
            <p className="text-gray-600">{formatSelectedDate(selectedDate)}</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            ダッシュボードに戻る
          </Button>
        </div>

        {/* ワークアウト未開始時 */}
        {!todayWorkout && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ワークアウトを開始</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workout-date" className="block text-sm font-medium mb-1">
                    ワークアウト日付
                  </Label>
                  <Input
                    id="workout-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // 今日以前のみ選択可能
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="workout-note" className="block text-sm font-medium mb-1">
                    ワークアウトメモ（任意）
                  </Label>
                  <Input
                    id="workout-note"
                    value={workoutNote}
                    onChange={(e) => setWorkoutNote(e.target.value)}
                    placeholder="例: 胸筋・三頭筋、調子良い"
                  />
                </div>
                <Button
                  onClick={handleStartWorkout}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'ワークアウト作成中...' : 'ワークアウト開始'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ワークアウト実行中 */}
        {todayWorkout && (
          <>
            {/* ワークアウト情報 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>ワークアウト詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">開始時刻</span>
                    <p className="font-medium">
                      {new Date(todayWorkout.date).toLocaleTimeString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">種目数</span>
                    <p className="font-medium">{todayWorkout.workout_exercises?.length || 0}種目</p>
                  </div>
                  {todayWorkout.note && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">メモ</span>
                      <p className="font-medium">{todayWorkout.note}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 種目一覧 */}
            {todayWorkout.workout_exercises && todayWorkout.workout_exercises.length > 0 && (
              <div className="space-y-4 mb-6">
                {todayWorkout.workout_exercises.map((workoutExercise: any) => (
                  <WorkoutExerciseCard
                    key={workoutExercise.id}
                    workoutExercise={workoutExercise}
                  />
                ))}
              </div>
            )}

            {/* 種目追加ボタン */}
            <Button
              onClick={() => setShowExerciseSelector(true)}
              disabled={isAddingExercise}
              className="w-full mb-6"
            >
              {isAddingExercise ? '種目追加中...' : '種目を追加'}
            </Button>

            {/* ワークアウト完了ボタン - 未完了の場合のみ表示 */}
            {!todayWorkout?.is_completed && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleCompleteWorkout}
                    variant="outline"
                    className="w-full"
                    disabled={isCompleting}
                  >
                    {isCompleting ? '完了処理中...' : 'ワークアウト完了'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 種目選択モーダル */}
        <ExerciseSelector
          isOpen={showExerciseSelector}
          onClose={() => setShowExerciseSelector(false)}
          onSelectExercise={handleAddExercise}
        />
      </div>
    </div>
  );
}