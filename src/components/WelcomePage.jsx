import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleContinue = () => {
    navigate('/emotion-detection');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Main Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          {/* Card Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
              filter: 'blur(30px)',
            }}
          />
          
          {/* Animated Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.5, 
              type: 'spring', 
              stiffness: 200,
              damping: 10 
            }}
            className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 mb-8 shadow-2xl"
          >
            {/* Heart Glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-60"
            />
            
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Heart className="w-12 h-12 text-white fill-current relative z-10" />
            </motion.div>
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6"
          >
            Welcome, {user.name}! 
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-xl text-gray-300 mb-8 leading-relaxed"
          >
            I'm here to support you on your emotional wellness journey. 
            Let's begin by understanding how you're feeling today.
          </motion.p>

          {/* Personalized Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Your Safe Space Awaits
            </h3>
            <p className="text-gray-300">
              This is a judgment-free zone where your emotions are valid and understood. 
              Take your time, breathe deeply, and know that you're taking a brave step 
              towards better mental health.
            </p>
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={handleContinue}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 25px 50px rgba(236, 72, 153, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl transition-all duration-500 group overflow-hidden"
          >
            {/* Button Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
            />
            
            <span className="relative z-10 flex items-center">
            Start Emotion Detection
            <motion.div
              className="ml-3"
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
            </span>
          </motion.button>
        </motion.div>

        {/* Bottom Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-gray-400 mt-8 text-lg"
        >
          Remember: Healing is not linear, and every step forward matters 💫
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomePage;