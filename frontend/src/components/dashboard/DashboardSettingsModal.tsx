import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSettingsModal({ isOpen, onClose }: DashboardSettingsModalProps) {
  const { config, availableWidgets, toggleWidget, getSelectedWidgets } = useDashboardConfig();
  
  const selectedWidgets = getSelectedWidgets();
  const categorizedWidgets = {
    fitness: availableWidgets.filter(w => w.category === 'fitness'),
    health: availableWidgets.filter(w => w.category === 'health'),
    progress: availableWidgets.filter(w => w.category === 'progress')
  };

  const categoryLabels = {
    fitness: '🏋️ フィットネス',
    health: '🏥 健康管理',
    progress: '📈 進捗'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ダッシュボード設定</DialogTitle>
          <p className="text-sm text-muted-foreground">
            表示したい指標を最大{config.maxWidgets}つまで選択できます
            （現在 {selectedWidgets.length}/{config.maxWidgets} 選択中）
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 選択中のウィジェット */}
          {selectedWidgets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">選択中の指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedWidgets.map((widget) => (
                  <Card key={widget.id} className="border-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{widget.icon}</span>
                          {widget.title}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleWidget(widget.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
                        {widget.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 利用可能なウィジェット */}
          <div>
            <h3 className="text-lg font-semibold mb-3">利用可能な指標</h3>
            {(Object.keys(categorizedWidgets) as Array<keyof typeof categorizedWidgets>).map((category) => (
              <div key={category} className="mb-6">
                <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                  {categoryLabels[category]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedWidgets[category].map((widget) => {
                    const isSelected = config.selectedWidgets.includes(widget.id);
                    const isDisabled = !isSelected && selectedWidgets.length >= config.maxWidgets;
                    
                    return (
                      <Card 
                        key={widget.id} 
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 
                          'hover:border-primary/50'
                        }`}
                        onClick={() => !isDisabled && toggleWidget(widget.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <span>{widget.icon}</span>
                              {widget.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  選択中
                                </Badge>
                              )}
                              {isDisabled && (
                                <Badge variant="secondary" className="text-xs">
                                  上限
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-xs">
                            {widget.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
