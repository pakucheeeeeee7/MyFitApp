import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseAPI } from '../lib/api';
import type { Exercise } from '../types/workout';

interface CreateExerciseRequest {
  name: string;
  muscle_group: string;
}

export function useExercises() {
  const queryClient = useQueryClient();

  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseAPI.getExercises().then((res: any) => res.data),
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
  });

  const createMutation = useMutation({
    mutationFn: (exerciseData: CreateExerciseRequest) => 
      exerciseAPI.createExercise(exerciseData.name, exerciseData.muscle_group).then((res: any) => res.data),
    onSuccess: () => {
      // 種目リストを再取得
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  // 筋肉部位別にグループ化
  const exercisesByMuscleGroup = exercises?.reduce((acc: Record<string, Exercise[]>, exercise: Exercise) => {
    if (!acc[exercise.muscle_group]) {
      acc[exercise.muscle_group] = [];
    }
    acc[exercise.muscle_group].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>) || {};

  return {
    exercises: exercises || [],
    exercisesByMuscleGroup,
    isLoading,
    error,
    createExercise: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}