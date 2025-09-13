import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext, UserData } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { Tier1Assessment } from './components/Tier1Assessment';
import { Tier2Assessment } from './components/Tier2Assessment';
import { LoginPage } from './components/LoginPage';
import { OtpVerificationPage } from './components/OtpVerificationPage';
import { EmailLoginModal } from './components/EmailLoginModal';
import { Tier1Results } from './components/Tier1Results';

function AppContent() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentView = (): 'home' | 'tier1' | 'tier2' => {
    const path = location.pathname;
    if (path === '/tier1') return 'tier1';
    if (path === '/tier2') return 'tier2';
    return 'home';
  };

  const navigateToTier = (tier: 'tier1' | 'tier2') => {
    navigate(`/${tier}`);
  };

  const navigateHome = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleLogin = (data: UserData) => {
    dispatch({ type: 'SET_PENDING_USER_DATA', payload: data });
    navigate('/otp');
  };

  const handleOtpVerification = () => {
    if (state.pendingUserData) {
      dispatch({ type: 'SET_USER_DATA', payload: state.pendingUserData });
      dispatch({ type: 'SET_PENDING_USER_DATA', payload: null });
      navigate('/tier1-results');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'RESET_STATE' });
    navigate('/');
  };

  const handleHeaderLogin = () => {
    navigate('/email-login');
  };

  const handleEmailSubmit = (email: string) => {
    dispatch({ type: 'SET_LOGIN_EMAIL', payload: email });
    navigate('/otp-login');
  };

  const handleLoginOtpVerification = () => {
    dispatch({ 
      type: 'SET_USER_DATA', 
      payload: {
        name: 'User',
        email: state.loginEmail,
        companyName: '',
        jobTitle: ''
      }
    });
    dispatch({ type: 'SET_LOGIN_EMAIL', payload: '' });
    navigate('/');
  };

  const handleScheduleCall = () => {
    // In a real app, this would open a calendar booking system
    alert('Calendar booking system would open here');
  };

  const handleRetakeAssessment = () => {
    navigate('/tier1');
  };

  const handleTier1Complete = (responses: Record<string, string>) => {
    dispatch({ type: 'SET_TIER1_RESPONSES', payload: responses });
    // Calculate score based on responses (simplified calculation)
    const score = Math.floor(Math.random() * 40) + 60; // Demo: random score between 60-100
    dispatch({ type: 'SET_TIER1_SCORE', payload: score });
    navigate('/login');
  };

  return (
    <Layout
      currentView={getCurrentView()}
      sidebarCollapsed={state.sidebarCollapsed}
      toggleSidebar={toggleSidebar}
      onNavigateHome={navigateHome}
      onNavigateToTier={navigateToTier}
      onLogin={handleHeaderLogin}
      onLogout={handleLogout}
      userName={state.userData?.name}
    >
      <Routes>
        <Route path="/" element={<HomePage onNavigateToTier={navigateToTier} />} />
        <Route 
          path="/tier1" 
          element={
            <Tier1Assessment 
              onNavigateToTier={navigateToTier} 
              onShowLogin={() => navigate('/login')}
              onComplete={handleTier1Complete}
            />
          } 
        />
        <Route 
          path="/tier2" 
          element={
            <Tier2Assessment 
              onNavigateToTier={navigateToTier} 
              onShowLogin={() => navigate('/login')} 
            />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage 
              onLogin={handleLogin} 
              onCancel={() => navigate('/')} 
            />
          } 
        />
        <Route 
          path="/otp" 
          element={
            <OtpVerificationPage 
              userEmail={state.pendingUserData?.email || ''} 
              onVerify={handleOtpVerification} 
              onCancel={() => navigate('/login')} 
            />
          } 
        />
        <Route 
          path="/tier1-results" 
          element={
            <Tier1Results 
              score={state.tier1Score}
              onNavigateToTier2={() => navigate('/tier2')}
              onScheduleCall={handleScheduleCall}
              onRetakeAssessment={handleRetakeAssessment}
            />
          } 
        />
        <Route 
          path="/email-login" 
          element={
            <EmailLoginModal 
              onSubmit={handleEmailSubmit} 
              onCancel={() => navigate('/')} 
            />
          } 
        />
        <Route 
          path="/otp-login" 
          element={
            <OtpVerificationPage 
              userEmail={state.loginEmail} 
              onVerify={handleLoginOtpVerification} 
              onCancel={() => navigate('/email-login')} 
            />
          } 
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;