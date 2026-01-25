import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, GraduationCap, School } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, user, isOnboarded } = useApp();
  const [inputName, setInputName] = useState('');
  const [studentType, setStudentType] = useState<'College' | 'School'>('College');

  const handleStart = () => {
    if (inputName.trim()) {
      setUser(inputName, studentType);
      if (isOnboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  };

  // Redirect if already logged in and onboarded
  React.useEffect(() => {
    if (user && isOnboarded) navigate('/dashboard');
  }, [user, isOnboarded, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
       {/* Background Effects */}
       <div className="absolute inset-0 z-0 bg-hero-glow opacity-40"></div>
       <div className="absolute top-10 right-10 w-32 h-32 bg-neon-pink/20 rounded-full blur-[60px] animate-pulse"></div>
       <div className="absolute bottom-20 left-10 w-48 h-48 bg-neon-cyan/20 rounded-full blur-[80px]"></div>

      <div className="z-10 w-full max-w-md flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-2 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono mb-4">
            <Sparkles size={12} />
            <span>AI-Powered Strategy</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-white">Master Your</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">Attendance.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mt-4">
            Stop guessing. Start strategizing. Forecast risks, calculate safe skips, and optimize your academic freedom.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 bg-surface/50 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col gap-2">
            <TrendingUp className="text-neon-cyan" size={24} />
            <span className="text-sm font-medium text-gray-300">Smart Forecasts</span>
          </div>
          <div className="p-4 bg-surface/50 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col gap-2">
            <ShieldCheck className="text-neon-pink" size={24} />
            <span className="text-sm font-medium text-gray-300">Risk Protection</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface-light/50 p-4 rounded-3xl border border-white/10 backdrop-blur-lg mt-8 space-y-4"
        >
          {/* User Type Selector */}
          <div className="flex bg-surface rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => setStudentType('College')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${studentType === 'College' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <GraduationCap size={16} /> College
            </button>
            <button 
              onClick={() => setStudentType('School')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${studentType === 'School' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <School size={16} /> School
            </button>
          </div>

          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Enter your name..." 
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl text-white px-6 py-4 outline-none placeholder:text-gray-600 font-medium focus:border-neon-purple transition-colors"
            />
            <button 
              onClick={handleStart}
              disabled={!inputName.trim()}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-lg px-6 font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-purple/20"
            >
              Go <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};