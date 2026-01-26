import React from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Archive, LogOut, Bell, Clock, CheckCircle, Database, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const context = useApp(); // Get full context object
  const { user, term, resetData, notificationSettings, updateNotificationSettings } = context;
  const navigate = useNavigate();

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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Profile Card */}
      <div className="bg-surface p-6 rounded-2xl border border-white/5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-2xl font-bold text-white">
          {user?.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">{user?.name}</h3>
          <p className="text-gray-500 text-sm">Current Term: {term?.name}</p>
        </div>
      </div>

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
    </div>
  );
};