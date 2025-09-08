import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useSets } from '../../hooks/useSets';
import type { SetFormData, Exercise } from '../../types/workout';

interface SetRecordProps {
  workoutExerciseId: number;
  setIndex: number;
  exercise: Exercise;
  onSuccess?: () => void;
}

export function SetRecord({ workoutExerciseId, setIndex, exercise, onSuccess }: SetRecordProps) {
  const [formData, setFormData] = useState<SetFormData>({
    weight: '',
    reps: '',
    rpe: '',
    duration_minutes: '',
    duration_seconds: '',
    distance_km: '',
    incline_percent: '',
    avg_heart_rate: '',
    is_warmup: false,
    note: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAddedSetIndex, setLastAddedSetIndex] = useState<number | null>(null);
  
  const { addSet, isAdding, calculateOneRepMax } = useSets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isCardio = exercise.exercise_type === 'cardio';
    
    let setData: any = {
      is_warmup: formData.is_warmup,
      note: formData.note || undefined,
    };

    if (isCardio) {
      // 有酸素運動の場合
      const minutes = parseInt(formData.duration_minutes) || 0;
      const seconds = parseInt(formData.duration_seconds) || 0;
      const totalSeconds = minutes * 60 + seconds;
      
      setData = {
        ...setData,
        duration_seconds: totalSeconds > 0 ? totalSeconds : undefined,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
        incline_percent: formData.incline_percent ? parseFloat(formData.incline_percent) : undefined,
        avg_heart_rate: formData.avg_heart_rate ? parseInt(formData.avg_heart_rate) : undefined,
      };
    } else {
      // 筋力トレーニングの場合
      setData = {
        ...setData,
        weight: parseFloat(formData.weight),
        reps: parseInt(formData.reps),
        rpe: formData.rpe ? parseInt(formData.rpe) : undefined,
      };
    }

    try {
      await addSet({ workoutExerciseId, setData });
      
      // 追加されたセットのインデックスを記録
      setLastAddedSetIndex(setIndex);
      
      setFormData({
        weight: '',
        reps: '',
        rpe: '',
        duration_minutes: '',
        duration_seconds: '',
        distance_km: '',
        incline_percent: '',
        avg_heart_rate: '',
        is_warmup: false,
        note: '',
      });
      setShowForm(false);
      
      // 成功メッセージを短時間表示
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      onSuccess?.();
    } catch (error) {
      // エラーは上位コンポーネントで処理される
    }
  };

  // 推定1RM計算（筋力トレーニングのみ）
  const estimated1RM = exercise.exercise_type === 'strength' && formData.weight && formData.reps
    ? calculateOneRepMax(parseFloat(formData.weight), parseInt(formData.reps))
    : null;

  const isCardio = exercise.exercise_type === 'cardio';

  if (!showForm) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
          disabled={isAdding}
        >
          {isAdding ? '追加中...' : `セット ${setIndex} を追加`}
        </Button>
        {showSuccess && lastAddedSetIndex && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 text-sm rounded text-center">
            ✓ セット {lastAddedSetIndex} が追加されました
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="mt-2">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCardio ? (
            // 有酸素運動用フォーム
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">時間</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      placeholder="0"
                      className="flex-1"
                    />
                    <span className="text-sm">分</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.duration_seconds}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_seconds: e.target.value }))}
                      placeholder="0"
                      className="flex-1"
                    />
                    <span className="text-sm">秒</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">距離 (km)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance_km: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">傾斜 (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.incline_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, incline_percent: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">平均心拍数</label>
                  <Input
                    type="number"
                    value={formData.avg_heart_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, avg_heart_rate: e.target.value }))}
                    placeholder="任意"
                  />
                </div>
              </div>
            </>
          ) : (
            // 筋力トレーニング用フォーム
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">重量 (kg)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">回数</label>
                  <Input
                    type="number"
                    value={formData.reps}
                    onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">RPE (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rpe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rpe: e.target.value }))}
                    placeholder="任意"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_warmup}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_warmup: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">ウォームアップ</span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">メモ</label>
            <Input
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="任意"
            />
          </div>

          {estimated1RM && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800">
                推定1RM: <strong>{estimated1RM.weight}kg</strong> ({estimated1RM.formula}式)
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isAdding || (isCardio ? false : (!formData.weight || !formData.reps))}
              className="flex-1"
            >
              {isAdding ? '追加中...' : 'セット追加'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}