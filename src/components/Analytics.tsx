import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { analyticsService } from "../services/analyticsService";
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

interface AnalyticsProps {
  habits: Habit[];
  userXP: number;
  userLevel: number;
}

export function Analytics({ habits, userXP, userLevel }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [overview, setOverview] = useState({
    totalCompletions: 0,
    totalXP: 0,
    averageCompletionRate: 0,
    activeHabits: 0
  });
  const [bestDay, setBestDay] = useState(null);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getDashboard(7); // Last 7 days
        
        setOverview(response.analytics.overview);
        setBestDay(response.analytics.bestDay);
        
        // Transform daily data to weekly format
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
          
          const dayData = response.analytics.dailyData.find(d => d.date.split('T')[0] === dateStr);
          
          last7Days.push({
            day: weekDays[dayIndex],
            completed: dayData?.habitsCompleted || 0,
            total: dayData?.totalHabits || habits.length,
            rate: dayData?.completionRate || 0
          });
        }
        
        setWeeklyData(last7Days);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [habits]);

  // Category breakdown from real habits
  const categoryData = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count,
    color: getCategoryColor(category)
  }));

  const COLORS = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'
  ];

  function getCategoryColor(category: string) {
    const colorMap = {
      'Health': '#10B981',
      'Fitness': '#F59E0B',
      'Learning': '#3B82F6',
      'Wellness': '#8B5CF6',
      'Productivity': '#F59E0B',
      'Social': '#06B6D4'
    };
    return colorMap[category as keyof typeof colorMap] || '#6B7280';
  }

  // Calculate stats from real data
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed).length;
  const averageStreak = totalHabits > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits) : 0;
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const weeklyCompletionRate = weeklyData.length > 0 
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.rate, 0) / weeklyData.length)
    : 0;

  // XP progress to next level
  const xpNeededForNext = (userLevel + 1) * 500;
  const xpProgress = ((userXP % 500) / 500) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics 📊
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Track your progress and insights
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Completions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-6 h-6 text-blue-500" />
              <Badge className="bg-blue-500 text-white">All Time</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {overview.totalCompletions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Completions</div>
          </Card>
        </motion.div>

        {/* Average Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-500/30">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-6 h-6 text-orange-500" />
              <span className="text-xl">🔥</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {averageStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Average Streak</div>
          </Card>
        </motion.div>

        {/* Weekly Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-6 h-6 text-green-500" />
              <Badge className="bg-green-500 text-white">{weeklyCompletionRate}%</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              7 Days
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Week Completion</div>
          </Card>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-6 h-6 text-purple-500" />
              <Badge className="bg-purple-500 text-white">Lvl {userLevel}</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {userXP}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total XP</div>
            <Progress value={xpProgress} className="mt-2 h-2" />
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Progress
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last 7 days completion rate
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-600" />
                <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6B7280" className="dark:stroke-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar dataKey="rate" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Habit Categories
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Distribution by type
                </p>
              </div>
              <PieChart className="w-6 h-6 text-purple-500" />
            </div>
            
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                No habits yet
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Best Day Card */}
      {bestDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Best Day This Week
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                    {bestDay.completionRate}% Complete
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-300">
                    {bestDay.habitsCompleted} habits completed
                  </span>
                </div>
              </div>
              <div className="text-6xl">🏆</div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Consistency Score</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You're completing {overview.averageCompletionRate}% of your habits on average
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Active Habits</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You're currently tracking {overview.activeHabits} active habits
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
