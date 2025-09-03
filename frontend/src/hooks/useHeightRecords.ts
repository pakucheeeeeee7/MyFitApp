import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { HeightRecord, HeightRecordCreateRequest } from '../types/profile';
import { api } from '../lib/api';

interface UseHeightRecordsOptions {
  onSuccess?: () => void;
}

export const useHeightRecords = (options?: UseHeightRecordsOptions) => {
  const queryClient = useQueryClient();

  // 身長記録一覧の取得
  const {
    data: heightRecords = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['height-records'],
    queryFn: async (): Promise<HeightRecord[]> => {
      const response = await api.get('/height-records');
      return response.data;
    }
  });

  // 身長記録の作成
  const createHeightRecord = useMutation({
    mutationFn: async (data: HeightRecordCreateRequest): Promise<HeightRecord> => {
      const response = await api.post('/height-records', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['height-records'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-analytics'] });
      options?.onSuccess?.();
    }
  });

  // 最新の身長記録を取得
  const latestHeight = heightRecords.length > 0 ? heightRecords[0] : null;

  return {
    heightRecords,
    latestHeight,
    isLoading,
    error,
    createHeightRecord: createHeightRecord.mutate,
    isCreating: createHeightRecord.isPending
  };
};
