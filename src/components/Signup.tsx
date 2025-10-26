import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, CheckCircle2, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface SignupProps {
  onSwitchToLogin: () => void;
  isDark: boolean;
  onToggleTheme?: () => void;
}

export function Signup({ onSwitchToLogin, isDark, onToggleTheme }: SignupProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully! 🎉');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl ${
            isDark ? 'bg-emerald-500/10' : 'bg-purple-300/30'
          }`}
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-cyan-500/10' : 'bg-pink-300/30'
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-400 to-cyan-400' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            } shadow-2xl`}>
              <span className="text-3xl">🎯</span>
            </div>
          </motion.div>
          <h1 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Start Your Journey! 🚀
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your account to build better habits
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-3xl p-8 backdrop-blur-xl shadow-2xl border ${
            isDark 
              ? 'bg-slate-800/50 border-purple-500/20' 
              : 'bg-white/80 border-purple-200/50'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                Full Name
              </Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-11 rounded-xl border-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                Email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-11 rounded-xl border-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-11 rounded-xl border-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                Confirm Password
              </Label>
              <div className="relative">
                <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-11 rounded-xl border-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm ${
                  isDark 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className={`w-full py-6 rounded-xl text-white transition-all duration-200 ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-slate-800/50 text-gray-400' : 'bg-white/80 text-gray-500'}`}>
                  {/* Or continue with */}
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            {/* <GoogleSignInButton isDark={isDark} /> */}
          </form>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center`}>
              <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${
                isDark ? 'bg-slate-800/50 text-gray-400' : 'bg-white/80 text-gray-500'
              }`}>
                or
              </span>
            </div>
          </div> */}

          {/* Switch to Login */}
          <div className="text-center">
            <p className={`text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className={`transition-colors ${
                  isDark 
                    ? 'text-emerald-400 hover:text-emerald-300' 
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-6 p-4 rounded-2xl text-center text-sm ${
            isDark 
              ? 'bg-slate-800/30 text-gray-400 border border-slate-700/50' 
              : 'bg-white/50 text-gray-600 border border-purple-200/30'
          }`}
        >
          <Sparkles className={`inline-block w-4 h-4 mr-2 ${
            isDark ? 'text-emerald-400' : 'text-purple-500'
          }`} />
          {/* Demo Mode: Your data will be stored locally in your browser */}
        </motion.div>
      </motion.div>
    </div>
  );
}