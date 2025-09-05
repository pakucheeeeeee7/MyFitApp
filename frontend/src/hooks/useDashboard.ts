import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../lib/api';

export function useDashboard() {
  // 統計データを取得
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardAPI.getStats().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  // 最近のワークアウトを取得
  const {
    data: recentWorkouts,
    isLoading: isWorkoutsLoading,
    error: workoutsError,
  } = useQuery({
    queryKey: ['dashboard', 'recent-workouts'],
    queryFn: () => dashboardAPI.getRecentWorkouts(5).then(res => res.data),
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats,
    recentWorkouts: recentWorkouts || [],
    isLoading: isStatsLoading || isWorkoutsLoading,
    error: statsError || workoutsError,
  };
}