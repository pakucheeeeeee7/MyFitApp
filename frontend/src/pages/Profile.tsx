import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '../lib/schemas';
import { useProfileForm } from '../hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Loader2, User, Calendar, Users, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile, isUpdating } = useProfileForm(() => {
    // プロフィール更新成功後、2秒後にダッシュボードに戻る
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  });
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      birth_date: profile?.birth_date || '',
      gender: profile?.gender || undefined,
    },
  });

  // プロフィールデータが取得できたらフォームに反映
  React.useEffect(() => {
    if (profile) {
      form.reset({
        birth_date: profile.birth_date || '',
        gender: profile.gender || undefined,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        birth_date: data.birth_date || null,
        gender: data.gender || null,
      });
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">プロフィールを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
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
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          ホーム
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="h-8 w-8" />
          プロフィール設定
        </h1>
        <p className="text-muted-foreground mt-2">
          年齢と性別情報で、より正確な身体分析を提供します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            基本情報
          </CardTitle>
          <CardDescription>
            基礎代謝率や理想体重の計算に使用されます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 生年月日入力 */}
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                生年月日
              </Label>
              <Input
                id="birth_date"
                type="date"
                {...form.register('birth_date')}
                className="w-full"
              />
              {form.formState.errors.birth_date && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.birth_date.message}
                </p>
              )}
              {profile?.age && (
                <p className="text-sm text-muted-foreground">
                  現在の年齢: {profile.age}歳
                </p>
              )}
            </div>

            {/* 性別選択 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                性別
              </Label>
              <RadioGroup
                value={form.watch('gender') || ''}
                onValueChange={(value: string) => form.setValue('gender', value as 'male' | 'female' | 'other')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">男性</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">女性</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">その他</Label>
                </div>
              </RadioGroup>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            {/* 保存ボタンとナビゲーション */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? '更新中...' : 'プロフィールを更新'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
                disabled={isUpdating}
              >
                保存せずにダッシュボードに戻る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 現在の設定表示 */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>現在の設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">メールアドレス:</span>
              <span>{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">年齢:</span>
              <span>{profile.age ? `${profile.age}歳` : '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">性別:</span>
              <span>
                {profile.gender === 'male' && '男性'}
                {profile.gender === 'female' && '女性'}
                {profile.gender === 'other' && 'その他'}
                {!profile.gender && '未設定'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">登録日:</span>
              <span>{new Date(profile.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
