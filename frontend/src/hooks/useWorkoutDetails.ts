import { useQuery } from '@tanstack/react-query';
import { workoutDetailAPI } from '../lib/api';

export function useWorkoutDetails(workoutIds: number[]) {
  return useQuery({
    queryKey: ['workout-details', workoutIds],
    queryFn: async () => {
      if (workoutIds.length === 0) return [];
      
      const workoutPromises = workoutIds.map(id => 
        workoutDetailAPI.getWorkout(id).then(res => res.data)
      );
      
      return Promise.all(workoutPromises);
    },
    enabled: workoutIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}
