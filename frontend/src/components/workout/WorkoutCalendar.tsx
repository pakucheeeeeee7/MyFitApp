import { useMemo, useState } from 'react';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import type { Workout as WorkoutType } from '../../types/workout';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  workouts: WorkoutType[];
}

interface WorkoutCalendarProps {
  workouts: WorkoutType[];
  onWorkoutClick: (workoutId: number) => void;
}

export function WorkoutCalendar({ workouts, onWorkoutClick }: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // 前月の日付を追加（カレンダーの空白を埋める）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({
        date,
        isCurrentMonth: false,
        hasWorkout: false,
        workouts: [],
      });
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const targetDateString = date.toISOString().split('T')[0];
      
      const dayWorkouts = workouts.filter(workout => {
        if (!workout.date) return false;
        
        const workoutDateString = new Date(workout.date).toISOString().split('T')[0];
        return workoutDateString === targetDateString;
      });

      days.push({
        date,
        isCurrentMonth: true,
        hasWorkout: dayWorkouts.length > 0,
        workouts: dayWorkouts,
      });
    }

    // 次月の日付を追加（完全な週を作るために必要な分のみ）
    const totalCells = days.length;
    const weeksNeeded = Math.ceil(totalCells / 7);
    const targetCells = weeksNeeded * 7;
    const remainingDays = targetCells - totalCells;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        hasWorkout: false,
        workouts: [],
      });
    }

    return days;
  }, [workouts, currentMonth, currentYear]);

  // 連続日数を計算する関数
  const getConsecutiveDays = (targetDate: Date) => {
    if (!workouts.length) return 0;
    
    let consecutiveDays = 0;
    let currentDate = new Date(targetDate);
    
    // 対象日からさかのぼって連続日数を計算
    while (true) {
      const currentDateString = currentDate.toISOString().split('T')[0];
      const hasWorkoutOnDate = workouts.some(workout => {
        if (!workout.date) return false;
        const workoutDateString = new Date(workout.date).toISOString().split('T')[0];
        return workoutDateString === currentDateString;
      });
      
      if (!hasWorkoutOnDate) break;
      
      consecutiveDays++;
      currentDate.setDate(currentDate.getDate() - 1);
      
      // 無限ループ防止（最大30日まで）
      if (consecutiveDays > 30) break;
    }
    
    return consecutiveDays;
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    // ワークアウトがある場合はモーダルを表示
    if (day.hasWorkout && day.workouts.length > 0) {
      setSelectedDate(day.date.toISOString().split('T')[0]);
      setSelectedWorkouts(day.workouts);
      setIsModalOpen(true);
    }
    // ワークアウトがない場合は何もしない（将来的に新しいワークアウト作成などに使用可能）
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
    setSelectedWorkouts([]);
  };

  const handleWorkoutSelect = (workoutId: number) => {
    setIsModalOpen(false);
    onWorkoutClick(workoutId);
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="w-full">
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {dayNames.map(dayName => (
          <div
            key={dayName}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 border-b"
          >
            {dayName}
          </div>
        ))}
        
        {/* カレンダーの日付 */}
        {calendarDays.map((day, index) => {
          const isToday = today.toDateString() === day.date.toDateString();
          const consecutiveDays = day.hasWorkout ? getConsecutiveDays(day.date) : 0;
          
          // 連続日数に応じてスタイルを決定
          const getDayStyle = () => {
            let baseStyle = 'h-12 border border-gray-200 flex flex-col items-center justify-center text-xs transition-all relative ';
            
            if (!day.isCurrentMonth) {
              return baseStyle + 'bg-gray-50 text-gray-400 cursor-default';
            }
            
            if (day.hasWorkout) {
              baseStyle += 'cursor-pointer '; // ワークアウトがある日はクリック可能
              if (consecutiveDays >= 7) {
                return baseStyle + 'bg-green-500 text-white font-bold hover:bg-green-600'; // 1週間以上：濃い緑
              } else if (consecutiveDays >= 3) {
                return baseStyle + 'bg-green-400 text-white font-bold hover:bg-green-500'; // 3-6日：中間
              } else {
                return baseStyle + 'bg-green-300 text-white font-bold hover:bg-green-400'; // 1-2日：薄い緑
              }
            } else {
              baseStyle += 'cursor-default '; // ワークアウトがない日は通常のカーソル
              if (isToday) {
                return baseStyle + 'bg-blue-50 border-blue-500 border-2 text-blue-700 font-bold hover:bg-blue-100';
              } else {
                return baseStyle + 'bg-white text-gray-700 hover:bg-gray-50';
              }
            }
          };
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={getDayStyle()}
            >
              <span className="text-sm">
                {day.date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-4">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <span>1-2日継続</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>3-6日継続</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>7日以上継続</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>実施なし</span>
          </div>
        </div>
      </div>

      {/* ワークアウト詳細モーダル */}
      <WorkoutDetailModal
        workouts={selectedWorkouts}
        date={selectedDate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onWorkoutSelect={handleWorkoutSelect}
      />
    </div>
  );
}
