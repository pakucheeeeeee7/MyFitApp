import { useQuery } from '@tanstack/react-query';
import { advancedAnalyticsAPI } from '../lib/api';
import type { AdvancedAnalytics } from '../types/profile';

export const useAdvancedAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'advanced-summary'],
    queryFn: async () => {
      const response = await advancedAnalyticsAPI.getAdvancedSummary();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効
  });
};

export const useAdvancedAnalyticsWithCalculations = () => {
  const { data: analytics, isLoading, error } = useAdvancedAnalytics();
  
  // 追加の計算やデータ変換
  const calculations = {
    // BMI カテゴリーの判定
    getBMICategory: (bmi: number | null) => {
      if (!bmi) return '不明';
      if (bmi < 18.5) return '低体重';
      if (bmi < 25) return '標準';
      if (bmi < 30) return '肥満(1度)';
      if (bmi < 35) return '肥満(2度)';
      return '肥満(3度)';
    },
    
    // BMI に基づく色の取得
    getBMIColor: (bmi: number | null) => {
      if (!bmi) return 'text-gray-500';
      if (bmi < 18.5) return 'text-blue-500';
      if (bmi < 25) return 'text-green-500';
      if (bmi < 30) return 'text-yellow-500';
      return 'text-red-500';
    },
    
    // 体重変化のトレンド表示
    getWeightTrend: (change: number | null) => {
      if (change === null || change === 0) return { text: '変化なし', color: 'text-gray-500', icon: '→' };
      if (change > 0) return { text: `+${change.toFixed(1)}kg`, color: 'text-red-500', icon: '↗' };
      return { text: `${change.toFixed(1)}kg`, color: 'text-blue-500', icon: '↘' };
    },
    
    // カロリー推奨の取得
    getCalorieRecommendation: (bmr: number | null, goalType: 'maintain' | 'lose' | 'gain' = 'maintain') => {
      if (!bmr) return null;
      const multipliers = {
        maintain: 1.5, // 軽い運動
        lose: 1.3,     // 減量目標
        gain: 1.7,     // 増量目標
      };
      return Math.round(bmr * multipliers[goalType]);
    },
  };
  
  return {
    analytics,
    isLoading,
    error,
    calculations,
  };
};
