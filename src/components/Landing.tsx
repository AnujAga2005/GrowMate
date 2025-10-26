import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface LandingProps {
  onGetStarted: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
}

export function Landing({ onGetStarted, onLogin, onSignup }: LandingProps) {
  const stats = [
    { label: 'Habits Tracked', value: '2,345', icon: '🎯' },
    { label: 'Active Users', value: '1,234', icon: '👥' },
    { label: 'Streaks Achieved', value: '5,678', icon: '🔥' },
    { label: 'Goals Completed', value: '9,876', icon: '✨' }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Smart Tracking',
      description: 'Track your habits with intelligent reminders and progress insights.'
    },
    {
      icon: '🔥',
      title: 'Streak Building',
      description: 'Build momentum with streak counters and achievement rewards.'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Visualize your progress with beautiful charts and statistics.'
    },
    {
      icon: '🎮',
      title: 'Gamification',
      description: 'Level up your habits with XP, badges, and fun rewards.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 mb-8"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                New: Dark Mode Available!
              </Badge>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-6 leading-tight"
            >
              GrowMate 🌱
              <br />
              <span className="text-5xl md:text-6xl lg:text-7xl">
                Your Habit Growth Partner
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your life with our playful habit tracker. Build streaks, earn rewards, 
              and celebrate every small win on your journey to success! ✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    onGetStarted();
                    // Will trigger Login via onGetStarted
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Login
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => {
                    onGetStarted();
                    // This will also trigger Login, but user can then switch to signup
                  }}
                  variant="outline"
                  className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg rounded-2xl"
                >
                  Sign Up 📝
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-slate-800/80 dark:to-purple-900/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border border-purple-200/50 dark:border-purple-500/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { emoji: '💧', name: 'Drink Water', completed: true },
                    { emoji: '💪', name: 'Exercise', completed: true },
                    { emoji: '📚', name: 'Read Books', completed: false },
                    { emoji: '🧘', name: 'Meditate', completed: true }
                  ].map((habit, index) => (
                    <motion.div
                      key={habit.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        habit.completed
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 dark:from-emerald-900/30 dark:to-green-900/30 dark:border-emerald-500/50'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-slate-700/50 dark:to-slate-800/50 dark:border-slate-600/50'
                      }`}
                    >
                      <div className="text-3xl mb-2 text-center">{habit.emoji}</div>
                      <div className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">{habit.name}</div>
                      {habit.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-center mt-2"
                        >
                          <span className="text-green-600 dark:text-emerald-400">✓</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">🌟</div>
        <div className="absolute top-40 right-20 text-4xl opacity-30 animate-pulse">🚀</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-bounce delay-1000">✨</div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
              Join Our Growing Community 🌱
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Thousands of people are already building better habits with us!
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <Card className="p-6 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Why Choose HabitFlow? 🎯
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We make habit building fun, engaging, and effective with gamification, 
              beautiful design, and powerful insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 1,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="p-8 h-full bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="text-5xl mb-6 text-center">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Life? 🚀
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of people who are already building better habits and achieving their goals!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onGetStarted}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}