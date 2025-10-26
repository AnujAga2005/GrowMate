import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Edit3, 
  Settings, 
  Trophy, 
  Target,
  Calendar,
  Flame,
  Award,
  Clock,
  Bell,
  Palette,
  Shield,
  Download,
  Share2
} from 'lucide-react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { achievementService } from "../services/achievementService";
import { userService } from "../services/userService";
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

interface ProfileProps {
  habits: Habit[];
  userLevel: number;
  userStreak: number;
  onNavigateToLanding?: () => void;
}

export function Profile({ habits, userLevel, userStreak, onNavigateToLanding }: ProfileProps) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    bio: user?.bio || 'Building better habits one day at a time! 💪',
    joinDate: user?.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    avatar: user?.avatar || ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    streakReminders: true,
    darkMode: false,
    soundEffects: true,
    confettiAnimation: true
  });

  // Real achievements and badges from backend
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch real achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoadingAchievements(true);
        const response = await achievementService.getAchievements({ limit: 20 });
        setAchievements(response.achievements);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, []);

  // Fetch user badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoadingBadges(true);
        const response = await userService.getBadges();
        setBadges(response.badges);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, []);

  // Calculate user stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed).length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);
  const averageCompletion = totalHabits > 0 ? Math.round((totalCompletions / (totalHabits * 30)) * 100) : 0;
  const daysActive = Math.floor((new Date().getTime() - new Date(userInfo.joinDate).getTime()) / (1000 * 60 * 60 * 24));

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Export data handler
  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await userService.exportData();
      
      // Create JSON blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `growmate-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully! 📥');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    console.log('🔴 DELETE BUTTON CLICKED');
    
    // Don't allow multiple clicks
    if (deleting) {
      console.log('⚠️ Already deleting, ignoring click');
      return;
    }
    
    // Simple confirmation dialog
    try {
      const confirmed = window.confirm(
        '⚠️ DELETE ACCOUNT\n\n' +
        'Are you absolutely sure you want to delete your account?\n\n' +
        'This will permanently delete:\n' +
        '• All your habits and completion history\n' +
        '• All achievements and badges\n' +
        '• XP and level progress\n' +
        '• Analytics and statistics\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to delete your account permanently.'
      );
      
      if (!confirmed) {
        console.log('❌ User cancelled deletion');
        return;
      }
      
      console.log('✅ User confirmed deletion');
      console.log('🗑️ Setting deleting state to true...');
      setDeleting(true);
      
      console.log('🗑️ Calling userService.deleteAccount()...');
      console.log('userService:', userService);
      console.log('deleteAccount function:', userService.deleteAccount);
      
      // Call backend to delete account
      const result = await userService.deleteAccount();
      console.log('✅ Delete account API response:', result);
      
      // Show success message
      toast.success('Account deleted successfully. Goodbye! 👋', {
        duration: 2000,
      });
      
      // Clear all localStorage
      console.log('🧹 Clearing localStorage...');
      try {
        localStorage.clear();
        console.log('✅ localStorage cleared');
      } catch (e) {
        console.error('❌ Error clearing localStorage:', e);
      }
      
      // Logout
      console.log('🚪 Logging out...');
      try {
        logout();
        console.log('✅ Logged out');
      } catch (e) {
        console.error('❌ Error logging out:', e);
      }
      
      // Navigate to landing page if callback provided
      if (onNavigateToLanding) {
        console.log('📍 Calling onNavigateToLanding...');
        try {
          onNavigateToLanding();
          console.log('✅ Navigation callback executed');
        } catch (e) {
          console.error('❌ Error in navigation callback:', e);
        }
      }
      
      // Force reload to ensure clean state
      console.log('🔄 Reloading page in 500ms...');
      setTimeout(() => {
        console.log('🔄 Executing window.location.replace("/")...');
        window.location.replace('/');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleDeleteAccount:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error response:', error?.response);
      
      // Always reset deleting state on error
      setDeleting(false);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Failed to delete account. Please try again.';
      
      console.error('Showing error to user:', errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      
      // Show error alert
      setTimeout(() => {
        alert('❌ Error deleting account:\n\n' + errorMessage + '\n\nPlease check the console for more details and try again.');
      }, 100);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-slate-600/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="max-w-xs"
                      />
                      <Input
                        value={userInfo.bio}
                        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                        className="max-w-lg"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} size="sm">Save</Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {userInfo.name}
                        </h2>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Level {userLevel}
                        </Badge>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsEditing(true)}
                          className="text-purple-500 hover:text-purple-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {userInfo.email}
                      </p>
                      <p className="text-gray-700 dark:text-gray-200 mb-4">
                        {userInfo.bio}
                      </p>
                      <div className="flex items-center justify-center md:justify-start space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(userInfo.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{daysActive} days active</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Target className="w-6 h-6 text-blue-500" />
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {totalHabits}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Habits</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {totalCompletions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completions</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {longestStreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Best Streak</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Award className="w-6 h-6 text-purple-500" />
                  <span className="text-2xl">✨</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {averageCompletion}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Badges & Achievements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Unlocked Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Unlocked Badges 🏅
                </h3>
                
                {loadingBadges ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">Loading badges...</p>
                  </div>
                ) : badges.length > 0 ? (
                  <div className="space-y-3">
                    {badges.slice(0, 3).map((userBadge, index) => (
                      <motion.div
                        key={userBadge._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-500/30"
                      >
                        <div className="text-3xl">{userBadge.badge.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {userBadge.badge.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {userBadge.badge.description}
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {userBadge.badge.tier}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏅</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">No badges yet. Complete habits to earn badges!</p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Achievements 🎯
                </h3>
                
                {loadingAchievements ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">Loading achievements...</p>
                  </div>
                ) : achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <motion.div
                        key={achievement._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {achievement.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {achievement.description}
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                          +{achievement.xpEarned} XP
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">No achievements yet. Keep building habits!</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h3>
              <div className="space-y-6">
                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-gray-900 dark:text-white">
                        {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {key === 'emailNotifications' && 'Receive habit reminders via email'}
                        {key === 'pushNotifications' && 'Get push notifications on your device'}
                        {key === 'weeklyReports' && 'Weekly progress summary emails'}
                        {key === 'streakReminders' && 'Reminders when your streak is at risk'}
                        {key === 'darkMode' && 'Use dark theme for the interface'}
                        {key === 'soundEffects' && 'Play sounds for interactions'}
                        {key === 'confettiAnimation' && 'Show celebrations when completing habits'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Your Badges 🏅
              </h3>
              
              {loadingBadges ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading badges...</p>
                </div>
              ) : badges.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {badges.map((userBadge, index) => (
                    <motion.div
                      key={userBadge._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-500/30"
                    >
                      <div className="text-4xl">{userBadge.badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {userBadge.badge.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {userBadge.badge.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            {userBadge.badge.tier}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {userBadge.badge.rarity}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏅</div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No badges yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete habits and unlock badges in the Rewards section!
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                All Achievements 🎯
              </h3>
              
              {loadingAchievements ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading achievements...</p>
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30"
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {achievement.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {achievement.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        +{achievement.xpEarned} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete habits and level up to earn achievements!
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Download all your habit data as JSON
                    </p>
                  </div>
                  <Button 
                    onClick={handleExportData}
                    disabled={exporting}
                    className="flex items-center space-x-2"
                  >
                    {exporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Delete Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex items-center space-x-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}