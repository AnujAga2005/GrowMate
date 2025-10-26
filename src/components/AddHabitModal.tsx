import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Clock, Calendar, Tag, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: any) => void;
  isDark: boolean;
}

export function AddHabitModal({ isOpen, onClose, onAdd, isDark }: AddHabitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎯',
    category: '',
    frequency: 'Daily',
    reminderTime: '08:00'
  });

  const popularEmojis = [
    '💧', '💪', '📚', '🧘', '🏃', '🥗', '💤', '📝',
    '🎯', '🌱', '⭐', '🔥', '💎', '🏆', '⚡', '🚀',
    '🎨', '🎵', '💻', '☕', '🍎', '🧠', '❤️', '✨'
  ];

  const categories = [
    { name: 'Health', color: 'from-green-400 to-emerald-500', emoji: '🏥' },
    { name: 'Fitness', color: 'from-orange-400 to-red-500', emoji: '💪' },
    { name: 'Learning', color: 'from-blue-400 to-indigo-500', emoji: '📚' },
    { name: 'Wellness', color: 'from-purple-400 to-pink-500', emoji: '🧘' },
    { name: 'Productivity', color: 'from-yellow-400 to-orange-500', emoji: '⚡' },
    { name: 'Social', color: 'from-cyan-400 to-blue-500', emoji: '👥' }
  ];

  const frequencies = ['Daily', 'Weekly', 'Weekdays', 'Weekends', 'Custom'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.category) {
      onAdd(formData);
      setFormData({
        name: '',
        emoji: '🎯',
        category: '',
        frequency: 'Daily',
        reminderTime: '08:00'
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, emoji }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className={`p-8 ${
            isDark 
              ? 'bg-slate-900 border-purple-500/30' 
              : 'bg-white border-purple-200/50'
          } shadow-2xl`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-2`}>
                  Create New Habit ✨
                </h2>
                <p className={`${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Start building better habits today!
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Habit Name */}
              <div className="space-y-3">
                <Label className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Habit Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Drink 8 glasses of water"
                  className={`text-lg p-4 rounded-xl border-2 transition-all duration-200 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 focus:border-purple-500'
                  }`}
                  required
                />
              </div>

              {/* Emoji Selection */}
              <div className="space-y-3">
                <Label className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Choose an Emoji
                </Label>
                <div className="grid grid-cols-8 gap-2">
                  {popularEmojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`p-3 text-2xl rounded-xl transition-all duration-200 ${
                        formData.emoji === emoji
                          ? isDark
                            ? 'bg-purple-600 shadow-lg shadow-purple-500/30'
                            : 'bg-purple-500 shadow-lg shadow-purple-500/30'
                          : isDark
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Category
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <motion.button
                      key={category.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.name }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.category === category.name
                          ? isDark
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-purple-500 bg-purple-50'
                          : isDark
                            ? 'border-slate-600 bg-slate-800 hover:border-slate-500'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-lg shadow-lg`}>
                          {category.emoji}
                        </div>
                        <span className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Frequency and Reminder Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Frequency
                  </Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className={`p-4 text-lg rounded-xl border-2 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'}>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq} value={freq} className={isDark ? 'text-white hover:bg-slate-700' : ''}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Clock className="w-5 h-5 inline mr-2" />
                    Reminder Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className={`text-lg p-4 rounded-xl border-2 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <Label className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Preview
                </Label>
                <div className={`p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                  isDark 
                    ? 'border-slate-600 bg-slate-800/50' 
                    : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                      formData.category
                        ? `bg-gradient-to-br ${categories.find(c => c.name === formData.category)?.color} shadow-lg`
                        : isDark ? 'bg-slate-700' : 'bg-gray-200'
                    }`}>
                      {formData.emoji}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formData.name || 'Your habit name'}
                      </h3>
                      <div className="flex items-center space-x-3 mt-2">
                        {formData.category && (
                          <Badge className={`bg-gradient-to-r ${categories.find(c => c.name === formData.category)?.color} text-white`}>
                            {formData.category}
                          </Badge>
                        )}
                        <span className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {formData.frequency} at {formData.reminderTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/50 dark:border-slate-600/50">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className={`px-8 py-3 text-lg rounded-xl ${
                      isDark 
                        ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className={`px-8 py-3 text-lg rounded-xl shadow-lg transition-all duration-200 ${
                      isDark
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-emerald-500/25 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/25 text-white'
                    }`}
                    disabled={!formData.name.trim() || !formData.category}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Habit
                  </Button>
                </motion.div>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}