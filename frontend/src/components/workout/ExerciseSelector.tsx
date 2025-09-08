import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useExercises } from '../../hooks/useExercises';
import { Plus, Search } from 'lucide-react';
import type { Exercise } from '../../types/workout';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseSelector({ isOpen, onClose, onSelectExercise }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('');
  
  const { exercises, exercisesByMuscleGroup, isLoading, createExercise, isCreating } = useExercises();

  const handleAddExercise = async () => {
    if (newExerciseName.trim() && newExerciseMuscleGroup.trim()) {
      try {
        await createExercise({
          name: newExerciseName.trim(),
          muscle_group: newExerciseMuscleGroup.trim()
        });
        setNewExerciseName('');
        setNewExerciseMuscleGroup('');
        setShowAddForm(false);
      } catch (error) {
        console.error('種目の追加に失敗しました:', error);
      }
    }
  };

  const muscleGroups = ['胸', '背中', '脚', '肩', '腕', '腹', 'その他'];

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
                      onChange={(e) => setNewExerciseMuscleGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">筋肉群を選択</option>
                      {muscleGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
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
                        {filteredGroupExercises.map((exercise: Exercise) => (
                          <Button
                            key={exercise.id}
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              onSelectExercise(exercise);
                              onClose();
                            }}
                          >
                            {exercise.name}
                            {exercise.is_builtin ? (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                内蔵
                              </span>
                            ) : (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                オリジナル
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}