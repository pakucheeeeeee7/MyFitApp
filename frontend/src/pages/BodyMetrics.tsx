import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bodyMetricSchema, type BodyMetricFormData } from '../lib/schemas';
import { useBodyMetricsForm } from '../hooks/useBodyMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Layout } from '../components/layout/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Scale, TrendingUp, Calendar, NotebookPen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BodyMetricsPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, isLoading, createMetric, isCreating } = useBodyMetricsForm();
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<BodyMetricFormData>({
    resolver: zodResolver(bodyMetricSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // 今日の日付をデフォルト
      body_weight: undefined, // 体重が主要項目
      body_fat_percent: undefined, // 体脂肪率は任意
      note: '',
    },
  });

  const onSubmit = async (data: BodyMetricFormData) => {
    try {
      // 同じ日付の記録があるかチェック
      const selectedDate = new Date(data.date).toDateString();
      const existingRecord = metrics.find(metric => 
        new Date(metric.date).toDateString() === selectedDate
      );
      
      if (existingRecord) {
        const confirmOverwrite = window.confirm(
          `${new Date(data.date).toLocaleDateString('ja-JP')}の記録が既に存在します。\n上書きしますか？`
        );
        if (!confirmOverwrite) {
          return;
        }
      }

      await createMetric({
        date: new Date(data.date).toISOString(), // 選択された日付を使用
        body_weight: data.body_weight || null,
        body_fat_percent: data.body_fat_percent || null,
        note: data.note || null,
      });
      
      // フォームをリセットして閉じる
      form.reset({
        date: new Date().toISOString().split('T')[0], // 今日の日付にリセット
        body_weight: undefined,
        body_fat_percent: undefined,
        note: '',
      });
      setShowForm(false);
    } catch (error) {
      // エラーはtoastで表示される
    }
  };

  // グラフ用のデータ変換
  const chartData = metrics
    .filter(metric => metric.body_weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(metric => ({
      date: new Date(metric.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weight: metric.body_weight,
      bodyFat: metric.body_fat_percent,
    }));

  // BMI計算（最新の身長が必要な場合は実装時に追加）
  const calculateBMI = (weight: number, height: number = 170) => {
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">体重記録を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ナビゲーションヘッダー */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Button>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            <Scale className="h-4 w-4" />
            {showForm ? '入力フォームを閉じる' : '体重を記録'}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Scale className="h-8 w-8" />
          体重・体脂肪率記録
        </h1>
        <p className="text-muted-foreground mt-2">
          定期的な記録で健康管理とトレーニング効果を可視化
        </p>
      </div>

      {/* 新規記録フォーム */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5" />
              体重記録
            </CardTitle>
            <CardDescription>
              日付を選択して体重を記録しましょう（体脂肪率は任意）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 日付選択 */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  記録日 <span className="text-red-500 text-sm">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="date"
                    type="date"
                    {...form.register('date')}
                    max={new Date().toISOString().split('T')[0]} // 今日まで選択可能
                    min={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 1年前まで選択可能
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('date', new Date().toISOString().split('T')[0])}
                    className="px-3"
                  >
                    今日
                  </Button>
                </div>
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.date.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  💡 過去1年分の記録が可能です。記録し忘れた日も追加できます。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 体重入力 */}
                <div className="space-y-2">
                  <Label htmlFor="body_weight" className="flex items-center gap-2">
                    体重 (kg) <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input
                    id="body_weight"
                    type="number"
                    step="0.1"
                    placeholder="例: 70.5"
                    {...form.register('body_weight', { 
                      setValueAs: (value) => value === '' ? undefined : parseFloat(value)
                    })}
                  />
                  {form.formState.errors.body_weight && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.body_weight.message}
                    </p>
                  )}
                </div>

                {/* 体脂肪率入力 */}
                <div className="space-y-2">
                  <Label htmlFor="body_fat_percent" className="flex items-center gap-2">
                    体脂肪率 (%) <span className="text-gray-400 text-sm">任意</span>
                  </Label>
                  <Input
                    id="body_fat_percent"
                    type="number"
                    step="0.1"
                    placeholder="例: 15.5（測定時のみ）"
                    {...form.register('body_fat_percent', { 
                      setValueAs: (value) => value === '' ? undefined : parseFloat(value)
                    })}
                  />
                  {form.formState.errors.body_fat_percent && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.body_fat_percent.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    💡 体組成計がない場合は空欄でOKです
                  </p>
                </div>
              </div>

              {/* メモ入力 */}
              <div className="space-y-2">
                <Label htmlFor="note">メモ（任意）</Label>
                <Textarea
                  id="note"
                  placeholder="例: 朝食後、トレーニング前など..."
                  rows={3}
                  {...form.register('note')}
                />
                {form.formState.errors.note && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.note.message}
                  </p>
                )}
              </div>

              {/* 保存ボタン */}
              <Button 
                type="submit" 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreating ? '記録中...' : '記録を保存'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 体重変化グラフ */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              体重変化グラフ
            </CardTitle>
            <CardDescription>
              過去の記録から体重の変化を可視化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'weight' ? 'kg' : '%'}`,
                      name === 'weight' ? '体重' : '体脂肪率'
                    ]}
                    labelFormatter={(label) => `日付: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  {chartData.some(d => d.bodyFat) && (
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 記録一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            記録履歴
          </CardTitle>
          <CardDescription>
            これまでの体重・体脂肪率記録
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">まだ記録がありません</p>
              <p className="text-sm">
                まずは体重だけでも記録してみましょう！<br />
                体脂肪率は測定できる時に追加すればOKです。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 新しい日付順
                .map((metric) => (
                <div 
                  key={metric.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(metric.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </div>
                    <div className="space-x-3">
                      {metric.body_weight && (
                        <span className="text-lg font-semibold text-blue-600">
                          {metric.body_weight}kg
                        </span>
                      )}
                      {metric.body_fat_percent && (
                        <span className="text-sm text-orange-600 font-medium">
                          体脂肪率: {metric.body_fat_percent}%
                        </span>
                      )}
                      {!metric.body_weight && !metric.body_fat_percent && (
                        <span className="text-sm text-muted-foreground">
                          記録なし
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {metric.body_weight && (
                      <div className="text-sm text-muted-foreground">
                        BMI: {calculateBMI(metric.body_weight)}
                      </div>
                    )}
                    {metric.note && (
                      <div className="text-sm text-muted-foreground mt-1">
                        📝 {metric.note}
                      </div>
                    )}
                    {metric.body_weight && !metric.body_fat_percent && (
                      <div className="text-xs text-gray-400 mt-1">
                        体重のみ記録
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyMetricsPage;
