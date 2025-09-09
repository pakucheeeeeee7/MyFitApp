import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Flame } from 'lucide-react';
import { useWorkoutDetails } from '../../hooks/useWorkoutDetails';
import type { Workout } from '../../types/workout';
import { calculateOptimalCalories } from '../../lib/calorieCalculations';
import { useCurrentWeight } from '../../hooks/useCurrentWeight';

interface WorkoutDetailModalProps {
  workouts: Workout[];
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onWorkoutSelect: (workoutId: number) => void;
}

export function WorkoutDetailModal({ 
  workouts, 
  date, 
  isOpen, 
  onClose, 
  onWorkoutSelect 
}: WorkoutDetailModalProps) {
  const workoutIds = workouts.map(w => w.id);
  const { data: detailedWorkouts, isLoading } = useWorkoutDetails(workoutIds);
  const currentWeight = useCurrentWeight();

  if (!isOpen) return null;

  // ワークアウトの推定消費カロリーを計算
  const calculateWorkoutCalories = (workout: Workout) => {
    if (!workout.workout_exercises) return 0;

    let totalCalories = 0;

    workout.workout_exercises.forEach(workoutExercise => {
      if (!workoutExercise.sets || workoutExercise.sets.length === 0) return;

      // セットデータの集計
      const totalDuration = workoutExercise.sets.reduce((sum, set) => sum + (set.duration_seconds || 0), 0);
      const totalDistance = workoutExercise.sets.reduce((sum, set) => sum + (set.distance_km || 0), 0);
      const totalWeight = workoutExercise.sets.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0);
      const totalReps = workoutExercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
      const avgHeartRate = workoutExercise.sets.reduce((sum, set) => sum + (set.avg_heart_rate || 0), 0) / workoutExercise.sets.length;

      // 筋トレの場合はデフォルトで時間を推定（10分/セット）
      const estimatedDuration = workoutExercise.exercise?.exercise_type === 'strength' && totalDuration === 0
        ? workoutExercise.sets.length * 600 // 10分/セット
        : totalDuration;

      // カロリー計算
      const calories = calculateOptimalCalories({
        weight: currentWeight,
        duration: estimatedDuration,
        distance: totalDistance,
        avgHeartRate: avgHeartRate > 0 ? avgHeartRate : undefined,
        exerciseType: workoutExercise.exercise?.exercise_type || 'strength',
        exerciseName: workoutExercise.exercise?.name,
        totalWeight,
        totalReps,
      });

      totalCalories += calories;
    });

    return totalCalories;
  };

  // 日全体の総カロリーを計算
  const totalDayCalories = detailedWorkouts?.reduce((total, workout) => {
    return total + calculateWorkoutCalories(workout);
  }, 0) || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    // 作成日時から時刻を抽出（実際のワークアウト時刻の代用）
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start sm:items-center mb-4 gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">ワークアウト詳細</h2>
              <p className="text-gray-600 text-sm sm:text-base">{formatDate(date)}</p>
              {totalDayCalories > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 font-medium text-sm sm:text-base">
                    <span className="hidden sm:inline">推定消費カロリー: </span>
                    <span className="sm:hidden">合計: </span>
                    {totalDayCalories}kcal
                  </span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={onClose} size="sm">
              ✕
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">ワークアウト詳細を読み込み中...</p>
            </div>
          ) : !detailedWorkouts || detailedWorkouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              この日のワークアウトはありません
            </p>
          ) : (
            <div className="space-y-4">
              {detailedWorkouts.map((workout, index) => (
                <Card key={workout.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg">
                          ワークアウト #{index + 1}
                        </CardTitle>
                        {(() => {
                          const workoutCalories = calculateWorkoutCalories(workout);
                          return workoutCalories > 0 ? (
                            <div className="flex items-center gap-1 mt-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-sm text-orange-600 font-medium">
                                {workoutCalories}kcal
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex items-center gap-2 justify-start sm:justify-end">
                        <Badge variant={workout.is_completed ? "default" : "secondary"} className="text-xs">
                          {workout.is_completed ? "完了" : "未完了"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTime(workout.date)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workout.note && (
                      <p className="text-gray-600 mb-3">{workout.note}</p>
                    )}
                    
                    {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-gray-700">実施種目:</h4>
                        <div className="space-y-3">
                          {workout.workout_exercises.map((we, idx) => {
                            const isCardio = we.exercise.exercise_type === 'cardio';
                            
                            // この種目のカロリーを計算
                            const exerciseCalories = (() => {
                              if (!we.sets || we.sets.length === 0) return 0;

                              const totalDuration = we.sets.reduce((sum, set) => sum + (set.duration_seconds || 0), 0);
                              const totalDistance = we.sets.reduce((sum, set) => sum + (set.distance_km || 0), 0);
                              const totalWeight = we.sets.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0);
                              const totalReps = we.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
                              const avgHeartRate = we.sets.reduce((sum, set) => sum + (set.avg_heart_rate || 0), 0) / we.sets.length;

                              const estimatedDuration = we.exercise?.exercise_type === 'strength' && totalDuration === 0
                                ? we.sets.length * 600
                                : totalDuration;

                              return calculateOptimalCalories({
                                weight: currentWeight,
                                duration: estimatedDuration,
                                distance: totalDistance,
                                avgHeartRate: avgHeartRate > 0 ? avgHeartRate : undefined,
                                exerciseType: we.exercise?.exercise_type || 'strength',
                                exerciseName: we.exercise?.name,
                                totalWeight,
                                totalReps,
                              });
                            })();
                            
                            return (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2 gap-2">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                                    <Badge variant="outline" className="shrink-0">
                                      {we.exercise.name}
                                    </Badge>
                                    <span className="text-xs text-gray-500 hidden sm:inline">
                                      ({we.exercise.muscle_group})
                                    </span>
                                    <span className="text-xs text-gray-500 sm:hidden truncate">
                                      {we.exercise.muscle_group}
                                    </span>
                                    {isCardio && (
                                      <>
                                        {/* スマホ表示 */}
                                        <Badge variant="secondary" className="text-xs sm:hidden">
                                          有酸素
                                        </Badge>
                                        {/* PC表示 */}
                                        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                                          有酸素運動
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                  {exerciseCalories > 0 && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Flame className="h-3 w-3 text-orange-500" />
                                      <span className="text-xs text-orange-600 font-medium">
                                        {exerciseCalories}kcal
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {we.sets && we.sets.length > 0 ? (
                                  <div className="space-y-1">
                                    {we.sets.map((set, setIdx) => (
                                      <div key={setIdx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span className="font-medium shrink-0">セット{set.set_index}:</span>
                                          {isCardio ? (
                                            <div className="flex flex-wrap items-center gap-1 text-xs">
                                              {set.duration_seconds && (
                                                <span className="bg-blue-100 px-1 rounded">
                                                  {Math.floor(set.duration_seconds / 60)}:{(set.duration_seconds % 60).toString().padStart(2, '0')}
                                                </span>
                                              )}
                                              {set.distance_km && (
                                                <span className="bg-green-100 px-1 rounded">
                                                  {set.distance_km}km
                                                </span>
                                              )}
                                              {set.incline_percent && (
                                                <span className="bg-yellow-100 px-1 rounded">
                                                  {set.incline_percent}%
                                                </span>
                                              )}
                                              {set.avg_heart_rate && (
                                                <span className="bg-red-100 px-1 rounded">
                                                  {set.avg_heart_rate}bpm
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="bg-gray-100 px-1 rounded">
                                              {set.weight}kg × {set.reps}回
                                              {set.rpe && ` (RPE ${set.rpe})`}
                                            </span>
                                          )}
                                          {set.is_warmup && (
                                            <span className="bg-yellow-200 text-yellow-800 px-1 rounded text-xs">[W]</span>
                                          )}
                                        </div>
                                        {set.note && (
                                          <div className="mt-1 text-gray-500 italic text-xs break-words">
                                            {set.note}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">セットが記録されていません</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">種目が登録されていません</p>
                    )}

                    {!workout.is_completed && (
                      <div className="mt-4">
                        <Button 
                          variant="outline"
                          onClick={() => onWorkoutSelect(workout.id)}
                          className="w-full"
                        >
                          続きを記録
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
