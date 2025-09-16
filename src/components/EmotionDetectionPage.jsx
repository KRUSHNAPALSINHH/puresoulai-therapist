// EmotionDetectionPage.jsx (FINAL VERSION: Automatic Start & Universal Redirect)

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Smile, Frown, Meh, AlertCircle, Navigation, CameraOff, Brain, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import MediaPipeEmotionDetector from '../utils/mediapipeDetection.js';

const EmotionDetectionPage = () => {
  const navigate = useNavigate();
  const { user, setCurrentEmotion, addEmotionData } = useApp();
  
  // State for the batching and popup logic
  
  const [emotionReadings, setEmotionReadings] = useState([]);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [showEmotionPopup, setShowEmotionPopup] = useState(false);
  const [showCalmingTips, setShowCalmingTips] = useState(false); // Kept in case you want to use it later
  const READINGS_BATCH_SIZE = 10;

  // State for the component's operation
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

  // --- UPDATED POPUP MESSAGES ---
  // Each question is now an invitation to a therapy session.
  const emotionDataMap = {
    neutral: { icon: '😐', color: 'from-gray-400 to-gray-600', component: Meh, question: "You seem to be feeling neutral. Would you like to start a session to check in?" },
    happy: { icon: '😊', color: 'from-green-400 to-green-600', component: Smile, question: "You look happy! Would you like to talk about what's bringing you joy?" },
    sad: { icon: '😢', color: 'from-blue-400 to-blue-600', component: Frown, question: "You seem sad. Would you like to talk about what you're feeling?" },
    angry: { icon: '😠', color: 'from-red-400 to-red-600', component: AlertCircle, question: "You seem upset. Would you like a safe space to talk it through?" },
    surprised: { icon: '😲', color: 'from-yellow-400 to-yellow-600', component: AlertCircle, question: "You seem surprised. Would you like to explore this feeling?" },
    fear: { icon: '😨', color: 'from-purple-400 to-purple-600', component: AlertCircle, question: "You seem to be feeling fearful. Would you like a safe space to talk?" },
    disgust: { icon: '🤢', color: 'from-green-400 to-green-600', component: AlertCircle, question: "You seem to be feeling disgust. Would you like to discuss it?" },
  };

  const initializeEmotionDetector = async () => {
    if (emotionDetectorRef.current) return;
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
      setDetectionError('Failed to load detection models. Please refresh and try again.');
    } finally {
      setIsModelLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
      });
      setStream(mediaStream);
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          initializeEmotionDetector();
        };
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
    }
  };

  const analyzeReadings = (readings) => {
    setIsDetecting(false);
    if (!readings.length) return;
    const emotionCounts = readings.reduce((acc, emotion) => ({ ...acc, [emotion]: (acc[emotion] || 0) + 1 }), {});
    const dominant = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
    setDominantEmotion(dominant);
    setShowEmotionPopup(true);
  };

  const performEmotionDetection = async () => {
    if (!emotionDetectorRef.current || !modelReady || !videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) return;
    try {
      const result = await emotionDetectorRef.current.detectEmotionFromVideo(videoRef.current, canvasRef.current);
      if (result) {
        const emotionData = {
          id: Date.now().toString(), emotion: result.emotion, confidence: result.confidence,
          timestamp: result.timestamp, allScores: result.allScores,
        };
        setCurrentEmotionState(emotionData);
        setCurrentEmotion(emotionData);
        addEmotionData(emotionData);
        setDetectionHistory(prev => [emotionData, ...prev.slice(0, 4)]);
        setEmotionReadings(prev => {
          const newReadings = [...prev, result.emotion];
          if (newReadings.length >= READINGS_BATCH_SIZE) {
            analyzeReadings(newReadings);
            return [];
          }
          return newReadings;
        });
      }
    } catch (error) {
      console.error('MediaPipe emotion detection error:', error);
      setDetectionError('Error during emotion detection. Please try again.');
    }
  };

  // --- UPDATED POPUP HANDLER ---
  const handlePopupConfirm = () => {
    setShowEmotionPopup(false);
    if (dominantEmotion) {
      navigate('/therapy-session');
    } else {
      setIsDetecting(true);
      setDominantEmotion(null);
    }
  };

  const handlePopupDismiss = () => {
    setShowEmotionPopup(false);
    setDominantEmotion(null);
    setIsDetecting(true);
  };
  
  const handleCloseTips = () => {
    setShowCalmingTips(false);
    setIsDetecting(true);
    setDominantEmotion(null);
  }

  // --- REACT LIFECYCLE HOOKS ---
  useEffect(() => {
    if (!user) navigate('/login');
    else if (hasPermission === null) requestCameraPermission();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (emotionDetectorRef.current) emotionDetectorRef.current.dispose();
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [user, hasPermission, stream, navigate]);

  // --- UPDATED useEffect FOR AUTOMATIC DETECTION ---
  useEffect(() => {
    // Automatically start detecting when ready
    if (hasPermission && modelReady && !isDetecting && !showEmotionPopup && !showCalmingTips) {
      setIsDetecting(true);
    }
    
    // Manage the interval timer
    if (isDetecting) {
      detectionIntervalRef.current = setInterval(performEmotionDetection, 1000);
    } else {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
    
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [isDetecting, hasPermission, modelReady, showEmotionPopup, showCalmingTips]);
  
  const EmotionIconComponent = currentEmotionState ? emotionDataMap[currentEmotionState.emotion].component : Camera;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl"
            style={{ width: `${Math.random()*200+100}px`, height: `${Math.random()*200+100}px`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
            animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0], scale: [1, 1.2, 0.8, 1] }}
            transition={{ duration: Math.random()*10+10, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      
      <AnimatePresence>
        {showEmotionPopup && dominantEmotion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800/80 border border-purple-500/50 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
              <div className="text-7xl mb-6 select-none">{emotionDataMap[dominantEmotion].icon}</div>
              <h2 className="text-2xl font-bold text-white mb-4">{emotionDataMap[dominantEmotion].question}</h2>
              <div className="flex justify-center gap-4 mt-8">
                <motion.button onClick={handlePopupDismiss} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 rounded-full font-semibold bg-white/10 text-purple-300 hover:bg-white/20 transition-colors">
                  No, I'm fine
                </motion.button>
                <motion.button onClick={handlePopupConfirm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  Yes, let's talk
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Emotion Detection</h1>
            <div className="flex space-x-3">
              <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20"><Navigation className="w-5 h-5 mr-2" /> Dashboard</button>
              <button onClick={() => navigate('/mood-history')} className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20"><Navigation className="w-5 h-5 mr-2" /> History</button>
            </div>
          </div>
          
          {hasPermission === false && ( <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-6"> <div className="flex items-center space-x-3"> <CameraOff className="w-5 h-5 text-red-400" /> <p className="text-red-200">Camera access is required. Please allow camera permission and try again.</p> </div> </motion.div> )}
          {detectionError && ( <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-6"> <div className="flex items-center space-x-3"> <AlertCircle className="w-5 h-5 text-red-400" /> <p className="text-red-200">{detectionError}</p> </div> </motion.div> )}
        </motion.div>

        <div className="w-full flex flex-col items-center gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
            <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500 relative">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center relative z-10">Live Camera Feed</h2>
              <div className="relative z-10">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-white/10 relative">
                  {hasPermission ? (
                    <>
                      <video ref={videoRef} className="w-full h-full object-cover rounded-2xl" autoPlay muted playsInline />
                      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                      {isDetecting && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"> 🔴 Detecting... </motion.div> )}
                    </>
                  ) : ( <div className="flex items-center justify-center h-full text-gray-500"> {hasPermission === null && !isModelLoading && (<Camera className="w-16 h-16 animate-pulse" />)} {isModelLoading && (<Brain className="w-16 h-16 animate-spin" />)} {hasPermission === false && (<div className="text-center"> <CameraOff className="w-16 h-16 mx-auto mb-4" /> <p className="text-sm">Camera access denied</p> </div>)} </div> )}
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500 h-full relative">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center relative z-10">Current Emotion</h2>
                <div className="relative z-10 flex flex-col justify-center items-center h-full">
                  <AnimatePresence>
                    {currentEmotionState ? (
                      <motion.div key={currentEmotionState.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${emotionDataMap[currentEmotionState.emotion].color} mb-4`}>
                          <EmotionIconComponent className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4 select-none">{emotionDataMap[currentEmotionState.emotion].icon}</motion.div>
                        <h3 className="text-2xl font-bold text-white capitalize mb-2">{currentEmotionState.emotion}</h3>
                        <div className="bg-gray-700 rounded-full h-3 mb-2 w-full">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${currentEmotionState.confidence * 100}%` }} transition={{ duration: 1 }} className={`h-3 rounded-full bg-gradient-to-r ${emotionDataMap[currentEmotionState.emotion].color} shadow-lg`} />
                        </div>
                        <p className="text-gray-300">{Math.round(currentEmotionState.confidence * 100)}% confidence</p>
                        <div className="mt-4 text-xs text-gray-400"><p>Detected: {currentEmotionState.timestamp.toLocaleTimeString()}</p></div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-400">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p>Initializing camera and detection models...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500 h-full relative">
                <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Recent Detections</h3>
                <div className="space-y-3 relative z-10">
                  {detectionHistory.length > 0 ? detectionHistory.map((emotion, index) => {
                    const IconComponent = emotionDataMap[emotion.emotion].component;
                    return (
                      <motion.div key={emotion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${emotionDataMap[emotion.emotion].color} flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium capitalize text-white">{emotion.emotion}</span>
                          <span className="text-2xl">{emotionDataMap[emotion.emotion].icon}</span>
                        </div>
                        <span className="text-sm text-gray-300">{Math.round(emotion.confidence * 100)}%</span>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center text-gray-400 pt-8"> <p>No detections yet...</p> </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmotionDetectionPage;