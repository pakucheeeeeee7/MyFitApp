import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutAPI, workoutDetailAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import type { CreateWorkoutRequest } from '../types/workout';

export function useWorkout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 今日のワークアウト取得または作成
  const todayDate = new Date().toISOString().split('T')[0];
  
  const { data: todayWorkout, isLoading } = useQuery({
    queryKey: ['workout', 'today', todayDate],
    queryFn: async () => {
      // 未完了のワークアウトのみ取得
      const workouts = await workoutAPI.getWorkouts(todayDate, todayDate, false);
      const todayWorkout = workouts.data[0];
      
      if (todayWorkout) {
        // 詳細情報を取得
        const detailed = await workoutDetailAPI.getWorkout(todayWorkout.id);
        return detailed.data;
      }
      return null;
    },
  });

  // ワークアウト作成
  const createWorkoutMutation = useMutation({
    mutationFn: (data: CreateWorkoutRequest) => workoutAPI.createWorkout(data.date, data.note),
    onSuccess: (response: any) => {
      queryClient.setQueryData(['workout', 'today', todayDate], response.data);
    },
  });

  // 種目追加
  const addExerciseMutation = useMutation({
    mutationFn: ({ workoutId, exerciseId, orderIndex }: { 
        workoutId: number; 
        exerciseId: number; 
        orderIndex?: number;
    }) => workoutDetailAPI.addExerciseToWorkout(workoutId, exerciseId, orderIndex),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });

  // ワークアウト完了
  const completeWorkoutMutation = useMutation({
    mutationFn: (workoutId: number) => workoutDetailAPI.completeWorkout(workoutId),
    onSuccess: () => {
      // 今日のワークアウトデータをクリア（新しいワークアウトを開始できるように）
      queryClient.setQueryData(['workout', 'today', todayDate], null);
      // ダッシュボードデータを再取得
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['workout'] });
    },
  });

  const startTodayWorkout = async (note?: string) => {
    if (!todayWorkout) {
      await createWorkoutMutation.mutateAsync({
        date: todayDate,
        note: note || '',
      });
    }
  };

  return {
    todayWorkout,
    isLoading,
    startTodayWorkout,
    addExercise: addExerciseMutation.mutateAsync,
    isCreating: createWorkoutMutation.isPending,
    isAddingExercise: addExerciseMutation.isPending,
    completeWorkout: completeWorkoutMutation.mutateAsync,
    isCompleting: completeWorkoutMutation.isPending,
  };
}