import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export const Planner: React.FC = () => {
  const { subjects, attendanceLogs, schedule, term, extraClasses } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  // Simplified calculation with class-based counting
  const insights = useMemo(() => {
    return subjects.map(sub => {
      // COUNT PAST BULK-IMPORTED DATA
      const bulkImportAttended = sub.pastAttendedClasses || 0;
      const bulkImportAbsent = sub.pastAbsentClasses || 0;
      const bulkImportTotal = bulkImportAttended + bulkImportAbsent;

      // COUNT CURRENT & TODAY ATTENDANCE LOGS (excluding cancelled)
      const pastAndTodayLogs = attendanceLogs.filter(l => {
        const sessionOrExtra = schedule.find(s => s.id === l.sessionId) || extraClasses.find(e => e.id === l.sessionId);
        const isCurrentOrPast = l.date <= todayStr;
        return sessionOrExtra?.subjectId === sub.id && isCurrentOrPast && l.status !== 'Cancelled';
      });

      const currentClassesAttended = pastAndTodayLogs.filter(l => l.status === 'Present').length;
      const currentClassesTotal = pastAndTodayLogs.length;

      // GRAND TOTALS (Bulk + Current)
      const totalClassesHappened = bulkImportTotal + currentClassesTotal;
      const totalClassesAttended = bulkImportAttended + currentClassesAttended;
      const currentAttendancePercent = totalClassesHappened === 0 ? 0 : Math.round((totalClassesAttended / totalClassesHappened) * 100);

      // RISK ASSESSMENT
      let zone: 'safe' | 'warning' | 'danger' = 'safe';
      if (currentAttendancePercent < sub.targetPercentage) {
        zone = currentAttendancePercent < sub.targetPercentage - 10 ? 'danger' : 'warning';
      }

      return {
        ...sub,
        totalClassesAttended,
        totalClassesHappened,
        currentAttendancePercent,
        zone
      };
    });
  }, [subjects, attendanceLogs, schedule, extraClasses, todayStr]);


  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="text-neon-purple" size={28} />
          Attendance Planner
        </h1>
        <p className="text-gray-400">Track your attendance progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 p-4 rounded-2xl border border-neon-purple/30 backdrop-blur-md"
        >
          <p className="text-xs text-gray-400 font-bold uppercase mb-2">Total Subjects</p>
          <p className="text-4xl font-bold text-white">{subjects.length}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-success/20 to-neon-cyan/20 p-4 rounded-2xl border border-success/30 backdrop-blur-md"
        >
          <p className="text-xs text-gray-400 font-bold uppercase mb-2">On Track</p>
          <p className="text-4xl font-bold text-success">{insights.filter(s => s.zone === 'safe').length}</p>
        </motion.div>
      </div>

      {/* Subject Cards */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-surface/50 rounded-2xl border border-white/5 text-center"
          >
            <p className="text-gray-400">Add subjects to track your attendance</p>
          </motion.div>
        ) : (
          insights.map((sub, idx) => {
            const progressPercent = Math.min(100, (sub.currentAttendancePercent / sub.targetPercentage) * 100);
            const zoneColor = sub.zone === 'safe' ? 'from-success to-neon-cyan' : sub.zone === 'warning' ? 'from-amber-500 to-neon-cyan' : 'from-danger to-neon-pink';
            const zoneBgColor = sub.zone === 'safe' ? 'bg-success/10 border-success/30' : sub.zone === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-danger/10 border-danger/30';

            return (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border p-5 backdrop-blur-md transition-all hover:border-white/20 ${zoneBgColor}`}
              >
                {/* Header with Subject Name and Attendance % */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{sub.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{sub.type}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold font-mono ${
                      sub.zone === 'safe' ? 'text-success' : sub.zone === 'warning' ? 'text-amber-400' : 'text-danger'
                    }`}>
                      {sub.currentAttendancePercent}%
                    </div>
                    <p className="text-xs text-gray-400 mt-1">attendance</p>
                  </div>
                </div>

                {/* Classes Info */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-xs text-gray-400 font-bold">ATTENDED</p>
                    <p className="text-2xl font-bold text-neon-cyan">{sub.totalClassesAttended}</p>
                  </div>
                  <div className="text-gray-600 text-lg">/</div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">TOTAL</p>
                    <p className="text-2xl font-bold text-white">{sub.totalClassesHappened}</p>
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300">TARGET: {sub.targetPercentage}%</span>
                    <span className={`text-xs font-bold ${
                      sub.zone === 'safe' ? 'text-success' : sub.zone === 'warning' ? 'text-amber-400' : 'text-danger'
                    }`}>
                      {sub.zone === 'safe' ? '✓ SAFE' : sub.zone === 'warning' ? '⚠ WARNING' : '✕ DANGER'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${zoneColor} rounded-full`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};