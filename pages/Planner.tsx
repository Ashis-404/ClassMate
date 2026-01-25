import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { BrainCircuit, AlertTriangle, PartyPopper, ArrowUpCircle } from 'lucide-react';

const getDurationInHours = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  return Number((diffMinutes / 60).toFixed(2));
};

export const Planner: React.FC = () => {
  const { subjects, attendanceLogs, schedule, term } = useApp();

  // Core Intelligence Logic
  const insights = subjects.map(sub => {
    // Current Stats (Weighted by hours + Bulk Data)
    const subjectLogs = attendanceLogs.filter(l => {
       const session = schedule.find(s => s.id === l.sessionId);
       return session?.subjectId === sub.id;
    });

    // Incorporate Bulk Import Data (Assuming 1 class = 1 hour)
    let presentHours = sub.pastAttendedClasses || 0;
    let totalOccurredHours = (sub.pastAttendedClasses || 0) + (sub.pastAbsentClasses || 0);

    subjectLogs.forEach(log => {
      const session = schedule.find(s => s.id === log.sessionId);
      if (session) {
        const duration = getDurationInHours(session.startTime, session.endTime);
        if (log.status === 'Present') presentHours += duration;
        if (log.status !== 'Cancelled') totalOccurredHours += duration;
      }
    });

    const currentPct = totalOccurredHours === 0 ? 0 : (presentHours / totalOccurredHours) * 100;
    
    // Future Estimation 
    // Calculate weekly hours for this subject
    const weeklyHours = schedule
      .filter(s => s.subjectId === sub.id)
      .reduce((acc, s) => acc + getDurationInHours(s.startTime, s.endTime), 0);
    
    // Estimate remaining weeks (Simplified: Fixed 14 weeks for demo or calculation based on term dates)
    const totalSemesterWeeks = 16;
    // Estimate passed weeks based on totalOccurred / weeklyHours (roughly)
    const weeksPassed = weeklyHours > 0 ? Math.ceil(totalOccurredHours / weeklyHours) : 0;
    const remainingWeeks = Math.max(0, totalSemesterWeeks - weeksPassed);
    const remainingHours = remainingWeeks * weeklyHours;

    // Skip Budget Calculation
    const targetRate = sub.targetPercentage / 100;
    const projectedTotalHours = totalOccurredHours + remainingHours;
    
    // Max allowable skips (in hours) for the ENTIRE semester context
    const maxSkipsTotal = Math.floor(presentHours + remainingHours - (targetRate * projectedTotalHours));
    const safeSkips = Math.max(0, maxSkipsTotal);

    // Recovery Plan
    // Need >= (Target*Total - Present) / (1 - Target)
    let recoveryNeeded = 0;
    if (totalOccurredHours > 0 && currentPct < sub.targetPercentage) {
       recoveryNeeded = Math.ceil((targetRate * totalOccurredHours - presentHours) / (1 - targetRate));
    }

    return {
      ...sub,
      presentHours,
      totalOccurredHours,
      safeSkips, // In hours
      recoveryNeeded, // In hours
      currentPct
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-neon-purple/20 to-blue-600/20 p-6 rounded-2xl border border-neon-purple/30">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="text-neon-purple" />
          <h2 className="text-xl font-bold text-white">AI Strategist</h2>
        </div>
        <p className="text-sm text-gray-300">
          Based on weighted hourly attendance, here is your personalized strategy.
        </p>
      </div>

      <div className="space-y-4">
        {insights.map(sub => (
          <motion.div 
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface p-5 rounded-xl border border-white/5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">{sub.name}</h3>
              <div className={`px-2 py-1 rounded text-xs font-bold ${sub.totalOccurredHours === 0 ? 'bg-white/10 text-gray-400' : (sub.currentPct >= sub.targetPercentage ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}`}>
                {sub.totalOccurredHours === 0 ? 'N/A' : `${Math.round(sub.currentPct)}%`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Skip Budget Card */}
              <div className={`p-3 rounded-lg border ${sub.safeSkips > 0 ? 'bg-surface-light border-white/10' : 'bg-surface-light border-white/5 opacity-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <PartyPopper size={14} className="text-neon-cyan" />
                  <span className="text-xs text-gray-400 font-bold uppercase">Skip Budget</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">
                  {sub.safeSkips} <span className="text-xs font-sans text-gray-500 font-normal">hrs</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                  Hours you can safely miss and stay above {sub.targetPercentage}%.
                </p>
              </div>

              {/* Recovery Card */}
              {sub.recoveryNeeded > 0 ? (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-danger" />
                    <span className="text-xs text-danger font-bold uppercase">Recovery</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {sub.recoveryNeeded} <span className="text-xs font-sans text-gray-500 font-normal">hrs</span>
                  </div>
                   <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                    Consecutive hours required to reach safety.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-1">
                    <ArrowUpCircle size={14} className="text-success" />
                    <span className="text-xs text-success font-bold uppercase">{sub.totalOccurredHours === 0 ? 'Waiting for Data' : 'Safe Zone'}</span>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{sub.totalOccurredHours === 0 ? 'Log your first class!' : 'You are on track!'}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};