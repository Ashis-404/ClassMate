import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Check, X, Settings2, Plus, Undo2, CalendarX, Clock } from 'lucide-react';
import { DayOfWeek, SubjectType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Calendar from '../components/Calendar';
import WeekCalendar from '../components/WeekCalendar';
import LightRays from '../components/LightRays';

// Helper to get duration in hours
const getDurationInHours = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  return Number((diffMinutes / 60).toFixed(2));
};

// --- Components ---

const Wave = ({ color }: { color: string }) => (
  <motion.div
    className="absolute -top-3 left-0 w-[200%] h-4 flex"
    animate={{ x: ["0%", "-50%"] }}
    transition={{ repeat: Infinity, ease: "linear", duration: 3 }}
  >
    <svg className={`w-full h-full ${color} fill-current`} viewBox="0 0 1000 100" preserveAspectRatio="none">
       <path d="M 0 50 Q 250 100 500 50 T 1000 50 V 100 H 0 Z" opacity="0.5" />
       <path d="M 0 50 Q 250 0 500 50 T 1000 50 V 100 H 0 Z" />
    </svg>
  </motion.div>
);

interface LiquidBubbleProps {
  label: string;
  subLabel?: string;
  value: number;
  target: number;
  hasData: boolean;
  size: string; // Tailwind w/h class e.g. "w-40 h-40"
  colorTheme: 'cyan' | 'purple' | 'pink';
  delay: number;
  className?: string;
}

