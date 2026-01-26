
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, fetchUserData, saveUserData } from '../firebase';
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
  firebaseUser: User | null;
  authLoading: boolean;
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (!user) {
        // When user logs out, reset everything
        localStorage.removeItem('attendIQ_data');
        setState(INITIAL_STATE);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load from Firestore (fallback to LocalStorage)
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (firebaseUser) {
        try {
          const remote = await fetchUserData(firebaseUser.uid);
          if (!cancelled && remote) {
            if (!remote.notificationSettings) remote.notificationSettings = INITIAL_STATE.notificationSettings;
            if (!remote.extraClasses) remote.extraClasses = [];
            setState(remote);
            localStorage.setItem('attendIQ_data', JSON.stringify(remote));
          } else if (!cancelled) {
            const stored = localStorage.getItem('attendIQ_data');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (!parsed.notificationSettings) parsed.notificationSettings = INITIAL_STATE.notificationSettings;
                if (!parsed.extraClasses) parsed.extraClasses = [];
                setState(parsed);
              } catch (e) {
                console.error('Failed to parse stored data', e);
                setState(INITIAL_STATE);
              }
            } else {
              setState(INITIAL_STATE);
            }
          }
        } catch (e) {
          console.error('Error fetching remote user data', e);
          const stored = localStorage.getItem('attendIQ_data');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (!parsed.notificationSettings) parsed.notificationSettings = INITIAL_STATE.notificationSettings;
              if (!parsed.extraClasses) parsed.extraClasses = [];
              setState(parsed);
            } catch (err) {
              console.error('Failed to parse stored data', err);
              setState(INITIAL_STATE);
            }
          } else {
            setState(INITIAL_STATE);
          }
        }
      } else {
        setState(INITIAL_STATE);
      }
      if (!cancelled) setIsLoaded(true);
    };
    load();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  // Save to LocalStorage and Firestore (debounced)
  useEffect(() => {
    if (isLoaded && firebaseUser) { // Only save if loaded and a user is present
      localStorage.setItem('attendIQ_data', JSON.stringify(state));
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveUserData(firebaseUser.uid, state).catch((e) => console.error('Failed to save user data', e));
      }, 1000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isLoaded, firebaseUser]);
  
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
      schedule: prev.schedule.filter(s => s.subjectId !== id)
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
    // This will be handled by the auth listener on signout
    auth.signOut();
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...settings }
    }));
  };

  if (authLoading || !isLoaded) {
    // Render a blank screen or a loader while auth state is being determined
    return <div className="min-h-screen bg-void" />;
  }

  return (
    <AppContext.Provider value={{ 
      ...state, 
      firebaseUser,
      authLoading,
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
