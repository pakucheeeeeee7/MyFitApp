import { useState } from 'react';

type ViewMode = 'list' | 'calendar';

export function useViewMode(key: string, defaultMode: ViewMode = 'list') {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(key);
      return (saved as ViewMode) || defaultMode;
    } catch {
      return defaultMode;
    }
  });

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(key, mode);
    } catch (error) {
      console.error('Failed to save view mode to localStorage:', error);
    }
  };

  return [viewMode, updateViewMode] as const;
}
