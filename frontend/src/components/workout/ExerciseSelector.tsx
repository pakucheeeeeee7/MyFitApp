import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExercises } from '@/hooks/useExercises';
import type { Exercise } from '../../types/workout';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseSelector({ isOpen, onClose, onSelectExercise }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { exercises, exercisesByMuscleGroup, isLoading } = useExercises();

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">種目を選択</h2>
            <Button variant="outline" onClick={onClose}>×</Button>
          </div>
          <Input
            placeholder="種目名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p>読み込み中...</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => {
                const filteredGroupExercises = exercises.filter(exercise =>
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
                        {filteredGroupExercises.map(exercise => (
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