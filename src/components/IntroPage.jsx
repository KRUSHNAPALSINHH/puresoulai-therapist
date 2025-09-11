import { motion } from 'framer-motion';
import { Heart, Brain, Shield, Users, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Emotional Understanding',
      description: 'AI-powered emotion recognition that truly understands your feelings',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Brain,
      title: 'Intelligent Therapy',
      description: 'Personalized therapeutic guidance tailored to your unique needs',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Safe Space',
      description: 'A secure, judgment-free environment for your mental wellness journey',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Users,
      title: 'Compassionate Support',
      description: '24/7 empathetic AI companion ready to listen and help',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Lightning Effects */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`lightning-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          >
            <Zap className="w-4 h-4 text-yellow-400 opacity-60" />
          </motion.div>
        ))}

        {/* Floating Sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
          </motion.div>
        ))}

        {/* Gradient Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl opacity-20"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${
                ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981'][Math.floor(Math.random() * 4)]
              }, ${
                ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 4)]
              })`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header with Heart Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-16"
        >
          {/* Animated Heart with Lightning Effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.5, 
              type: 'spring', 
              stiffness: 200,
              damping: 15
            }}
            className="relative inline-block mb-8"
          >
            {/* Lightning Ring */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 w-32 h-32 rounded-full border-4 border-yellow-400 opacity-30"
              style={{
                filter: 'drop-shadow(0 0 20px #FBBF24)',
              }}
            />
            
            {/* Pulsing Glow */}
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
              className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-50"
            />
            
            {/* Heart Shape */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.5))',
              }}
            >
              <Heart className="w-16 h-16 text-white fill-current" />
              
              {/* Inner Lightning */}
              <motion.div
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6"
            style={{
              textShadow: '0 0 30px rgba(236, 72, 153, 0.3)',
            }}
          >
            Puresoul AItherapist
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of emotional wellness through advanced AI therapy, 
            real-time emotion recognition, and personalized healing journeys.
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + index * 0.2 }}
              whileHover={{ 
                y: -10,
                scale: 1.05,
                rotateY: 5,
              }}
              className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              }}
            >
              {/* Hover Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}20, ${feature.color.split(' ')[1].replace('to-', '')}20)`,
                  filter: 'blur(20px)',
                }}
              />
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.2
                  }}
                  transition={{ duration: 0.5 }}
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-pink-400 group-hover:to-cyan-400 transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}) border-box`,
                  mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5 }}
          className="text-center"
        >
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ 
              scale: 1.1,
              rotateX: 5,
            }}
            whileTap={{ scale: 0.95 }}
            className="relative group bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-16 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden"
          >
            {/* Button Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
            />
            
            {/* Button Content */}
            <span className="relative z-10 flex items-center">
              Begin Your Healing Journey
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="ml-3"
              >
                <Heart className="w-6 h-6 fill-current" />
              </motion.div>
            </span>
            
            {/* Animated Sparkles on Button */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-2 h-2 text-white" />
              </motion.div>
            ))}
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-gray-400 mt-6 text-lg"
          >
            Transform your emotional wellness with AI-powered compassion ✨
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroPage;