import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import SuccessMessage from './components/SuccessMessage';
import OAuthButton from './components/OAuthButton';
import AuthCallback from './components/AuthCallback';
import AdCreationForm from './components/AdCreationForm';
import ErrorDisplay from './components/ErrorDisplay';
import tiktokAuth from './services/tiktokAuth';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adCreationSuccess, setAdCreationSuccess] = useState(null);
  
  const location = useLocation();
  
  // Check for success query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setAdCreationSuccess({
        campaignName: localStorage.getItem('lastCampaignName') || 'New Campaign',
        adId: localStorage.getItem('lastAdId') || 'AD_' + Date.now()
      });
    }
  }, [location]);

  // Check for existing valid token on app load
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        if (tiktokAuth.isTokenValid()) {
          const token = tiktokAuth.getAccessToken();
          setAccessToken(token);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        tiktokAuth.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleOAuthSuccess = (token) => {
    setAccessToken(token);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleLogout = () => {
    tiktokAuth.clearTokens();
    setAccessToken(null);
    setUserInfo(null);
    setError(null);
  };

    const handleAdCreationSuccess = (campaignName, adId) => {
    localStorage.setItem('lastCampaignName', campaignName);
    localStorage.setItem('lastAdId', adId);
    setAdCreationSuccess({ campaignName, adId });
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

    return (
    <Router>
      <div className="App">
        <header className="App-header">
          {/* ... existing header code ... */}
        </header>
        
        <main className="App-main">
          {error && (
            <ErrorDisplay 
              message={error} 
              onClose={clearError}
            />
          )}
          
          {adCreationSuccess ? (
            <SuccessMessage 
              campaignName={adCreationSuccess.campaignName}
              adId={adCreationSuccess.adId}
            />
          ) : (
            <Routes>
              <Route path="/" element={
                <div className="container">
                  {!accessToken ? (
                    <div className="auth-section">
                      {/* ... existing auth section ... */}
                    </div>
                  ) : (
                    <div className="ad-creation-section">
                      <div className="connection-status">
                        <div className="status-indicator connected"></div>
                        <span>TikTok Account Connected</span>
                      </div>
                      <h2>Create New Ad Creative</h2>
                      <AdCreationForm 
                        accessToken={accessToken}
                        onError={handleError}
                        onSuccess={handleAdCreationSuccess}
                      />
                    </div>
                  )}
                </div>
              } />
              
              <Route path="/auth/callback" element={
                <AuthCallback 
                  onSuccess={handleOAuthSuccess}
                  onError={handleError}
                />
              } />
            </Routes>
          )}
        </main>
        
        <footer className="App-footer">
          <p>TikTok Ads Creative Flow - Frontend Assignment</p>
          <p className="footer-note">
            Note: This application uses real TikTok OAuth and requires a configured TikTok Developer App.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;