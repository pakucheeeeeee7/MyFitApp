import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useWorkoutDetails } from '../../hooks/useWorkoutDetails';
import type { Workout } from '../../types/workout';

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

  if (!isOpen) return null;

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
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">ワークアウト詳細</h2>
              <p className="text-gray-600">{formatDate(date)}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
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
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        ワークアウト #{index + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={workout.is_completed ? "default" : "secondary"}>
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
                            
                            return (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">
                                    {we.exercise.name}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    ({we.exercise.muscle_group})
                                  </span>
                                  {isCardio && (
                                    <Badge variant="secondary" className="text-xs">
                                      有酸素
                                    </Badge>
                                  )}
                                </div>
                                
                                {we.sets && we.sets.length > 0 ? (
                                  <div className="space-y-1">
                                    {we.sets.map((set, setIdx) => (
                                      <div key={setIdx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        <span className="font-medium">セット{set.set_index}:</span>
                                        {isCardio ? (
                                          <span className="ml-1">
                                            {set.duration_seconds && `${Math.floor(set.duration_seconds / 60)}:${(set.duration_seconds % 60).toString().padStart(2, '0')}`}
                                            {set.distance_km && ` • ${set.distance_km}km`}
                                            {set.incline_percent && ` • ${set.incline_percent}%`}
                                            {set.avg_heart_rate && ` • ${set.avg_heart_rate}bpm`}
                                          </span>
                                        ) : (
                                          <span className="ml-1">
                                            {set.weight}kg × {set.reps}回
                                            {set.rpe && ` (RPE ${set.rpe})`}
                                          </span>
                                        )}
                                        {set.is_warmup && (
                                          <span className="ml-1 text-yellow-600">[W]</span>
                                        )}
                                        {set.note && (
                                          <span className="ml-1 italic">({set.note})</span>
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
