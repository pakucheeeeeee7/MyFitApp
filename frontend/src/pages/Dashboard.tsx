import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useViewMode } from '../hooks/useViewMode';
import { DashboardStatsCards } from '../components/dashboard/DashboardStatsCards';
import { DashboardSettingsModal } from '../components/dashboard/DashboardSettingsModal';
import { WorkoutCalendar } from '../components/workout/WorkoutCalendar';
import { WorkoutListItem } from '../components/dashboard/WorkoutListItem';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, List } from 'lucide-react';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode('dashboard-workout-view', 'list');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { stats, recentWorkouts, monthlyWorkouts, selectedMonth, setSelectedMonth, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ダッシュボードを読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">データの読み込みに失敗しました。ページを再読み込みしてください。</p>
        </div>
      )}

      {/* ページタイトル */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-600 mt-1">今日のトレーニング状況を確認しましょう</p>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="mb-8">
          <DashboardStatsCards 
            stats={stats} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        </div>
      )}

      {/* ワークアウト履歴セクション */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {viewMode === 'calendar' ? 'ワークアウトカレンダー' : '最近のワークアウト'}
          </h2>
          
          {/* ビュー切り替えボタンをここに移動 */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {viewMode === 'list' ? (
                <>
                  <Calendar className="h-4 w-4" />
                  カレンダー表示
                </>
              ) : (
                <>
                  <List className="h-4 w-4" />
                  リスト表示
                </>
              )}
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>最近のワークアウト</CardTitle>
              <CardDescription>
                直近のトレーニング履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentWorkouts && recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {recentWorkouts.map((workout: any) => (
                    <WorkoutListItem
                      key={workout.id}
                      workout={workout}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>まだワークアウトがありません</p>
                  <p className="text-sm mt-1">新しいワークアウトを開始しましょう！</p>
                  <Button
                    onClick={() => navigate('/workout')}
                    className="mt-4"
                  >
                    ワークアウトを開始
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <WorkoutCalendar 
                workouts={monthlyWorkouts || []} 
                onWorkoutClick={(workoutId) => navigate(`/workout-history/${workoutId}`)}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 設定モーダル */}
      <DashboardSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </Layout>
  );
}