// TherapySessionPage.jsx (UPDATED: single audio element, TTS queue, sync text+speech)

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Mic, MicOff, Home, User, Brain, Shield, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

// Simple in-memory TTS queue manager to avoid overlapping audio and double-play
class TTSQueue {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.queue = [];
    this.running = false;
    this.lastPlayed = null; // dedupe last played text
  }

  enqueue(text, fetchAudioFn) {
    if (!text || !text.trim()) return;
    // dedupe identical consecutive texts
    if (this.lastPlayed === text) return;
    this.queue.push({ text, fetchAudioFn });
    this._run();
  }

  async _run() {
    if (this.running) return;
    this.running = true;
    while (this.queue.length) {
      const { text, fetchAudioFn } = this.queue.shift();
      try {
        // fetch audio arrayBuffer via provided function
        const arrayBuffer = await fetchAudioFn(text);
        if (!arrayBuffer) continue;

        // revoke previous src if any
        try {
          if (this.audioElement.src) {
            URL.revokeObjectURL(this.audioElement.src);
          }
        } catch (e) { /* ignore */ }

        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        this.audioElement.src = url;

        // pause current if playing and reset
        try {
          this.audioElement.pause();
          this.audioElement.currentTime = 0;
        } catch (e) {}

        // attempt to play; if blocked by browser, catch and continue
        try {
          await this.audioElement.play();
        } catch (err) {
          console.error('Audio play blocked or failed:', err);
          // still keep lastPlayed to avoid replaying same text
        }

        // wait until ended (or short timeout fallback)
        await new Promise((resolve) => {
          const clean = () => {
            this.audioElement.removeEventListener('ended', clean);
            clearTimeout(timeoutHandle);
            resolve();
          };
          this.audioElement.addEventListener('ended', clean);
          // fallback in case audio 'ended' doesn't fire
          const timeoutHandle = setTimeout(() => {
            try { this.audioElement.pause(); } catch (e) {}
            resolve();
          }, 60_000); // 60s safety cap
        });

        this.lastPlayed = text;

        // cleanup URL
        try {
          URL.revokeObjectURL(url);
          // clear src so future revokes are clean
          this.audioElement.removeAttribute('src');
          this.audioElement.load();
        } catch (e) {}
      } catch (err) {
        console.error('TTS Queue item failed:', err);
      }
    }
    this.running = false;
  }
}

// Fetch audio helper (returns ArrayBuffer) — used by TTSQueue
const fetchTTSAudioArrayBuffer = async (text) => {
  if (!text || !text.trim()) return null;
  try {
    const resp = await fetch('http://localhost:3001/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) {
      console.error('TTS endpoint responded not ok:', resp.status, await resp.text());
      return null;
    }
    const arrayBuffer = await resp.arrayBuffer();
    return arrayBuffer;
  } catch (err) {
    console.error('Network error fetching TTS audio:', err);
    return null;
  }
};

