import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Subject, ClassSession, AttendanceRecord, Term, DayOfWeek, NotificationSettings, ExtraClass } from '../types';

const INITIAL_STATE: AppState = {
  user: null,
  term: null,
  subjects: [],
  schedule: [],
  extraClasses: [],
  attendanceLogs: [],
  isOnboarded: false,
  notificationSettings: {
    enabled: false,
    time: "20:00",
    lastNotifiedDate: null,
  }
};

interface AppContextType extends AppState {
  setUser: (name: string, type: 'College' | 'School') => void;
  setTerm: (term: Term) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  updateSubjectPastData: (id: string, attended: number, absent: number) => void;
  updateSchedule: (sessions: ClassSession[]) => void;
  addExtraClass: (extraClass: ExtraClass) => void;
  markAttendance: (record: AttendanceRecord) => void;
  resetData: () => void;
  completeOnboarding: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('attendIQ_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure notificationSettings exists for older saves
        if (!parsed.notificationSettings) {
          parsed.notificationSettings = INITIAL_STATE.notificationSettings;
        }
        // Ensure extraClasses exists for older saves
        if (!parsed.extraClasses) {
          parsed.extraClasses = [];
        }
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('attendIQ_data', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Notification Timer Logic
  useEffect(() => {
    if (!state.notificationSettings.enabled) return;

    const checkAndNotify = () => {
       const now = new Date();
       const [targetHour, targetMinute] = state.notificationSettings.time.split(':').map(Number);
       
       const targetTime = new Date();
       targetTime.setHours(targetHour, targetMinute, 0, 0);

       const todayStr = now.toISOString().split('T')[0];
       const { lastNotifiedDate } = state.notificationSettings;

       // If now is past target time AND we haven't notified today
       if (now >= targetTime && lastNotifiedDate !== todayStr) {
          if (Notification.permission === 'granted') {
             try {
                new Notification("AttendIQ Reminder", {
                   body: "Time to log your attendance for the day! Keep your streak alive.",
                   icon: "/vite.svg" // Browser usually handles this relative path
                });
             } catch (e) {
                console.error("Notification failed", e);
             }
             
             // Update state to prevent multiple notifications today
             setState(prev => ({
                ...prev,
                notificationSettings: {
                   ...prev.notificationSettings,
                   lastNotifiedDate: todayStr
                }
             }));
          }
       }
    };

    // Check immediately and then every minute
    checkAndNotify();
    const timer = setInterval(checkAndNotify, 60000); 

    return () => clearInterval(timer);
  }, [state.notificationSettings]);

  const setUser = (name: string, type: 'College' | 'School') => {
    setState(prev => ({ ...prev, user: { name, type } }));
  };

  const setTerm = (term: Term) => {
    setState(prev => ({ ...prev, term }));
  };

  const addSubject = (subject: Subject) => {
    setState(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  };

  const removeSubject = (id: string) => {
    setState(prev => ({ 
      ...prev, 
      subjects: prev.subjects.filter(s => s.id !== id),
      schedule: prev.schedule.filter(s => s.subjectId !== id) // Cascade delete
    }));
  };

  const updateSubjectPastData = (id: string, attended: number, absent: number) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, pastAttendedClasses: attended, pastAbsentClasses: absent } : s)
    }));
  };

  const updateSchedule = (sessions: ClassSession[]) => {
    setState(prev => ({ ...prev, schedule: sessions }));
  };

  const addExtraClass = (extraClass: ExtraClass) => {
    setState(prev => ({ ...prev, extraClasses: [...prev.extraClasses, extraClass] }));
  };

  const markAttendance = (record: AttendanceRecord) => {
    setState(prev => {
      // Update logs
      const existingIndex = prev.attendanceLogs.findIndex(
        l => l.date === record.date && l.sessionId === record.sessionId
      );
      
      let newLogs = [...prev.attendanceLogs];
      if (existingIndex >= 0) {
        newLogs[existingIndex] = record;
      } else {
        newLogs.push(record);
      }
      return { ...prev, attendanceLogs: newLogs };
    });
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, isOnboarded: true }));
  }

  const resetData = () => {
    localStorage.removeItem('attendIQ_data');
    window.location.reload();
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...settings }
    }));
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{ 
      ...state, 
      setUser, 
      setTerm, 
      addSubject, 
      removeSubject, 
      updateSubjectPastData,
      updateSchedule, 
      addExtraClass,
      markAttendance, 
      resetData, 
      completeOnboarding,
      updateNotificationSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};