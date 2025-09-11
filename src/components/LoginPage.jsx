import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, Sparkles, Zap, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { 
  authenticateUser, 
  createUser, 
  generateSessionToken,
  validateEmail,
  validateUsername,
  validatePassword
} from '../utils/auth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Real-time validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'username':
        const usernameErrors = validateUsername(value);
        if (usernameErrors.length > 0) {
          newErrors.username = usernameErrors[0];
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        const passwordErrors = validatePassword(value);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors[0];
        } else {
          delete newErrors.password;
        }
        break;
      case 'name':
        if (value && value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      if (isLogin) {
        // Login
        const user = await authenticateUser(identifier, password);
        const token = generateSessionToken(user);
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        setUser(user);
        setSuccessMessage('Login successful!');
        
        setTimeout(() => {
          navigate('/welcome');
        }, 1000);
      } else {
        // Registration
        const user = await createUser({
          username,
          email,
          name,
          password
        });
        
        setSuccessMessage('Account created successfully! Please login.');
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setIdentifier(username);
          setPassword('');
        }, 2000);
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMessage('');
    setIdentifier('');
    setPassword('');
    setName('');
    setEmail('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Lightning Effects */}
        {[...Array(8)].map((_, i) => (
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
            <Zap className="w-3 h-3 text-yellow-400 opacity-40" />
          </motion.div>
        ))}
        
        {/* Floating Sparkles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-2 h-2 text-purple-300" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative inline-block mb-6"
          >
            {/* Glow Effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-60"
            />
            
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl">
              <Heart className="w-10 h-10 text-white fill-current" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            {isLogin ? 'Welcome Back' : 'Join Puresoul'}
          </h1>
          <p className="text-gray-300 text-lg">
            {isLogin ? 'Continue your wellness journey' : 'Start your healing journey today'}
          </p>
          
          {/* Demo Credentials */}
          {isLogin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3"
            >
              <p className="text-blue-200 text-sm">
                <strong>Demo Credentials:</strong><br />
                Username: <code className="bg-blue-400/20 px-1 rounded">demo</code><br />
                Password: <code className="bg-blue-400/20 px-1 rounded">password</code>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          {/* Form Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-200">{successMessage}</p>
              </div>
            </motion.div>
          )}
          
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-200">{errors.general}</p>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-200">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      validateField('name', e.target.value);
                    }}
                    className="w-full pl-4 pr-4 py-4 rounded-xl border border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </motion.div>
            )}
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-200">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateField('email', e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required={!isLogin}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </motion.div>
            )}
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-200">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      validateField('username', e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                    placeholder="Choose a username"
                    required={!isLogin}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={isLogin ? identifier : username}
                  onChange={(e) => {
                    if (isLogin) {
                      setIdentifier(e.target.value);
                    } else {
                      setUsername(e.target.value);
                      validateField('username', e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder={isLogin ? "Enter username or email" : "Choose a username"}
                  required
                />
                {!isLogin && errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!isLogin) {
                      validateField('password', e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-4 rounded-xl border border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {!isLogin && errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              
              {!isLogin && (
                <div className="mt-2 text-xs text-gray-400">
                  Password must contain: 8+ characters, uppercase, lowercase, number, special character
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(236, 72, 153, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Button Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              />
              
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </span>
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;