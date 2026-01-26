
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = () => {
  const [date, setDate] = useState(new Date());

  const month = date.getMonth();
  const year = date.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return i - firstDay + 1;
  });

  return (
    <motion.div 
      className="bg-surface/50 border border-white/10 rounded-2xl p-6 text-white w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10">
          <ChevronLeft size={20} />
        </motion.button>
        <h2 className="font-bold text-lg">
          {date.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10">
          <ChevronRight size={20} />
        </motion.button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-gray-400">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {days.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className={`flex items-center justify-center h-10 w-10 rounded-full
              ${day ? 'hover:bg-neon-purple/30 cursor-pointer' : ''}
              ${day === new Date().getDate() && month === new Date().getMonth() ? 'bg-neon-purple text-white' : ''}
            `}
          >
            {day}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Calendar;
