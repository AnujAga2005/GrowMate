import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Flame, 
  ChevronRight, 
  Check,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

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

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onView: () => void;
}

export function HabitCard({ habit, onToggle, onView }: HabitCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Health': 'from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-400',
      'Fitness': 'from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-400',
      'Learning': 'from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-400',
      'Wellness': 'from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-400',
      'Productivity': 'from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-400',
      'Social': 'from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-400'
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
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`p-3 sm:p-4 md:p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
        habit.completed
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300/50 dark:border-green-500/50 shadow-lg shadow-green-500/10'
          : 'bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg'
      }`}>
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Left Section - Habit Info */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0" onClick={onView}>
            {/* Emoji and Status */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={habit.completed ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                } : {}}
                transition={{ duration: 0.6 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl ${
                  habit.completed
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600'
                }`}
              >
                {habit.emoji}
              </motion.div>
              
              {/* Completion Checkmark */}
              {habit.completed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.div>
              )}
            </div>

            {/* Habit Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <h3 className={`text-sm sm:text-base md:text-lg truncate ${
                  habit.completed 
                    ? 'text-green-800 dark:text-green-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {habit.name}
                </h3>
                <Badge className={`bg-gradient-to-r ${getCategoryColor(habit.category)} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0 hidden sm:inline-flex`}>
                  {habit.category}
                </Badge>
              </div>

              {/* Habit Meta Info */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{habit.reminderTime}</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 hidden sm:flex">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{habit.frequency}</span>
                </div>
                {habit.streak > 0 && (
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="text-xs sm:text-base">{getStreakEmoji(habit.streak)}</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {habit.streak}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggle();
                }}
                className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base transition-all duration-200 ${
                  habit.completed
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/30'
                }`}
              >
                {habit.completed ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Done!</span>
                    <span className="sm:hidden">✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
                    <span className="hidden md:inline">Mark Done</span>
                    <span className="md:hidden">Done</span>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* View Details Arrow */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onView();
              }}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                habit.completed
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-slate-700'
              }`}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Progress Indicator */}
        {habit.completedDates.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
              <span className="text-gray-600 dark:text-gray-300">Recent Progress</span>
              <span className={`font-medium ${
                habit.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {habit.completedDates.length} completions
              </span>
            </div>
            
            {/* Mini Calendar Dots */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-2">
              {[...Array(7)].map((_, i) => {
                const dayOffset = 6 - i;
                const date = new Date();
                date.setDate(date.getDate() - dayOffset);
                const dateString = date.toISOString().split('T')[0];
                const isCompleted = habit.completedDates.includes(dateString);
                const isToday = dayOffset === 0;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                      isCompleted
                        ? isToday && habit.completed
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50'
                          : 'bg-green-400 dark:bg-green-500'
                        : isToday
                          ? 'bg-gray-300 dark:bg-slate-600 ring-2 ring-purple-400 dark:ring-purple-500'
                          : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
