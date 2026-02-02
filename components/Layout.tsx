import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, PieChart, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { resetData, firebaseUser } = useApp();
  const [clickedIcon, setClickedIcon] = useState<string | null>(null);

  const handleLogout = () => {
    resetData(); // This will trigger sign-out and state reset from the context
  };

  const navItems = [
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/dashboard', icon: Home, label: 'Home' },
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

      <motion.div 
        className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-t from-surface/90 to-surface/70 backdrop-blur-2xl border-t border-white/10 shadow-2xl shadow-neon-purple/10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-around items-center px-6 py-5 max-w-2xl mx-auto relative">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isClicked = clickedIcon === item.path;

            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => {}}
              >
                <Link 
                  to={item.path}
                  onClick={() => {
                    setClickedIcon(item.path);
                    setTimeout(() => setClickedIcon(null), 600);
                  }}
                  className="relative flex flex-col items-center gap-2 cursor-pointer group"
                >
                  {/* Animated background glow on click */}
                  {isClicked && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}

                  {/* Icon container */}
                  <motion.div
                    className={`relative p-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-neon-purple/30 to-neon-cyan/20 shadow-lg shadow-neon-purple/40' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    animate={isClicked ? { rotate: [0, -10, 10, -5, 0] } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <motion.div
                      animate={isClicked ? { y: [0, -3, 3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-all duration-300 ${
                          isActive ? 'text-neon-purple' : 'text-gray-400 group-hover:text-gray-300'
                        }`} 
                      />
                    </motion.div>
                  </motion.div>

                  {/* Label */}
                  <motion.span 
                    className={`text-[11px] font-semibold tracking-wide transition-all duration-300 ${
                      isActive ? 'text-neon-purple' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                    animate={isActive ? { scale: 1.05 } : {}}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -bottom-3 h-1 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
                      style={{ width: '24px' }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};