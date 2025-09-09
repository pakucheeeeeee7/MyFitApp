import { useState, useEffect } from 'react';
import { userSettingsAPI } from '../lib/api';
import type { DashboardWidget, DashboardConfig, DashboardStats, CalorieGoal } from '../types/workout';

// 利用可能なウィジェットの定義
export const availableWidgets: DashboardWidget[] = [
  {
    id: 'total_workouts',
    title: '総ワークアウト数',
    description: 'これまでに完了したワークアウトの総数',
    category: 'fitness',
    enabled: true,
    getValue: (stats) => stats.total_workouts,
    format: 'number',
    icon: '💪'
  },
  {
    id: 'this_week_workouts',
    title: '今週のワークアウト数',
    description: '今週完了したワークアウトの回数',
    category: 'fitness',
    enabled: true,
    getValue: (stats) => stats.this_week_workouts,
    format: 'number',
    icon: '📅'
  },
  {
    id: 'total_volume',
    title: '総トレーニング量',
    description: 'これまでの累計トレーニングボリューム (kg)',
    category: 'fitness',
    enabled: true,
    getValue: (stats) => stats.total_volume,
    format: 'decimal',
    icon: '🏋️'
  },
  {
    id: 'this_week_volume',
    title: '今週のトレーニング量',
    description: '今週のトレーニングボリューム (kg)',
    category: 'fitness',
    enabled: true,
    getValue: (stats) => stats.this_week_volume,
    format: 'decimal',
    icon: '📊'
  },
  {
    id: 'today_total_estimated_calories',
    title: '今日の推定総消費カロリー',
    description: 'BMR + 日常活動 + ワークアウトによる今日の総消費カロリー推定値',
    category: 'health',
    enabled: false,
    getValue: (stats) => stats.today_total_estimated_calories,
    format: 'calories',
    icon: '🔥'
  },
  {
    id: 'today_calories_burned',
    title: '今日のワークアウト消費カロリー',
    description: '今日のワークアウトで消費したカロリー',
    category: 'health',
    enabled: false,
    getValue: (stats) => stats.today_calories_burned,
    format: 'calories',
    icon: '⚡'
  },
  {
    id: 'this_week_calories_burned',
    title: '今週のワークアウト消費カロリー',
    description: '今週のワークアウトで消費した合計カロリー',
    category: 'health',
    enabled: false,
    getValue: (stats) => stats.this_week_calories_burned,
    format: 'calories',
    icon: '🔥'
  },
  {
    id: 'weight_change_since_last',
    title: '前回からの体重変化',
    description: '前回計測時からの体重変化量',
    category: 'progress',
    enabled: false,
    getValue: (stats) => stats.weight_change_since_last,
    format: 'weight',
    icon: '⚖️'
  },
  {
    id: 'latest_weight',
    title: '現在の体重',
    description: '最新の体重記録',
    category: 'health',
    enabled: false,
    getValue: (stats) => stats.latest_weight,
    format: 'weight',
    icon: '📏'
  }
];

const STORAGE_KEY = 'dashboard-config';
const DEFAULT_CONFIG: DashboardConfig = {
  selectedWidgets: ['total_workouts', 'this_week_workouts', 'total_volume', 'this_week_volume'],
  maxWidgets: 4
};

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // バックエンドから設定を読み込み（ログイン時）
  useEffect(() => {
    const loadServerConfig = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // ログインしている場合はサーバーから設定を取得
          const response = await userSettingsAPI.getSettings();
          if (response.data.dashboard_config) {
            setConfig(response.data.dashboard_config);
          }
        } else {
          // ログインしていない場合はlocalStorageから取得
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsedConfig = JSON.parse(saved) as DashboardConfig;
            setConfig(parsedConfig);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard config:', error);
        // エラー時はlocalStorageから取得を試行
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsedConfig = JSON.parse(saved) as DashboardConfig;
            setConfig(parsedConfig);
          }
        } catch (fallbackError) {
          console.error('Fallback config loading failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadServerConfig();
  }, []);

  // storage イベントリスナーでリアルタイム更新
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newConfig = JSON.parse(e.newValue) as DashboardConfig;
          setConfig(newConfig);
        } catch (error) {
          console.error('Failed to parse updated config:', error);
        }
      }
    };

    // カスタムイベントリスナー（同一タブ内での変更用）
    const handleConfigChange = (e: CustomEvent<DashboardConfig>) => {
      setConfig(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dashboard-config-change', handleConfigChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dashboard-config-change', handleConfigChange as EventListener);
    };
  }, []);

  // 設定をサーバーとlocalStorageに保存してリアルタイム更新
  const saveConfig = async (newConfig: DashboardConfig) => {
    try {
      // まずローカル状態を更新
      setConfig(newConfig);
      
      // localStorageに保存（フォールバック用）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      
      // ログインしている場合はサーバーにも保存
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await userSettingsAPI.updateDashboardConfig(newConfig);
        } catch (serverError) {
          console.error('Failed to save config to server:', serverError);
          // サーバー保存に失敗してもローカル保存は維持
        }
      }
      
      // カスタムイベントを発火して同一タブ内の他のコンポーネントに通知
      const event = new CustomEvent('dashboard-config-change', { detail: newConfig });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to save dashboard config:', error);
    }
  };

  // ウィジェットの有効/無効を切り替え
  const toggleWidget = (widgetId: string) => {
    const currentSelected = config.selectedWidgets;
    let newSelected: string[];

    if (currentSelected.includes(widgetId)) {
      // ウィジェットを削除
      newSelected = currentSelected.filter(id => id !== widgetId);
    } else {
      // ウィジェットを追加（最大数チェック）
      if (currentSelected.length >= config.maxWidgets) {
        // 最大数に達している場合、最初のウィジェットを削除して新しいものを追加
        newSelected = [...currentSelected.slice(1), widgetId];
      } else {
        newSelected = [...currentSelected, widgetId];
      }
    }

    saveConfig({
      ...config,
      selectedWidgets: newSelected
    });
  };

  // 選択されたウィジェットを取得
  const getSelectedWidgets = (): DashboardWidget[] => {
    return config.selectedWidgets
      .map(id => availableWidgets.find(widget => widget.id === id))
      .filter((widget): widget is DashboardWidget => widget !== undefined);
  };

  // ウィジェットの並び順を変更
  const reorderWidgets = (newOrder: string[]) => {
    saveConfig({
      ...config,
      selectedWidgets: newOrder
    });
  };

  // フォーマット関数
  const formatValue = (value: string | number | null, format: DashboardWidget['format']): string => {
    if (value === null || value === undefined) return '-';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (format) {
      case 'number':
        return numValue.toString();
      case 'decimal':
        return numValue.toFixed(1);
      case 'weight':
        return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}kg`;
      case 'calories':
        return `${Math.round(numValue)}kcal`;
      case 'percentage':
        return `${Math.round(numValue)}%`;
      default:
        return numValue.toString();
    }
  };

  return {
    config,
    availableWidgets,
    getSelectedWidgets,
    toggleWidget,
    reorderWidgets,
    formatValue,
    saveConfig,
    isLoading
  };
}
