import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useExercises } from '../../hooks/useExercises';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import type { Exercise } from '../../types/workout';
import { ExerciseOptions } from './ExerciseOptions';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise, options?: {
    selected_angle?: string;
    selected_grip?: string;
    selected_stance?: string;
  }) => void;
}

export function ExerciseSelector({ isOpen, onClose, onSelectExercise }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<'strength' | 'cardio'>('strength');
  
  // オプション選択用の状態
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    angle?: string;
    grip?: string;
    stance?: string;
  }>({});
  
  const { exercises, exercisesByMuscleGroup, isLoading, createExercise, isCreating } = useExercises();

  const handleAddExercise = async () => {
    if (newExerciseName.trim() && newExerciseMuscleGroup.trim()) {
      try {
        await createExercise({
          name: newExerciseName.trim(),
          muscle_group: newExerciseMuscleGroup.trim(),
          exercise_type: newExerciseType
        });
        setNewExerciseName('');
        setNewExerciseMuscleGroup('');
        setNewExerciseType('strength');
        setShowAddForm(false);
      } catch (error) {
        console.error('種目の追加に失敗しました:', error);
      }
    }
  };

  // 種目選択時の処理
  const handleExerciseClick = (exercise: Exercise) => {
    // オプションがある種目の場合はオプション選択画面に移行
    const hasOptions = exercise.angle_options || exercise.grip_options || exercise.stance_options;
    
    if (hasOptions) {
      setSelectedExercise(exercise);
      setSelectedOptions({});
    } else {
      // オプションがない場合は直接選択
      onSelectExercise(exercise);
      onClose();
    }
  };

  // オプション選択完了時の処理
  const handleConfirmSelection = () => {
    if (selectedExercise) {
      const options = Object.keys(selectedOptions).length > 0 ? {
        selected_angle: selectedOptions.angle,
        selected_grip: selectedOptions.grip,
        selected_stance: selectedOptions.stance,
      } : undefined;
      
      onSelectExercise(selectedExercise, options);
      setSelectedExercise(null);
      setSelectedOptions({});
      onClose();
    }
  };

  // オプション選択をキャンセル
  const handleCancelOptions = () => {
    setSelectedExercise(null);
    setSelectedOptions({});
  };

  // オプション選択表示名を生成
  const getExerciseDisplayName = (exercise: Exercise) => {
    const parts = [exercise.name];
    if (selectedOptions.angle) parts.push(`(${selectedOptions.angle})`);
    if (selectedOptions.grip) parts.push(`(${selectedOptions.grip})`);
    if (selectedOptions.stance) parts.push(`(${selectedOptions.stance})`);
    return parts.join(' ');
  };

  const muscleGroups = ['胸', '背中', '脚', '肩', '腕', '腹', '有酸素運動', 'その他'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">種目を選択</h2>
            <Button variant="outline" onClick={onClose}>×</Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="種目名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                新しい種目を追加
              </Button>
            </div>

            {/* 種目追加フォーム */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">新しい種目を追加</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="exercise-name">種目名</Label>
                    <Input
                      id="exercise-name"
                      placeholder="例: インクラインベンチプレス"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="muscle-group">筋肉群</Label>
                    <select
                      id="muscle-group"
                      value={newExerciseMuscleGroup}
                      onChange={(e) => {
                        setNewExerciseMuscleGroup(e.target.value);
                        // 有酸素運動が選択された場合は自動でcardioに設定
                        if (e.target.value === '有酸素運動') {
                          setNewExerciseType('cardio');
                        } else {
                          setNewExerciseType('strength');
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">筋肉群を選択</option>
                      {muscleGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="exercise-type">種目タイプ</Label>
                    <select
                      id="exercise-type"
                      value={newExerciseType}
                      onChange={(e) => setNewExerciseType(e.target.value as 'strength' | 'cardio')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="strength">筋力トレーニング</option>
                      <option value="cardio">有酸素運動</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddExercise}
                      disabled={!newExerciseName.trim() || !newExerciseMuscleGroup.trim() || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? '追加中...' : '追加'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewExerciseName('');
                        setNewExerciseMuscleGroup('');
                        setNewExerciseType('strength');
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedExercise ? (
            // オプション選択画面
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelOptions}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  戻る
                </Button>
                <h3 className="text-lg font-semibold">{selectedExercise.name}</h3>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">選択予定:</p>
                <p className="font-medium">{getExerciseDisplayName(selectedExercise)}</p>
              </div>

              <ExerciseOptions
                exercise={selectedExercise}
                selectedOptions={selectedOptions}
                onOptionsChange={setSelectedOptions}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleConfirmSelection}
                  className="flex-1"
                >
                  この設定で追加
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelOptions}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            // 種目選択リスト
            <>
              {isLoading ? (
                <p>読み込み中...</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => {
                    const filteredGroupExercises = (exercises as Exercise[]).filter((exercise: Exercise) =>
                      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    if (filteredGroupExercises.length === 0) return null;
                    
                    return (
                      <Card key={muscleGroup}>
                        <CardHeader>
                          <CardTitle className="text-lg">{muscleGroup}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            {filteredGroupExercises.map((exercise: Exercise) => {
                              const hasOptions = exercise.angle_options || exercise.grip_options || exercise.stance_options;
                              
                              return (
                                <Button
                                  key={exercise.id}
                                  variant="outline"
                                  className="justify-start"
                                  onClick={() => handleExerciseClick(exercise)}
                                >
                                  <div className="flex-1 text-left">
                                    {exercise.name}
                                    {hasOptions && (
                                      <span className="text-xs text-blue-600 ml-2">
                                        (オプション選択可)
                                      </span>
                                    )}
                                  </div>
                                  <div className="ml-auto flex gap-1">
                                    {exercise.exercise_type === 'cardio' && (
                                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                        有酸素
                                      </span>
                                    )}
                                    {exercise.is_builtin ? (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        内蔵
                                      </span>
                                    ) : (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        オリジナル
                                      </span>
                                    )}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}