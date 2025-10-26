import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Flame, 
  Target, 
  TrendingUp,
  Clock,
  Edit3,
  Trash2,
  Share2
} from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

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

interface HabitDetailProps {
  habit: Habit;
  onBack: () => void;
}

export function HabitDetail({ habit, onBack }: HabitDetailProps) {
  if (!habit) return null;

  // Generate calendar heatmap data (last 90 days)
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(dateString);
      
      data.push({
        date: dateString,
        day: date.getDate(),
        month: date.getMonth(),
        completed: isCompleted,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        monthName: date.toLocaleDateString('en', { month: 'short' })
      });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  const completionRate = Math.round((habit.completedDates.length / 90) * 100);
  const weeklyStreak = 7; // Mock weekly streak
  const monthlyStreak = 15; // Mock monthly streak

  const getCategoryColor = (category: string) => {
    const colors = {
      'Health': 'from-green-400 to-emerald-500',
      'Fitness': 'from-orange-400 to-red-500',
      'Learning': 'from-blue-400 to-indigo-500',
      'Wellness': 'from-purple-400 to-pink-500',
      'Productivity': 'from-yellow-400 to-orange-500',
      'Social': 'from-cyan-400 to-blue-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '💎';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '🌱';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${getCategoryColor(habit.category)} shadow-lg`}
              >
                {habit.emoji}
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {habit.name}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className={`bg-gradient-to-r ${getCategoryColor(habit.category)} text-white`}>
                    {habit.category}
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-300">
                    {habit.frequency} at {habit.reminderTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="text-2xl">{getStreakEmoji(habit.streak)}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {habit.streak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Current Streak</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-6 h-6 text-green-500" />
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {completionRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {habit.completedDates.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Completions</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {Math.max(habit.streak, 15)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Best Streak</div>
          </Card>
        </motion.div>
      </div>

      {/* Habit Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              90-Day Activity Calendar
            </h3>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              Last 3 Months
            </Badge>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-15 gap-1 max-w-4xl">
            {heatmapData.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + (index * 0.01) }}
                className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${
                  day.completed
                    ? 'bg-green-500 dark:bg-green-400 shadow-sm hover:scale-125'
                    : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 hover:scale-110'
                }`}
                title={`${day.date} - ${day.completed ? 'Completed' : 'Not completed'}`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          
          {/* Calendar Legend */}
          <div className="flex items-center justify-between mt-6 text-sm text-gray-600 dark:text-gray-300">
            <span>Less</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded-sm" />
              <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 dark:bg-green-500 rounded-sm" />
              <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </Card>
      </motion.div>

      {/* Streaks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Streak Progress
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Current Streak */}
            <div className="text-center p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-500/30">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="text-4xl mb-3"
              >
                🔥
              </motion.div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {habit.streak} Days
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Streak</div>
              <Progress value={Math.min((habit.streak / 30) * 100, 100)} className="mt-3 h-2" />
            </div>

            {/* Weekly Progress */}
            <div className="text-center p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-500/30">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {weeklyStreak} Days
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">This Week</div>
              <Progress value={(weeklyStreak / 7) * 100} className="mt-3 h-2" />
            </div>

            {/* Monthly Progress */}
            <div className="text-center p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-500/30">
              <div className="text-4xl mb-3">📈</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {monthlyStreak} Days
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">This Month</div>
              <Progress value={(monthlyStreak / 30) * 100} className="mt-3 h-2" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30 shadow-lg text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4
            }}
            className="text-6xl mb-4"
          >
            {habit.streak >= 30 ? '🏆' : habit.streak >= 7 ? '🔥' : '🌱'}
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {habit.streak >= 30 
              ? "Incredible! You're a habit master! 🎉"
              : habit.streak >= 7 
                ? "You're on fire! Keep the streak alive! 🔥"
                : "Great start! Every journey begins with a single step! 🌟"
            }
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {habit.streak >= 30 
              ? "Your consistency is truly inspiring. You've built an amazing habit!"
              : habit.streak >= 7 
                ? "Your dedication is paying off. You're building something great!"
                : "You're on the right path. Consistency is the key to success!"
            }
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg">
              {habit.completed ? 'Completed Today! ✓' : 'Mark as Done'}
            </Button>
            <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
              Share Progress 📱
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}