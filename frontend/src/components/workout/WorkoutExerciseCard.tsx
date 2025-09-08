import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { WorkoutExercise } from '../../types/workout';
import { SetRecord } from './SetRecord';
import { useSets } from '../../hooks/useSets';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

export function WorkoutExerciseCard({ workoutExercise }: WorkoutExerciseCardProps) {
  const { deleteSet, calculateOneRepMax, isDeleting } = useSets();
  const { exercise, sets } = workoutExercise;

  const isCardio = exercise.exercise_type === 'cardio';

  // 筋力トレーニングの場合のみ最大重量セットを計算
  const maxWeightSet = !isCardio && sets.length > 0 ? sets.reduce((max, set) => 
    (set.weight || 0) > (max.weight || 0) ? set : max, 
    sets[0]
  ) : null;

  const estimated1RM = maxWeightSet && maxWeightSet.weight && maxWeightSet.reps 
    ? calculateOneRepMax(maxWeightSet.weight, maxWeightSet.reps) 
    : null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <span>{exercise.name}</span>
            <span className="text-sm text-gray-500 ml-2">({exercise.muscle_group})</span>
            {isCardio && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">
                有酸素
              </span>
            )}
          </div>
          {estimated1RM && (
            <div className="text-sm text-blue-600">
              推定1RM: {estimated1RM.weight}kg
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 既存セット一覧 */}
        {sets.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium">完了セット</h4>
            {sets.map((set) => (
              <div
                key={set.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium">セット {set.set_index}</span>
                  {isCardio ? (
                    <div className="flex space-x-3">
                      {set.duration_seconds && (
                        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                          {formatDuration(set.duration_seconds)}
                        </span>
                      )}
                      {set.distance_km && (
                        <span className="text-sm bg-green-100 px-2 py-1 rounded">
                          {set.distance_km}km
                        </span>
                      )}
                      {set.incline_percent && (
                        <span className="text-sm bg-yellow-100 px-2 py-1 rounded">
                          {set.incline_percent}%
                        </span>
                      )}
                      {set.avg_heart_rate && (
                        <span className="text-sm bg-red-100 px-2 py-1 rounded">
                          {set.avg_heart_rate}bpm
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>{set.weight}kg × {set.reps}回</span>
                  )}
                  {set.rpe && <span className="text-sm text-gray-600">RPE {set.rpe}</span>}
                  {set.is_warmup && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      ウォームアップ
                    </span>
                  )}
                  {set.note && (
                    <span className="text-sm text-gray-600 italic">{set.note}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSet(set.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800"
                >
                  削除
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 新しいセット追加フォーム */}
        <SetRecord
          workoutExerciseId={workoutExercise.id}
          setIndex={sets.length + 1}
          exercise={exercise}
        />
      </CardContent>
    </Card>
  );
}