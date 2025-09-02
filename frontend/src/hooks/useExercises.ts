import { useQuery } from '@tanstack/react-query';
import { exerciseAPI } from '@/lib/api';
import type { Exercise } from '../types/workout';

export function useExercises() {
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseAPI.getExercises().then((res: any) => res.data),
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
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
  };
}