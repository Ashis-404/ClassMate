import React from 'react';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export const Landing: React.FC = () => {
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
          className="mt-8 space-y-4 text-center"
        >
          <Link to="/signup">
            <button className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-lg px-8 py-4 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-neon-purple/20">
              Get Started <ArrowRight size={16} />
            </button>
          </Link>
          <p className="text-gray-500 text-sm">
            Already have an account? <Link to="/login" className="text-neon-cyan hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};