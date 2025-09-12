import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, workoutAPI } from '../lib/api';

export function useDashboard() {
  // 選択された月を管理
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

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

  // 選択された月のワークアウトを取得（カレンダー表示用）
  const {
    data: monthlyWorkouts,
    isLoading: isMonthlyLoading,
    error: monthlyError,
  } = useQuery({
    queryKey: ['dashboard', 'monthly-workouts', selectedMonth.getFullYear(), selectedMonth.getMonth()],
    queryFn: async () => {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      
      // カレンダー表示のため、前月末と次月初も含める範囲を設定
      const firstDayOfMonth = new Date(year, month, 1);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // カレンダーの開始日（前月の日付含む）
      const startDate = new Date(year, month, 1 - firstDayOfWeek);
      
      // カレンダーの終了日（次月の日付含む）
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const totalDaysFromStart = firstDayOfWeek + daysInMonth;
      const weeksNeeded = Math.ceil(totalDaysFromStart / 7);
      const endDate = new Date(year, month, daysInMonth + (weeksNeeded * 7 - totalDaysFromStart));
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      const response = await workoutAPI.getWorkouts(startDateString, endDateString, true);
      return response.data.filter(workout => workout.is_completed);
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats,
    calorieGoal,
    recentWorkouts,
    monthlyWorkouts,
    selectedMonth,
    setSelectedMonth,
    isLoading: isStatsLoading || isWorkoutsLoading || isMonthlyLoading || isCalorieGoalLoading,
    error: statsError || workoutsError || monthlyError || calorieGoalError,
  };
}