const TherapySessionPage = () => {
  const navigate = useNavigate();
  const { user, addTherapySession, setSadDetectionCount } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionStartTime] = useState(new Date());
  const [isTyping, setIsTyping] = useState(false);
  const [sessionPhase, setSessionPhase] = useState('introduction');
  const [userEmotionalState, setUserEmotionalState] = useState('');
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  const messagesEndRef = useRef(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  // audio element & queue refs
  const audioElRef = useRef(null);
  const ttsQueueRef = useRef(null);

  // initialize audio element and queue once
  useEffect(() => {
    if (!audioElRef.current) {
      // create a hidden audio element if not present in DOM
      let audio = document.getElementById('tts-audio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'tts-audio';
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
      audioElRef.current = audio;
    }

    if (!ttsQueueRef.current && audioElRef.current) {
      ttsQueueRef.current = new TTSQueue(audioElRef.current);
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  const getTherapeuticResponse = async (userMessage, messageHistory) => {
    try {
      const response = await fetch('http://localhost:3001/api/get-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          messageHistory: messageHistory.slice(-6),
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.therapistResponse;
    } catch (error) {
      console.error('Error fetching therapeutic response:', error);
      return "I'm having a little trouble connecting right now, but I'm still here to listen. Please tell me more.";
    }
  };

  // welcome message: ensure it is added only once and not duplicated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user && !welcomeMessageSent) {
      const welcomeText =
        "Welcome to your therapy session. This is your safe space to talk about anything on your mind. I'm here to listen without any judgment.";

      // protect against duplicate initial message if messages already contain same text
      const alreadyHasWelcome = messages.some(
        (m) => m.sender === 'therapist' && m.text === welcomeText
      );
      if (!alreadyHasWelcome) {
        const initialMessage = {
          id: Date.now().toString(),
          text: welcomeText,
          sender: 'therapist',
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
        // enqueue TTS (queue will fetch and play when possible)
        ttsQueueRef.current?.enqueue(initialMessage.text, fetchTTSAudioArrayBuffer);
      }
      setWelcomeMessageSent(true);
    }
    // intentionally exclude messages from deps so it doesn't retrigger on message changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, welcomeMessageSent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const userMessage = {
    id: Date.now().toString(),
    text: inputMessage,
    sender: 'user',
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setInputMessage('');
  setIsTyping(true);

  // fetch therapist response
  const therapeuticResponse = await getTherapeuticResponse(inputMessage, [...messages, userMessage]);
  
  // 🔹 Preload audio while we prepare message
  const audioBuffer = await fetchTTSAudioArrayBuffer(therapeuticResponse);

  setIsTyping(false);

  const therapistMessage = {
    id: (Date.now() + 1).toString(),
    text: therapeuticResponse,
    sender: 'therapist',
    timestamp: new Date(),
  };

  // 🔹 Append text message & play audio together
  setMessages((prev) => [...prev, therapistMessage]);
  if (audioBuffer) {
    ttsQueueRef.current?.enqueue(therapistMessage.text, async () => audioBuffer);
  }
};


  const handleEndSession = () => {
    const session = {
      id: Date.now().toString(),
      date: sessionStartTime,
      duration: Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60),
      messages,
      initialEmotion: userEmotionalState || 'neutral',
    };
    addTherapySession(session);
    setSadDetectionCount(0);
    navigate('/emotion-detection');
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hidden audio element for TTS playback (kept in DOM, queue will use it) */}
      <audio id="tts-audio" hidden />

      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm border-b border-white/50 p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Professional Therapy Session</h1>
              <p className="text-sm text-gray-600">Confidential • Safe Space • Judgment-Free</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700 capitalize">{sessionPhase} Phase</span>
            </div>

            <motion.button
              onClick={toggleVoice}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
                isListening ? 'bg-red-500 text-white shadow-red-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            <motion.button
              onClick={handleEndSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              End Session
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Chat Area */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 h-[65vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.sender === 'therapist' && (
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-3 shadow-lg">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Professional Therapist</span>
                        <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Licensed</div>
                      </div>
                    )}

                    {message.sender === 'user' && (
                      <div className="flex items-center justify-end mb-3">
                        <span className="text-sm font-semibold text-gray-700 mr-3">You</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`px-6 py-4 rounded-2xl shadow-lg ${
                        message.sender === 'user' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-3 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-3 shadow-lg">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Professional Therapist</span>
                      <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Thinking...</div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200 shadow-lg">
                      <div className="flex space-x-2">
                        {[0, 0.3, 0.6].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay }}
                            className="w-3 h-3 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200 p-6 bg-gray-50/50">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Share what's on your mind... this is your safe space"
                  className="w-full px-6 py-4 rounded-full border border-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white shadow-sm text-gray-800 placeholder-gray-500"
                />
              </div>

              <motion.button
                onClick={handleSendMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputMessage.trim() && !isListening}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Professional Info Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Professional AI Therapy Support</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                You're in a professional therapeutic environment designed to provide evidence-based mental health support.
                This session uses advanced therapeutic techniques including Cognitive Behavioral Therapy (CBT),
                mindfulness-based interventions, and solution-focused therapy approaches.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Confidential Session</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>Voice Enabled</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Brain className="w-4 h-4" />
                  <span>Evidence-Based</span>
                </div>
              </div>
            </div>
          </div>

          {/* Techniques */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/50">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 mb-2">CBT Techniques</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Cognitive behavioral therapy methods to identify and change negative thought patterns</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/50">
              <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 mb-2">Emotional Support</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Empathetic listening, validation, and emotional regulation techniques</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/50">
              <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 mb-2">Solution-Focused</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Goal-oriented therapy focusing on solutions and personal strengths</p>
            </div>
          </motion.div>

          {/* Crisis Support */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-xl p-6 shadow-lg">
            <h4 className="font-bold text-red-800 mb-3 flex items-center"><Shield className="w-5 h-5 mr-2" />Crisis Support Available 24/7</h4>
            <p className="text-sm text-red-700 leading-relaxed">
              If you're experiencing thoughts of self-harm or suicide, please reach out to a crisis helpline immediately.
              This AI therapy provides professional support but cannot replace emergency mental health services.
              Your safety and well-being are the top priority.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TherapySessionPage;