const LiquidBubble: React.FC<LiquidBubbleProps> = ({ label, subLabel, value, target, hasData, size, colorTheme, delay, className }) => {
  const isDanger = hasData && value < target;
  const isWarning = hasData && value >= target && value < target + 5;
  
  // Dynamic colors based on theme
  const colors = {
    cyan: 'bg-neon-cyan',
    purple: 'bg-neon-purple',
    pink: 'bg-neon-pink'
  };

  const waterColor = colors[colorTheme];
  const displayValue = hasData ? `${value}%` : '--';

  return (
    <motion.div
      className={`absolute rounded-full border-4 border-white/10 bg-surface/40 backdrop-blur-sm overflow-hidden shadow-2xl flex flex-col items-center justify-center z-20 ${size} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -10, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        scale: { type: "spring", damping: 12, delay },
        opacity: { duration: 0.5, delay },
        y: { repeat: Infinity, duration: 4 + Math.random(), ease: "easeInOut", delay: Math.random() },
        rotate: { repeat: Infinity, duration: 6 + Math.random(), ease: "easeInOut", delay: Math.random() }
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Liquid Fill */}
      <motion.div 
        className={`absolute bottom-0 left-0 right-0 ${waterColor} opacity-80`}
        initial={{ height: "0%" }}
        animate={{ height: hasData ? `${value}%` : "10%" }}
        transition={{ type: "spring", damping: 20, stiffness: 60, delay: delay + 0.3 }}
      >
        <Wave color={`text-${colorTheme === 'purple' ? 'neon-purple' : colorTheme === 'cyan' ? 'neon-cyan' : 'neon-pink'}`} />
      </motion.div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center drop-shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">{label}</span>
        <span className={`font-mono font-bold leading-none ${size.includes('44') ? 'text-5xl' : 'text-3xl'} text-white`}>
          {displayValue}
        </span>
        {subLabel && <span className="text-[10px] text-white/70 mt-2 font-medium">{subLabel}</span>}
      </div>

      {/* Glossy Reflection */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, subjects, schedule, extraClasses, attendanceLogs, markAttendance, addExtraClass, term } = useApp();
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  // Extra Class Form State
  const [newExtraSubject, setNewExtraSubject] = useState('');
  const [newExtraStart, setNewExtraStart] = useState('09:00');
  const [newExtraEnd, setNewExtraEnd] = useState('10:00');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }) as DayOfWeek;
  const dateStr = new Date().toISOString().split('T')[0];

  const todaysClasses = useMemo(() => {
    const standard = schedule.filter(s => s.day === today).map(s => ({ ...s, isExtra: false }));
    const extras = extraClasses.filter(e => e.date === dateStr).map(e => ({ 
      id: e.id, subjectId: e.subjectId, day: today, startTime: e.startTime, endTime: e.endTime, isExtra: true
    }));
    return [...standard, ...extras].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule, extraClasses, today, dateStr]);

  const stats = useMemo(() => {
    return subjects.map(sub => {
      const subjectLogs = attendanceLogs.filter(l => {
         const session = schedule.find(s => s.id === l.sessionId);
         const extraSession = extraClasses.find(e => e.id === l.sessionId);
         return (session || extraSession)?.subjectId === sub.id;
      });

      let presentHours = sub.pastAttendedClasses || 0;
      let totalHours = (sub.pastAttendedClasses || 0) + (sub.pastAbsentClasses || 0);

      subjectLogs.forEach(log => {
        const session = schedule.find(s => s.id === log.sessionId);
        const extraSession = extraClasses.find(e => e.id === log.sessionId);
        const actualSession = session || extraSession;

        if (actualSession) {
          const duration = getDurationInHours(actualSession.startTime, actualSession.endTime);
          if (log.status === 'Present') presentHours += duration;
          if (log.status !== 'Cancelled') totalHours += duration;
        }
      });
      
      const percentage = totalHours === 0 ? 0 : Math.round((presentHours / totalHours) * 100);
      return { ...sub, present: presentHours, total: totalHours, percentage };
    });
  }, [subjects, attendanceLogs, schedule, extraClasses]);

  const aggregateStats = useMemo(() => {
    let theoryP = 0, theoryT = 0, labP = 0, labT = 0;
    stats.forEach(sub => {
      if (sub.type === SubjectType.THEORY) { theoryP += sub.present; theoryT += sub.total; } 
      else if (sub.type === SubjectType.LAB) { labP += sub.present; labT += sub.total; }
    });
    const totalP = theoryP + labP;
    const totalT = theoryT + labT;

    return {
      overall: { val: totalT === 0 ? 0 : Math.round((totalP / totalT) * 100), hasData: totalT > 0 },
      theory: { val: theoryT === 0 ? 0 : Math.round((theoryP / theoryT) * 100), hasData: theoryT > 0 },
      lab: { val: labT === 0 ? 0 : Math.round((labP / labT) * 100), hasData: labT > 0 }
    };
  }, [stats]);

  const minCriteria = term?.minAttendanceCriteria || 75;

  const handleAddExtraClass = () => {
    if(!newExtraSubject) return;
    addExtraClass({
      id: uuidv4(),
      subjectId: newExtraSubject,
      date: dateStr,
      startTime: newExtraStart,
      endTime: newExtraEnd
    });
    setNewExtraSubject('');
  };

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Animated Light Rays Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#d0169e"
          raysSpeed={1.5}
          lightSpread={1.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.3}
          noiseAmount={0.25}
          distortion={0.1}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1.5}
          saturation={3}
        />
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, {user?.name}</h1>
          <p className="text-gray-400 text-sm">Your Liquid Status</p>
        </div>
      </div>

      {/* Floating Liquid Bubbles Section */}
      <div className="relative h-72 w-full flex justify-center items-center -mt-4 mb-6">
        
        {/* Animated Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" overflow="visible">
          <motion.path 
            d="M 50% 30% L 20% 70%" 
            stroke="url(#grad1)" 
            strokeWidth="2" 
            fill="none" 
            className="opacity-30"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path 
            d="M 50% 30% L 80% 70%" 
            stroke="url(#grad1)" 
            strokeWidth="2" 
            fill="none" 
            className="opacity-30"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <defs>
             <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#06B6D4" />
             </linearGradient>
          </defs>
        </svg>

        {/* Overall Bubble (Center) */}
        <LiquidBubble 
          label="Overall"
          subLabel={`Target: ${minCriteria}%`}
          value={aggregateStats.overall.val}
          target={minCriteria}
          hasData={aggregateStats.overall.hasData}
          size="w-44 h-44"
          colorTheme="purple"
          delay={0}
          className="top-0"
        />

        {/* Theory Bubble (Left) */}
        <LiquidBubble 
          label="Theory"
          value={aggregateStats.theory.val}
          target={minCriteria}
          hasData={aggregateStats.theory.hasData}
          size="w-32 h-32"
          colorTheme="cyan"
          delay={0.2}
          className="bottom-0 left-4"
        />

        {/* Lab Bubble (Right) */}
        <LiquidBubble 
          label="Lab"
          value={aggregateStats.lab.val}
          target={minCriteria}
          hasData={aggregateStats.lab.hasData}
          size="w-32 h-32"
          colorTheme="pink"
          delay={0.4}
          className="bottom-0 right-4"
        />
      </div>
       <div className="my-8">
        <WeekCalendar />
      </div>


      {/* Schedule Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-6 bg-neon-pink rounded-full"></span>
          Today's Classes
        </h3>
        <button 
          onClick={() => setIsManageOpen(true)}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-white/5"
        >
          <Settings2 size={14} /> Manage
        </button>
      </div>
      
      <div className="space-y-3 pb-24">
        {todaysClasses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-surface/50 rounded-xl text-center border border-white/5">
            <p className="text-gray-500">No classes scheduled for today. Enjoy!</p>
          </motion.div>
        ) : (
          todaysClasses.map((session, idx) => {
            const subject = subjects.find(s => s.id === session.subjectId);
            const log = attendanceLogs.find(l => l.date === dateStr && l.sessionId === session.id);
            const status = log?.status;
            const duration = getDurationInHours(session.startTime, session.endTime);
            const isCancelled = status === 'Cancelled';

            return (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`p-4 rounded-xl border flex items-center justify-between relative overflow-hidden transition-all ${isCancelled ? 'bg-surface/30 border-white/5 opacity-60' : 'bg-surface border-white/5'}`}
              >
                {isCancelled && (
                   <div className="absolute top-0 left-0 z-10">
                     <div className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded-br-lg border-b border-r border-red-500/20 backdrop-blur-md shadow-sm">
                       CANCELLED
                     </div>
                   </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1 mt-1">
                    <span className="text-xs text-neon-purple font-mono">{session.startTime} - {session.endTime}</span>
                    <span className="text-gray-600 text-xs">({duration}h)</span>
                    {session.isExtra && <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-1.5 rounded font-bold">EXTRA</span>}
                  </div>
                  <div className="font-bold text-white">{subject?.name}</div>
                  <div className="text-xs text-gray-500">{subject?.type}</div>
                </div>

                <div className="flex gap-2 z-20">
                  <button 
                    onClick={() => markAttendance({ id: `${dateStr}-${session.id}`, date: dateStr, sessionId: session.id, status: 'Present' })}
                    className={`p-3 rounded-lg transition-all ${status === 'Present' ? 'bg-success text-white shadow-lg shadow-success/20 scale-105' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                    disabled={isCancelled}
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => markAttendance({ id: `${dateStr}-${session.id}`, date: dateStr, sessionId: session.id, status: 'Absent' })}
                    className={`p-3 rounded-lg transition-all ${status === 'Absent' ? 'bg-danger text-white shadow-lg shadow-danger/20 scale-105' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                    disabled={isCancelled}
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isManageOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsManageOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#121216] w-full max-w-md rounded-2xl border border-white/10 p-6 z-10 relative max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings2 size={20} className="text-neon-purple"/> Manage Today</h3>
                <button onClick={() => setIsManageOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400"><X size={18} /></button>
              </div>

              <div className="mb-6 shrink-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add Extra Class</h4>
                <div className="space-y-3">
                   <select 
                      value={newExtraSubject} 
                      onChange={(e) => setNewExtraSubject(e.target.value)}
                      className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-purple"
                   >
                     <option value="">Select Subject</option>
                     {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                   </select>
                   <div className="flex gap-3">
                     <div className="flex-1 bg-surface-light border border-white/10 rounded-lg flex items-center px-3">
                        <Clock size={14} className="text-gray-500 mr-2"/>
                        <input type="time" value={newExtraStart} onChange={e => setNewExtraStart(e.target.value)} className="bg-transparent py-3 w-full outline-none text-sm"/>
                     </div>
                     <div className="flex-1 bg-surface-light border border-white/10 rounded-lg flex items-center px-3">
                        <Clock size={14} className="text-gray-500 mr-2"/>
                        <input type="time" value={newExtraEnd} onChange={e => setNewExtraEnd(e.target.value)} className="bg-transparent py-3 w-full outline-none text-sm"/>
                     </div>
                   </div>
                   <button 
                      onClick={handleAddExtraClass}
                      disabled={!newExtraSubject}
                      className="w-full bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 py-3 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <Plus size={16} /> Add Class
                   </button>
                </div>
              </div>

              <div className="shrink-1 min-h-0 flex flex-col">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 shrink-0">Cancel / Restore Classes</h4>
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-[150px]">
                   {todaysClasses.length === 0 ? <p className="text-sm text-gray-600 italic">No classes today.</p> : 
                     todaysClasses.map(session => {
                        const subject = subjects.find(s => s.id === session.subjectId);
                        const log = attendanceLogs.find(l => l.date === dateStr && l.sessionId === session.id);
                        const isCancelled = log?.status === 'Cancelled';
                        
                        return (
                          <div key={session.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg border border-white/5">
                             <div>
                                <div className="text-sm font-bold">{subject?.name}</div>
                                <div className="text-xs text-gray-500">{session.startTime} - {session.endTime}</div>
                             </div>
                             <button 
                                onClick={() => {
                                   markAttendance({ id: `${dateStr}-${session.id}`, date: dateStr, sessionId: session.id, status: isCancelled ? 'Absent' : 'Cancelled' });
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${isCancelled ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}`}
                             >
                                {isCancelled ? <><Undo2 size={12}/> Restore</> : <><CalendarX size={12}/> Cancel</>}
                             </button>
                          </div>
                        )
                     })
                   }
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};