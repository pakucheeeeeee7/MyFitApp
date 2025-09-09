import { useBodyMetrics } from '../hooks/useBodyMetrics';

/**
 * 現在の体重を取得するヘルパー関数
 * 1. 最新の体重記録から取得
 * 2. なければデフォルト値（70kg）を使用
 */
export const useCurrentWeight = (): number => {
  const { data: bodyMetrics } = useBodyMetrics();

  // 最新の体重記録から取得
  if (bodyMetrics && bodyMetrics.length > 0) {
    const latestMetric = bodyMetrics.find(metric => metric.body_weight !== null);
    if (latestMetric?.body_weight) {
      return latestMetric.body_weight;
    }
  }

  // デフォルト値
  return 70;
};
