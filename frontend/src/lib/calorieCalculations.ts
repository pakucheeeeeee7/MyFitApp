// カロリー計算ユーティリティ関数

export interface CalorieCalculationParams {
  weight?: number; // 体重（kg）
  duration?: number; // 時間（秒）
  distance?: number; // 距離（km）
  avgHeartRate?: number; // 平均心拍数
  exerciseType: 'strength' | 'cardio';
  exerciseName?: string;
}

// METs値の参考データ（2024 Compendium of Physical Activities準拠）
const METS_VALUES: Record<string, number> = {
  // 筋トレ系 - より現実的な値に調整
  'ベンチプレス': 3.5,
  'スクワット': 5.0,
  'デッドリフト': 5.0,
  'プルアップ': 6.0,
  'ショルダープレス': 3.5,
  'バーベルロウ': 3.5,
  'レッグプレス': 3.5,
  'チェストフライ': 3.5,
  'ラットプルダウン': 3.5,
  'レッグカール': 3.0,
  'レッグエクステンション': 3.0,
  'ダンベルカール': 3.0,
  '筋トレ': 3.5, // デフォルト値（複数エクササイズ、8-15レップス）

  // 有酸素系
  'ランニング': 8.0,
  'ジョギング': 7.0,
  'ウォーキング': 3.5,
  'サイクリング': 7.5,
  'エリプティカル': 5.0,
  '水泳': 8.0,
  'ローイング': 7.0,
  '有酸素運動': 6.0, // デフォルト値
};

/**
 * 基礎代謝率から推定消費カロリーを計算
 * カロリー = METs値 × 体重(kg) × 時間(h)
 */
export function calculateCaloriesByMETs(params: CalorieCalculationParams): number {
  const { weight = 70, duration = 0, exerciseName, exerciseType } = params;
  
  const hours = duration / 3600; // 秒を時間に変換
  
  // 種目名からMETs値を取得、なければデフォルト値
  let mets = METS_VALUES[exerciseName || ''] || 
             METS_VALUES[exerciseType === 'strength' ? '筋トレ' : '有酸素運動'];
  
  return Math.round(mets * weight * hours);
}

/**
 * 心拍数ベースのカロリー計算（有酸素運動用）
 * より精密な計算が可能
 */
export function calculateCaloriesByHeartRate(params: CalorieCalculationParams): number {
  const { weight = 70, duration = 0, avgHeartRate } = params;
  
  if (!avgHeartRate || avgHeartRate <= 0) {
    return calculateCaloriesByMETs(params);
  }
  
  const minutes = duration / 60;
  
  // 心拍数ベースの簡易計算式
  // カロリー/分 = (0.6309 × HR + 0.1988 × Weight + 0.2017 × Age - 55.0969) / 4.184
  // 年齢を30歳と仮定
  const caloriesPerMinute = (0.6309 * avgHeartRate + 0.1988 * weight + 0.2017 * 30 - 55.0969) / 4.184;
  
  return Math.max(0, Math.round(caloriesPerMinute * minutes));
}

/**
 * 距離ベースのカロリー計算（ランニング/ウォーキング用）
 */
export function calculateCaloriesByDistance(params: CalorieCalculationParams): number {
  const { weight = 70, distance = 0, duration = 0 } = params;
  
  if (distance <= 0) {
    return calculateCaloriesByMETs(params);
  }
  
  // 簡易計算: 体重(kg) × 距離(km) × 係数
  // ランニング係数: 1.0、ウォーキング係数: 0.5
  const pace = duration > 0 ? distance / (duration / 3600) : 0; // km/h
  const factor = pace > 6 ? 1.0 : 0.6; // 6km/h以上をランニングとみなす
  
  return Math.round(weight * distance * factor);
}

/**
 * 筋トレ用カロリー計算
 * 現実的なMETs値と運動時間を使用
 */
export function calculateStrengthCalories(params: CalorieCalculationParams & {
  totalWeight?: number; // 総重量（kg）
  totalReps?: number; // 総回数
}): number {
  const { duration = 0 } = params;
  
  // セット間の休憩時間を除いた実際の運動時間を想定
  // 実際の運動時間は全体の30-40%程度
  const actualExerciseTime = duration * 0.35;
  
  // 基本的なMETsベース計算（現実的な値）
  const baseCalories = calculateCaloriesByMETs({
    ...params,
    duration: actualExerciseTime
  });
  
  return Math.round(baseCalories);
}

/**
 * 最適なカロリー計算方法を自動選択
 */
export function calculateOptimalCalories(params: CalorieCalculationParams & {
  totalWeight?: number;
  totalReps?: number;
}): number {
  const { exerciseType, avgHeartRate, distance } = params;
  
  if (exerciseType === 'strength') {
    return calculateStrengthCalories(params);
  } else {
    // 有酸素運動の場合、利用可能なデータに応じて最適な方法を選択
    if (avgHeartRate && avgHeartRate > 0) {
      return calculateCaloriesByHeartRate(params);
    } else if (distance && distance > 0) {
      return calculateCaloriesByDistance(params);
    } else {
      return calculateCaloriesByMETs(params);
    }
  }
}
