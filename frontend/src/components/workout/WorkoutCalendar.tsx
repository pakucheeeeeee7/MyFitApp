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
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        // 日付文字列を正規化して比較（時刻を除く）
        const workoutDateString = workoutDate.toISOString().split('T')[0];
        const targetDateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
        return workoutDateString === targetDateString;
      });

      days.push({
        date,
        isCurrentMonth: true,
        hasWorkout: dayWorkouts.length > 0,
        workouts: dayWorkouts,
      });
    }

    // 次月の日付を追加（カレンダーを42日で埋める）
    const remainingDays = 42 - days.length;
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
    if (!day.isCurrentMonth || !day.hasWorkout) return;
    
    // 選択した日付とワークアウトをモーダルに表示
    setSelectedDate(day.date.toISOString().split('T')[0]);
    setSelectedWorkouts(day.workouts);
    setIsModalOpen(true);
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
          
          // 連続日数に応じて背景色を変える（マス全体）
          const getWorkoutBgStyle = () => {
            if (!day.hasWorkout) return 'bg-white';
            if (consecutiveDays >= 7) return 'bg-green-500'; // 1週間以上：濃い緑
            if (consecutiveDays >= 3) return 'bg-green-400'; // 3日以上：中間
            return 'bg-green-300'; // 1-2日：薄い緑
          };
          
          const getTextStyle = () => {
            if (!day.hasWorkout) {
              return isToday ? 'font-bold text-blue-700' : 'text-gray-900';
            }
            // ワークアウト実施日は白文字で太字
            return 'font-bold text-white';
          };
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                h-12 border border-gray-200 flex flex-col items-center justify-center text-xs transition-colors relative
                ${day.isCurrentMonth ? getWorkoutBgStyle() : 'bg-gray-50 text-gray-400'}
                ${day.hasWorkout ? 'cursor-pointer hover:brightness-110' : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <span className={`
                text-sm
                ${day.isCurrentMonth ? getTextStyle() : 'text-gray-400'}
              `}>
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
