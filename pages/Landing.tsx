import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Target, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const features = [
  {
    title: "Smart Attendance Tracking",
    description: "Real-time tracking of your attendance with intuitive daily logging. Never miss recording a class again.",
    icon: TrendingUp,
    gradient: "from-neon-cyan/20 to-neon-purple/20",
    color: "text-neon-cyan"
  },
  {
    title: "Intelligent Risk Forecasting",
    description: "AI-powered predictions show your attendance risk zones. Safe zone, warning zone, or danger zone at a glance.",
    icon: Target,
    gradient: "from-neon-purple/20 to-neon-pink/20",
    color: "text-neon-purple"
  },
  {
    title: "Safety Shield Protection",
    description: "Calculate how many classes you can safely skip while maintaining your minimum attendance requirement.",
    icon: ShieldCheck,
    gradient: "from-neon-pink/20 to-neon-cyan/20",
    color: "text-neon-pink"
  },
  {
    title: "Data-Driven Insights",
    description: "Detailed statistics, attendance graphs, and subject-wise breakdown to optimize your academic performance.",
    icon: Zap,
    gradient: "from-neon-cyan/20 to-neon-pink/20",
    color: "text-neon-cyan"
  }
];

const highlights = [
  "Effortless attendance logging",
  "Real-time risk calculation",
  "Weekly schedule management",
  "Offline data persistence",
  "Export your records",
  "Multi-device sync"
];

export const Landing: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
    setAutoplay(false);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
    setAutoplay(false);
  };

  const CurrentIcon = features[currentFeature].icon;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-void">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-hero-glow opacity-30"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-neon-pink/30 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-neon-cyan/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-purple/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Particles */}
        <motion.div
          className="absolute top-20 left-20 w-2 h-2 bg-neon-cyan/60 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-1.5 h-1.5 bg-neon-pink/70 rounded-full"
          animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-1 h-1 bg-neon-purple/80 rounded-full"
          animate={{ y: [0, -25, 0], x: [0, 10, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Header with Cursive App Name */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-20 w-full px-6 py-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.img
            src="/logos/ClassMate.png"
            alt="ClassMate"
            className="w-10 h-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Righteous', 'Brush Script MT', cursive" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan">ClassMate</span>
          </motion.h1>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex gap-3"
        >
          <Link to="/login">
            <button className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors text-sm font-medium">
              Login
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-5xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20 text-neon-cyan text-sm font-mono backdrop-blur-sm"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>The Future of Attendance Management</span>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1]"
            >
              <span className="text-white">Master Your</span>
              <br />
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Attendance
              </motion.span>
              <span className="text-white">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto"
            >
              Stop guessing. Start strategizing. Forecast risks, calculate safe skips, and optimize your academic freedom with AI-powered intelligence.
            </motion.p>
          </motion.div>

          {/* Feature Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-16"
          >
            <div className="relative"
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-br ${features[currentFeature].gradient} border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className={`flex-shrink-0 ${features[currentFeature].color}`}
                    >
                      <CurrentIcon size={80} />
                    </motion.div>
                    <div className="flex-1 text-center md:text-left">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                      >
                        {features[currentFeature].title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-300 text-lg leading-relaxed"
                      >
                        {features[currentFeature].description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="flex items-center justify-between mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevFeature}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <div className="flex gap-2">
                  {features.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        setCurrentFeature(idx);
                        setAutoplay(false);
                      }}
                      animate={{
                        width: idx === currentFeature ? 32 : 8,
                        backgroundColor: idx === currentFeature ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.2)'
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-2 rounded-full cursor-pointer"
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextFeature}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((highlight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/30 transition-all"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <Check size={20} className="text-neon-cyan" />
                  </motion.div>
                  <span className="text-gray-300 font-medium">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link to="/signup">
                <button className="w-full sm:w-auto bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan text-white rounded-xl px-10 py-4 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300 shadow-2xl shadow-neon-purple/30 hover:shadow-neon-purple/50 text-lg">
                  Start Free Trial <ArrowRight size={20} />
                </button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-gray-500 text-sm"
            >
              Already have an account?{' '}
              <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-colors font-medium">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-500 text-sm"
        >
          ↓ Scroll to explore
        </motion.div>
      </motion.div>
    </div>
  );
};