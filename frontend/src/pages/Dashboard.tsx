import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
          >
            ログアウト
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>今週のボリューム</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12,500 kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>今週のワークアウト</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3回</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>今日の予定</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate('/workout')}
              >
                ワークアウト開始
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}