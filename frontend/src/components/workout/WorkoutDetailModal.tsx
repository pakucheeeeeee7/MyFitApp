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
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">実施種目:</h4>
                        <div className="flex flex-wrap gap-2">
                          {workout.workout_exercises.map((we, idx) => (
                            <Badge key={idx} variant="outline">
                              {we.exercise.name}
                              {we.sets && we.sets.length > 0 && ` (${we.sets.length}セット)`}
                            </Badge>
                          ))}
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
