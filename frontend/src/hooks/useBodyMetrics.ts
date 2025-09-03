import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bodyMetricsAPI } from '../lib/api';
import type { BodyMetric, BodyMetricCreateRequest } from '../types/profile';
import { toast } from 'sonner';

export const useBodyMetrics = () => {
  return useQuery({
    queryKey: ['body-metrics'],
    queryFn: async () => {
      const response = await bodyMetricsAPI.getBodyMetrics();
      return response.data;
    },
  });
};

export const useCreateBodyMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BodyMetricCreateRequest) => {
      const response = await bodyMetricsAPI.createBodyMetric(data);
      return response.data;
    },
    onSuccess: (newMetric: BodyMetric) => {
      // 体重記録リストのキャッシュを更新
      queryClient.setQueryData(['body-metrics'], (oldData: BodyMetric[] | undefined) => {
        if (!oldData) return [newMetric];
        return [newMetric, ...oldData];
      });
      
      // 高度分析データも更新
      queryClient.invalidateQueries({ queryKey: ['analytics', 'advanced-summary'] });
      
      toast.success('体重記録を追加しました！');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || '体重記録の追加に失敗しました';
      toast.error(message);
    },
  });
};

export const useUpdateBodyMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ metricId, data }: { metricId: number; data: Partial<BodyMetricCreateRequest> }) => {
      const response = await bodyMetricsAPI.updateBodyMetric(metricId, data);
      return response.data;
    },
    onSuccess: (updatedMetric: BodyMetric) => {
      // 体重記録リストのキャッシュを更新
      queryClient.setQueryData(['body-metrics'], (oldData: BodyMetric[] | undefined) => {
        if (!oldData) return [updatedMetric];
        return oldData.map(metric => 
          metric.id === updatedMetric.id ? updatedMetric : metric
        );
      });
      
      // 高度分析データも更新
      queryClient.invalidateQueries({ queryKey: ['analytics', 'advanced-summary'] });
      
      toast.success('体重記録を更新しました！');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || '体重記録の更新に失敗しました';
      toast.error(message);
    },
  });
};

export const useBodyMetricsForm = () => {
  const { data: metrics, isLoading } = useBodyMetrics();
  const createMetric = useCreateBodyMetric();
  const updateMetric = useUpdateBodyMetric();
  
  const handleSubmit = async (data: BodyMetricCreateRequest) => {
    await createMetric.mutateAsync(data);
  };
  
  const handleUpdate = async (metricId: number, data: Partial<BodyMetricCreateRequest>) => {
    await updateMetric.mutateAsync({ metricId, data });
  };
  
  return {
    metrics: metrics || [],
    isLoading,
    createMetric: handleSubmit,
    updateMetric: handleUpdate,
    isCreating: createMetric.isPending,
    isUpdating: updateMetric.isPending,
  };
};
