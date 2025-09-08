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

// プロフィール更新フォームのバリデーション
export const profileSchema = z.object({
  username: z
    .string()
    .optional()
    .refine((username) => {
      if (!username || username.trim() === '') return true; // 空の場合はOK
      return username.length >= 3 && username.length <= 20;
    }, {
      message: 'ユーザーネームは3文字以上20文字以下で入力してください',
    }),
  birth_date: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true; // 空の場合はOK
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 5 && age <= 120;
    }, {
      message: '年齢は5歳から120歳の間で入力してください',
    }),
  gender: z
    .enum(['male', 'female', 'other'], {
      message: '性別を選択してください',
    })
    .optional(),
});

// 体重記録フォームのバリデーション
export const bodyMetricSchema = z.object({
  date: z
    .string()
    .min(1, '日付を選択してください')
    .refine((dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      return date >= oneYearAgo && date <= tomorrow;
    }, {
      message: '日付は1年前から明日までの範囲で選択してください',
    }),
  body_weight: z
    .union([
      z.number().min(20, '体重は20kg以上で入力してください').max(300, '体重は300kg以下で入力してください'),
      z.undefined()
    ]),
  body_fat_percent: z
    .union([
      z.number().min(1, '体脂肪率は1%以上で入力してください').max(60, '体脂肪率は60%以下で入力してください'),
      z.undefined()
    ]),
  note: z
    .string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional(),
}).refine((data) => {
  // 体重または体脂肪率のどちらか一つは必須
  return data.body_weight !== undefined || data.body_fat_percent !== undefined;
}, {
  message: '体重または体脂肪率のどちらか一つは入力してください',
  path: ['body_weight'], // エラー表示位置
});

// 身長記録フォームのバリデーション
export const heightRecordSchema = z.object({
  height_cm: z
    .number({
      message: '身長は数値で入力してください',
    })
    .min(50, '身長は50cm以上で入力してください')
    .max(250, '身長は250cm以下で入力してください'),
  note: z
    .string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type BodyMetricFormData = z.infer<typeof bodyMetricSchema>;
export type HeightRecordFormData = z.infer<typeof heightRecordSchema>;