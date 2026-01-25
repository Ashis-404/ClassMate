
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/Onboarding');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-surface rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Shield className="w-16 h-16 text-neon-purple" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Login to AttendIQ
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-surface-light border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-surface-light border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-neon-purple text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors duration-300"
          >
            Login
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-danger">
            {error}
          </p>
        )}
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-neon-cyan hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export { Login };
