import React from 'react';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Target } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Enhanced Background Effects */}
       <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-hero-glow opacity-30"></div>
         <div className="absolute top-10 right-10 w-40 h-40 bg-neon-pink/30 rounded-full blur-[80px] animate-pulse"></div>
         <div className="absolute bottom-20 left-10 w-56 h-56 bg-neon-cyan/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-purple/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>

         {/* Floating Particles */}
         <motion.div
           className="absolute top-20 left-20 w-2 h-2 bg-neon-cyan/60 rounded-full"
           animate={{
             y: [0, -20, 0],
             opacity: [0.3, 0.8, 0.3]
           }}
           transition={{
             duration: 3,
             repeat: Infinity,
             ease: "easeInOut"
           }}
         />
         <motion.div
           className="absolute bottom-32 right-16 w-1.5 h-1.5 bg-neon-pink/70 rounded-full"
           animate={{
             y: [0, -15, 0],
             opacity: [0.4, 0.9, 0.4]
           }}
           transition={{
             duration: 2.5,
             repeat: Infinity,
             ease: "easeInOut",
             delay: 1
           }}
         />
         <motion.div
           className="absolute top-1/3 right-1/4 w-1 h-1 bg-neon-purple/80 rounded-full"
           animate={{
             y: [0, -25, 0],
             x: [0, 10, 0],
             opacity: [0.2, 0.7, 0.2]
           }}
           transition={{
             duration: 4,
             repeat: Infinity,
             ease: "easeInOut",
             delay: 0.5
           }}
         />
       </div>

      <div className="z-10 w-full max-w-md flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20 text-neon-cyan text-sm font-mono mb-6 backdrop-blur-sm"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>AI-Powered Strategy</span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative"
          >
            <img src="/logos/ClassMate.png" alt="ClassMate" className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl" />
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-full blur-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-6xl font-extrabold tracking-tight leading-[1.05] mb-2"
          >
            <span className="text-white">Master Your</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan animate-gradient-x">Attendance.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-gray-400 text-lg leading-relaxed max-w-sm mx-auto"
          >
            Stop guessing. Start strategizing. Forecast risks, calculate safe skips, and optimize your academic freedom.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-5 bg-surface/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-3 hover:bg-surface/80 transition-all duration-300 shadow-lg hover:shadow-neon-cyan/10"
          >
            <TrendingUp className="text-neon-cyan" size={28} />
            <span className="text-sm font-semibold text-gray-200">Smart Forecasts</span>
            <span className="text-xs text-gray-400">Predict attendance patterns</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-5 bg-surface/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-3 hover:bg-surface/80 transition-all duration-300 shadow-lg hover:shadow-neon-pink/10"
          >
            <ShieldCheck className="text-neon-pink" size={28} />
            <span className="text-sm font-semibold text-gray-200">Risk Protection</span>
            <span className="text-xs text-gray-400">Stay safe from penalties</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-6 space-y-6 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/signup">
              <button className="w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan text-white rounded-xl px-8 py-4 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300 shadow-2xl shadow-neon-purple/30 hover:shadow-neon-purple/50 text-lg">
                Get Started <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-gray-500 text-sm"
          >
            Already have an account? <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-colors">Login</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};