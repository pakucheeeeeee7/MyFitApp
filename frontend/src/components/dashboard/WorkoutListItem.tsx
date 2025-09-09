import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Flame } from 'lucide-react';
import type { Workout } from '../../types/workout';
import { calculateOptimalCalories } from '../../lib/calorieCalculations';
import { useCurrentWeight } from '../../hooks/useCurrentWeight';

interface WorkoutListItemProps {
  workout: Workout;
  formatDate: (dateString: string) => string;
}

export function WorkoutListItem({ workout, formatDate }: WorkoutListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentWeight = useCurrentWeight();

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // ワークアウト全体の推定消費カロリーを計算
  const calculateWorkoutCalories = () => {
    let totalCalories = 0;

    workout.workout_exercises?.forEach(workoutExercise => {
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

  const workoutCalories = calculateWorkoutCalories();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* メインワークアウト情報 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 hover:bg-gray-50 transition-colors gap-2">
        <div className="min-w-0 flex-grow">
          <div className="font-medium text-gray-900 text-sm sm:text-base">
            {formatDate(workout.date)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1">
            <span>{workout.workout_exercises?.length || 0}種目</span>
            <span>•</span>
            <span>{workout.is_completed ? '完了' : '進行中'}</span>
            {workoutCalories > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-orange-600 font-medium">{workoutCalories}kcal</span>
                </span>
              </>
            )}
          </div>
          {workout.note && (
            <div className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{workout.note}</div>
          )}
        </div>
        
        {/* アクションボタン */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleExpand}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                閉じる
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                詳細
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 展開された詳細情報 */}
      {isExpanded && (
        <div className="border-t bg-gray-50/50 p-3 sm:p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">ワークアウト詳細</h4>
              <div className="text-xs sm:text-sm text-gray-500">
                合計セット数: {workout.workout_exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0}
              </div>
            </div>
            
            {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
              <div className="space-y-3">
                {workout.workout_exercises.map((workoutExercise) => (
                  <div key={workoutExercise.id} className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                          {workoutExercise.exercise?.name || '種目名不明'}
                        </h5>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {workoutExercise.sets?.length || 0}セット
                          </span>
                          {workoutExercise.exercise?.muscle_group && (
                            <>
                              <span className="hidden sm:inline px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {workoutExercise.exercise.muscle_group}
                              </span>
                              <span className="sm:hidden text-xs text-blue-600">
                                {workoutExercise.exercise.muscle_group}
                              </span>
                            </>
                          )}
                          {workoutExercise.exercise?.exercise_type === 'cardio' && (
                            <>
                              <span className="hidden sm:inline px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                有酸素運動
                              </span>
                              <span className="sm:hidden text-xs text-green-600">
                                有酸素
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {workoutExercise.sets && workoutExercise.sets.length > 0 ? (
                      <div className="space-y-2">
                        {/* 筋トレ系の表示 */}
                        {workoutExercise.exercise?.exercise_type === 'strength' ? (
                          <>
                            {/* スマホ表示 */}
                            <div className="sm:hidden space-y-2">
                              {workoutExercise.sets.map((set, index) => (
                                <div key={set.id} className="bg-gray-50 p-2 rounded">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-600">セット {index + 1}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="bg-blue-100 px-2 py-1 rounded">{set.weight || '-'}kg</span>
                                      <span className="bg-green-100 px-2 py-1 rounded">{set.reps || '-'}回</span>
                                    </div>
                                  </div>
                                  {set.note && (
                                    <div className="text-xs text-gray-500 mt-1 break-words">{set.note}</div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* PC表示 */}
                            <div className="hidden sm:block">
                              <div className="grid grid-cols-4 text-xs text-gray-500 font-medium mb-2 px-2">
                                <span>セット</span>
                                <span>重量 (kg)</span>
                                <span>回数</span>
                                <span>メモ</span>
                              </div>
                              {workoutExercise.sets.map((set, index) => (
                                <div key={set.id} className="grid grid-cols-4 text-sm py-2 px-2 rounded hover:bg-gray-50">
                                  <span className="text-gray-600 font-medium">{index + 1}</span>
                                  <span className="text-gray-800">{set.weight || '-'}</span>
                                  <span className="text-gray-800">{set.reps || '-'}</span>
                                  <span className="text-gray-600 text-xs truncate">{set.note || '-'}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* 筋トレ統計 */}
                            <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-2">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">総重量: </span>
                                  <span className="font-medium">
                                    {workoutExercise.sets.reduce((total, set) => 
                                      total + ((set.weight || 0) * (set.reps || 0)), 0
                                    ).toLocaleString()} kg
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">平均重量: </span>
                                  <span className="font-medium">
                                    {workoutExercise.sets.length > 0 
                                      ? (workoutExercise.sets.reduce((total, set) => total + (set.weight || 0), 0) / workoutExercise.sets.length).toFixed(1)
                                      : 0
                                    } kg
                                  </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-orange-600">
                                    <Flame className="h-3 w-3 inline mr-1" />
                                    {(() => {
                                      const totalDuration = workoutExercise.sets.reduce((sum, set) => sum + (set.duration_seconds || 600), 0);
                                      const totalWeight = workoutExercise.sets.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0);
                                      const totalReps = workoutExercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
                                      
                                      return calculateOptimalCalories({
                                        weight: currentWeight,
                                        duration: totalDuration,
                                        exerciseType: 'strength',
                                        exerciseName: workoutExercise.exercise?.name,
                                        totalWeight,
                                        totalReps,
                                      });
                                    })()}kcal
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* 有酸素系の表示 */
                          <>
                            {/* スマホ表示 */}
                            <div className="sm:hidden space-y-2">
                              {workoutExercise.sets.map((set, index) => (
                                <div key={set.id} className="bg-gray-50 p-2 rounded">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-600">セット {index + 1}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {set.duration_seconds && (
                                      <div className="bg-blue-100 px-2 py-1 rounded text-center">
                                        <div className="text-gray-500">時間</div>
                                        <div className="font-medium">
                                          {Math.floor(set.duration_seconds / 60)}:{(set.duration_seconds % 60).toString().padStart(2, '0')}
                                        </div>
                                      </div>
                                    )}
                                    {set.distance_km && (
                                      <div className="bg-green-100 px-2 py-1 rounded text-center">
                                        <div className="text-gray-500">距離</div>
                                        <div className="font-medium">{set.distance_km}km</div>
                                      </div>
                                    )}
                                    {set.avg_heart_rate && (
                                      <div className="bg-red-100 px-2 py-1 rounded text-center">
                                        <div className="text-gray-500">心拍数</div>
                                        <div className="font-medium">{set.avg_heart_rate}bpm</div>
                                      </div>
                                    )}
                                  </div>
                                  {set.note && (
                                    <div className="text-xs text-gray-500 mt-1 break-words">{set.note}</div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* PC表示 */}
                            <div className="hidden sm:block">
                              <div className="grid grid-cols-5 text-xs text-gray-500 font-medium mb-2 px-2">
                                <span>セット</span>
                                <span>時間</span>
                                <span>距離 (km)</span>
                                <span>心拍数</span>
                                <span>メモ</span>
                              </div>
                              {workoutExercise.sets.map((set, index) => (
                                <div key={set.id} className="grid grid-cols-5 text-sm py-2 px-2 rounded hover:bg-gray-50">
                                  <span className="text-gray-600 font-medium">{index + 1}</span>
                                  <span className="text-gray-800">
                                    {set.duration_seconds 
                                      ? `${Math.floor(set.duration_seconds / 60)}:${(set.duration_seconds % 60).toString().padStart(2, '0')}`
                                      : '-'
                                    }
                                  </span>
                                  <span className="text-gray-800">{set.distance_km || '-'}</span>
                                  <span className="text-gray-800">{set.avg_heart_rate || '-'}</span>
                                  <span className="text-gray-600 text-xs truncate">{set.note || '-'}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* 有酸素統計 */}
                            <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-2">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">総時間: </span>
                                  <span className="font-medium">
                                    {(() => {
                                      const totalSeconds = workoutExercise.sets.reduce((total, set) => total + (set.duration_seconds || 0), 0);
                                      const hours = Math.floor(totalSeconds / 3600);
                                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                                      const seconds = totalSeconds % 60;
                                      if (hours > 0) {
                                        return `${hours}h ${minutes}m`;
                                      } else if (minutes > 0) {
                                        return `${minutes}m ${seconds}s`;
                                      } else {
                                        return `${seconds}s`;
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">総距離: </span>
                                  <span className="font-medium">
                                    {workoutExercise.sets.reduce((total, set) => total + (set.distance_km || 0), 0).toFixed(2)} km
                                  </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-orange-600">
                                    <Flame className="h-3 w-3 inline mr-1" />
                                    {(() => {
                                      const totalDuration = workoutExercise.sets.reduce((sum, set) => sum + (set.duration_seconds || 0), 0);
                                      const totalDistance = workoutExercise.sets.reduce((sum, set) => sum + (set.distance_km || 0), 0);
                                      const avgHeartRate = workoutExercise.sets.reduce((sum, set) => sum + (set.avg_heart_rate || 0), 0) / workoutExercise.sets.length;
                                      
                                      return calculateOptimalCalories({
                                        weight: currentWeight,
                                        duration: totalDuration,
                                        distance: totalDistance,
                                        avgHeartRate: avgHeartRate > 0 ? avgHeartRate : undefined,
                                        exerciseType: 'cardio',
                                        exerciseName: workoutExercise.exercise?.name,
                                      });
                                    })()}kcal
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2 text-sm">セットが記録されていません</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">種目が登録されていません</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
