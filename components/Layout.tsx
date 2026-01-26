import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, PieChart, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { resetData, firebaseUser } = useApp();

  const handleLogout = () => {
    resetData(); // This will trigger sign-out and state reset from the context
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/planner', icon: PieChart, label: 'Planner' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-void text-white pb-24 relative overflow-x-hidden selection:bg-neon-purple selection:text-white">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-20 p-4 max-w-2xl mx-auto flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan p-0.5">
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
              <img src="/logos/ClassMate.png" alt="ClassMate" className="w-5 h-5 object-contain" />
            </div>
          </div>
          <motion.h1
            className="text-lg font-bold bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink bg-clip-text text-transparent font-['JetBrains_Mono'] tracking-wide"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            ClassMate
          </motion.h1>
        </div>
      </header>

      <motion.main 
        key={location.pathname} // Re-animate on route change
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 p-4 max-w-2xl mx-auto"
      >
        {children}
      </motion.main>

      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex justify-around items-center p-4 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-neon-purple scale-110' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot" 
                    className="absolute -bottom-2 w-1 h-1 bg-neon-purple rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};