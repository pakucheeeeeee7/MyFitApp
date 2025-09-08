import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutDetailAPI } from '@/lib/api';
import type { CreateSetRequest, OneRepMax } from '../types/workout';

export function useSets() {
  const queryClient = useQueryClient();

  // セット追加
  const addSetMutation = useMutation({
    mutationFn: ({ workoutExerciseId, setData }: { 
      workoutExerciseId: number; 
      setData: CreateSetRequest;
    }) => workoutDetailAPI.addSetToExercise(workoutExerciseId, setData),
    onSuccess: () => {
      // より積極的なクエリ更新でリアルタイム表示を確保
      queryClient.invalidateQueries({ queryKey: ['workout'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // データを強制的に再取得
      const today = new Date().toISOString().split('T')[0];
      queryClient.refetchQueries({ queryKey: ['workout', 'date', today] });
    },
  });

  // セット削除
  const deleteSetMutation = useMutation({
    mutationFn: (setId: number) => workoutDetailAPI.deleteSet(setId),
    onSuccess: () => {
      // より積極的なクエリ更新でリアルタイム表示を確保
      queryClient.invalidateQueries({ queryKey: ['workout'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // データを強制的に再取得
      const today = new Date().toISOString().split('T')[0];
      queryClient.refetchQueries({ queryKey: ['workout', 'date', today] });
    },
  });

  // 1RM計算（Epley式）
  const calculateOneRepMax = (weight: number, reps: number): OneRepMax => {
    if (reps === 1) {
      return { weight, formula: 'Actual' };
    }
    const estimatedMax = weight * (1 + reps / 30);
    return {
      weight: Math.round(estimatedMax * 10) / 10,
      formula: 'Epley',
    };
  };

  return {
    addSet: addSetMutation.mutateAsync,
    deleteSet: deleteSetMutation.mutateAsync,
    calculateOneRepMax,
    isAdding: addSetMutation.isPending,
    isDeleting: deleteSetMutation.isPending,
  };
}