import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../lib/api';
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
    staleTime: 1000 * 60 * 5,
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
    onSuccess: (response) => {
      // JWTトークンをlocalStorageに保存
      localStorage.setItem('access_token', response.data.access_token);
      
      setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
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
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // JWTトークンを削除
      localStorage.removeItem('access_token');
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