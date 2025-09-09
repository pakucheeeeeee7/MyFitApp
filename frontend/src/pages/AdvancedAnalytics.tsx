import React from 'react';
import { useAdvancedAnalyticsWithCalculations } from '../hooks/useAdvancedAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Layout } from '../components/layout/Layout';
import { 
  Loader2, 
  BarChart3, 
  Heart, 
  Target, 
  TrendingUp,
  Activity,
  Calculator,
  Zap,
  Scale
} from 'lucide-react';

const AdvancedAnalyticsPage: React.FC = () => {
  const { analytics, isLoading, error, calculations } = useAdvancedAnalyticsWithCalculations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">分析データを読み込み中...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold mb-2">分析データがありません</h2>
          <p className="text-muted-foreground mb-4">
            高度分析を行うには、プロフィール設定・身長記録・体重記録が必要です。
          </p>
          <p className="text-sm text-muted-foreground">
            ヘッダーメニューから「プロフィール」や「体重記録」にアクセスできます。
          </p>
        </div>
      </div>
    );
  }

  const weightTrend = calculations.getWeightTrend(analytics.weight_change_30days);
  const bmiCategory = calculations.getBMICategory(analytics.latest_bmi);
  const bmiColor = calculations.getBMIColor(analytics.latest_bmi);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8" />
            高度分析ダッシュボード
          </h1>
          <p className="text-muted-foreground mt-2">
            年齢・性別・体重データに基づく科学的分析結果
          </p>
        </div>

      {/* 基本指標カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 現在の体重 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              現在の体重
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.latest_weight ? `${analytics.latest_weight}kg` : '未記録'}
            </div>
            <div className={`text-sm ${weightTrend.color} flex items-center gap-1`}>
              <span>{weightTrend.icon}</span>
              <span>30日間: {weightTrend.text}</span>
            </div>
          </CardContent>
        </Card>

        {/* BMI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.latest_bmi ? analytics.latest_bmi.toFixed(1) : '--'}
            </div>
            <Badge variant="secondary" className={bmiColor}>
              {bmiCategory}
            </Badge>
          </CardContent>
        </Card>

        {/* 基礎代謝率 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              基礎代謝率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.bmr ? `${Math.round(analytics.bmr)}` : '--'}
            </div>
            <div className="text-sm text-muted-foreground">kcal/日</div>
          </CardContent>
        </Card>

        {/* 年齢・性別 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              プロフィール
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.age ? `${analytics.age}歳` : '--'}
            </div>
            <div className="text-sm text-muted-foreground">
              {analytics.gender === 'male' && '男性'}
              {analytics.gender === 'female' && '女性'}
              {analytics.gender === 'other' && 'その他'}
              {!analytics.gender && '未設定'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 理想体重範囲 */}
      {analytics.ideal_weight_range && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              理想体重範囲
            </CardTitle>
            <CardDescription>
              WHO基準（BMI 18.5-24.9）に基づく健康的な体重範囲
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span>理想体重範囲:</span>
                <span className="font-semibold text-green-600">
                  {analytics.ideal_weight_range.min.toFixed(1)}kg - {analytics.ideal_weight_range.max.toFixed(1)}kg
                </span>
              </div>
              
              {analytics.latest_weight && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{analytics.ideal_weight_range.min.toFixed(1)}kg</span>
                    <span>現在: {analytics.latest_weight}kg</span>
                    <span>{analytics.ideal_weight_range.max.toFixed(1)}kg</span>
                  </div>
                  <Progress 
                    value={Math.min(100, Math.max(0, 
                      ((analytics.latest_weight - analytics.ideal_weight_range.min) / 
                       (analytics.ideal_weight_range.max - analytics.ideal_weight_range.min)) * 100
                    ))}
                    className="h-2"
                  />
                  
                  {analytics.latest_weight < analytics.ideal_weight_range.min && (
                    <p className="text-sm text-blue-600">
                      理想体重まで +{(analytics.ideal_weight_range.min - analytics.latest_weight).toFixed(1)}kg
                    </p>
                  )}
                  {analytics.latest_weight > analytics.ideal_weight_range.max && (
                    <p className="text-sm text-orange-600">
                      理想体重まで -{(analytics.latest_weight - analytics.ideal_weight_range.max).toFixed(1)}kg
                    </p>
                  )}
                  {analytics.latest_weight >= analytics.ideal_weight_range.min && 
                   analytics.latest_weight <= analytics.ideal_weight_range.max && (
                    <p className="text-sm text-green-600">
                      ✅ 理想的な体重範囲内です！
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1日必要カロリー */}
      {analytics.daily_calorie_needs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              1日必要カロリー
            </CardTitle>
            <CardDescription>
              活動レベル別の推奨カロリー摂取量
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">座り仕事中心</div>
                <div className="text-xl font-semibold">{analytics.daily_calorie_needs.sedentary}</div>
                <div className="text-xs text-muted-foreground">kcal/日</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-blue-700 mb-1">軽い運動</div>
                <div className="text-xl font-semibold text-blue-700">{analytics.daily_calorie_needs.light}</div>
                <div className="text-xs text-blue-600">kcal/日 (推奨)</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">中程度の運動</div>
                <div className="text-xl font-semibold">{analytics.daily_calorie_needs.moderate}</div>
                <div className="text-xs text-muted-foreground">kcal/日</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">激しい運動</div>
                <div className="text-xl font-semibold">{analytics.daily_calorie_needs.active}</div>
                <div className="text-xs text-muted-foreground">kcal/日</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">非常に激しい運動</div>
                <div className="text-xl font-semibold">{analytics.daily_calorie_needs.very_active}</div>
                <div className="text-xs text-muted-foreground">kcal/日</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>推奨:</strong> 筋トレを行っている場合は「軽い運動」レベルのカロリー摂取がおすすめです。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析サマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            分析サマリー
          </CardTitle>
          <CardDescription>
            現在のデータに基づく総合評価とアドバイス
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                記録数: <strong>{analytics.total_records}件</strong>
              </span>
            </div>
            
            {analytics.bmi_for_age_category && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm">
                  年齢別BMI判定: <strong>{analytics.bmi_for_age_category}</strong>
                </span>
              </div>
            )}
            
            {analytics.body_fat_trend && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  体脂肪率トレンド: <strong>{analytics.body_fat_trend}</strong>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default AdvancedAnalyticsPage;
