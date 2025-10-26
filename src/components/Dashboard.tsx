import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Award,
  ChevronRight,
  Clock,
  Target, 
  Zap
} from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { HabitCard } from "./HabitCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner@2.0.3";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  category: string;
  completed: boolean;
  streak: number;
  completedDates: string[];
  frequency: string;
  reminderTime: string;
}

interface DashboardProps {
  habits: Habit[];
  onToggleHabit: (id: number) => void;
  onViewHabit: (habit: Habit) => void;
  userStreak: number;
  onAddHabit?: () => void;
  userLevel?: number;
  userXP?: number;
  onNavigateToAnalytics?: () => void;
}

export function Dashboard({ habits, onToggleHabit, onViewHabit, userStreak, onAddHabit, userLevel = 1, userXP = 0, onNavigateToAnalytics }: DashboardProps) {
  const [celebratingHabits, setCelebratingHabits] = useState<number[]>([]);

  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Handle habit toggle with celebration
  const handleToggle = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit && !habit.completed) {
      setCelebratingHabits(prev => [...prev, id]);
      setTimeout(() => {
        setCelebratingHabits(prev => prev.filter(hId => hId !== id));
      }, 3000);
    }
    onToggleHabit(id);
  };

  // Get completion color
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'from-green-500 to-emerald-500';
    if (rate >= 60) return 'from-yellow-500 to-orange-500';
    if (rate >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  // Share achievement function
  const handleShare = (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'instagram') => {
    const message = `🎉 I just completed all my habits for today on GrowMate! Building better habits, one day at a time. 💪✨ #HabitTracker #GrowMate #SelfImprovement`;
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(message);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct web sharing, so copy to clipboard
        navigator.clipboard.writeText(message);
        toast.success('Message copied! Open Instagram and paste it to share 📋');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
              Good morning! ☀️
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
              Ready to make today count?
            </p>
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 5, 0],
              scale: [1, 1.05, 1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex-shrink-0"
          >
            🎯
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Overview - 4 cards in one row on desktop, 2 rows on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card className="h-full p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0" />
              <Badge className={`bg-gradient-to-r ${getCompletionColor(completionRate)} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                {completionRate}%
              </Badge>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
              {completedToday}/{totalHabits}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate mb-2 sm:mb-3">Today's Progress</div>
            <div className="mt-auto">
              <Progress value={completionRate} className="h-1.5 sm:h-2" />
            </div>
          </Card>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card className="h-full p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-500 flex-shrink-0" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="text-sm sm:text-base md:text-lg"
              >
                🔥
              </motion.div>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
              {userStreak}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">Day Streak</div>
          </Card>
        </motion.div>

        {/* Total Habits */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card className="h-full p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg">🎯</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
              {totalHabits}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">Total Habits</div>
          </Card>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card className="h-full p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500 flex-shrink-0" />
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                Level {userLevel}
              </Badge>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
              {userXP}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate mb-2 sm:mb-3">XP Points</div>
            <div className="mt-auto">
              <Progress value={65} className="h-1.5 sm:h-2" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Today's Habits */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-white truncate">
              Today's Habits
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1">
              {completedToday === totalHabits && totalHabits > 0 
                ? "Amazing! All habits completed! 🎉"
                : `${totalHabits - completedToday} habits remaining`}
            </p>
          </div>
          <motion.div
            animate={completedToday === totalHabits && totalHabits > 0 ? {
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 1, repeat: completedToday === totalHabits && totalHabits > 0 ? Infinity : 0, repeatDelay: 2 }}
            className="text-2xl sm:text-3xl flex-shrink-0"
          >
            {completedToday === totalHabits && totalHabits > 0 ? '🎉' : '📋'}
          </motion.div>
        </div>

        <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <AnimatePresence>
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <HabitCard
                  habit={habit}
                  onToggle={() => handleToggle(habit.id)}
                  onView={() => onViewHabit(habit)}
                />
                
                {/* Celebration Animation */}
                <AnimatePresence>
                  {celebratingHabits.includes(habit.id) && (
                    <motion.div
                      initial={{ opacity: 1, scale: 0 }}
                      animate={{ opacity: 0, scale: 2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="text-4xl sm:text-5xl md:text-6xl">🎉</div>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            x: 0, 
                            y: 0, 
                            rotate: 0,
                            scale: 0
                          }}
                          animate={{ 
                            x: (Math.random() - 0.5) * 200,
                            y: (Math.random() - 0.5) * 200,
                            rotate: Math.random() * 360,
                            scale: 1
                          }}
                          transition={{ 
                            duration: 2,
                            ease: "easeOut"
                          }}
                          className="absolute text-lg sm:text-xl md:text-2xl"
                        >
                          {['✨', '🌟', '💫', '🎊', '🎆', '⭐'][i]}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🌱</div>
            <h3 className="text-lg sm:text-xl text-gray-900 dark:text-white mb-1 sm:mb-2">
              No habits yet!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-4">
              Start building better habits today. Every journey begins with a single step!
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg text-sm sm:text-base" onClick={onAddHabit}>
              Add Your First Habit
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      {completedToday === totalHabits && totalHabits > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 sm:py-6 md:py-8"
        >
          <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30 shadow-lg">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity
              }}
              className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 md:mb-4"
            >
              🏆
            </motion.div>
            <h3 className="text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-white mb-1 sm:mb-2">
              Fantastic Work! 🎉
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-2">
              You've completed all your habits for today. You're on fire! 🔥
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full px-2 sm:px-0">
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg text-sm sm:text-base w-full sm:w-auto flex-1 sm:flex-initial max-w-full sm:max-w-xs" 
                onClick={onNavigateToAnalytics}
              >
                View Analytics 📊
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-green-300 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm sm:text-base w-full sm:w-auto flex-1 sm:flex-initial max-w-full sm:max-w-xs"
                  >
                    Share Achievement 📱
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Share Your Achievement! 🎉</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      Let your friends know about your progress!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">
                    <Button
                      onClick={() => handleShare('whatsapp')}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm p-2 sm:p-3 h-auto"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="truncate">WhatsApp</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('twitter')}
                      className="bg-blue-400 hover:bg-blue-500 text-white text-xs sm:text-sm p-2 sm:p-3 h-auto"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span className="truncate">Twitter</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('linkedin')}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm p-2 sm:p-3 h-auto"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="truncate">LinkedIn</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('instagram')}
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white text-xs sm:text-sm p-2 sm:p-3 h-auto"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                      <span className="truncate">Instagram</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
