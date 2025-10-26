import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Target, 
  BarChart3, 
  User, 
  Settings, 
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Dashboard } from "./components/Dashboard";
import { Analytics } from "./components/Analytics";
import { Profile } from "./components/Profile";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AddHabitModal } from "./components/AddHabitModal";
import { HabitDetail } from "./components/HabitDetail";
import { Gamification } from "./components/Gamification";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OAuthCallback } from "./components/OAuthCallback";
import { DebugPanel } from "./components/DebugPanel";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { habitService } from "./services/habitService";
import { userService } from "./services/userService";

function AppContent() {
  const { isAuthenticated, logout, user, loading: authLoading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLevel, setUserLevel] = useState(3);
  const [userXP, setUserXP] = useState(1250);
  const [userStreak, setUserStreak] = useState(7);

  // Real habits data from backend
  const [habits, setHabits] = useState([]);
  const [habitsLoading, setHabitsLoading] = useState(true);

  // Fetch user stats from backend
  const fetchUserStats = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await userService.getStats();
      setUserLevel(response.stats.level);
      setUserXP(response.stats.xp);
      setUserStreak(response.stats.streak);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  // Fetch habits from backend
  const fetchHabits = async () => {
    if (!isAuthenticated) {
      setHabits([]);
      setHabitsLoading(false);
      return;
    }

    try {
      setHabitsLoading(true);
      const response = await habitService.getHabits();
      
      // Transform backend habits to match component format
      const transformedHabits = response.habits.map(habit => ({
        id: habit._id,
        _id: habit._id,
        name: habit.name,
        emoji: habit.emoji || '✨',
        category: habit.category,
        completed: isHabitCompletedToday(habit.completedDates),
        streak: habit.streak,
        completedDates: habit.completedDates,
        frequency: habit.frequency,
        reminderTime: habit.reminderTime || '',
        ...habit
      }));
      
      setHabits(transformedHabits);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setHabitsLoading(false);
    }
  };

  // Check if habit is completed today
  const isHabitCompletedToday = (completedDates: string[]) => {
    if (!completedDates || completedDates.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    return completedDates.some(dateStr => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === todayTimestamp;
    });
  };

  // Fetch habits when user logs in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchHabits();
      fetchUserStats();
    } else {
      setHabits([]);
      setHabitsLoading(false);
      // Reset to landing page when not authenticated
      setCurrentPage('landing');
    }
  }, [isAuthenticated, authLoading]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Toggle habit completion - Save to backend
  const toggleHabit = async (habitId) => {
    try {
      const habit = habits.find(h => h.id === habitId || h._id === habitId);
      if (!habit) return;

      const isCompleted = habit.completed;

      // Optimistic update
      setHabits(prev => prev.map(h => {
        if (h.id === habitId || h._id === habitId) {
          return {
            ...h,
            completed: !isCompleted,
          };
        }
        return h;
      }));

      // Call backend API
      if (isCompleted) {
        // Uncomplete habit
        await habitService.uncompleteHabit(habit._id);
        toast.success('Habit unchecked!');
      } else {
        // Complete habit
        const response = await habitService.completeHabit(habit._id);
        
        // Update XP if earned
        if (response.xpEarned) {
          setUserXP(response.userXP || (userXP + response.xpEarned));
          setUserLevel(response.userLevel || userLevel);
          toast.success(`+${response.xpEarned} XP! 🎉`);
        }

        // Show level up notification
        if (response.leveledUp) {
          toast.success(`🎊 Level Up! You're now level ${response.newLevel}!`);
          setUserLevel(response.newLevel);
        }
      }

      // Refresh habits to get updated data
      await fetchHabits();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      toast.error('Failed to update habit');
      // Revert optimistic update
      await fetchHabits();
    }
  };

  // Add new habit - Save to backend
  const addHabit = async (newHabit) => {
    try {
      const response = await habitService.createHabit({
        name: newHabit.name,
        emoji: newHabit.emoji || '✨',
        category: newHabit.category,
        frequency: newHabit.frequency || 'Daily',
        reminderTime: newHabit.reminderTime,
        reminderEnabled: !!newHabit.reminderTime,
        xpReward: 50,
        notes: newHabit.notes || '',
      });

      toast.success(`Habit "${newHabit.name}" created! 🎉`);
      
      // Refresh habits list
      await fetchHabits();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
      toast.error('Failed to create habit');
    }
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gamification', label: 'Rewards', icon: Target },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Mobile navigation
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
    setHabits([]); // Clear habits on logout
  };

  useEffect(() => {
    // Initialize theme based on user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check URL path and set appropriate page
    const checkPath = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Handle OAuth callback
      if (path === '/auth/callback' || searchParams.has('token')) {
        setCurrentPage('auth-callback');
        return;
      }

      // Handle dashboard route
      if (path === '/dashboard' && isAuthenticated) {
        setCurrentPage('dashboard');
        return;
      }

      // If authenticated, go to dashboard
      if (isAuthenticated && currentPage === 'landing') {
        setCurrentPage('dashboard');
      }
    };

    checkPath();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', checkPath);
    
    return () => {
      window.removeEventListener('popstate', checkPath);
    };
  }, [isAuthenticated, currentPage]);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const renderCurrentPage = () => {
    // Handle OAuth callback
    if (window.location.pathname === '/auth/callback' || currentPage === 'auth-callback') {
      return <OAuthCallback />;
    }

    // If not authenticated, show landing or auth pages
    if (!isAuthenticated) {
      if (currentPage === 'landing') {
        return <Landing onGetStarted={() => {
          setCurrentPage('auth');
          setAuthPage('login');
        }} />;
      }
      if (authPage === 'login') {
        return (
          <Login 
            onSwitchToSignup={() => setAuthPage('signup')}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        );
      }
      if (authPage === 'signup') {
        return (
          <Signup 
            onSwitchToLogin={() => setAuthPage('login')}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        );
      }
    }

    // Show loading state while fetching habits
    if (authLoading || habitsLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading your habits...</p>
          </div>
        </div>
      );
    }

    // Authenticated routes
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            habits={habits}
            onToggleHabit={toggleHabit}
            onViewHabit={setSelectedHabit}
            userStreak={userStreak}
            onAddHabit={() => setShowAddModal(true)}
            userLevel={userLevel}
            userXP={userXP}
            onNavigateToAnalytics={() => setCurrentPage('analytics')}
          />
        );
      case 'analytics':
        return <Analytics habits={habits} userXP={userXP} userLevel={userLevel} />;
      case 'gamification':
        return <Gamification userLevel={userLevel} userXP={userXP} userStreak={userStreak} />;
      case 'profile':
        return (
          <Profile 
            habits={habits} 
            userLevel={userLevel} 
            userStreak={userStreak}
            onNavigateToLanding={() => setCurrentPage('landing')}
          />
        );
      case 'habit-detail':
        return (
          <HabitDetail 
            habit={selectedHabit}
            onBack={() => {
              setCurrentPage('dashboard');
              setSelectedHabit(null);
            }}
          />
        );
      default:
        return (
          <Dashboard 
            habits={habits}
            onToggleHabit={toggleHabit}
            onViewHabit={setSelectedHabit}
            userStreak={userStreak}
            onAddHabit={() => setShowAddModal(true)}
            userLevel={userLevel}
            userXP={userXP}
            onNavigateToAnalytics={() => setCurrentPage('analytics')}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Navigation Header */}
      {currentPage !== 'landing' && currentPage !== 'auth-callback' && (
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/90 border-purple-500/20' 
              : 'bg-white/90 border-purple-200/50'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark 
                    ? 'bg-gradient-to-br from-emerald-400 to-cyan-400' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  <span className="text-white">🎯</span>
                </div>
                <span className={`font-bold text-lg ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  GrowMate
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                        currentPage === item.id
                          ? isDark
                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 shadow-lg'
                            : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 shadow-lg'
                          : isDark
                            ? 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Right side controls */}
              <div className="flex items-center space-x-3">
                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-800/50 text-yellow-400 hover:bg-slate-700/50'
                      : 'bg-white/50 text-amber-600 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>

                {/* Add Habit Button - Only show when authenticated */}
                {isAuthenticated && (
                  <motion.button
                    onClick={() => setShowAddModal(true)}
                    className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:block">Add Habit</span>
                  </motion.button>
                )}

                {/* Logout Button - Only show when authenticated */}
                {isAuthenticated && (
                  <motion.button
                    onClick={handleLogout}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isDark
                        ? 'text-gray-300 hover:text-red-400 hover:bg-slate-800/50'
                        : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Mobile Menu Toggle */}
                <motion.button
                  onClick={toggleMobileMenu}
                  className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
                    isDark
                      ? 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`md:hidden border-t ${
                  isDark ? 'border-purple-500/20 bg-slate-900/95' : 'border-purple-200/50 bg-white/95'
                }`}
              >
                <div className="px-4 py-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                          currentPage === item.id
                            ? isDark
                              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600'
                            : isDark
                              ? 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addHabit}
        isDark={isDark}
      />

      {/* Footer */}
      {currentPage !== 'landing' && currentPage !== 'auth-callback' && (
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`border-t transition-all duration-300 ${
            isDark 
              ? 'border-purple-500/20 bg-slate-900/50' 
              : 'border-purple-200/50 bg-white/50'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tiny steps, big change 🚀
              </p>
              <div className="flex justify-center space-x-6 mt-4">
                <a href="#" className={`${isDark ? 'text-gray-500 hover:text-emerald-400' : 'text-gray-400 hover:text-purple-600'} transition-colors`}>About</a>
                <a href="#" className={`${isDark ? 'text-gray-500 hover:text-emerald-400' : 'text-gray-400 hover:text-purple-600'} transition-colors`}>Contact</a>
                <a href="#" className={`${isDark ? 'text-gray-500 hover:text-emerald-400' : 'text-gray-400 hover:text-purple-600'} transition-colors`}>Privacy</a>
              </div>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
      <DebugPanel />
    </AuthProvider>
  );
}