import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useViewMode } from '../hooks/useViewMode';
import { useProfile } from '../hooks/useProfile';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { WorkoutCalendar } from '../components/workout/WorkoutCalendar';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const [viewMode, setViewMode] = useViewMode('dashboard-workout-view', 'list');
  
  // 現在の月を取得（カレンダー表示用）
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM形式
  
  const { stats, recentWorkouts, monthlyWorkouts, isLoading, error } = useDashboard(
    viewMode === 'calendar' ? { month: currentMonth } : {}
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // ユーザーネームまたはメールアドレスを表示用に取得
  const displayName = profile?.username || user?.email || 'ユーザー';

  // ダッシュボードのデータ読み込み中（認証は完了済み）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MyFit</h1>
                <p className="text-sm text-gray-600">おかえりなさい、{displayName}さん</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                ログアウト
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">データを読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MyFit</h1>
              <p className="text-sm text-gray-600">おかえりなさい、{displayName}さん</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate('/workout')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ワークアウト開始
              </Button>
              <Button
                onClick={() => navigate('/body-metrics')}
                className="bg-green-600 hover:bg-green-700"
              >
                体重記録
              </Button>
              <Button
                onClick={() => navigate('/analytics')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                高度分析
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
              >
                プロフィール設定
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラー表示 */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">
                データの読み込みに失敗しました。バックエンドが起動していることを確認してください。
              </p>
            </CardContent>
          </Card>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総ワークアウト数</CardDescription>
              <CardTitle className="text-2xl">
                {stats?.total_workouts || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今週のワークアウト</CardDescription>
              <CardTitle className="text-2xl">
                {stats?.this_week_workouts || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総トレーニング量</CardDescription>
              <CardTitle className="text-2xl">
                {stats?.total_volume || 0}kg
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今週のトレーニング量</CardDescription>
              <CardTitle className="text-2xl">
                {stats?.this_week_volume || 0}kg
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 最近のワークアウト */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>最近のワークアウト</CardTitle>
                <CardDescription>
                  {viewMode === 'list' ? '過去5回のワークアウト履歴' : '今月のワークアウト実施状況'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                >
                  リスト
                </Button>
                <Button
                  onClick={() => setViewMode('calendar')}
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                >
                  カレンダー
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'list' ? (
              // リスト表示
              recentWorkouts && recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.map((workout: any) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{formatDate(workout.date)}</p>
                        <p className="text-sm text-gray-600">
                          {workout.workout_exercises?.length || 0}種目
                        </p>
                        {workout.note && (
                          <p className="text-sm text-gray-500 mt-1">
                            {workout.note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/workout/${workout.id}`)}
                      >
                        詳細
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    まだワークアウトの記録がありません
                  </p>
                  <Button
                    onClick={() => navigate('/workout')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    最初のワークアウトを記録する
                  </Button>
                </div>
              )
            ) : (
              // カレンダー表示
              monthlyWorkouts && monthlyWorkouts.length > 0 ? (
                <WorkoutCalendar
                  workouts={monthlyWorkouts}
                  onWorkoutClick={(workoutId) => navigate(`/workout/${workoutId}`)}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    まだワークアウトの記録がありません
                  </p>
                  <Button
                    onClick={() => navigate('/workout')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    最初のワークアウトを記録する
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}