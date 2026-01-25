import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Database, History } from 'lucide-react';

export const BulkImport: React.FC = () => {
  const { subjects, updateSubjectPastData } = useApp();
  const navigate = useNavigate();
  
  // Local state to manage inputs before saving
  const [data, setData] = useState<{ [key: string]: { attended: number, absent: number } }>(() => {
    const initial: { [key: string]: { attended: number, absent: number } } = {};
    subjects.forEach(s => {
      initial[s.id] = {
        attended: s.pastAttendedClasses || 0,
        absent: s.pastAbsentClasses || 0
      };
    });
    return initial;
  });

  const handleChange = (id: string, field: 'attended' | 'absent', value: string) => {
    const num = parseInt(value) || 0;
    setData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Math.max(0, num)
      }
    }));
  };

  const handleSave = () => {
    Object.entries(data).forEach(([id, counts]) => {
      updateSubjectPastData(id, counts.attended, counts.absent);
    });
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="text-neon-pink" /> Past Attendance
        </h2>
      </div>

      <div className="bg-gradient-to-br from-surface to-surface-light p-5 rounded-2xl border border-white/5">
        <p className="text-gray-400 text-sm leading-relaxed">
          Input the number of classes you have <b>Attended</b> and <b>Missed</b> before using this app. 
          These will be added to your overall statistics.
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <motion.div 
            key={subject.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface p-4 rounded-xl border border-white/5"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-white">{subject.name}</h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded uppercase">{subject.type}</span>
              </div>
              {/* Percentage Preview */}
              <div className="text-right">
                <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Current Calc</span>
                <span className={`font-mono font-bold ${
                  (data[subject.id].attended + data[subject.id].absent) > 0 
                  ? ((data[subject.id].attended / (data[subject.id].attended + data[subject.id].absent) * 100) >= subject.targetPercentage ? 'text-success' : 'text-danger')
                  : 'text-gray-600'
                }`}>
                   {(data[subject.id].attended + data[subject.id].absent) > 0 
                      ? Math.round((data[subject.id].attended / (data[subject.id].attended + data[subject.id].absent)) * 100) 
                      : 0}%
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1">
                  Attended
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data[subject.id]?.attended.toString()}
                  onChange={(e) => handleChange(subject.id, 'attended', e.target.value)}
                  className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-success transition-colors text-center font-mono font-bold"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-1">
                  Missed
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data[subject.id]?.absent.toString()}
                  onChange={(e) => handleChange(subject.id, 'absent', e.target.value)}
                  className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-white outline-none focus:border-danger transition-colors text-center font-mono font-bold"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-24 left-0 w-full px-4 flex justify-center z-20 pointer-events-none">
        <button 
          onClick={handleSave}
          className="pointer-events-auto max-w-2xl w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Save size={20} /> Save Data
        </button>
      </div>
    </div>
  );
};