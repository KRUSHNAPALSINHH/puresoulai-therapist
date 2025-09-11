import { createContext, useContext, useState } from 'react';
import { verifySessionToken } from '../utils/auth.js';

const AppContext = createContext(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const verifiedUser = verifySessionToken(token);
        return verifiedUser;
      } catch (error) {
        console.warn('Token verification failed, clearing invalid token:', error.message);
        localStorage.removeItem('authToken');
        return null;
      }
    }
    return null;
  });
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [therapySessions, setTherapySessions] = useState([]);
  const [sadDetectionCount, setSadDetectionCount] = useState(0);

  const addEmotionData = (emotion) => {
    setEmotionHistory(prev => [...prev, emotion]);
  };

  const addTherapySession = (session) => {
    setTherapySessions(prev => [...prev, session]);
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Debug user state
  console.log('AppContext user state:', user ? { id: user.id, username: user.username } : 'null');
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        currentEmotion,
        setCurrentEmotion,
        emotionHistory,
        addEmotionData,
        therapySessions,
        addTherapySession,
        sadDetectionCount,
        setSadDetectionCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};