import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Calendar, Clock, MessageSquare, Heart, Brain, 
  Activity, Target, Award, ArrowLeft, Smile, Frown, Meh, 
  AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, emotionHistory, therapySessions } = useApp();

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
    happy: '#10B981',
    sad: '#3B82F6',
    neutral: '#6B7280',
    surprised: '#F59E0B',
    angry: '#EF4444',
    fear: '#8B5CF6',
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Emotion distribution
    const emotionCounts = emotionHistory.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {});

    const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: emotionColors[emotion],
    }));

    // Daily emotion trends (last 7 days)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayEmotions = emotionHistory.filter(emotion => 
        isWithinInterval(emotion.timestamp, { start: dayStart, end: dayEnd })
      );

      const dayData = {
        date: format(date, 'MMM dd'),
        total: dayEmotions.length,
      };

      // Count each emotion for this day
      Object.keys(emotionColors).forEach(emotion => {
        dayData[emotion] = dayEmotions.filter(e => e.emotion === emotion).length;
      });

      dailyTrends.push(dayData);
    }

    // Weekly emotion averages
    const weeklyEmotions = emotionHistory.filter(emotion => 
      isWithinInterval(emotion.timestamp, { start: last7Days, end: now })
    );

    const weeklyAverages = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / emotionHistory.length) * 100),
      weeklyCount: weeklyEmotions.filter(e => e.emotion === emotion).length,
    })).sort((a, b) => b.count - a.count);

    // Therapy session analytics
    const sessionDurations = therapySessions.map(session => ({
      date: format(session.date, 'MMM dd'),
      duration: session.duration,
      messages: session.messages.length,
    }));

    // Wellness score calculation
    const positiveEmotions = ['happy'];
    const neutralEmotions = ['neutral', 'surprised'];
    const negativeEmotions = ['sad', 'angry', 'fear'];

    const positiveCount = emotionHistory.filter(e => positiveEmotions.includes(e.emotion)).length;
    const neutralCount = emotionHistory.filter(e => neutralEmotions.includes(e.emotion)).length;
    const negativeCount = emotionHistory.filter(e => negativeEmotions.includes(e.emotion)).length;

    const wellnessScore = emotionHistory.length > 0 
      ? Math.round(((positiveCount * 2 + neutralCount * 1) / (emotionHistory.length * 2)) * 100)
      : 0;

    return {
      emotionDistribution,
      dailyTrends,
      weeklyAverages,
      sessionDurations,
      wellnessScore,
      totalEmotions: emotionHistory.length,
      totalSessions: therapySessions.length,
      averageSessionDuration: therapySessions.length > 0 
        ? Math.round(therapySessions.reduce((sum, s) => sum + s.duration, 0) / therapySessions.length)
        : 0,
      mostFrequentEmotion: weeklyAverages[0]?.emotion || 'neutral',
    };
  }, [emotionHistory, therapySessions]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}
      className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:border-white/70 transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );

  const ChartCard = ({ title, icon: Icon, children, className = "" }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
      }}
      className={`group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:border-white/70 transition-all duration-500 ${className}`}
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </motion.div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your emotional wellness journey</p>
            </div>
          </div>
          
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full"
          >
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Wellness Score: {analytics.wellnessScore}%</span>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            title="Total Emotions Detected"
            value={analytics.totalEmotions}
            subtitle="All time tracking"
            color="from-purple-500 to-purple-600"
            trend="+12%"
          />
          <StatCard
            icon={MessageSquare}
            title="Therapy Sessions"
            value={analytics.totalSessions}
            subtitle={`Avg ${analytics.averageSessionDuration} min each`}
            color="from-blue-500 to-blue-600"
            trend="+8%"
          />
          <StatCard
            icon={Brain}
            title="Most Frequent Emotion"
            value={analytics.mostFrequentEmotion}
            subtitle="This week's pattern"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Target}
            title="Wellness Score"
            value={`${analytics.wellnessScore}%`}
            subtitle="Based on emotion balance"
            color="from-orange-500 to-orange-600"
            trend="+5%"
          />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Emotion Distribution Pie Chart */}
        <ChartCard title="Emotion Distribution" icon={PieChartIcon}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.emotionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Count']}
                  labelFormatter={(label) => `Emotion: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics.emotionDistribution.map((emotion, index) => {
              const Icon = emotionIcons[emotion.name];
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: emotion.color }}
                  />
                  <Icon className="w-4 h-4" style={{ color: emotion.color }} />
                  <span className="text-sm capitalize font-medium">{emotion.name}</span>
                  <span className="text-xs text-gray-500">({emotion.value})</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Daily Emotion Trends */}
        <ChartCard title="7-Day Emotion Trends" icon={LineChartIcon}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="happy"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke="#6B7280"
                  fill="#6B7280"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="sad"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="surprised"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="angry"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="fear"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Therapy Session Analytics */}
        <ChartCard title="Therapy Session Duration" icon={BarChart3}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sessionDurations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'duration' ? `${value} min` : value,
                    name === 'duration' ? 'Duration' : 'Messages'
                  ]}
                />
                <Bar dataKey="duration" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Weekly Emotion Summary */}
        <ChartCard title="Emotion Frequency Analysis" icon={BarChart3}>
          <div className="space-y-4">
            {analytics.weeklyAverages.slice(0, 6).map((emotion, index) => {
              const Icon = emotionIcons[emotion.emotion];
              const color = emotionColors[emotion.emotion];
              
              return (
                <motion.div
                  key={emotion.emotion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-medium capitalize text-gray-800">{emotion.emotion}</p>
                      <p className="text-sm text-gray-500">
                        {emotion.weeklyCount} this week
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{emotion.count}</p>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${emotion.percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {emotion.percentage}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mt-8"
      >
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8">
          <div className="flex items-center mb-6">
            <Award className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Wellness Insights</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Emotional Balance</h3>
              <p className="text-sm text-gray-600">
                Your wellness score of {analytics.wellnessScore}% shows {
                  analytics.wellnessScore >= 70 ? 'excellent' : 
                  analytics.wellnessScore >= 50 ? 'good' : 'developing'
                } emotional balance. Keep tracking your emotions for better insights.
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Therapy Progress</h3>
              <p className="text-sm text-gray-600">
                You've completed {analytics.totalSessions} therapy sessions with an average duration of {analytics.averageSessionDuration} minutes. 
                Consistent engagement shows commitment to your wellness.
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Tracking Consistency</h3>
              <p className="text-sm text-gray-600">
                You've recorded {analytics.totalEmotions} emotions. Regular tracking helps identify patterns and 
                triggers for better emotional awareness and management.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;