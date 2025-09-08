import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, heightRecordSchema, type ProfileFormData, type HeightRecordFormData } from '../lib/schemas';
import { useProfileForm } from '../hooks/useProfile';
import { useHeightRecords } from '../hooks/useHeightRecords';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { Loader2, User, Calendar, Users, ArrowLeft, Home, Ruler, Plus, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [showHeightForm, setShowHeightForm] = useState(false);
  
  const { profile, isLoading, updateProfile, isUpdating } = useProfileForm(() => {
    // プロフィール更新成功後、2秒後にダッシュボードに戻る
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  });
  
  const { heightRecords, latestHeight, createHeightRecord, isCreating } = useHeightRecords({
    onSuccess: () => {
      setShowHeightForm(false);
      heightForm.reset();
    }
  });
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      birth_date: profile?.birth_date || '',
      gender: profile?.gender || undefined,
    },
  });

  const heightForm = useForm<HeightRecordFormData>({
    resolver: zodResolver(heightRecordSchema),
    defaultValues: {
      height_cm: 0,
      note: '',
    },
  });

  // プロフィールデータが取得できたらフォームに反映
  React.useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || undefined,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        username: data.username?.trim() || null,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
      });
    } catch (error) {
      // エラーはtoastで表示される
    }
  };

  const onHeightSubmit = async (data: HeightRecordFormData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await createHeightRecord({
        height_cm: data.height_cm,
        date: today,
        note: data.note || null,
      });
    } catch (error) {
      // エラーはtoastで表示される
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
            {/* ユーザーネーム入力 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                ユーザーネーム
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="ユーザーネームを入力（3-20文字、省略可）"
                {...form.register('username')}
                className="w-full"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.username.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                ユーザーネームは省略可能です。設定すると表示名として使用されます。
              </p>
            </div>

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

      {/* 身長記録セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              身長記録
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeightForm(!showHeightForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              新しい記録
            </Button>
          </CardTitle>
          <CardDescription>
            BMI計算と高度分析に使用されます（年に数回の更新で十分です）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 最新の身長表示 */}
          {latestHeight ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">現在の身長: {latestHeight.height_cm}cm</p>
                  <p className="text-sm text-muted-foreground">
                    記録日: {new Date(latestHeight.date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              {latestHeight.note && (
                <p className="text-sm mt-2 text-muted-foreground">
                  メモ: {latestHeight.note}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                身長が未記録です。BMI計算と高度分析のために身長を記録してください。
              </p>
            </div>
          )}

          {/* 身長記録フォーム */}
          {showHeightForm && (
            <form onSubmit={heightForm.handleSubmit(onHeightSubmit)} className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm">身長 (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  step="0.1"
                  min="50"
                  max="250"
                  {...heightForm.register('height_cm', { valueAsNumber: true })}
                  placeholder="170.5"
                />
                {heightForm.formState.errors.height_cm && (
                  <p className="text-sm text-red-500">
                    {heightForm.formState.errors.height_cm.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="height_note">メモ（任意）</Label>
                <Textarea
                  id="height_note"
                  {...heightForm.register('note')}
                  placeholder="測定場所や時間など..."
                  rows={2}
                />
                {heightForm.formState.errors.note && (
                  <p className="text-sm text-red-500">
                    {heightForm.formState.errors.note.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? '記録中...' : '身長を記録'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHeightForm(false)}
                  disabled={isCreating}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          )}

          {/* 身長記録履歴 */}
          {heightRecords.length > 1 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">記録履歴</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {heightRecords.slice(1).map((record) => (
                  <div key={record.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <span>{record.height_cm}cm</span>
                      <span className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    {record.note && (
                      <p className="text-muted-foreground mt-1">{record.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* 高度分析への案内 */}
      {profile && latestHeight && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              科学的身体分析を見る
            </CardTitle>
            <CardDescription>
              プロフィール情報と身長記録を使用して、BMI・基礎代謝率・理想体重などの詳細分析を表示します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/analytics')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              高度分析ダッシュボードを見る
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
