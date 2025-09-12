import React from 'react';
import type { Exercise } from '../../types/workout';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ExerciseOptionsProps {
  exercise: Exercise;
  selectedOptions: {
    angle?: string;
    grip?: string;
    stance?: string;
  };
  onOptionsChange: (options: { angle?: string; grip?: string; stance?: string }) => void;
}

export const ExerciseOptions: React.FC<ExerciseOptionsProps> = ({
  exercise,
  selectedOptions,
  onOptionsChange,
}) => {
  // オプション文字列をパース（カンマ区切り）
  const parseOptions = (optionString: string | undefined): string[] => {
    if (!optionString) return [];
    return optionString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
  };

  const angleOptions = parseOptions(exercise.angle_options);
  const gripOptions = parseOptions(exercise.grip_options);
  const stanceOptions = parseOptions(exercise.stance_options);

  // オプションが一つもない場合は何も表示しない
  if (angleOptions.length === 0 && gripOptions.length === 0 && stanceOptions.length === 0) {
    return null;
  }

  const handleOptionChange = (type: 'angle' | 'grip' | 'stance', value: string) => {
    const newOptions = { ...selectedOptions };
    if (value === 'none') {
      delete newOptions[type];
    } else {
      newOptions[type] = value;
    }
    onOptionsChange(newOptions);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">オプション選択</CardTitle>
        <CardDescription className="text-xs">
          この種目には複数のバリエーションがあります。お好みのスタイルを選択してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {angleOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">角度</Label>
            <select
              value={selectedOptions.angle || 'none'}
              onChange={(e) => handleOptionChange('angle', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">指定なし</option>
              {angleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {gripOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">グリップ</Label>
            <select
              value={selectedOptions.grip || 'none'}
              onChange={(e) => handleOptionChange('grip', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">指定なし</option>
              {gripOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {stanceOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">スタンス</Label>
            <select
              value={selectedOptions.stance || 'none'}
              onChange={(e) => handleOptionChange('stance', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">指定なし</option>
              {stanceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
