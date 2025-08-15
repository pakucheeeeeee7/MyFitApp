import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Workout() {
  const navigate = useNavigate()
    
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">今日のワークアウト</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            ダッシュボードに戻る
          </Button>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ベンチプレス</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">セット 1: 80kg × 8回 RPE 8</p>
            <Button>セット追加</Button>
          </CardContent>
        </Card>
        <Button className="w-full">種目追加</Button>
      </div>
    </div>
  )
}