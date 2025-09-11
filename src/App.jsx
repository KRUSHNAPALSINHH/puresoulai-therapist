import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import IntroPage from './components/IntroPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import WelcomePage from './components/WelcomePage.jsx';
import EmotionDetectionPage from './components/EmotionDetectionPage.jsx';
import TherapySessionPage from './components/TherapySessionPage.jsx';
import MoodHistoryPage from './components/MoodHistoryPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/emotion-detection" element={<EmotionDetectionPage />} />
          <Route path="/therapy-session" element={<TherapySessionPage />} />
          <Route path="/mood-history" element={<MoodHistoryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;