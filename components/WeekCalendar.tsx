import React from 'react';
import { motion } from 'framer-motion';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WeekCalendar = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get the start of the current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);

  // Generate the 7 days of the current week
  const weekDaysData = weekDays.map((dayName, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return {
      name: dayName,
      date: date.getDate(),
      fullDate: date,
      isToday: date.toDateString() === today.toDateString()
    };
  });

  return (
    <motion.div
      className="bg-surface/50 border border-white/10 rounded-2xl p-4 text-white w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">This Week</h3>
        <div className="text-sm text-gray-400">
          {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDaysData[6].fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDaysData.map((day, index) => (
          <motion.div
            key={day.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
              day.isToday
                ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple shadow-lg shadow-neon-purple/20'
                : 'bg-surface-light/30 border-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className={`text-xs font-medium mb-1 ${day.isToday ? 'text-neon-purple' : 'text-gray-400'}`}>
              {day.name}
            </div>
            <div className={`text-lg font-bold ${day.isToday ? 'text-white' : 'text-gray-300'}`}>
              {day.date}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeekCalendar;