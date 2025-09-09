import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import { useState, useEffect } from 'react';
import type { DashboardStats, CalorieGoal } from '../../types/workout';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  calorieGoal?: CalorieGoal;
  onOpenSettings: () => void;
}

export function DashboardStatsCards({ stats, calorieGoal, onOpenSettings }: DashboardStatsCardsProps) {
  const { getSelectedWidgets, formatValue } = useDashboardConfig();
  const [forceUpdate, setForceUpdate] = useState(0);
  const selectedWidgets = getSelectedWidgets();

  // カスタムイベントを監視してリアルタイム更新
  useEffect(() => {
    const handleConfigChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('dashboard-config-change', handleConfigChange);
    return () => {
      window.removeEventListener('dashboard-config-change', handleConfigChange);
    };
  }, []);

  if (selectedWidgets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          表示する指標が選択されていません
        </p>
        <Button onClick={onOpenSettings} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          設定を開く
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">統計</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4 mr-2" />
          カスタマイズ
        </Button>
      </div>
      
      <div key={`grid-${forceUpdate}`} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {selectedWidgets.map((widget) => {
          const value = widget.getValue(stats, calorieGoal);
          const formattedValue = formatValue(value, widget.format);
          
          return (
            <Card key={widget.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
                <span className="text-lg">{widget.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formattedValue}
                </div>
                <CardDescription className="text-xs mt-1">
                  {widget.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
