import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutExercise } from '../../types/workout';
import { SetRecord } from './SetRecord';
import { useSets } from '@/hooks/useSets';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

export function WorkoutExerciseCard({ workoutExercise }: WorkoutExerciseCardProps) {
  const { deleteSet, calculateOneRepMax, isDeleting } = useSets();
  const { exercise, sets } = workoutExercise;

  // 最大重量セットを見つける
  const maxWeightSet = sets.reduce((max, set) => 
    set.weight > max.weight ? set : max, 
    sets[0] || { weight: 0, reps: 0 }
  );

  const estimated1RM = maxWeightSet ? calculateOneRepMax(maxWeightSet.weight, maxWeightSet.reps) : null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <span>{exercise.name}</span>
            <span className="text-sm text-gray-500 ml-2">({exercise.muscle_group})</span>
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
            {sets.map((set, index) => (
              <div
                key={set.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium">セット {set.set_index}</span>
                  <span>{set.weight}kg × {set.reps}回</span>
                  {set.rpe && <span className="text-sm text-gray-600">RPE {set.rpe}</span>}
                  {set.is_warmup && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      ウォームアップ
                    </span>
                  )}
                  {set.note && (
                    <span className="text-sm text-gray-600">({set.note})</span>
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
        />
      </CardContent>
    </Card>
  );
}