import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Archive, LogOut, Bell, Clock, CheckCircle, Database, History, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings: React.FC = () => {
  const context = useApp();
  const { user, term, resetData, notificationSettings, updateNotificationSettings, subjects, schedule, editSubject, editScheduleSession } = context;
  const navigate = useNavigate();
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editScheduleDay, setEditScheduleDay] = useState('');
  const [editScheduleStart, setEditScheduleStart] = useState('');
  const [editScheduleEnd, setEditScheduleEnd] = useState('');

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe all data permanently.")) {
      resetData();
    }
  };

  const handleExport = () => {
    try {
      // Create export object explicitly
      const exportData = {
        user: context.user,
        term: context.term,
        subjects: context.subjects,
        schedule: context.schedule,
        attendanceLogs: context.attendanceLogs,
        notificationSettings: context.notificationSettings
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      // Format: AttendIQ_Name_Date.json
      link.download = `AttendIQ_${context.user?.name || 'Backup'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export data. Please try again.");
    }
  };

  const toggleNotifications = async () => {
    if (!notificationSettings.enabled) {
      if (!('Notification' in window)) {
        alert("This browser does not support desktop notification");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateNotificationSettings({ enabled: true });
      } else {
        alert("Permission denied. Please enable notifications in your browser settings.");
      }
    } else {
      updateNotificationSettings({ enabled: false });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNotificationSettings({ time: e.target.value });
  };

  const handleSaveSubjectEdit = () => {
    if (selectedSubjectId && editSubjectName.trim()) {
      editSubject(selectedSubjectId, {
        name: editSubjectName.trim(),
        lecturer: editTeacherName.trim()
      });
      setShowEditSubject(false);
      setSelectedSubjectId(null);
    }
  };

  const handleSaveScheduleEdit = () => {
    if (selectedScheduleId && editScheduleDay && editScheduleStart && editScheduleEnd) {
      editScheduleSession(selectedScheduleId, {
        day: editScheduleDay as any,
        startTime: editScheduleStart,
        endTime: editScheduleEnd
      });
      setShowEditSchedule(false);
      setSelectedScheduleId(null);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Preferences</h3>
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
          {/* Enable Toggle */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${notificationSettings.enabled ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5 text-gray-500'}`}>
                <Bell size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Daily Reminders</div>
                <div className="text-xs text-gray-500">Get notified to log attendance</div>
              </div>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${notificationSettings.enabled ? 'bg-neon-purple' : 'bg-white/10'}`}
            >
              <motion.div 
                layout
                className="w-4 h-4 bg-white rounded-full shadow-md"
                animate={{ x: notificationSettings.enabled ? 24 : 0 }}
              />
            </button>
          </div>

          {/* Time Picker */}
          {notificationSettings.enabled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-4 bg-surface-light/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 text-gray-400">
                <div className="p-2">
                   <Clock size={18} />
                </div>
                <span className="text-sm">Reminder Time</span>
              </div>
              <input 
                type="time" 
                value={notificationSettings.time}
                onChange={handleTimeChange}
                className="bg-surface border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-purple"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Data</h3>
         <div className="space-y-3">
          {/* Edit Subject */}
          <button onClick={() => setShowEditSubject(true)} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-white/5 transition-colors">
            <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple"><Edit2 size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Edit Subject Details</div>
              <div className="text-xs text-gray-500">Update subject name or teacher name</div>
            </div>
          </button>

          {/* Edit Schedule */}
          <button onClick={() => setShowEditSchedule(true)} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-white/5 transition-colors">
            <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan"><Edit2 size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Edit Schedule</div>
              <div className="text-xs text-gray-500">Modify weekly class times and days</div>
            </div>
          </button>

          {/* Bulk Import Link */}
          <button onClick={() => navigate('/bulk-import')} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-white/5 transition-colors">
            <div className="p-2 bg-neon-pink/10 rounded-lg text-neon-pink"><History size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Import Past Attendance</div>
              <div className="text-xs text-gray-500">Add attended/missed classes from before</div>
            </div>
          </button>

          <button onClick={handleExport} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-white/5 transition-colors">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Archive size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Export Data</div>
              <div className="text-xs text-gray-500">Backup your attendance logs</div>
            </div>
          </button>
          
          <button onClick={handleReset} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-danger/10 group transition-colors">
            <div className="p-2 bg-danger/10 rounded-lg text-danger group-hover:bg-danger group-hover:text-white transition-colors"><Trash2 size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-danger group-hover:text-white">Reset App</div>
              <div className="text-xs text-gray-500 group-hover:text-gray-300">Clear all storage and start over</div>
            </div>
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account</h3>
         <div className="space-y-3">
          <button onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              resetData();
            }
          }} className="w-full flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5 text-left hover:bg-danger/10 group transition-colors">
            <div className="p-2 bg-danger/10 rounded-lg text-danger group-hover:bg-danger group-hover:text-white transition-colors"><LogOut size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-sm text-danger group-hover:text-white">Sign Out</div>
              <div className="text-xs text-gray-500 group-hover:text-gray-300">Log out of your account</div>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 mt-12 font-mono">
        AttendIQ v1.1.0<br/>
        Attendance Intelligence System
      </div>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {showEditSubject && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditSubject(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl shadow-neon-purple/30 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowEditSubject(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6">Edit Subject Details</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Select Subject</label>
                    <select
                      value={selectedSubjectId || ''}
                      onChange={(e) => {
                        const subId = e.target.value;
                        setSelectedSubjectId(subId);
                        const sub = subjects.find(s => s.id === subId);
                        if (sub) {
                          setEditSubjectName(sub.name);
                          setEditTeacherName(sub.lecturer || '');
                        }
                      }}
                      className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-purple transition-colors"
                    >
                      <option value="">Choose a subject...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedSubjectId && (
                    <>
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Subject Name</label>
                        <input
                          type="text"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-purple transition-colors"
                          placeholder="Subject name"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Teacher/Lecturer Name</label>
                        <input
                          type="text"
                          value={editTeacherName}
                          onChange={(e) => setEditTeacherName(e.target.value)}
                          className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-purple transition-colors"
                          placeholder="Teacher/Lecturer name (optional)"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowEditSubject(false)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg transition-all font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSubjectEdit}
                          className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Schedule Modal */}
      <AnimatePresence>
        {showEditSchedule && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditSchedule(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl shadow-neon-cyan/30 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowEditSchedule(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6">Edit Weekly Schedule</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Select Class</label>
                    <select
                      value={selectedScheduleId || ''}
                      onChange={(e) => {
                        const sessId = e.target.value;
                        setSelectedScheduleId(sessId);
                        const sess = schedule.find(s => s.id === sessId);
                        if (sess) {
                          setEditScheduleDay(sess.day);
                          setEditScheduleStart(sess.startTime);
                          setEditScheduleEnd(sess.endTime);
                        }
                      }}
                      className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-cyan transition-colors"
                    >
                      <option value="">Choose a class...</option>
                      {schedule.map(s => {
                        const sub = subjects.find(sub => sub.id === s.subjectId);
                        return (
                          <option key={s.id} value={s.id}>
                            {sub?.name} - {s.day} {s.startTime}-{s.endTime}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedScheduleId && (
                    <>
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Day of Week</label>
                        <select
                          value={editScheduleDay}
                          onChange={(e) => setEditScheduleDay(e.target.value)}
                          className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-cyan transition-colors"
                        >
                          <option value="Mon">Monday</option>
                          <option value="Tue">Tuesday</option>
                          <option value="Wed">Wednesday</option>
                          <option value="Thu">Thursday</option>
                          <option value="Fri">Friday</option>
                          <option value="Sat">Saturday</option>
                          <option value="Sun">Sunday</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Start Time</label>
                          <input
                            type="time"
                            value={editScheduleStart}
                            onChange={(e) => setEditScheduleStart(e.target.value)}
                            className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-cyan transition-colors"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">End Time</label>
                          <input
                            type="time"
                            value={editScheduleEnd}
                            onChange={(e) => setEditScheduleEnd(e.target.value)}
                            className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-cyan transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowEditSchedule(false)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg transition-all font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveScheduleEdit}
                          className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};