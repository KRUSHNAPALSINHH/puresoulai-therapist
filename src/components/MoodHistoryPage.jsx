import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, MessageSquare, ArrowLeft, Smile, Frown, Meh, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const MoodHistoryPage = () => {
  const navigate = useNavigate();
  const { emotionHistory, therapySessions, user } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const emotionIcons = {
    happy: Smile,
    sad: Frown,
    neutral: Meh,
    surprised: AlertCircle,
    angry: AlertCircle,
    fear: AlertCircle,
  };

  const emotionColors = {
    happy: 'from-green-400 to-green-600',
    sad: 'from-blue-400 to-blue-600',
    neutral: 'from-gray-400 to-gray-600',
    surprised: 'from-yellow-400 to-yellow-600',
    angry: 'from-red-400 to-red-600',
    fear: 'from-purple-400 to-purple-600',
  };

  const getEmotionStats = () => {
    const emotionCounts = emotionHistory.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const recentEmotions = emotionHistory.slice(0, 10);
  const topEmotions = getEmotionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => navigate('/emotion-detection')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/80 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mood History & Insights
            </h1>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Detections</p>
                <p className="text-2xl font-bold text-gray-800">{emotionHistory.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Therapy Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{therapySessions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Days Active</p>
                <p className="text-2xl font-bold text-gray-800">
                  {emotionHistory.length > 0 ? 
                    Math.ceil((Date.now() - new Date(emotionHistory[emotionHistory.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24)) || 1
                    : 0
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Emotion Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Emotions</h2>
          
          {recentEmotions.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentEmotions.map((emotion, index) => {
                const Icon = emotionIcons[emotion.emotion];
                return (
                  <motion.div
                    key={emotion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${emotionColors[emotion.emotion]} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium capitalize text-gray-800">{emotion.emotion}</p>
                        <p className="text-sm text-gray-500">
                          {emotion.timestamp.toLocaleDateString()} at {emotion.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">
                        {Math.round(emotion.confidence * 100)}%
                      </p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${emotionColors[emotion.emotion]}`}
                          style={{ width: `${emotion.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No emotion data yet. Start detection to see your history!</p>
            </div>
          )}
        </motion.div>

        {/* Analytics & Therapy Sessions */}
        <div className="space-y-8">
          {/* Top Emotions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Emotion Insights</h2>
            
            {topEmotions.length > 0 ? (
              <div className="space-y-4">
                {topEmotions.map(([emotion, count], index) => {
                  const Icon = emotionIcons[emotion];
                  const percentage = Math.round((count / emotionHistory.length) * 100);
                  
                  return (
                    <motion.div
                      key={emotion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${emotionColors[emotion]} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium capitalize">{emotion}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">{percentage}%</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${emotionColors[emotion]}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Start using the app to see insights!</p>
              </div>
            )}
          </motion.div>

          {/* Recent Therapy Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Therapy Sessions</h2>
            
            {therapySessions.length > 0 ? (
              <div className="space-y-4">
                {therapySessions.slice(0, 5).map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">
                        {session.date.toLocaleDateString()}
                      </p>
                      <span className="text-sm text-gray-500">
                        {session.duration} min
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {session.messages.length} messages exchanged
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No therapy sessions yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Sessions will appear here after you use the therapy feature.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MoodHistoryPage;