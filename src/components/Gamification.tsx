import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Trophy, 
  Star, 
  Zap, 
  Target,
  Crown,
  Medal,
  Flame,
  Diamond,
  Heart,
  Lock
} from 'lucide-react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { badgeService } from "../services/badgeService";
import { userService } from "../services/userService";
import { toast } from "sonner@2.0.3";

interface GamificationProps {
  userLevel: number;
  userXP: number;
  userStreak: number;
}

export function Gamification({ userLevel, userXP, userStreak }: GamificationProps) {
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [checkingBadges, setCheckingBadges] = useState(false);

  // XP progress to next level
  const xpPerLevel = 500;
  const currentLevelXP = userXP % xpPerLevel;
  const xpToNextLevel = xpPerLevel - currentLevelXP;
  const xpProgress = (currentLevelXP / xpPerLevel) * 100;

  // Fetch badges data
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const [allBadgesRes, userBadgesRes] = await Promise.all([
          badgeService.getAllBadges(),
          userService.getBadges()
        ]);
        
        setAllBadges(allBadgesRes.badges);
        setUserBadges(userBadgesRes.badges);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
        toast.error('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Check for new badges
  const handleCheckBadges = async () => {
    try {
      setCheckingBadges(true);
      const response = await userService.checkAndAwardBadges();
      
      if (response.newBadgesCount > 0) {
        toast.success(`🎉 You earned ${response.newBadgesCount} new badge${response.newBadgesCount > 1 ? 's' : ''}!`);
        // Refresh badges
        const userBadgesRes = await userService.getBadges();
        setUserBadges(userBadgesRes.badges);
      } else {
        toast.info('No new badges yet. Keep going! 💪');
      }
    } catch (error) {
      console.error('Failed to check badges:', error);
      toast.error('Failed to check badges');
    } finally {
      setCheckingBadges(false);
    }
  };

  // Check if user has badge
  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badge._id === badgeId);
  };

  // Get emoji for requirement type
  const getRequirementEmoji = (type: string) => {
    const emojiMap = {
      'streak': '🔥',
      'completions': '✅',
      'level': '⚡',
      'habits': '🎯',
      'custom': '🌟'
    };
    return emojiMap[type as keyof typeof emojiMap] || '🏅';
  };

  // Get color based on rarity
  const getRarityColor = (rarity: string) => {
    const colorMap = {
      'Common': 'from-gray-400 to-gray-500',
      'Rare': 'from-blue-400 to-indigo-500',
      'Epic': 'from-purple-400 to-pink-500',
      'Legendary': 'from-yellow-400 to-orange-500'
    };
    return colorMap[rarity as keyof typeof colorMap] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading rewards...</p>
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
          Rewards & Achievements 🏆
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Unlock badges and level up as you build better habits!
        </p>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-orange-500/20 border-purple-200/50 dark:border-purple-500/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg"
              >
                ⚡
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Level {userLevel}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentLevelXP} / {xpPerLevel} XP
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2">
              {xpToNextLevel} XP to Level {userLevel + 1}
            </Badge>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
            <span>Keep completing habits to earn XP!</span>
            <span>{Math.round(xpProgress)}% Complete</span>
          </div>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🔥
              </motion.div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {userStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Current Streak</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-purple-500" />
              <span className="text-3xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {userBadges.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Badges Earned</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-500" />
              <span className="text-3xl">⚡</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {userXP}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total XP</div>
          </Card>
        </motion.div>
      </div>

      {/* Check Badges Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-center"
      >
        <Button
          onClick={handleCheckBadges}
          disabled={checkingBadges}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg text-lg px-8 py-6"
        >
          {checkingBadges ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Checking...
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5 mr-2" />
              Check for New Badges
            </>
          )}
        </Button>
      </motion.div>

      {/* Badges Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Badges
          </h2>
          <Badge variant="outline" className="text-sm">
            {userBadges.length} / {allBadges.length} Unlocked
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBadges.map((badge, index) => {
            const unlocked = hasBadge(badge._id);
            
            return (
              <motion.div
                key={badge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={unlocked ? { scale: 1.05 } : {}}
              >
                <Card className={`p-6 relative overflow-hidden transition-all duration-300 ${
                  unlocked
                    ? 'bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-500/30 shadow-lg'
                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200/50 dark:border-slate-600/50 opacity-60'
                }`}>
                  {/* Rarity Badge */}
                  <Badge className={`absolute top-3 right-3 bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-xs`}>
                    {badge.rarity}
                  </Badge>

                  {/* Badge Icon */}
                  <div className={`mb-4 flex items-center justify-center ${unlocked ? 'scale-100' : 'scale-90'}`}>
                    <motion.div
                      animate={unlocked ? {
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg ${
                        unlocked
                          ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}`
                          : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                    >
                      {unlocked ? badge.icon : <Lock className="w-8 h-8 text-gray-500" />}
                    </motion.div>
                  </div>

                  {/* Badge Info */}
                  <div className="text-center">
                    <h3 className={`font-semibold text-lg mb-2 ${
                      unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {badge.description}
                    </p>

                    {/* Requirement */}
                    <div className={`flex items-center justify-center space-x-2 text-sm ${
                      unlocked ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>{getRequirementEmoji(badge.requirement.type)}</span>
                      <span>
                        {badge.requirement.type === 'streak' && `${badge.requirement.value} day streak`}
                        {badge.requirement.type === 'completions' && `${badge.requirement.value} completions`}
                        {badge.requirement.type === 'level' && `Reach level ${badge.requirement.value}`}
                        {badge.requirement.type === 'habits' && `Create ${badge.requirement.value} habits`}
                      </span>
                    </div>

                    {/* XP Reward */}
                    {badge.xpReward > 0 && (
                      <div className={`mt-3 pt-3 border-t ${
                        unlocked ? 'border-purple-200 dark:border-purple-500/30' : 'border-gray-200 dark:border-slate-600'
                      }`}>
                        <div className="flex items-center justify-center space-x-2">
                          <Zap className={`w-4 h-4 ${unlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${
                            unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                          }`}>
                            +{badge.xpReward} XP
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Unlocked Status */}
                    {unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-3"
                      >
                        <Badge className="bg-green-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Unlocked!
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {allBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No badges available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Badges will appear here as you progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
