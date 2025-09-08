import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../lib/api';
import type { UserProfile, ProfileUpdateRequest } from '../types/profile';
import { toast } from 'sonner';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileAPI.getProfile();
      return response.data;
    },
  });
};

export const useUpdateProfile = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: ProfileUpdateRequest) => {
      const response = await profileAPI.updateProfile(profileData);
      return response.data;
    },
    onSuccess: (updatedProfile: UserProfile) => {
      // プロフィールキャッシュを更新
      queryClient.setQueryData(['profile'], updatedProfile);
      toast.success('プロフィールを更新しました！');
      
      // コールバック関数があれば実行
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'プロフィールの更新に失敗しました';
      toast.error(message);
    },
  });
};

export const useProfileForm = (onSuccessCallback?: () => void) => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile(onSuccessCallback);
  
  const handleSubmit = async (data: ProfileUpdateRequest) => {
    await updateProfile.mutateAsync(data);
  };
  
  return {
    profile,
    isLoading,
    updateProfile: handleSubmit,
    isUpdating: updateProfile.isPending,
  };
};
