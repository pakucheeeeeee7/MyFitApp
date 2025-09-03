import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { stats, recentWorkouts, isLoading, error } = useDashboard();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // ダッシュボードのデータ読み込み中（認証は完了済み）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MyFit</h1>
                <p className="text-sm text-gray-600">おかえりなさい、{user?.email}</p>
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
              <p className="text-sm text-gray-600">おかえりなさい、{user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate('/workout')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ワークアウト開始
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
            <CardTitle>最近のワークアウト</CardTitle>
            <CardDescription>
              過去5回のワークアウト履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentWorkouts && recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{formatDate(workout.date)}</p>
                      <p className="text-sm text-gray-600">
                        {workout.exercises.length}種目
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}