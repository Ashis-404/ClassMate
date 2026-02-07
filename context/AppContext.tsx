
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, fetchUserData, saveUserData, getLastUpdateTimestamp, deleteUserData } from '../firebase';
import { AppState, Subject, ClassSession, AttendanceRecord, Term, DayOfWeek, NotificationSettings, ExtraClass } from '../types';
import { validateAppState, sanitizeAppState } from '../services/validation';

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
  firestoreBlocked?: boolean;
  isSyncing: boolean;
  syncError: string | null;
  setUser: (name: string, type: 'College' | 'School', institution?: string) => void;
  setProfilePicture: (pfp: string | null) => void;
  setTerm: (term: Term) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  updateSubjectPastData: (id: string, attended: number, absent: number) => void;
  editSubject: (id: string, updates: Partial<Subject>) => void;
  updateSchedule: (sessions: ClassSession[]) => void;
  editScheduleSession: (id: string, updates: Partial<ClassSession>) => void;
  addExtraClass: (extraClass: ExtraClass) => void;
  markAttendance: (record: AttendanceRecord) => void;
  removeAttendanceRecord: (date: string, sessionId: string) => void;
  signOut: () => void;
  resetData: () => void;
  completeOnboarding: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  editUserProfile: (updates: { name?: string; institution?: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Track critical operations (like onboarding completion) that need immediate save
  const criticalSaveRef = useRef<Promise<void> | null>(null);

  // Track whether user is deliberately signing out - skip Firestore saves during signout
  const isSigningOutRef = useRef(false);

  // Track current firebase user UID via ref to avoid stale closures in the auth listener
  const firebaseUserUidRef = useRef<string | null>(null);

  // Firebase Auth Listener — runs ONCE (no deps), uses ref instead of state for comparisons
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const previousUid = firebaseUserUidRef.current;
      const newUid = user?.uid ?? null;

      firebaseUserUidRef.current = newUid;
      setFirebaseUser(user);
      setAuthLoading(false);

      if (!user) {
        // User logged out: clear local state but do NOT touch Firestore
        localStorage.removeItem('attendIQ_data');
        setState(INITIAL_STATE);
        setLastSyncTime(null);
        setSyncError(null);
        isSigningOutRef.current = false;
      }

      // When user changes (login, logout, or switch account),
      // reset isLoaded so the save effect won't fire until fresh data is loaded.
      if (previousUid !== newUid) {
        setIsLoaded(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load from Firestore (fallback to LocalStorage)
  const saveTimeoutRef = useRef<any>(null);
  const [firestoreBlocked, setFirestoreBlocked] = useState(false);
  const lastLocalUpdateRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (firebaseUser) {
        try {
          // Fetch both remote timestamp and data for conflict resolution
          const remoteTimestamp = await getLastUpdateTimestamp(firebaseUser.uid);
          const remote = await fetchUserData(firebaseUser.uid);

          if (!cancelled && remote) {
            if (!remote.notificationSettings) remote.notificationSettings = INITIAL_STATE.notificationSettings;
            if (!remote.extraClasses) remote.extraClasses = [];
            
            // Validate loaded data
            const validation = validateAppState(remote);
            if (!validation.isValid) {
              console.warn('⚠ Invalid data loaded from Firestore, sanitizing:', validation.errors);
              const sanitized = sanitizeAppState(remote);
              setState(sanitized);
              localStorage.setItem('attendIQ_data', JSON.stringify(sanitized));
            } else {
              setState(remote);
              localStorage.setItem('attendIQ_data', JSON.stringify(remote));
            }

            if (remoteTimestamp) {
              setLastSyncTime(remoteTimestamp);
              lastLocalUpdateRef.current = remoteTimestamp;
            }
          } else if (!cancelled) {
            const stored = localStorage.getItem('attendIQ_data');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (!parsed.notificationSettings) parsed.notificationSettings = INITIAL_STATE.notificationSettings;
                if (!parsed.extraClasses) parsed.extraClasses = [];
                setState(parsed);
              } catch (e) {
                console.error('✗ Failed to parse stored data', e);
                setState(INITIAL_STATE);
              }
            } else {
              setState(INITIAL_STATE);
            }
          }
        } catch (e: any) {
          console.error('✗ Error fetching remote user data', e);
          // If the browser or an extension blocks connections to Firestore (ERR_BLOCKED_BY_CLIENT),
          // surface a helpful developer message and mark the flag so UI can warn the user.
          setFirestoreBlocked(true);
          console.warn('⚠ Firestore requests may be blocked by a browser extension (adblock/privacy). Try disabling extensions or whitelisting firestore.googleapis.com and related Firebase domains.');
          const stored = localStorage.getItem('attendIQ_data');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (!parsed.notificationSettings) parsed.notificationSettings = INITIAL_STATE.notificationSettings;
              if (!parsed.extraClasses) parsed.extraClasses = [];
              setState(parsed);
            } catch (err) {
              console.error('✗ Failed to parse stored data', err);
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

  // Improved save logic with validation, conflict resolution, and retry
  const performSave = useCallback(
    async (dataToSave: AppState, isUrgent: boolean = false) => {
      if (!firebaseUser) return;

      // Validate data before saving
      const validation = validateAppState(dataToSave);
      if (!validation.isValid) {
        console.warn('✗ Validation failed, sanitizing data:', validation.errors);
        setSyncError(`Validation error: ${validation.errors[0]}`);
        // Sanitize and save sanitized version
        const sanitized = sanitizeAppState(dataToSave);
        // Update state with sanitized version
        setState(sanitized);
        localStorage.setItem('attendIQ_data', JSON.stringify(sanitized));
        return;
      }

      // Always save to localStorage immediately (critical for offline support)
      try {
        localStorage.setItem('attendIQ_data', JSON.stringify(dataToSave));
      } catch (err) {
        console.error('✗ Failed to save to localStorage:', err);
        setSyncError('Local storage save failed');
      }

      // Save to Firestore - user's local changes are the source of truth
      // The user's most recent action should always be saved, regardless of server state
      setIsSyncing(true);
      try {
        await saveUserData(firebaseUser.uid, dataToSave);
        setIsSyncing(false);
        setSyncError(null);
        console.log('✓ Data synced to Firestore');
      } catch (error: any) {
        setIsSyncing(false);
        // Don't throw - data is safe in localStorage, will retry on next change
        console.error('✗ Failed to sync to Firestore:', error);
        setSyncError('Sync failed, saving locally. Will retry.');
      }
    },
    [firebaseUser]
  );

  // Save to LocalStorage immediately and Firestore with debounce
  useEffect(() => {
    if (isLoaded && firebaseUser && !isSigningOutRef.current) {
      // SAFETY GUARD: Never overwrite Firestore with empty/initial state.
      // This prevents the race condition where state is still INITIAL_STATE
      // right after login but before Firestore data has been loaded.
      const isEmptyState = !state.isOnboarded && state.subjects.length === 0;
      if (isEmptyState) {
        console.warn('⚠ Skipping save: state appears to be INITIAL_STATE, refusing to overwrite Firestore');
        return;
      }

      // Always save immediately to localStorage for data safety
      localStorage.setItem('attendIQ_data', JSON.stringify(state));

      // Debounce Firestore save - for high-frequency updates, batch them
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      // CRITICAL operations: onboarding completion
      // These MUST be saved immediately without debounce
      const hasCriticalChanges = state.isOnboarded === true;
      const delay = hasCriticalChanges ? 10 : 1000;

      saveTimeoutRef.current = setTimeout(() => {
        const savePromise = performSave(state);
        if (hasCriticalChanges) {
          // Store the promise so other code can wait for it
          criticalSaveRef.current = savePromise;
        }
      }, delay);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isLoaded, firebaseUser, performSave]);

  // Handle page unload - ensure pending saves are flushed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Cancel pending debounce and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // This becomes a synchronous operation at unload time
      // Navigator.sendBeacon is not available in React context, so we rely on
      // localStorage being the source of truth and the debounce being short
      if (isLoaded && firebaseUser && state) {
        // Final save attempt (non-blocking)
        performSave(state, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state, isLoaded, firebaseUser, performSave]);
  
  const setUser = (name: string, type: 'College' | 'School', institution?: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, name, type, institution } as any }));
  };

  const setProfilePicture = (pfp: string | null) => {
    setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, profilePicture: pfp } : prev.user }));
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

  const editSubject = (id: string, updates: Partial<Subject>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const updateSchedule = (sessions: ClassSession[]) => {
    setState(prev => ({ ...prev, schedule: sessions }));
  };

  const editScheduleSession = (id: string, updates: Partial<ClassSession>) => {
    setState(prev => ({
      ...prev,
      schedule: prev.schedule.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
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

  const removeAttendanceRecord = (date: string, sessionId: string) => {
    setState(prev => ({
      ...prev,
      attendanceLogs: prev.attendanceLogs.filter(
        l => !(l.date === date && l.sessionId === sessionId)
      )
    }));
  };

  const completeOnboarding = async () => {
    // First, update state
    setState(prev => ({ ...prev, isOnboarded: true }));
    
    // Now wait for the critical save to complete
    // We need to wait for a short time to allow React to process the state change
    // and trigger the useEffect that sets criticalSaveRef
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Keep checking for the critical save promise to be set
    let attempts = 0;
    const maxAttempts = 100; // 100 * 50ms = 5 seconds max wait
    
    while (criticalSaveRef.current === null && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    if (criticalSaveRef.current) {
      try {
        await criticalSaveRef.current;
        console.log('✓ Onboarding completion saved to Firestore');
      } catch (error) {
        console.error('✗ Failed to save onboarding completion, but data is safe in localStorage');
        // Don't throw - data is safe in localStorage even if Firestore fails
      }
    } else {
      console.warn('⚠ Onboarding save timed out, but data is safe in localStorage');
    }
  };

  // Sign out only — preserves all data in Firestore, just ends the session
  const signOut = () => {
    // Cancel any pending Firestore saves to prevent overwriting remote data with empty state
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    isSigningOutRef.current = true;
    // Auth listener will handle clearing local state
    auth.signOut();
  };

  // Destructive reset — wipes Firestore data and signs out
  const resetData = async () => {
    // Cancel any pending Firestore saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    isSigningOutRef.current = true;

    // Wipe Firestore data before signing out (need uid while still authenticated)
    if (firebaseUser) {
      try {
        await deleteUserData(firebaseUser.uid);
        console.log('✓ Firestore data wiped for reset');
      } catch (error) {
        console.error('✗ Failed to wipe Firestore data during reset:', error);
        // Continue with sign-out even if Firestore delete fails
      }
    }

    // Clear localStorage
    localStorage.removeItem('attendIQ_data');

    // Auth listener will handle clearing local state
    auth.signOut();
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...settings }
    }));
  };

  const editUserProfile = (updates: { name?: string; institution?: string }) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : prev.user
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
      firestoreBlocked,
      isSyncing,
      syncError,
      setUser, 
      setProfilePicture,
      setTerm, 
      addSubject, 
      removeSubject, 
      updateSubjectPastData,
      editSubject,
      updateSchedule,
      editScheduleSession,
      addExtraClass,
      markAttendance,
      removeAttendanceRecord,
      signOut,
      resetData, 
      completeOnboarding,
      updateNotificationSettings,
      editUserProfile
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
