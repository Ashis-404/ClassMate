
import React, { useState } from 'react';
import { auth, signInWithGoogle } from '../firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingLines from '../components/FloatingLines';

const SignUp: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Mark that this session came from sign up so onboarding is shown
      try { localStorage.setItem('justSignedUp', '1'); } catch (e) {}
      await signInWithGoogle();
      // Don't navigate — onAuthStateChanged will fire, AppProvider will load
      // Firestore data (none for new user), and route guards (PublicRoutes)
      // will redirect to /onboarding since isOnboarded is false.
    } catch (error: any) {
      setError(error.message || 'Google sign-up failed');
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Lines Background */}
      <div className="absolute inset-0 z-0">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          linesGradient={['#06B6D4', '#A855F7', '#EC4899']}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-center text-white mb-8"
          >
            Create Account
          </motion.h2>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSignUp}
            className="space-y-6"
          >
            {/* Google Sign-in */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-cyan/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-18.5-1.5-37-4.7-54.6H272v103.5h147.6c-6.4 34.5-25.7 63.8-54.8 83.3v69.3h88.5c51.7-47.6 81.2-117.7 81.2-201.5z" fill="#4285f4"/>
                <path d="M272 544.3c73.7 0 135.6-24.3 180.8-66.1l-88.5-69.3c-24.6 16.5-56 26.2-92.3 26.2-71 0-131.2-47.8-152.6-111.9H28.1v70.4C73.2 487.6 166 544.3 272 544.3z" fill="#34a853"/>
                <path d="M119.4 326.9c-11.4-33.9-11.4-70.6 0-104.5V152h-91.3C8 219.2 0 246.4 0 272s8 52.8 28.1 120l91.3-65.1z" fill="#fbbc04"/>
                <path d="M272 107.7c39.9 0 75.8 13.7 104 40.6l78-78C406.2 24.9 344.3 0 272 0 166 0 73.2 56.7 28.1 152l91.3 70.4C140.8 155.5 201 107.7 272 107.7z" fill="#ea4335"/>
              </svg>
              Continue with Google
            </motion.button>
          </motion.form>

          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center text-danger bg-danger/10 border border-danger/20 rounded-lg p-3"
            >
              {error}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-center text-gray-400"
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors duration-300"
            >
              Login
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export { SignUp };
