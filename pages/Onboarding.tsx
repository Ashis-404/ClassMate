import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, CheckCircle2, ChevronRight, BookOpen, Clock, AlertCircle, User, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubjectType, DayOfWeek, Subject } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Onboarding: React.FC = () => {
  const { setTerm, addSubject, updateSchedule, subjects, completeOnboarding, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Term
  const [termName, setTermName] = useState(user?.type === 'College' ? 'Semester 1' : 'Class 10');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [minAttend, setMinAttend] = useState(75);

  // Step 2: Subjects
  const [tempSubject, setTempSubject] = useState('');
  const [tempType, setTempType] = useState<SubjectType>(SubjectType.THEORY);
  const [tempCredits, setTempCredits] = useState<number>(3);
  const [tempLecturer, setTempLecturer] = useState('');
  const [localSubjects, setLocalSubjects] = useState<Subject[]>([]);

  // Step 3: Schedule
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  const [scheduleMap, setScheduleMap] = useState<Record<string, { subjectId: string, start: string, end: string }[]>>({});

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!termName.trim()) { setError("Please enter a name."); return; }
      setTerm({
        id: generateId(),
        name: termName,
        startDate,
        endDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 4)).toISOString().split('T')[0], // Default 4 months
        minAttendanceCriteria: minAttend
      });
      setStep(2);
    } else if (step === 2) {
      if (localSubjects.length === 0) { setError("Please add at least one subject."); return; }
      localSubjects.forEach(s => addSubject(s));
      setStep(3);
    } else {
      // Flatten schedule map
      const sessions = Object.entries(scheduleMap).flatMap(([day, classes]) => 
        (classes as { subjectId: string, start: string, end: string }[]).map(cls => ({
          id: generateId(),
          subjectId: cls.subjectId,
          day: day as DayOfWeek,
          startTime: cls.start,
          endTime: cls.end
        }))
      );
      updateSchedule(sessions);
      completeOnboarding();
      navigate('/dashboard');
    }
  };

  const addLocalSubject = () => {
    if (!tempSubject.trim()) return;
    setError(null);
    setLocalSubjects([...localSubjects, {
      id: generateId(),
      name: tempSubject,
      type: tempType,
      totalClasses: 0,
      attendedClasses: 0,
      targetPercentage: minAttend,
      credits: tempCredits,
      lecturer: tempLecturer.trim()
    }]);
    // Reset form
    setTempSubject('');
    setTempLecturer('');
    setTempCredits(3);
  };

  const isOverlapping = (day: string, newStart: string, newEnd: string) => {
    const existingClasses = scheduleMap[day] || [];
    const newStartMin = parseInt(newStart.split(':')[0]) * 60 + parseInt(newStart.split(':')[1]);
    const newEndMin = parseInt(newEnd.split(':')[0]) * 60 + parseInt(newEnd.split(':')[1]);

    return existingClasses.some(cls => {
      const clsStartMin = parseInt(cls.start.split(':')[0]) * 60 + parseInt(cls.start.split(':')[1]);
      const clsEndMin = parseInt(cls.end.split(':')[0]) * 60 + parseInt(cls.end.split(':')[1]);
      
      // Check for overlap: (StartA < EndB) and (EndA > StartB)
      return (newStartMin < clsEndMin) && (newEndMin > clsStartMin);
    });
  };

  const addToSchedule = (subjectId: string, start: string, end: string) => {
    setError(null);
    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }
    
    if (isOverlapping(selectedDay, start, end)) {
      setError(`Time slot clashes with an existing class on ${selectedDay}.`);
      return;
    }

    setScheduleMap(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), { subjectId, start, end }].sort((a, b) => a.start.localeCompare(b.start))
    }));
  };

  const removeFromSchedule = (day: string, index: number) => {
    const newDaySchedule = [...(scheduleMap[day] || [])];
    newDaySchedule.splice(index, 1);
    setScheduleMap(prev => ({
      ...prev,
      [day]: newDaySchedule
    }));
  };

  return (
    <div className="min-h-screen bg-void text-white p-6 pt-12 flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
          {step === 1 ? 'Academic Setup' : step === 2 ? 'Your Subjects' : 'Weekly Routine'}
        </h2>
        <p className="text-gray-400 mt-2">
          {step === 1 ? `Let's configure your ${user?.type === 'College' ? 'semester' : 'academic year'}, ${user?.name}.` : step === 2 ? 'What are you studying this term?' : 'Map out your standard week.'}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-sm">
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode='wait'>
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase tracking-wider font-bold">
                  {user?.type === 'College' ? 'Semester Name' : 'Class / Standard / Grade'}
                </label>
                <input 
                  type="text" 
                  value={termName} 
                  onChange={e => setTermName(e.target.value)} 
                  placeholder={user?.type === 'College' ? 'e.g. Semester 5' : 'e.g. Class 12 - Term 1'}
                  className="w-full bg-surface p-4 rounded-xl border border-white/10 outline-none focus:border-neon-purple transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase tracking-wider font-bold">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-surface p-4 rounded-xl border border-white/10 outline-none focus:border-neon-purple text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase tracking-wider font-bold">Minimum Attendance Target (%)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="50" max="100" value={minAttend} onChange={e => setMinAttend(Number(e.target.value))} className="w-full accent-neon-purple" />
                  <span className="text-2xl font-mono text-neon-purple">{minAttend}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="bg-surface p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subject Name</label>
                  <div className="flex items-center gap-2 bg-surface-light rounded-xl px-3 border border-white/5 focus-within:border-neon-purple transition-colors">
                    <BookOpen size={18} className="text-gray-500" />
                    <input 
                      type="text" 
                      placeholder={user?.type === 'College' ? "e.g. Advanced Calculus" : "e.g. Mathematics"} 
                      value={tempSubject} 
                      onChange={e => setTempSubject(e.target.value)} 
                      className="flex-1 bg-transparent py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Type</label>
                    <div className="flex gap-2">
                      {[SubjectType.THEORY, SubjectType.LAB].map(type => (
                        <button 
                          key={type}
                          onClick={() => setTempType(type)}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${tempType === type ? 'bg-neon-purple/20 border-neon-purple text-neon-purple' : 'bg-surface-light border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  {user?.type === 'College' && (
                    <div className="w-1/3 space-y-2">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Credits</label>
                      <div className="flex items-center gap-2 bg-surface-light rounded-xl px-3 border border-white/5 focus-within:border-neon-purple transition-colors">
                        <Award size={18} className="text-gray-500" />
                        <input 
                          type="number" 
                          min="0"
                          value={tempCredits} 
                          onChange={e => setTempCredits(parseInt(e.target.value) || 0)} 
                          className="w-full bg-transparent py-3 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                     {user?.type === 'College' ? 'Lecturer (Optional)' : 'Teacher (Optional)'}
                  </label>
                  <div className="flex items-center gap-2 bg-surface-light rounded-xl px-3 border border-white/5 focus-within:border-neon-purple transition-colors">
                    <User size={18} className="text-gray-500" />
                    <input 
                      type="text" 
                      placeholder={user?.type === 'College' ? "e.g. Dr. Smith" : "e.g. Mr. Johnson"} 
                      value={tempLecturer} 
                      onChange={e => setTempLecturer(e.target.value)} 
                      className="flex-1 bg-transparent py-3 outline-none"
                    />
                  </div>
                </div>

                <button onClick={addLocalSubject} className="w-full bg-gradient-to-r from-neon-purple to-neon-pink p-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-neon-purple/20">
                  <Plus size={20} /> Add Subject
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {localSubjects.length === 0 && (
                   <p className="text-gray-500 text-center italic mt-10">No subjects added yet.</p>
                )}
                {localSubjects.map(sub => (
                  <motion.div layout key={sub.id} className="flex justify-between items-center bg-surface p-4 rounded-xl border border-white/5">
                    <div>
                      <p className="font-semibold text-lg">{sub.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold bg-white/5 px-2 py-1 rounded text-neon-cyan">{sub.type}</span>
                        {user?.type === 'College' && sub.credits !== undefined && <span className="text-[10px] uppercase font-bold bg-white/5 px-2 py-1 rounded text-neon-purple">{sub.credits} Credits</span>}
                        {sub.lecturer && <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1"><User size={10}/> {sub.lecturer}</span>}
                      </div>
                    </div>
                    <button onClick={() => setLocalSubjects(localSubjects.filter(s => s.id !== sub.id))} className="text-danger p-2 hover:bg-danger/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Day Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedDay === d ? 'bg-white text-void' : 'bg-surface text-gray-500'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Add Class Form */}
              <div className="bg-surface/50 p-4 rounded-xl border border-white/10 space-y-4">
                <p className="text-sm font-medium text-gray-400 flex items-center gap-2"><Clock size={14}/> Add class for {selectedDay}</p>
                <select id="subject-select" className="w-full bg-surface p-3 rounded-lg border border-white/10 outline-none text-white focus:border-neon-purple transition-colors">
                  {localSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="time" id="start-time" defaultValue="09:00" className="bg-surface p-2 rounded-lg border border-white/10 text-white flex-1 focus:border-neon-purple outline-none" />
                  <span className="text-gray-500 self-center">to</span>
                  <input type="time" id="end-time" defaultValue="10:00" className="bg-surface p-2 rounded-lg border border-white/10 text-white flex-1 focus:border-neon-purple outline-none" />
                </div>
                <div className="text-xs text-gray-500 italic">
                  Tip: Attendance weight is based on duration (e.g., 2 hours = 2 points).
                </div>
                <button 
                  onClick={() => {
                    const select = document.getElementById('subject-select') as HTMLSelectElement;
                    const start = (document.getElementById('start-time') as HTMLInputElement).value;
                    const end = (document.getElementById('end-time') as HTMLInputElement).value;
                    addToSchedule(select.value, start, end);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors border border-white/5"
                >
                  Add Session
                </button>
              </div>

              {/* List for Day */}
              <div className="space-y-2">
                {(scheduleMap[selectedDay] || []).length === 0 && (
                   <p className="text-xs text-gray-600 text-center py-4">No classes scheduled for {selectedDay}</p>
                )}
                {(scheduleMap[selectedDay] || []).map((sess, idx) => {
                  const sub = localSubjects.find(s => s.id === sess.subjectId);
                   // Simple duration calc for display
                  const startH = parseInt(sess.start.split(':')[0]);
                  const startM = parseInt(sess.start.split(':')[1]);
                  const endH = parseInt(sess.end.split(':')[0]);
                  const endM = parseInt(sess.end.split(':')[1]);
                  const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

                  return (
                    <motion.div layout key={idx} className="flex items-center justify-between bg-surface p-3 rounded-lg border-l-2 border-neon-cyan">
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500 font-mono w-24 text-center">
                          {sess.start} - {sess.end}
                          <br/>
                          <span className="text-neon-purple">{duration} hr{duration !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="font-medium text-sm">{sub?.name}</div>
                      </div>
                      <button 
                        onClick={() => removeFromSchedule(selectedDay, idx)}
                        className="text-gray-500 hover:text-danger p-2 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={handleNextStep}
          className="bg-gradient-to-r from-neon-purple to-neon-pink text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-neon-purple/20 hover:scale-105 transition-transform"
        >
          {step === 3 ? 'Finish Setup' : 'Next Step'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};