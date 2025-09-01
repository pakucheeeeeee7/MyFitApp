import { z } from 'zod';

// ログインフォームのバリデーション
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
});

// サインアップフォームのバリデーション
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワード確認は必須です'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;