// 認証フック - ユーザー認証とダッシュボード設定の管理
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authAPI, userSettingsAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData, SignupFormData } from '../lib/schemas';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 認証状態チェック（トークンがある場合のみ）
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.me().then(res => res.data),
    retry: false,
    enabled: !!localStorage.getItem('access_token'), // トークンがある場合のみ実行
    staleTime: 1000 * 60 * 30, // 30分間はキャッシュを使用
    gcTime: 1000 * 60 * 60 * 24, // 24時間キャッシュを保持
  });

  // useEffectでクエリ結果を処理
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error) {
      // トークンが無効な場合はクリア
      localStorage.removeItem('access_token');
      setUser(null);
    }
  }, [userData, error, setUser]);

  // ログイン
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => {
      return authAPI.login(email, password);
    },
    onSuccess: async (response) => {
      // JWTトークンをlocalStorageに保存
      localStorage.setItem('access_token', response.data.access_token);
      
      setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // ダッシュボード設定を同期
      try {
        const settingsResponse = await userSettingsAPI.getSettings();
        if (settingsResponse.data.dashboard_config) {
          // サーバーの設定をlocalStorageにも保存（フォールバック用）
          localStorage.setItem('dashboard-config', JSON.stringify(settingsResponse.data.dashboard_config));
          
          // カスタムイベントを発火してダッシュボード設定を更新
          const event = new CustomEvent('dashboard-config-change', { 
            detail: settingsResponse.data.dashboard_config 
          });
          window.dispatchEvent(event);
        }
      } catch (settingsError) {
        console.error('Failed to sync dashboard settings:', settingsError);
      }
      
      navigate('/dashboard');
    },
  });

  // サインアップ
  const signupMutation = useMutation({
    mutationFn: ({ email, password }: SignupFormData) => {
      return authAPI.signup(email, password);
    },
    onSuccess: (response) => {
      // JWTトークンをlocalStorageに保存
      localStorage.setItem('access_token', response.data.access_token);
      
      setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/dashboard');
    },
  });

  // ログアウト
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // JWTトークンを削除
      localStorage.removeItem('access_token');
      // ダッシュボード設定もクリア（次回ログイン時にサーバーから取得）
      localStorage.removeItem('dashboard-config');
      logoutStore();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user,
    isLoading: !localStorage.getItem('access_token') ? false : isLoading, // トークンない場合はloading不要
    isAuthenticated,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
}