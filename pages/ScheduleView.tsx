import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DayOfWeek } from '../types';
import { User } from 'lucide-react';

const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ScheduleView: React.FC = () => {
  const { schedule, subjects } = useApp();
  const [activeDay, setActiveDay] = useState<DayOfWeek>(new Date().toLocaleDateString('en-US', { weekday: 'short' }) as DayOfWeek);
  
  // Fallback if today is Sunday
  if (!days.includes(activeDay)) {
     // Default to Monday if Sunday
     if(activeDay === 'Sun' as any) setActiveDay('Mon');
  }

  const daySchedule = schedule
    .filter(s => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Weekly Timetable</h2>
      
      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeDay === d 
                ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' 
                : 'bg-surface text-gray-500 hover:text-gray-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="relative border-l border-white/10 ml-4 pl-8 py-2 space-y-8">
        {daySchedule.length === 0 ? (
          <div className="text-gray-500 italic text-sm">No classes on {activeDay}.</div>
        ) : (
          daySchedule.map(sess => {
            const sub = subjects.find(s => s.id === sess.subjectId);
            return (
              <div key={sess.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[37px] top-2 w-4 h-4 rounded-full bg-void border-2 border-neon-cyan"></div>
                
                <div className="bg-surface p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neon-cyan font-mono text-sm">{sess.startTime} - {sess.endTime}</span>
                    <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400">{sub?.type}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{sub?.name}</h3>
                  {sub?.lecturer && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <User size={12} />
                      <span>{sub.lecturer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};