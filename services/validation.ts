import { AppState, Subject, ClassSession, AttendanceRecord, Term } from '../types';

/**
 * Validation utilities to ensure data consistency before Firestore saves
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the entire app state before saving to Firestore
 */
export const validateAppState = (state: AppState): ValidationResult => {
  const errors: string[] = [];

  // Validate user info
  if (state.user) {
    if (typeof state.user.name !== 'string' || state.user.name.trim().length === 0) {
      errors.push('User name is required');
    }
    if (!['College', 'School'].includes(state.user.type)) {
      errors.push('User type must be College or School');
    }
  }

  // Validate term
  if (state.term) {
    if (typeof state.term.id !== 'string' || state.term.id.trim().length === 0) {
      errors.push('Term ID is required');
    }
    if (typeof state.term.name !== 'string' || state.term.name.trim().length === 0) {
      errors.push('Term name is required');
    }
    if (typeof state.term.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(state.term.startDate)) {
      errors.push('Term start date must be in YYYY-MM-DD format');
    }
    if (typeof state.term.endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(state.term.endDate)) {
      errors.push('Term end date must be in YYYY-MM-DD format');
    }
    if (typeof state.term.minAttendanceCriteria !== 'number' || state.term.minAttendanceCriteria < 0 || state.term.minAttendanceCriteria > 100) {
      errors.push('Minimum attendance criteria must be between 0 and 100');
    }
  }

  // Validate subjects
  if (Array.isArray(state.subjects)) {
    state.subjects.forEach((subject, index) => {
      const subjectErrors = validateSubject(subject);
      errors.push(...subjectErrors.map(e => `Subject ${index}: ${e}`));
    });
  } else {
    errors.push('Subjects must be an array');
  }

  // Validate schedule (ClassSessions)
  if (Array.isArray(state.schedule)) {
    state.schedule.forEach((session, index) => {
      const sessionErrors = validateClassSession(session);
      errors.push(...sessionErrors.map(e => `Schedule item ${index}: ${e}`));
    });
  } else {
    errors.push('Schedule must be an array');
  }

  // Validate extra classes
  if (Array.isArray(state.extraClasses)) {
    state.extraClasses.forEach((extraClass, index) => {
      if (typeof extraClass.id !== 'string' || extraClass.id.trim().length === 0) {
        errors.push(`Extra class ${index}: ID is required`);
      }
      if (typeof extraClass.subjectId !== 'string' || extraClass.subjectId.trim().length === 0) {
        errors.push(`Extra class ${index}: Subject ID is required`);
      }
      if (typeof extraClass.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(extraClass.date)) {
        errors.push(`Extra class ${index}: Date must be in YYYY-MM-DD format`);
      }
      if (typeof extraClass.startTime !== 'string' || !/^\d{2}:\d{2}$/.test(extraClass.startTime)) {
        errors.push(`Extra class ${index}: Start time must be in HH:mm format`);
      }
      if (typeof extraClass.endTime !== 'string' || !/^\d{2}:\d{2}$/.test(extraClass.endTime)) {
        errors.push(`Extra class ${index}: End time must be in HH:mm format`);
      }
    });
  } else {
    errors.push('Extra classes must be an array');
  }

  // Validate attendance logs
  if (Array.isArray(state.attendanceLogs)) {
    state.attendanceLogs.forEach((log, index) => {
      const logErrors = validateAttendanceRecord(log);
      errors.push(...logErrors.map(e => `Attendance log ${index}: ${e}`));
    });
  } else {
    errors.push('Attendance logs must be an array');
  }

  // Validate notification settings
  if (state.notificationSettings) {
    if (typeof state.notificationSettings.enabled !== 'boolean') {
      errors.push('Notification enabled must be a boolean');
    }
    if (typeof state.notificationSettings.time !== 'string' || !/^\d{2}:\d{2}$/.test(state.notificationSettings.time)) {
      errors.push('Notification time must be in HH:mm format');
    }
    if (state.notificationSettings.lastNotifiedDate !== null && 
        (typeof state.notificationSettings.lastNotifiedDate !== 'string' || 
         !/^\d{4}-\d{2}-\d{2}$/.test(state.notificationSettings.lastNotifiedDate))) {
      errors.push('Last notified date must be in YYYY-MM-DD format or null');
    }
  }

  // Validate isOnboarded
  if (typeof state.isOnboarded !== 'boolean') {
    errors.push('isOnboarded must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a single subject
 */
export const validateSubject = (subject: Subject): string[] => {
  const errors: string[] = [];

  if (typeof subject.id !== 'string' || subject.id.trim().length === 0) {
    errors.push('Subject ID is required');
  }
  if (typeof subject.name !== 'string' || subject.name.trim().length === 0) {
    errors.push('Subject name is required');
  }
  if (!['Theory', 'Lab'].includes(subject.type as any)) {
    errors.push('Subject type must be Theory or Lab');
  }
  if (typeof subject.totalClasses !== 'number' || subject.totalClasses < 0) {
    errors.push('Total classes must be a non-negative number');
  }
  if (typeof subject.attendedClasses !== 'number' || subject.attendedClasses < 0) {
    errors.push('Attended classes must be a non-negative number');
  }
  if (subject.attendedClasses > subject.totalClasses) {
    errors.push('Attended classes cannot exceed total classes');
  }
  if (typeof subject.targetPercentage !== 'number' || subject.targetPercentage < 0 || subject.targetPercentage > 100) {
    errors.push('Target percentage must be between 0 and 100');
  }

  return errors;
};

/**
 * Validates a class session
 */
export const validateClassSession = (session: ClassSession): string[] => {
  const errors: string[] = [];

  if (typeof session.id !== 'string' || session.id.trim().length === 0) {
    errors.push('Session ID is required');
  }
  if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(session.day)) {
    errors.push('Day of week is invalid');
  }
  if (typeof session.startTime !== 'string' || !/^\d{2}:\d{2}$/.test(session.startTime)) {
    errors.push('Start time must be in HH:mm format');
  }
  if (typeof session.endTime !== 'string' || !/^\d{2}:\d{2}$/.test(session.endTime)) {
    errors.push('End time must be in HH:mm format');
  }
  if (typeof session.subjectId !== 'string' || session.subjectId.trim().length === 0) {
    errors.push('Subject ID is required');
  }

  return errors;
};

/**
 * Validates an attendance record
 */
export const validateAttendanceRecord = (record: AttendanceRecord): string[] => {
  const errors: string[] = [];

  if (typeof record.id !== 'string' || record.id.trim().length === 0) {
    errors.push('Record ID is required');
  }
  if (typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }
  if (typeof record.sessionId !== 'string' || record.sessionId.trim().length === 0) {
    errors.push('Session ID is required');
  }
  if (!['Present', 'Absent', 'Cancelled'].includes(record.status)) {
    errors.push('Status must be Present, Absent, or Cancelled');
  }

  return errors;
};

/**
 * Sanitizes data to prevent invalid entries from being saved
 * This is a last resort - validation should happen before this
 */
export const sanitizeAppState = (state: AppState): AppState => {
  return {
    ...state,
    attendanceLogs: Array.isArray(state.attendanceLogs)
      ? state.attendanceLogs.filter((log): log is AttendanceRecord => {
          const errors = validateAttendanceRecord(log);
          if (errors.length > 0) {
            console.warn('Removing invalid attendance record:', log, errors);
            return false;
          }
          return true;
        })
      : [],
    subjects: Array.isArray(state.subjects)
      ? state.subjects.filter((subj): subj is Subject => {
          const errors = validateSubject(subj);
          if (errors.length > 0) {
            console.warn('Removing invalid subject:', subj, errors);
            return false;
          }
          return true;
        })
      : [],
    schedule: Array.isArray(state.schedule)
      ? state.schedule.filter((session): session is ClassSession => {
          const errors = validateClassSession(session);
          if (errors.length > 0) {
            console.warn('Removing invalid class session:', session, errors);
            return false;
          }
          return true;
        })
      : [],
  };
};
