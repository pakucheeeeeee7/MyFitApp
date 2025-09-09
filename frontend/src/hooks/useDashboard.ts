import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, workoutAPI } from '../lib/api';

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

  // カロリー目標を取得
  const {
    data: calorieGoal,
    isLoading: isCalorieGoalLoading,
    error: calorieGoalError,
  } = useQuery({
    queryKey: ['dashboard', 'calorie-goal'],
    queryFn: () => dashboardAPI.getCalorieGoal().then(res => res.data),
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
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

  // 当月のワークアウトを取得（カレンダー表示用）
  const {
    data: monthlyWorkouts,
    isLoading: isMonthlyLoading,
    error: monthlyError,
  } = useQuery({
    queryKey: ['dashboard', 'monthly-workouts'],
    queryFn: async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await workoutAPI.getWorkouts(startDate, endDate, true);
      return response.data.filter(workout => workout.is_completed);
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats,
    calorieGoal,
    recentWorkouts,
    monthlyWorkouts,
    isLoading: isStatsLoading || isWorkoutsLoading || isMonthlyLoading || isCalorieGoalLoading,
    error: statsError || workoutsError || monthlyError || calorieGoalError,
  };
}