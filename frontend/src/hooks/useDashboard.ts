import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, workoutAPI } from '../lib/api';

interface UseDashboardOptions {
  month?: string; // YYYY-MM形式
}

export function useDashboard(options: UseDashboardOptions = {}) {
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
    enabled: !options.month, // 月が指定されていない場合のみ実行
  });

  // 月ごとのワークアウトを取得（カレンダー表示用）
  const {
    data: monthlyWorkouts,
    isLoading: isMonthlyLoading,
    error: monthlyError,
  } = useQuery({
    queryKey: ['dashboard', 'monthly-workouts', options.month],
    queryFn: async () => {
      if (!options.month) return [];
      const [year, month] = options.month.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      
      const response = await workoutAPI.getWorkouts(startDate, endDate, true); // 全ワークアウト取得
      // カレンダーには完了済みワークアウトのみ表示
      return response.data.filter(workout => workout.is_completed);
    },
    enabled: !!options.month,
    staleTime: 1000 * 60 * 5,
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