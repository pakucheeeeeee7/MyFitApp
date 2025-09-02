import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSets } from '@/hooks/useSets';
import type { SetFormData } from '../../types/workout';

interface SetRecordProps {
  workoutExerciseId: number;
  setIndex: number;
  onSuccess?: () => void;
}

export function SetRecord({ workoutExerciseId, setIndex, onSuccess }: SetRecordProps) {
  const [formData, setFormData] = useState<SetFormData>({
    weight: '',
    reps: '',
    rpe: '',
    is_warmup: false,
    note: '',
  });
  const [showForm, setShowForm] = useState(false);
  
  const { addSet, isAdding, calculateOneRepMax } = useSets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const setData = {
      weight: parseFloat(formData.weight),
      reps: parseInt(formData.reps),
      rpe: formData.rpe ? parseInt(formData.rpe) : undefined,
      is_warmup: formData.is_warmup,
      note: formData.note || undefined,
    };

    try {
      await addSet({ workoutExerciseId, setData });
      setFormData({
        weight: '',
        reps: '',
        rpe: '',
        is_warmup: false,
        note: '',
      });
      setShowForm(false);
      onSuccess?.();
    } catch (error) {
      console.error('セット追加エラー:', error);
    }
  };

  // 推定1RM計算
  const estimated1RM = formData.weight && formData.reps
    ? calculateOneRepMax(parseFloat(formData.weight), parseInt(formData.reps))
    : null;

  if (!showForm) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowForm(true)}
        className="w-full"
      >
        セット {setIndex} を追加
      </Button>
    );
  }

  return (
    <Card className="mt-2">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isAdding || !formData.weight || !formData.reps}
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