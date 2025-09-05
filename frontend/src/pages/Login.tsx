import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from '../lib/schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'


export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const { login, signup, isLoginLoading, isSignupLoading, loginError, signupError } = useAuth()

  // ログインフォーム
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // サインアップフォーム
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // ログイン処理
  const handleLogin = async (data: LoginFormData) => {
    await login(data)
  }

  // サインアップ処理
  const handleSignup = async (data: SignupFormData) => {
    await signup(data)
  }

  // エラーメッセージの表示
  const getErrorMessage = (error: any) => {
    if (error?.response?.data?.detail) {
      return error.response.data.detail
    }
    return 'エラーが発生しました。もう一度お試しください。'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignup ? 'アカウント作成' : 'ログイン'}
          </CardTitle>
          <CardDescription>
            {isSignup 
              ? '新しいアカウントを作成してください' 
              : 'アカウントにログインしてください'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ログインフォーム */}
          {!isSignup && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="パスワード"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <p className="text-sm text-red-600 text-center">
                  {getErrorMessage(loginError)}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoginLoading}
              >
                {isLoginLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>
          )}

          {/* サインアップフォーム */}
          {isSignup && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="パスワード"
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="パスワード確認"
                  {...signupForm.register('confirmPassword')}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {signupError && (
                <p className="text-sm text-red-600 text-center">
                  {getErrorMessage(signupError)}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSignupLoading}
              >
                {isSignupLoading ? 'アカウント作成中...' : 'アカウント作成'}
              </Button>
            </form>
          )}

          {/* フォーム切り替え */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignup 
                ? 'すでにアカウントをお持ちですか？ログイン' 
                : 'アカウントをお持ちでないですか？新規作成'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}