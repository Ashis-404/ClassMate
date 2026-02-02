import React, { useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Upload, Trash2, Calendar, BookOpen, Zap, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectType } from '../types';

// Helper to get duration in hours
const getDurationInHours = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  return Number((diffMinutes / 60).toFixed(2));
};

export const Profile: React.FC = () => {
  const { user, term, notificationSettings, resetData, subjects, attendanceLogs, schedule, extraClasses, firebaseUser, setProfilePicture } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pfpData, setPfpData] = useState<string | null>(user?.profilePicture ?? null);
  const [showPFPModal, setShowPFPModal] = useState(false);

  // Calculate class statistics based on hours (same as Dashboard)
  const stats = useMemo(() => {
    let theoryPresentHours = 0, theoryTotalHours = 0;
    let labPresentHours = 0, labTotalHours = 0;
    let overallPresentHours = 0, overallTotalHours = 0;

    subjects.forEach(sub => {
      const subLogs = attendanceLogs.filter(l => {
        const session = schedule.find(s => s.id === l.sessionId);
        const extra = extraClasses.find(e => e.id === l.sessionId);
        return (session || extra)?.subjectId === sub.id;
      });

      let subPresentHours = sub.pastAttendedClasses || 0;
      let subTotalHours = (sub.pastAttendedClasses || 0) + (sub.pastAbsentClasses || 0);

      subLogs.forEach(log => {
        const session = schedule.find(s => s.id === log.sessionId);
        const extraSession = extraClasses.find(e => e.id === log.sessionId);
        const actualSession = session || extraSession;

        if (actualSession) {
          const duration = getDurationInHours(actualSession.startTime, actualSession.endTime);
          if (log.status === 'Present') subPresentHours += duration;
          if (log.status !== 'Cancelled') subTotalHours += duration;
        }
      });

      overallPresentHours += subPresentHours;
      overallTotalHours += subTotalHours;

      if (sub.type === SubjectType.THEORY) {
        theoryPresentHours += subPresentHours;
        theoryTotalHours += subTotalHours;
      } else if (sub.type === SubjectType.LAB) {
        labPresentHours += subPresentHours;
        labTotalHours += subTotalHours;
      }
    });

    const overallPct = overallTotalHours === 0 ? 0 : Math.round((overallPresentHours / overallTotalHours) * 100);
    const theoryPct = theoryTotalHours === 0 ? 0 : Math.round((theoryPresentHours / theoryTotalHours) * 100);
    const labPct = labTotalHours === 0 ? 0 : Math.round((labPresentHours / labTotalHours) * 100);

    return {
      overall: { present: Number(overallPresentHours.toFixed(2)), total: Number(overallTotalHours.toFixed(2)), pct: overallPct },
      theory: { present: Number(theoryPresentHours.toFixed(2)), total: Number(theoryTotalHours.toFixed(2)), pct: theoryPct },
      lab: { present: Number(labPresentHours.toFixed(2)), total: Number(labTotalHours.toFixed(2)), pct: labPct }
    };
  }, [subjects, attendanceLogs, schedule, extraClasses]);

  const handlePFPUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPfpData(base64);
        setProfilePicture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePFP = () => {
    setPfpData(null);
    setProfilePicture(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Profile</h2>
      </div>

      {/* Profile Picture Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan p-1 shadow-lg shadow-neon-purple/30">
            {pfpData ? (
              <img 
                src={pfpData} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover bg-surface"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                <div className="text-4xl font-bold text-neon-purple opacity-70">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowPFPModal(true)}
            className="absolute bottom-0 right-0 bg-neon-cyan text-void p-3 rounded-full shadow-lg hover:bg-neon-cyan/80 transition-colors"
          >
            <Camera size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-400">Click camera to upload or remove</p>
      </motion.div>

      {/* User Information */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md space-y-4"
      >
        <div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Name</div>
          <div className="mt-1 text-lg font-semibold text-white">{user?.name || 'Student'}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account Email</div>
          <div className="mt-1 text-sm text-neon-cyan font-mono">{firebaseUser?.email || 'Not available'}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Institution</div>
          <div className="mt-1 text-sm text-white">{user?.institution || user?.type || 'Not set'}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current Term</div>
          <div className="mt-1 font-medium text-white">{term?.name || 'Not set'}</div>
          {term && <div className="text-xs text-gray-500 mt-1">{term.startDate} — {term.endDate}</div>}
        </div>
      </motion.div>

      {/* Class Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar size={20} className="text-neon-purple" />
          Class Statistics
        </h3>

        {/* Overall Stats */}
        <div className="bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-neon-purple" />
              <span className="font-bold text-white">Overall</span>
            </div>
            <div className="text-3xl font-mono font-bold text-neon-purple">
              {stats.overall.pct}%
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Attended: {stats.overall.present}h / {stats.overall.total}h</span>
          </div>
        </div>

        {/* Theory Stats */}
        {stats.theory.total > 0 && (
          <div className="bg-surface/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-neon-cyan" />
                <span className="font-semibold text-white">Theory</span>
              </div>
              <div className="text-2xl font-mono font-bold text-neon-cyan">
                {stats.theory.pct}%
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {stats.theory.present}h attended / {stats.theory.total}h total
            </div>
          </div>
        )}

        {/* Lab Stats */}
        {stats.lab.total > 0 && (
          <div className="bg-surface/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-neon-pink" />
                <span className="font-semibold text-white">Lab</span>
              </div>
              <div className="text-2xl font-mono font-bold text-neon-pink">
                {stats.lab.pct}%
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {stats.lab.present}h attended / {stats.lab.total}h total
            </div>
          </div>
        )}
      </motion.div>

      {/* App Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md"
      >
        <div className="text-xs text-gray-400 uppercase font-bold mb-3">App Settings</div>
        <div className="text-sm text-gray-300">
          Notifications: {notificationSettings.enabled ? `On (${notificationSettings.time})` : 'Off'}
        </div>
      </motion.div>

      {/* Sign Out Button */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button 
          onClick={() => resetData()} 
          className="w-full bg-gradient-to-r from-danger/80 to-danger hover:from-danger hover:to-danger/80 text-white py-3 rounded-lg font-bold shadow-lg shadow-danger/20 transition-all"
        >
          Sign Out
        </button>
      </motion.div>

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePFPUpload}
        className="hidden"
      />

      {/* PFP Upload/Remove Modal */}
      <AnimatePresence>
        {showPFPModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPFPModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl shadow-neon-purple/30 w-full max-w-xs">
                {/* Close Button */}
                <button
                  onClick={() => setShowPFPModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Title */}
                <div className="mb-6 pr-8">
                  <h3 className="text-xl font-bold text-white mb-1">Profile Picture</h3>
                  <p className="text-xs text-gray-400">Upload or remove your profile picture</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {/* Upload Button */}
                  <button
                    onClick={() => {
                      setShowPFPModal(false);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 border border-neon-cyan/30 text-neon-cyan py-3 rounded-lg font-semibold transition-all"
                  >
                    <Upload size={18} />
                    Upload Image
                  </button>

                  {/* Remove Button */}
                  {pfpData && (
                    <button
                      onClick={() => {
                        handleRemovePFP();
                        setShowPFPModal(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-danger/20 to-danger/10 hover:from-danger/30 hover:to-danger/20 border border-danger/30 text-danger py-3 rounded-lg font-semibold transition-all"
                    >
                      <Trash2 size={18} />
                      Remove Picture
                    </button>
                  )}

                  {/* Cancel Button */}
                  <button
                    onClick={() => setShowPFPModal(false)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
