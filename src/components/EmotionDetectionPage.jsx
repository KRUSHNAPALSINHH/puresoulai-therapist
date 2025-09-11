import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Smile, Frown, Meh, AlertCircle, Navigation, CameraOff, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import MediaPipeEmotionDetector from '../utils/mediapipeDetection.js';

const EmotionDetectionPage = () => {
  const navigate = useNavigate();
  const { 
    user, 
    setCurrentEmotion, 
    addEmotionData, 
    sadDetectionCount, 
    setSadDetectionCount 
  } = useApp();
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotionState, setCurrentEmotionState] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [stream, setStream] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [detectionError, setDetectionError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionDetectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fear', 'disgust'];
  
  const emotionIcons = {
    neutral: '😐',
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fear: '😨',
    disgust: '🤢',
  };

  const emotionColors = {
    neutral: 'from-gray-400 to-gray-600',
    happy: 'from-green-400 to-green-600',
    sad: 'from-blue-400 to-blue-600',
    angry: 'from-red-400 to-red-600',
    surprised: 'from-yellow-400 to-yellow-600',
    fear: 'from-purple-400 to-purple-600',
    disgust: 'from-green-400 to-green-600',
  };

  const emotionIconComponents = {
    neutral: Meh,
    happy: Smile,
    sad: Frown,
    angry: AlertCircle,
    surprised: AlertCircle,
    fear: AlertCircle,
    disgust: AlertCircle,
  };

  // Initialize MediaPipe emotion detector
  const initializeEmotionDetector = async () => {
    if (emotionDetectorRef.current) {
      return;
    }

    setIsModelLoading(true);
    setDetectionError(null);

    try {
      emotionDetectorRef.current = new MediaPipeEmotionDetector();
      const success = await emotionDetectorRef.current.initialize();
      
      if (success) {
        setModelReady(true);
        console.log('MediaPipe emotion detection initialized successfully');
      } else {
        throw new Error('Failed to initialize MediaPipe emotion detector');
      }
    } catch (error) {
      console.error('Error initializing MediaPipe emotion detector:', error);
      setDetectionError('Failed to load MediaPipe models. Please refresh and try again.');
    } finally {
      setIsModelLoading(false);
    }
  };

  // Request camera permission and start video stream
  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Initialize emotion detector when video is ready
        videoRef.current.onloadedmetadata = () => {
          initializeEmotionDetector();
        };
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
    }
  };

  // Real emotion detection using MediaPipe
  const performEmotionDetection = async () => {
    if (!emotionDetectorRef.current || !modelReady || !videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) {
      return;
    }

    try {
      const result = await emotionDetectorRef.current.detectEmotionFromVideo(videoRef.current, canvasRef.current);
      
      if (result) {
        const emotionData = {
          id: Date.now().toString(),
          emotion: result.emotion,
          confidence: result.confidence,
          timestamp: result.timestamp,
          allScores: result.allScores,
        };

        setCurrentEmotionState(emotionData);
        setCurrentEmotion(emotionData);
        addEmotionData(emotionData);
        setDetectionHistory(prev => [emotionData, ...prev.slice(0, 4)]);

        // Check for sad emotion detection
        if (result.emotion === 'sad') {
          const newCount = sadDetectionCount + 1;
          setSadDetectionCount(newCount);
          
          // Redirect to therapy after 2 sad detections
          if (newCount >= 2) {
            setTimeout(() => {
              navigate('/therapy-session');
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('MediaPipe emotion detection error:', error);
      setDetectionError('Error during emotion detection. Please try again.');
    }
  };

  useEffect(() => {
    console.log('EmotionDetectionPage: Checking user authentication...');
    console.log('User state:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login...');
      navigate('/login');
      return;
    }

    console.log('User authenticated, staying on emotion detection page');
  }, [user, navigate]);

  useEffect(() => {
    // Only request camera permission if we don't already have it and user is authenticated
    if (user && hasPermission === null) {
      console.log('Requesting camera permission...');
      requestCameraPermission();
    }

    return () => {
      // Cleanup: stop video stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Cleanup emotion detector
      if (emotionDetectorRef.current) {
        emotionDetectorRef.current.dispose();
      }
      
      // Clear detection interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [user, hasPermission, stream]);

  useEffect(() => {
    if (isDetecting && hasPermission && modelReady) {
      // Start continuous emotion detection
      detectionIntervalRef.current = setInterval(performEmotionDetection, 1000);
      
      // Perform initial detection
      performEmotionDetection();
    } else {
      // Clear interval when stopping detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isDetecting, hasPermission, modelReady]);

  const startDetection = () => {
    // Prevent default behavior if this is triggered by a form or link
    event?.preventDefault();
    
    if (hasPermission && modelReady) {
      setIsDetecting(true);
    } else if (hasPermission && !modelReady) {
      setDetectionError('Emotion detection model is still loading. Please wait...');
    } else {
      // Request camera permission if we don't have it
      if (hasPermission === false || hasPermission === null) {
        requestCameraPermission();
      }
    }
  };

  const stopDetection = () => {
    // Prevent default behavior if this is triggered by a form or link
    event?.preventDefault();
    
    setIsDetecting(false);
    setDetectionError(null);
    // Clear the canvas overlay
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const EmotionIconComponent = currentEmotionState ? emotionIconComponents[currentEmotionState.emotion] : Camera;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Emotion Detection
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/mood-history')}
              className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <Navigation className="w-5 h-5 mr-2" />
              History
            </button>
          </div>
        </div>
        
        {sadDetectionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4 mb-6"
          >
            <p className="text-blue-200">
              I notice you might be feeling down. {sadDetectionCount === 1 ? 'If this continues, I\'ll be here to help.' : 'Let me connect you with therapeutic support.'}
            </p>
          </motion.div>
        )}

        {/* Camera Permission Status */}
        {hasPermission === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <CameraOff className="w-5 h-5 text-red-400" />
              <p className="text-red-200">
                Camera access is required for emotion detection. Please allow camera permission and try again.
              </p>
            </div>
          </motion.div>
        )}

        {/* Model Loading Status */}
        {isModelLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="w-5 h-5 text-blue-400" />
              </motion.div>
              <p className="text-blue-200">
                Loading MediaPipe models (Face Landmarker with Blendshapes)... This may take a moment.
              </p>
            </div>
          </motion.div>
        )}

        {/* Detection Error */}
        {detectionError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200">{detectionError}</p>
            </div>
          </motion.div>
        )}

        {/* Model Ready Status */}
        {modelReady && !isDetecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-green-200">
                MediaPipe Face Landmarker ready! Click "Start Detection" to begin real-time emotion analysis with blendshapes.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Webcam Feed */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500"
        >
          {/* Card Glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
              filter: 'blur(20px)',
            }}
          />
          
          <h2 className="text-2xl font-semibold text-white mb-6 text-center relative z-10">
            Live Camera Feed
          </h2>
          
          <div className="relative z-10">
            {/* Camera View */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-white/10 relative">
              {hasPermission ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-2xl"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  
                  {/* Detection Status */}
                  {isDetecting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      🔴 Detecting Faces & Expressions...
                    </motion.div>
                  )}
                </>
              ) : hasPermission === null ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-gray-500"
                  >
                    <Camera className="w-16 h-16" />
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <CameraOff className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm">Camera access denied</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Button */}
            <div className="text-center mt-6">
              <motion.button
                type="button"
                onClick={isDetecting ? stopDetection : startDetection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={hasPermission === false || (isModelLoading && !modelReady)}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDetecting
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30'
                    : hasPermission === false || isModelLoading
                    ? 'bg-gray-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-xl hover:shadow-purple-500/30 text-white'
                }`}
              >
                {hasPermission === false 
                  ? 'Allow Camera Access' 
                  : isModelLoading
                  ? 'Loading Models...'
                  : isDetecting 
                  ? 'Stop Detection' 
                  : modelReady
                  ? 'Start Face Detection'
                  : 'Initializing...'
                }
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Current Emotion Display */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Current Emotion */}
          <motion.div
            layout
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500"
          >
            {/* Card Glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
                filter: 'blur(20px)',
              }}
            />
            
            <h2 className="text-2xl font-semibold text-white mb-6 text-center relative z-10">
              Current Emotion
            </h2>
            
            <div className="relative z-10">
              <AnimatePresence>
                {currentEmotionState ? (
                  <motion.div
                    key={currentEmotionState.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${emotionColors[currentEmotionState.emotion]} mb-4`}
                    >
                      <EmotionIconComponent className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    {/* Large Emoji Display */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-6xl mb-4 select-none"
                    >
                      {emotionIcons[currentEmotionState.emotion]}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white capitalize mb-2">
                      {currentEmotionState.emotion}
                    </h3>
                    
                    <div className="bg-gray-700 rounded-full h-3 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentEmotionState.confidence * 100}%` }}
                        transition={{ duration: 1 }}
                        className={`h-3 rounded-full bg-gradient-to-r ${emotionColors[currentEmotionState.emotion]} shadow-lg`}
                      />
                    </div>
                    
                    <p className="text-gray-300">
                      {Math.round(currentEmotionState.confidence * 100)}% confidence
                    </p>
                    
                    <div className="mt-4 text-xs text-gray-400">
                      <p>Detected: {currentEmotionState.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-400"
                  >
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p>Start face detection to analyze your emotions in real-time</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Recent Detections */}
          {detectionHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500"
            >
              {/* Card Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
                  filter: 'blur(20px)',
                }}
              />
              
              <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Recent Detections</h3>
              <div className="space-y-3 relative z-10">
                {detectionHistory.map((emotion, index) => {
                  const IconComponent = emotionIconComponents[emotion.emotion];
                  return (
                    <motion.div
                      key={emotion.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${emotionColors[emotion.emotion]} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium capitalize text-white">{emotion.emotion}</span>
                        <span className="text-2xl">{emotionIcons[emotion.emotion]}</span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {Math.round(emotion.confidence * 100)}%
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmotionDetectionPage;