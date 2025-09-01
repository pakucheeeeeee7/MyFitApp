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

  // 最近のワークアウトを取得（一時的に無効化してエラーを回避）
  const {
    data: recentWorkouts,
    isLoading: isWorkoutsLoading,
    error: workoutsError,
  } = useQuery({
    queryKey: ['dashboard', 'recent-workouts'],
    queryFn: () => dashboardAPI.getRecentWorkouts(5).then(res => res.data),
    staleTime: 1000 * 60 * 2,
    enabled: false, // 一時的に無効化
  });

  return {
    stats,
    recentWorkouts: [], // 空のリストを返す
    isLoading: isStatsLoading, // workoutsLoadingを除外
    error: statsError, // workoutsErrorを除外
  };
}