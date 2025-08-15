import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">MyFit App にログインしてください</p>
          <Button
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            ログイン
        </Button>
        </CardContent>
      </Card>
    </div>
  )
}