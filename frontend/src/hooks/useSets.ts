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
      queryClient.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });

  // セット削除
  const deleteSetMutation = useMutation({
    mutationFn: (setId: number) => workoutDetailAPI.deleteSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', 'today'] });
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